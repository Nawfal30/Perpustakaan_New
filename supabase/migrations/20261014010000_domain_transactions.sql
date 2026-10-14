-- Atomic, organization-scoped operations for Pustaka Bersama.
-- Apply after 20261014000000_initial_schema.sql.
alter table public.reservations add column if not exists updated_at timestamptz not null default now();
create unique index if not exists payments_reference_idempotency_uidx
  on public.payments (organization_id, reference) where reference is not null;
create unique index if not exists loan_events_idempotency_uidx
  on public.loan_events (organization_id, (payload ->> 'idempotency_key'))
  where payload ? 'idempotency_key';

create or replace function public.calculate_fine(p_rule jsonb, p_overdue_days integer)
returns bigint
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_days integer := greatest(0, coalesce(p_overdue_days, 0));
  v_amount bigint := 0;
  v_rate bigint;
  v_start integer;
  v_end integer;
  v_tier jsonb;
begin
  if v_days = 0 then return 0; end if;

  if coalesce(p_rule ->> 'type', 'flat') in ('tiered', 'bertingkat') then
    for v_tier in select value from jsonb_array_elements(coalesce(p_rule -> 'tiers', '[]'::jsonb)) loop
      v_start := greatest(1, coalesce((v_tier ->> 'start_day')::integer, 1));
      v_end := greatest(v_start, coalesce((v_tier ->> 'end_day')::integer, v_days));
      v_rate := greatest(0, coalesce((v_tier ->> 'rate')::bigint, (v_tier ->> 'per_day')::bigint, 0));
      v_amount := v_amount + greatest(0, least(v_days, v_end) - v_start + 1)::bigint * v_rate;
    end loop;
  else
    v_rate := greatest(0, coalesce((p_rule ->> 'per_day')::bigint, (p_rule ->> 'rate')::bigint, 500));
    v_amount := v_days::bigint * v_rate;
  end if;

  if nullif(p_rule ->> 'cap', '') is not null then
    v_amount := least(v_amount, greatest(0, (p_rule ->> 'cap')::bigint));
  end if;
  return greatest(0, v_amount);
end;
$$;

create or replace function public.create_catalog_item(
  p_title text,
  p_kind text,
  p_category_name text default null,
  p_author text default null,
  p_isbn text default null,
  p_copy_count integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
  v_category_id uuid;
  v_location_id uuid;
  v_item_id uuid;
  v_prefix text;
  v_barcode text;
  v_barcodes text[] := array[]::text[];
  v_i integer;
  v_attempt integer;
begin
  if auth.uid() is null then raise exception using errcode = '28000', message = 'UNAUTHENTICATED'; end if;
  if nullif(trim(p_title), '') is null then raise exception using errcode = '22023', message = 'TITLE_REQUIRED'; end if;
  if p_kind not in ('BUKU','PERALATAN','LAINNYA') then raise exception using errcode = '22023', message = 'INVALID_ITEM_KIND'; end if;

  select om.organization_id into v_org_id
  from public.organization_members om
  where om.user_id = auth.uid() and om.status = 'ACTIVE'
    and om.role in ('SUPER_ADMIN','ADMIN')
  order by case om.role when 'SUPER_ADMIN' then 0 else 1 end
  limit 1;
  if v_org_id is null then raise exception using errcode = '42501', message = 'STAFF_ACCESS_REQUIRED'; end if;

  if nullif(trim(p_category_name), '') is not null then
    select ic.id into v_category_id
    from public.item_categories ic
    where ic.organization_id = v_org_id and lower(ic.name) = lower(trim(p_category_name))
    limit 1;
    if v_category_id is null then
      insert into public.item_categories(organization_id, name)
      values (v_org_id, trim(p_category_name))
      returning id into v_category_id;
    end if;
  end if;

  select l.id into v_location_id
  from public.locations l
  where l.organization_id = v_org_id and l.kind = 'RAK' and l.active = true
  order by l.name limit 1;

  insert into public.item_types(organization_id, category_id, kind, title, author, isbn)
  values (v_org_id, v_category_id, p_kind, trim(p_title), nullif(trim(p_author), ''), nullif(trim(p_isbn), ''))
  returning id into v_item_id;

  v_prefix := case p_kind when 'BUKU' then 'BK' when 'PERALATAN' then 'EQ' else 'OT' end;
  for v_i in 1..greatest(1, least(coalesce(p_copy_count, 1), 100)) loop
    v_attempt := 0;
    loop
      v_barcode := v_prefix || '-' || lpad((floor(random() * 1000000))::integer::text, 6, '0');
      exit when not exists (
        select 1 from public.item_copies c
        where c.organization_id = v_org_id and c.barcode = v_barcode
      );
      v_attempt := v_attempt + 1;
      if v_attempt > 25 then raise exception using errcode = '23505', message = 'BARCODE_GENERATION_FAILED'; end if;
    end loop;
    insert into public.item_copies(organization_id, item_type_id, barcode, location_id, status, condition)
    values (v_org_id, v_item_id, v_barcode, v_location_id, 'TERSEDIA', 'BAIK');
    v_barcodes := array_append(v_barcodes, v_barcode);
  end loop;

  return jsonb_build_object('item_type_id', v_item_id, 'title', trim(p_title), 'barcodes', to_jsonb(v_barcodes));
end;
$$;
revoke all on function public.create_catalog_item(text, text, text, text, text, integer) from public, anon;
grant execute on function public.create_catalog_item(text, text, text, text, text, integer) to authenticated;

create or replace function public.create_member(
  p_full_name text,
  p_member_category_id uuid,
  p_email text default null,
  p_phone text default null,
  p_expires_on date default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
  v_member_id uuid;
  v_member_number text;
  v_attempt integer := 0;
begin
  if auth.uid() is null then raise exception using errcode = '28000', message = 'UNAUTHENTICATED'; end if;
  if nullif(trim(p_full_name), '') is null then raise exception using errcode = '22023', message = 'MEMBER_NAME_REQUIRED'; end if;

  select mc.organization_id into v_org_id
  from public.member_categories mc
  where mc.id = p_member_category_id and mc.active = true;
  if v_org_id is null or not public.has_org_role(v_org_id, array['SUPER_ADMIN','ADMIN']) then
    raise exception using errcode = '42501', message = 'STAFF_ACCESS_REQUIRED';
  end if;

  loop
    v_member_number := 'M-' || lpad((floor(random() * 1000000))::integer::text, 6, '0');
    exit when not exists (
      select 1 from public.members m where m.organization_id = v_org_id and m.member_number = v_member_number
    );
    v_attempt := v_attempt + 1;
    if v_attempt > 25 then raise exception using errcode = '23505', message = 'MEMBER_NUMBER_GENERATION_FAILED'; end if;
  end loop;

  insert into public.members(organization_id, member_category_id, member_number, full_name, email, phone, expires_on, status)
  values (v_org_id, p_member_category_id, v_member_number, trim(p_full_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), p_expires_on, 'AKTIF')
  returning id into v_member_id;

  return jsonb_build_object('id', v_member_id, 'member_number', v_member_number, 'full_name', trim(p_full_name));
end;
$$;
revoke all on function public.create_member(text, uuid, text, text, date) from public, anon;
grant execute on function public.create_member(text, uuid, text, text, date) to authenticated;

create or replace function public.checkout_copies(
  p_member_number text,
  p_copy_barcodes text[],
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member public.members%rowtype;
  v_copy public.item_copies%rowtype;
  v_item public.item_types%rowtype;
  v_policy public.loan_policies%rowtype;
  v_hold public.reservations%rowtype;
  v_org public.organizations%rowtype;
  v_barcode text;
  v_codes text[];
  v_code_key text;
  v_due_date date;
  v_active_total integer;
  v_active_group integer;
  v_fine_outstanding bigint;
  v_fine_limit bigint;
  v_loan_id uuid;
  v_result jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then raise exception using errcode = '28000', message = 'UNAUTHENTICATED'; end if;
  if p_member_number is null or trim(p_member_number) = '' then raise exception using errcode = '22023', message = 'MEMBER_CODE_REQUIRED'; end if;
  select array_agg(code order by code) into v_codes
  from (select distinct trim(x) as code from unnest(coalesce(p_copy_barcodes, array[]::text[])) x where trim(x) <> '') q;
  if coalesce(cardinality(v_codes), 0) = 0 then raise exception using errcode = '22023', message = 'COPY_CODE_REQUIRED'; end if;

  select m.* into v_member
  from public.members m
  join public.organization_members om on om.organization_id = m.organization_id
  where m.member_number = trim(p_member_number)
    and om.user_id = auth.uid() and om.status = 'ACTIVE'
    and om.role in ('SUPER_ADMIN','ADMIN','STEWARD')
  order by case om.role when 'SUPER_ADMIN' then 0 when 'ADMIN' then 1 else 2 end
  limit 1
  for update of m;
  if v_member.id is null then raise exception using errcode = 'P0002', message = 'MEMBER_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_member.status <> 'AKTIF' then raise exception using errcode = 'P0001', message = 'MEMBER_SUSPENDED'; end if;
  if v_member.expires_on is not null and v_member.expires_on < (now() at time zone 'Asia/Jakarta')::date then
    raise exception using errcode = 'P0001', message = 'MEMBERSHIP_EXPIRED';
  end if;
  select * into v_org from public.organizations o where o.id = v_member.organization_id;
  v_fine_limit := coalesce((v_org.settings ->> 'fine_block_threshold')::bigint, 0);
  select coalesce(sum(f.amount - f.amount_paid), 0) into v_fine_outstanding
  from public.fines f where f.organization_id = v_member.organization_id
    and f.member_id = v_member.id and f.status in ('BELUM_BAYAR','SEBAGIAN') and f.amount > f.amount_paid;
  if v_fine_outstanding > v_fine_limit then raise exception using errcode = 'P0001', message = 'FINES_OUTSTANDING'; end if;

  foreach v_barcode in array v_codes loop
    v_code_key := coalesce(nullif(p_idempotency_key, ''), gen_random_uuid()::text) || ':' || v_barcode;
    select l.id into v_loan_id from public.loans l
    where l.organization_id = v_member.organization_id and l.idempotency_key = v_code_key;
    if v_loan_id is not null then
      v_result := v_result || jsonb_build_array(jsonb_build_object('loan_id', v_loan_id, 'barcode', v_barcode, 'idempotent_replay', true));
      v_loan_id := null;
      continue;
    end if;

    select c.* into v_copy from public.item_copies c
    where c.organization_id = v_member.organization_id and c.barcode = v_barcode
    for update;
    if v_copy.id is null then raise exception using errcode = 'P0002', message = 'COPY_NOT_FOUND:' || v_barcode; end if;

    select it.* into v_item from public.item_types it
    where it.organization_id = v_member.organization_id and it.id = v_copy.item_type_id and it.archived_at is null;
    if v_item.id is null then raise exception using errcode = 'P0002', message = 'ITEM_NOT_FOUND:' || v_barcode; end if;
    if v_copy.status not in ('TERSEDIA','DITAHAN') then raise exception using errcode = 'P0001', message = 'COPY_NOT_AVAILABLE:' || v_barcode; end if;

    if v_copy.status = 'DITAHAN' then
      select r.* into v_hold from public.reservations r
      where r.organization_id = v_member.organization_id and r.held_copy_id = v_copy.id and r.status = 'SIAP_DIAMBIL'
      for update;
      if v_hold.id is null or v_hold.member_id <> v_member.id then
        raise exception using errcode = 'P0001', message = 'HOLD_RESERVED_FOR_OTHER:' || v_barcode;
      end if;
    end if;

    select lp.* into v_policy from public.loan_policies lp
    where lp.organization_id = v_member.organization_id and lp.member_category_id = v_member.member_category_id
      and (lp.item_category_id is null or lp.item_category_id = v_item.category_id)
      and (lp.item_kind is null or lp.item_kind = v_item.kind)
    order by (lp.item_category_id is not null) desc, (lp.item_kind is not null) desc
    limit 1;
    if v_policy.id is null or not v_policy.allowed then raise exception using errcode = 'P0001', message = 'NOT_ELIGIBLE:' || v_barcode; end if;

    select count(*) into v_active_total from public.loans l
    where l.organization_id = v_member.organization_id and l.member_id = v_member.id and l.returned_at is null and l.status = 'AKTIF';
    if v_active_total >= (select mc.max_total_items from public.member_categories mc where mc.id = v_member.member_category_id) then
      raise exception using errcode = 'P0001', message = 'QUOTA_EXCEEDED_TOTAL';
    end if;

    select count(*) into v_active_group
    from public.loans l
    join public.item_copies c on c.id = l.copy_id and c.organization_id = l.organization_id
    join public.item_types it on it.id = c.item_type_id and it.organization_id = c.organization_id
    where l.organization_id = v_member.organization_id and l.member_id = v_member.id
      and l.returned_at is null and l.status = 'AKTIF'
      and (v_policy.item_category_id is null or it.category_id = v_policy.item_category_id)
      and (v_policy.item_kind is null or it.kind = v_policy.item_kind);
    if v_active_group >= v_policy.max_items then raise exception using errcode = 'P0001', message = 'QUOTA_EXCEEDED:' || v_barcode; end if;

    v_due_date := (now() at time zone coalesce(nullif(v_org.timezone,''),'Asia/Jakarta'))::date + v_policy.loan_days;
    insert into public.loans(
      organization_id, copy_id, member_id, due_date, due_at, policy_snapshot,
      processed_by, idempotency_key, condition_out
    ) values (
      v_member.organization_id, v_copy.id, v_member.id, v_due_date,
      ((v_due_date::timestamp + time '23:59') at time zone coalesce(nullif(v_org.timezone,''),'Asia/Jakarta')),
      jsonb_build_object(
        'loan_days', v_policy.loan_days, 'max_items', v_policy.max_items,
        'max_renewals', v_policy.max_renewals, 'renewal_days', v_policy.renewal_days,
        'grace_days', v_policy.grace_days, 'fine_rule', v_policy.fine_rule,
        'item_kind', v_item.kind, 'item_category_id', v_item.category_id
      ),
      auth.uid(), v_code_key, 'BAIK'
    ) returning id into v_loan_id;

    update public.item_copies set status = 'DIPINJAM', version = version + 1, updated_at = now()
    where id = v_copy.id and organization_id = v_member.organization_id
      and status in ('TERSEDIA','DITAHAN');
    if not found then raise exception using errcode = 'P0001', message = 'COPY_NOT_AVAILABLE:' || v_barcode; end if;

    if v_hold.id is not null and v_hold.status = 'SIAP_DIAMBIL' then
      update public.reservations set status = 'TERPENUHI', fulfilled_loan_id = v_loan_id, updated_at = now()
      where id = v_hold.id;
    end if;
    insert into public.loan_events(organization_id, loan_id, event_type, actor_user_id, payload)
    values (v_member.organization_id, v_loan_id, 'CHECKOUT', auth.uid(),
      jsonb_build_object('barcode', v_barcode, 'member_number', v_member.member_number, 'idempotency_key', v_code_key));
    v_result := v_result || jsonb_build_array(jsonb_build_object('loan_id', v_loan_id, 'barcode', v_barcode, 'due_date', v_due_date));
  end loop;

  return jsonb_build_object('ok', true, 'member_number', v_member.member_number, 'loans', v_result, 'count', jsonb_array_length(v_result));
end;
$$;
revoke all on function public.checkout_copies(text, text[], text) from public, anon;
grant execute on function public.checkout_copies(text, text[], text) to authenticated;

create or replace function public.return_copy(
  p_copy_barcode text,
  p_condition text default 'BAIK',
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
  v_copy_id uuid;
  v_member_id uuid;
  v_loan public.loans%rowtype;
  v_copy public.item_copies%rowtype;
  v_item public.item_types%rowtype;
  v_member public.members%rowtype;
  v_reservation public.reservations%rowtype;
  v_org public.organizations%rowtype;
  v_rule jsonb;
  v_local_today date;
  v_grace integer;
  v_overdue integer;
  v_amount bigint := 0;
  v_replacement bigint := 0;
  v_hold_hours integer;
  v_key text := nullif(p_idempotency_key, '');
begin
  if auth.uid() is null then raise exception using errcode = '28000', message = 'UNAUTHENTICATED'; end if;
  if p_condition not in ('BAIK','RUSAK','HILANG') then raise exception using errcode = '22023', message = 'INVALID_CONDITION'; end if;
  if v_key is not null and exists (
    select 1 from public.loan_events le
    where le.event_type = 'RETURN' and le.payload ->> 'idempotency_key' = v_key
  ) then
    return jsonb_build_object('ok', true, 'idempotent_replay', true);
  end if;

  select c.organization_id, c.id, l.member_id into v_org_id, v_copy_id, v_member_id
  from public.item_copies c
  join public.loans l on l.organization_id = c.organization_id and l.copy_id = c.id
  where c.barcode = trim(p_copy_barcode) and l.status = 'AKTIF' and l.returned_at is null
  limit 1;
  if v_copy_id is null then raise exception using errcode = 'P0002', message = 'COPY_NOT_ON_LOAN'; end if;
  if not public.has_org_role(v_org_id, array['SUPER_ADMIN','ADMIN','STEWARD']) then
    raise exception using errcode = '42501', message = 'STAFF_ACCESS_REQUIRED';
  end if;

  select * into v_member from public.members m where m.id = v_member_id and m.organization_id = v_org_id for update;
  select * into v_copy from public.item_copies c where c.id = v_copy_id and c.organization_id = v_org_id for update;
  select * into v_loan from public.loans l where l.copy_id = v_copy_id and l.organization_id = v_org_id and l.status = 'AKTIF' and l.returned_at is null for update;
  if v_loan.id is null then raise exception using errcode = 'P0002', message = 'COPY_NOT_ON_LOAN'; end if;
  select * into v_item from public.item_types it where it.id = v_copy.item_type_id and it.organization_id = v_org_id;
  select * into v_org from public.organizations o where o.id = v_org_id;
  v_local_today := (now() at time zone coalesce(nullif(v_org.timezone,''),'Asia/Jakarta'))::date;

  v_grace := greatest(0, coalesce((v_loan.policy_snapshot ->> 'grace_days')::integer, 0));
  v_overdue := greatest(0, v_local_today - v_loan.due_date - v_grace);
  v_rule := coalesce(v_loan.policy_snapshot -> 'fine_rule', '{"type":"flat","per_day":500}'::jsonb);
  if p_condition = 'HILANG' then
    v_replacement := coalesce(v_copy.acquisition_price, 0);
    if v_replacement > 0 then v_amount := v_replacement; end if;
  else
    v_amount := public.calculate_fine(v_rule, v_overdue);
  end if;

  if v_amount > 0 then
    insert into public.fines(organization_id, member_id, loan_id, type, amount, computed_from)
    values (
      v_org_id, v_member.id, v_loan.id,
      case when p_condition = 'HILANG' then 'HILANG' when p_condition = 'RUSAK' then 'RUSAK' else 'TERLAMBAT' end,
      v_amount,
      jsonb_build_object('overdue_days', v_overdue, 'grace_days', v_grace, 'fine_rule', v_rule, 'condition', p_condition)
    );
  end if;

  update public.loans set returned_at = now(),
    status = case when p_condition = 'HILANG' then 'HILANG' else 'DIKEMBALIKAN' end,
    condition_in = p_condition, returned_processed_by = auth.uid()
  where id = v_loan.id;
  update public.item_copies set condition = p_condition,
    status = case when p_condition = 'RUSAK' then 'RUSAK' when p_condition = 'HILANG' then 'HILANG' else 'TERSEDIA' end,
    version = version + 1, updated_at = now()
  where id = v_copy.id;

  if p_condition = 'BAIK' then
    select * into v_reservation from public.reservations r
    where r.organization_id = v_org_id and r.item_type_id = v_item.id and r.status = 'MENUNGGU'
    order by r.queued_at, r.id limit 1 for update skip locked;
    if v_reservation.id is not null then
      v_hold_hours := greatest(1, coalesce((v_org.settings ->> 'hold_hours')::integer, 48));
      update public.reservations set status = 'SIAP_DIAMBIL', ready_at = now(),
        hold_expires_at = now() + make_interval(hours => v_hold_hours), held_copy_id = v_copy.id
      where id = v_reservation.id;
      update public.item_copies set status = 'DITAHAN', version = version + 1, updated_at = now()
      where id = v_copy.id;
      insert into public.notifications(organization_id, type, channel, member_id, payload, dedupe_key)
      values (
        v_org_id, 'HOLD_READY', 'EMAIL', v_reservation.member_id,
        jsonb_build_object('item_type_id', v_item.id, 'copy_barcode', v_copy.barcode, 'hold_expires_at', now() + make_interval(hours => v_hold_hours)),
        'HOLD_READY:' || v_reservation.id::text || ':' || (now() at time zone coalesce(nullif(v_org.timezone,''),'Asia/Jakarta'))::date::text
      ) on conflict (organization_id, dedupe_key) do nothing;
    end if;
  end if;

  insert into public.loan_events(organization_id, loan_id, event_type, actor_user_id, payload)
  values (v_org_id, v_loan.id, 'RETURN', auth.uid(),
    jsonb_build_object('barcode', v_copy.barcode, 'condition', p_condition, 'fine_amount', v_amount, 'idempotency_key', v_key));

  return jsonb_build_object(
    'ok', true, 'loan_id', v_loan.id, 'barcode', v_copy.barcode, 'condition', p_condition,
    'fine_amount', v_amount, 'overdue_days', v_overdue,
    'copy_status', (select c.status from public.item_copies c where c.id = v_copy.id),
    'reservation_id', case when v_reservation.id is not null and p_condition = 'BAIK' then v_reservation.id else null end,
    'hold_expires_at', case when v_reservation.id is not null and p_condition = 'BAIK' then v_reservation.hold_expires_at else null end
  );
end;
$$;
revoke all on function public.return_copy(text, text, text) from public, anon;
grant execute on function public.return_copy(text, text, text) to authenticated;

create or replace function public.renew_copy(
  p_copy_barcode text,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
  v_copy_id uuid;
  v_member_id uuid;
  v_loan public.loans%rowtype;
  v_member public.members%rowtype;
  v_copy public.item_copies%rowtype;
  v_item public.item_types%rowtype;
  v_policy public.loan_policies%rowtype;
  v_org public.organizations%rowtype;
  v_new_due_date date;
  v_local_today date;
  v_outstanding bigint;
  v_limit bigint;
  v_key text := nullif(p_idempotency_key, '');
begin
  if auth.uid() is null then raise exception using errcode = '28000', message = 'UNAUTHENTICATED'; end if;

  select c.organization_id, c.id, l.member_id into v_org_id, v_copy_id, v_member_id
  from public.item_copies c
  join public.loans l on l.organization_id = c.organization_id and l.copy_id = c.id
  where c.barcode = trim(p_copy_barcode) and l.status = 'AKTIF' and l.returned_at is null
  limit 1;
  if v_copy_id is null then raise exception using errcode = 'P0002', message = 'COPY_NOT_ON_LOAN'; end if;
  if not public.has_org_role(v_org_id, array['SUPER_ADMIN','ADMIN','STEWARD']) then
    raise exception using errcode = '42501', message = 'STAFF_ACCESS_REQUIRED';
  end if;

  if v_key is not null and exists (
    select 1 from public.loan_events le where le.organization_id = v_org_id
      and le.event_type = 'RENEW' and le.payload ->> 'idempotency_key' = v_key
  ) then
    return jsonb_build_object('ok', true, 'idempotent_replay', true);
  end if;

  select * into v_member from public.members m where m.id = v_member_id and m.organization_id = v_org_id for update;
  select * into v_copy from public.item_copies c where c.id = v_copy_id and c.organization_id = v_org_id for update;
  select * into v_loan from public.loans l where l.id = (
    select l2.id from public.loans l2 where l2.copy_id = v_copy_id and l2.organization_id = v_org_id
      and l2.status = 'AKTIF' and l2.returned_at is null limit 1
  ) for update;
  if v_loan.id is null then raise exception using errcode = 'P0002', message = 'COPY_NOT_ON_LOAN'; end if;
  select * into v_item from public.item_types it where it.id = v_copy.item_type_id and it.organization_id = v_org_id;
  select * into v_org from public.organizations o where o.id = v_org_id;
  v_local_today := (now() at time zone coalesce(nullif(v_org.timezone,''),'Asia/Jakarta'))::date;

  if v_member.status <> 'AKTIF' then raise exception using errcode = 'P0001', message = 'MEMBER_SUSPENDED'; end if;
  if v_member.expires_on is not null and v_member.expires_on < v_local_today then raise exception using errcode = 'P0001', message = 'MEMBERSHIP_EXPIRED'; end if;
  if v_loan.due_date < v_local_today then raise exception using errcode = 'P0001', message = 'RENEWAL_BLOCKED_OVERDUE'; end if;

  v_limit := coalesce((v_org.settings ->> 'fine_block_threshold')::bigint, 0);
  select coalesce(sum(f.amount - f.amount_paid),0) into v_outstanding
  from public.fines f where f.organization_id = v_org_id and f.member_id = v_member.id
    and f.status in ('BELUM_BAYAR','SEBAGIAN') and f.amount > f.amount_paid;
  if v_outstanding > v_limit then raise exception using errcode = 'P0001', message = 'FINES_OUTSTANDING'; end if;

  select lp.* into v_policy from public.loan_policies lp
  where lp.organization_id = v_org_id and lp.member_category_id = v_member.member_category_id
    and (lp.item_category_id is null or lp.item_category_id = v_item.category_id)
    and (lp.item_kind is null or lp.item_kind = v_item.kind)
  order by (lp.item_category_id is not null) desc, (lp.item_kind is not null) desc
  limit 1;
  if v_policy.id is null or v_loan.renewal_count >= v_policy.max_renewals then
    raise exception using errcode = 'P0001', message = 'RENEWAL_LIMIT_REACHED';
  end if;
  if exists (
    select 1 from public.reservations r where r.organization_id = v_org_id
      and r.item_type_id = v_item.id and r.status in ('MENUNGGU','SIAP_DIAMBIL')
  ) then raise exception using errcode = 'P0001', message = 'RENEWAL_BLOCKED_BY_QUEUE'; end if;

  v_new_due_date := greatest(v_loan.due_date, v_local_today) + v_policy.renewal_days;
  update public.loans set due_date = v_new_due_date,
    due_at = ((v_new_due_date::timestamp + time '23:59') at time zone coalesce(nullif(v_org.timezone,''),'Asia/Jakarta')),
    renewal_count = renewal_count + 1
  where id = v_loan.id;
  insert into public.loan_events(organization_id, loan_id, event_type, actor_user_id, payload)
  values (v_org_id, v_loan.id, 'RENEW', auth.uid(),
    jsonb_build_object('barcode', v_copy.barcode, 'old_due_date', v_loan.due_date, 'new_due_date', v_new_due_date, 'idempotency_key', v_key));

  return jsonb_build_object('ok', true, 'loan_id', v_loan.id, 'barcode', v_copy.barcode, 'due_date', v_new_due_date);
end;
$$;
revoke all on function public.renew_copy(text, text) from public, anon;
grant execute on function public.renew_copy(text, text) to authenticated;

create or replace function public.record_payment(
  p_member_number text,
  p_amount bigint,
  p_method text,
  p_notes text default null,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member public.members%rowtype;
  v_fine public.fines%rowtype;
  v_org_id uuid;
  v_payment_id uuid;
  v_remaining bigint;
  v_allocate bigint;
  v_key text := nullif(p_idempotency_key, '');
begin
  if auth.uid() is null then raise exception using errcode = '28000', message = 'UNAUTHENTICATED'; end if;
  if coalesce(p_amount, 0) <= 0 then raise exception using errcode = '22023', message = 'PAYMENT_AMOUNT_INVALID'; end if;
  if p_method not in ('TUNAI','TRANSFER','QRIS_MANUAL','LAINNYA') then raise exception using errcode = '22023', message = 'PAYMENT_METHOD_INVALID'; end if;

  select m.* into v_member
  from public.members m
  join public.organization_members om on om.organization_id = m.organization_id
  where m.member_number = trim(p_member_number) and om.user_id = auth.uid()
    and om.status = 'ACTIVE' and om.role in ('SUPER_ADMIN','ADMIN')
  order by case om.role when 'SUPER_ADMIN' then 0 else 1 end
  limit 1 for update of m;
  if v_member.id is null then raise exception using errcode = 'P0002', message = 'MEMBER_NOT_FOUND_OR_FORBIDDEN'; end if;

  if v_key is not null and exists (
    select 1 from public.payments p where p.organization_id = v_member.organization_id and p.reference = v_key
  ) then
    return jsonb_build_object('ok', true, 'idempotent_replay', true);
  end if;

  select coalesce(sum(f.amount - f.amount_paid),0) into v_remaining
  from public.fines f where f.organization_id = v_member.organization_id and f.member_id = v_member.id
    and f.status in ('BELUM_BAYAR','SEBAGIAN') and f.amount > f.amount_paid;
  if p_amount > v_remaining then raise exception using errcode = 'P0001', message = 'PAYMENT_EXCEEDS_OUTSTANDING'; end if;

  insert into public.payments(organization_id, member_id, amount, method, received_by, reference, notes)
  values (v_member.organization_id, v_member.id, p_amount, p_method, auth.uid(), v_key, nullif(trim(p_notes), ''))
  returning id into v_payment_id;

  v_remaining := p_amount;
  for v_fine in
    select * from public.fines f where f.organization_id = v_member.organization_id and f.member_id = v_member.id
      and f.status in ('BELUM_BAYAR','SEBAGIAN') and f.amount > f.amount_paid
    order by f.created_at, f.id for update
  loop
    exit when v_remaining <= 0;
    v_allocate := least(v_remaining, v_fine.amount - v_fine.amount_paid);
    insert into public.payment_allocations(organization_id, payment_id, fine_id, amount)
    values (v_member.organization_id, v_payment_id, v_fine.id, v_allocate);
    update public.fines set amount_paid = amount_paid + v_allocate,
      status = case when amount_paid + v_allocate >= amount then 'LUNAS' else 'SEBAGIAN' end
    where id = v_fine.id;
    v_remaining := v_remaining - v_allocate;
  end loop;

  return jsonb_build_object('ok', true, 'payment_id', v_payment_id, 'amount', p_amount, 'method', p_method);
end;
$$;
revoke all on function public.record_payment(text, bigint, text, text, text) from public, anon;
grant execute on function public.record_payment(text, bigint, text, text, text) to authenticated;
