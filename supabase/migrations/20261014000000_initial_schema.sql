-- Pustaka Bersama: organization-scoped library and community inventory.
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'Asia/Jakarta',
  currency char(3) not null default 'IDR',
  is_public_catalog boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('SUPER_ADMIN','ADMIN','STEWARD','MEMBER')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUSPENDED','INACTIVE')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index organization_members_user_idx on public.organization_members(user_id, status);

create table public.member_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  max_total_items integer not null default 3 check (max_total_items >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (organization_id, id)
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  auth_user_id uuid references auth.users(id),
  member_category_id uuid not null,
  member_number text not null,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'AKTIF' check (status in ('AKTIF','DISUSPEND','DIBLOKIR','NONAKTIF')),
  expires_on date,
  notes text,
  suspended_reason text,
  suspended_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  foreign key (organization_id, member_category_id) references public.member_categories(organization_id, id),
  unique (organization_id, member_number),
  unique (organization_id, id)
);
create unique index members_auth_user_org_uidx on public.members(organization_id, auth_user_id) where auth_user_id is not null;
create index members_search_idx on public.members using gin (full_name gin_trgm_ops);

create table public.item_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  parent_id uuid,
  name text not null,
  created_at timestamptz not null default now(),
  foreign key (organization_id, parent_id) references public.item_categories(organization_id, id),
  unique (organization_id, name),
  unique (organization_id, id)
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  parent_id uuid,
  name text not null,
  kind text not null default 'RAK' check (kind in ('GEDUNG','RUANGAN','RAK','HOLD')),
  active boolean not null default true,
  foreign key (organization_id, parent_id) references public.locations(organization_id, id),
  unique (organization_id, name),
  unique (organization_id, id)
);

create table public.item_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  category_id uuid,
  kind text not null check (kind in ('BUKU','PERALATAN','LAINNYA')),
  title text not null,
  description text,
  isbn text,
  author text,
  publisher text,
  published_year integer,
  language text,
  pages integer,
  cover_url text,
  attributes jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, category_id) references public.item_categories(organization_id, id),
  unique (organization_id, id)
);
create index item_types_title_search_idx on public.item_types using gin (title gin_trgm_ops);
create index item_types_isbn_idx on public.item_types(organization_id, isbn) where isbn is not null;

create table public.item_copies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  item_type_id uuid not null,
  barcode text not null,
  status text not null default 'TERSEDIA' check (status in ('TERSEDIA','DIPINJAM','DITAHAN','RUSAK','DALAM_PERBAIKAN','HILANG','DITARIK')),
  location_id uuid,
  condition text not null default 'BAIK' check (condition in ('BAIK','RUSAK','HILANG')),
  acquired_at date,
  acquisition_price bigint check (acquisition_price is null or acquisition_price >= 0),
  source text,
  notes text,
  version integer not null default 1,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, item_type_id) references public.item_types(organization_id, id),
  foreign key (organization_id, location_id) references public.locations(organization_id, id),
  unique (organization_id, barcode),
  unique (organization_id, id)
);
create index item_copies_type_status_idx on public.item_copies(organization_id, item_type_id, status);

create table public.loan_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  member_category_id uuid not null,
  item_category_id uuid,
  item_kind text check (item_kind is null or item_kind in ('BUKU','PERALATAN','LAINNYA')),
  allowed boolean not null default true,
  loan_days integer not null default 7 check (loan_days > 0),
  max_items integer not null default 3 check (max_items >= 0),
  max_renewals integer not null default 1 check (max_renewals >= 0),
  renewal_days integer not null default 7 check (renewal_days > 0),
  grace_days integer not null default 0 check (grace_days >= 0),
  fine_rule jsonb not null default '{"type":"flat","per_day":500}'::jsonb,
  updated_at timestamptz not null default now(),
  foreign key (organization_id, member_category_id) references public.member_categories(organization_id, id),
  foreign key (organization_id, item_category_id) references public.item_categories(organization_id, id),
  unique nulls not distinct (organization_id, member_category_id, item_category_id, item_kind)
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  copy_id uuid not null,
  member_id uuid not null,
  checked_out_at timestamptz not null default now(),
  due_date date not null,
  due_at timestamptz not null,
  returned_at timestamptz,
  status text not null default 'AKTIF' check (status in ('AKTIF','DIKEMBALIKAN','HILANG','DIBATALKAN')),
  renewal_count integer not null default 0 check (renewal_count >= 0),
  policy_snapshot jsonb not null default '{}'::jsonb,
  condition_out text,
  condition_in text,
  processed_by uuid references auth.users(id),
  returned_processed_by uuid references auth.users(id),
  void_reason text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  foreign key (organization_id, copy_id) references public.item_copies(organization_id, id),
  foreign key (organization_id, member_id) references public.members(organization_id, id),
  unique (organization_id, id)
);
create unique index loans_one_open_per_copy_uidx on public.loans(copy_id) where returned_at is null and status = 'AKTIF';
create unique index loans_idempotency_uidx on public.loans(organization_id, idempotency_key) where idempotency_key is not null;
create index loans_open_due_idx on public.loans(organization_id, due_date) where returned_at is null and status = 'AKTIF';
create index loans_member_open_idx on public.loans(organization_id, member_id) where returned_at is null and status = 'AKTIF';

create table public.loan_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  loan_id uuid not null,
  event_type text not null check (event_type in ('CHECKOUT','RENEW','RETURN','MARK_LOST','VOID','OVERRIDE')),
  actor_user_id uuid references auth.users(id),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (organization_id, loan_id) references public.loans(organization_id, id)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  item_type_id uuid not null,
  member_id uuid not null,
  status text not null default 'MENUNGGU' check (status in ('MENUNGGU','SIAP_DIAMBIL','TERPENUHI','KEDALUWARSA','DIBATALKAN')),
  queued_at timestamptz not null default now(),
  ready_at timestamptz,
  hold_expires_at timestamptz,
  held_copy_id uuid,
  fulfilled_loan_id uuid,
  cancel_reason text,
  created_by uuid references auth.users(id),
  foreign key (organization_id, item_type_id) references public.item_types(organization_id, id),
  foreign key (organization_id, member_id) references public.members(organization_id, id),
  foreign key (organization_id, held_copy_id) references public.item_copies(organization_id, id),
  foreign key (organization_id, fulfilled_loan_id) references public.loans(organization_id, id),
  unique (organization_id, id)
);
create unique index reservations_active_per_member_uidx on public.reservations(item_type_id, member_id) where status in ('MENUNGGU','SIAP_DIAMBIL');
create unique index reservations_held_copy_uidx on public.reservations(held_copy_id) where status = 'SIAP_DIAMBIL' and held_copy_id is not null;
create index reservations_fifo_idx on public.reservations(organization_id, item_type_id, queued_at, id) where status = 'MENUNGGU';

create table public.fines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  member_id uuid not null,
  loan_id uuid,
  type text not null check (type in ('TERLAMBAT','HILANG','RUSAK','LAINNYA')),
  amount bigint not null check (amount >= 0),
  amount_paid bigint not null default 0 check (amount_paid >= 0 and amount_paid <= amount),
  status text not null default 'BELUM_BAYAR' check (status in ('BELUM_BAYAR','SEBAGIAN','LUNAS','DIHAPUSKAN')),
  computed_from jsonb not null default '{}'::jsonb,
  waived_by uuid references auth.users(id),
  waive_reason text,
  created_at timestamptz not null default now(),
  foreign key (organization_id, member_id) references public.members(organization_id, id),
  foreign key (organization_id, loan_id) references public.loans(organization_id, id),
  unique (organization_id, id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  member_id uuid not null,
  amount bigint not null check (amount > 0),
  method text not null check (method in ('TUNAI','TRANSFER','QRIS_MANUAL','LAINNYA')),
  received_by uuid references auth.users(id),
  paid_at timestamptz not null default now(),
  reference text,
  notes text,
  voided_at timestamptz,
  foreign key (organization_id, member_id) references public.members(organization_id, id),
  unique (organization_id, id)
);
create table public.payment_allocations (
  organization_id uuid not null references public.organizations(id),
  payment_id uuid not null,
  fine_id uuid not null,
  amount bigint not null check (amount > 0),
  primary key (payment_id, fine_id),
  foreign key (organization_id, payment_id) references public.payments(organization_id, id),
  foreign key (organization_id, fine_id) references public.fines(organization_id, id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  type text not null,
  channel text not null check (channel in ('EMAIL','WHATSAPP','MANUAL')),
  member_id uuid,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text not null,
  status text not null default 'PENDING' check (status in ('PENDING','SENDING','SENT','FAILED','SKIPPED')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  error text,
  created_at timestamptz not null default now(),
  foreign key (organization_id, member_id) references public.members(organization_id, id),
  unique (organization_id, dedupe_key)
);

create table public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  type text not null,
  channel text not null check (channel in ('EMAIL','WHATSAPP')),
  subject text,
  body text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (organization_id, type, channel)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs(organization_id, entity_type, entity_id, created_at desc);

create table public.holidays (
  organization_id uuid not null references public.organizations(id),
  holiday_date date not null,
  name text not null,
  primary key (organization_id, holiday_date)
);
create table public.isbn_cache (
  isbn text primary key,
  source text not null,
  payload jsonb not null,
  fetched_at timestamptz not null default now()
);
create table public.job_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  job_name text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'RUNNING' check (status in ('RUNNING','SUCCEEDED','FAILED')),
  details jsonb not null default '{}'::jsonb
);

-- Audit records are created by database triggers and cannot be edited through the Data API.
create or replace function public.capture_audit_log()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  org_id uuid;
  row_id uuid;
begin
  if tg_op = 'DELETE' then
    org_id := old.organization_id;
    row_id := old.id;
  else
    org_id := new.organization_id;
    row_id := new.id;
  end if;
  insert into public.audit_logs (organization_id, actor_user_id, action, entity_type, entity_id, before_data, after_data)
  values (
    org_id,
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    row_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;
revoke all on function public.capture_audit_log() from public, anon, authenticated;

create trigger audit_members after insert or update or delete on public.members for each row execute function public.capture_audit_log();
create trigger audit_member_categories after insert or update or delete on public.member_categories for each row execute function public.capture_audit_log();
create trigger audit_item_categories after insert or update or delete on public.item_categories for each row execute function public.capture_audit_log();
create trigger audit_locations after insert or update or delete on public.locations for each row execute function public.capture_audit_log();
create trigger audit_item_types after insert or update or delete on public.item_types for each row execute function public.capture_audit_log();
create trigger audit_item_copies after insert or update or delete on public.item_copies for each row execute function public.capture_audit_log();
create trigger audit_loan_policies after insert or update or delete on public.loan_policies for each row execute function public.capture_audit_log();
create trigger audit_loans after insert or update or delete on public.loans for each row execute function public.capture_audit_log();
create trigger audit_reservations after insert or update or delete on public.reservations for each row execute function public.capture_audit_log();
create trigger audit_fines after insert or update or delete on public.fines for each row execute function public.capture_audit_log();
create trigger audit_payments after insert or update or delete on public.payments for each row execute function public.capture_audit_log();
create trigger audit_notifications after insert or update or delete on public.notifications for each row execute function public.capture_audit_log();

-- All exposed application tables use RLS. Organization membership is the source of authorization.
revoke all on public.organizations, public.organization_members, public.member_categories, public.members,
  public.item_categories, public.locations, public.item_types, public.item_copies, public.loan_policies,
  public.loans, public.loan_events, public.reservations, public.fines, public.payments,
  public.payment_allocations, public.notifications, public.notification_templates, public.audit_logs,
  public.holidays, public.isbn_cache, public.job_runs from anon, authenticated;

create or replace function public.has_org_role(target_org uuid, allowed_roles text[])
returns boolean language sql stable set search_path = '' as $$
  select exists (
    select 1 from public.organization_members om
    where om.organization_id = target_org
      and om.user_id = (select auth.uid())
      and om.status = 'ACTIVE'
      and om.role = any(allowed_roles)
  );
$$;
revoke all on function public.has_org_role(uuid, text[]) from public, anon;
grant execute on function public.has_org_role(uuid, text[]) to authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'organizations','organization_members','member_categories','members','item_categories','locations',
    'item_types','item_copies','loan_policies','loans','loan_events','reservations','fines','payments',
    'payment_allocations','notifications','notification_templates','audit_logs','holidays','isbn_cache','job_runs'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

create policy "memberships read own" on public.organization_members for select to authenticated using (user_id = (select auth.uid()));
create policy "organizations read by members" on public.organizations for select to authenticated using (public.has_org_role(id, array['SUPER_ADMIN','ADMIN','STEWARD','MEMBER']));
create policy "organizations update by super admins" on public.organizations for update to authenticated using (public.has_org_role(id, array['SUPER_ADMIN'])) with check (public.has_org_role(id, array['SUPER_ADMIN']));

create policy "member categories staff read" on public.member_categories for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "member categories super admin write" on public.member_categories for all to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN'])) with check (public.has_org_role(organization_id, array['SUPER_ADMIN']));
create policy "members staff read" on public.members for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "members read own profile" on public.members for select to authenticated using (auth_user_id = (select auth.uid()));
create policy "members admin insert" on public.members for insert to authenticated with check (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN']));
create policy "members admin update" on public.members for update to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN'])) with check (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN']));

create policy "item categories staff access" on public.item_categories for all to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD'])) with check (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN']));
create policy "locations staff access" on public.locations for all to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD'])) with check (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN']));
create policy "item types staff access" on public.item_types for all to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD'])) with check (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN']));
create policy "copies staff access" on public.item_copies for all to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD'])) with check (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN']));
create policy "catalog visible to organization members" on public.item_types for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD','MEMBER']));
create policy "policies read by staff" on public.loan_policies for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "policies changed by super admins" on public.loan_policies for all to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN'])) with check (public.has_org_role(organization_id, array['SUPER_ADMIN']));

create policy "loans staff read" on public.loans for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "loans member read own" on public.loans for select to authenticated using (exists (select 1 from public.members m where m.id = loans.member_id and m.organization_id = loans.organization_id and m.auth_user_id = (select auth.uid())));
create policy "loan events staff read" on public.loan_events for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "reservations staff read" on public.reservations for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "reservations member read own" on public.reservations for select to authenticated using (exists (select 1 from public.members m where m.id = reservations.member_id and m.organization_id = reservations.organization_id and m.auth_user_id = (select auth.uid())));
create policy "reservations member create own" on public.reservations for insert to authenticated with check (exists (select 1 from public.members m where m.id = reservations.member_id and m.organization_id = reservations.organization_id and m.auth_user_id = (select auth.uid()) and m.status = 'AKTIF'));
create policy "reservations member cancel own" on public.reservations for update to authenticated using (status in ('MENUNGGU','SIAP_DIAMBIL') and exists (select 1 from public.members m where m.id = reservations.member_id and m.organization_id = reservations.organization_id and m.auth_user_id = (select auth.uid()))) with check (status = 'DIBATALKAN' and exists (select 1 from public.members m where m.id = reservations.member_id and m.organization_id = reservations.organization_id and m.auth_user_id = (select auth.uid())));

create policy "fines staff read" on public.fines for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "fines member read own" on public.fines for select to authenticated using (exists (select 1 from public.members m where m.id = fines.member_id and m.organization_id = fines.organization_id and m.auth_user_id = (select auth.uid())));
create policy "payments staff read" on public.payments for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "allocations staff read" on public.payment_allocations for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "notifications staff access" on public.notifications for all to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD'])) with check (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN']));
create policy "templates staff read" on public.notification_templates for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "templates super admin write" on public.notification_templates for all to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN'])) with check (public.has_org_role(organization_id, array['SUPER_ADMIN']));
create policy "audit staff read" on public.audit_logs for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','STEWARD']));
create policy "holidays staff read" on public.holidays for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN','ADMIN','STEWARD']));
create policy "holidays super admin write" on public.holidays for all to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN'])) with check (public.has_org_role(organization_id, array['SUPER_ADMIN']));
create policy "job runs super admin read" on public.job_runs for select to authenticated using (public.has_org_role(organization_id, array['SUPER_ADMIN']));

grant select on public.organizations, public.organization_members, public.member_categories, public.members,
  public.item_categories, public.locations, public.item_types, public.item_copies, public.loan_policies,
  public.loans, public.loan_events, public.reservations, public.fines, public.payments,
  public.payment_allocations, public.notifications, public.notification_templates, public.audit_logs,
  public.holidays, public.job_runs to authenticated;
grant insert, update on public.members, public.item_categories, public.locations, public.item_types, public.item_copies,
  public.reservations, public.notifications to authenticated;
grant insert on public.member_categories, public.loan_policies, public.notification_templates, public.holidays to authenticated;
grant usage on schema public to authenticated;
grant update on public.organizations, public.member_categories, public.loan_policies, public.notification_templates, public.holidays to authenticated;
revoke insert, update, delete, truncate on public.audit_logs from anon, authenticated;
revoke all on public.isbn_cache from anon, authenticated;
