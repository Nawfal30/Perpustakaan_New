-- Jalankan SATU KALI setelah migration selesai dan akun admin sudah dibuat di Supabase Auth.
-- Ganti admin@example.com dengan email akun pengelola pertama.
-- Skrip ini membuat organisasi dan akses SUPER_ADMIN untuk akun tersebut.
begin;

do $$
declare
  v_admin_id uuid;
  v_org_id uuid;
  v_building_id uuid;
  v_room_id uuid;
begin
  select id into v_admin_id
  from auth.users
  where lower(email) = lower('admin@example.com')
  limit 1;

  if v_admin_id is null then
    raise exception 'Akun admin belum ada. Buat akun melalui Supabase Auth, lalu ganti email di bootstrap.sql.';
  end if;

  if exists (
    select 1 from public.organization_members
    where user_id = v_admin_id and status = 'ACTIVE'
  ) then
    raise exception 'Akun ini sudah terdaftar pada organisasi aktif. Bootstrap dibatalkan agar tidak membuat organisasi ganda.';
  end if;

  insert into public.organizations(name, timezone, currency, settings)
  values ('Pustaka Bersama', 'Asia/Jakarta', 'IDR',
    '{"hold_hours":48,"fine_block_threshold":0,"max_reservations_per_member":3}'::jsonb)
  returning id into v_org_id;

  insert into public.organization_members(organization_id, user_id, role, status)
  values (v_org_id, v_admin_id, 'SUPER_ADMIN', 'ACTIVE');

  insert into public.member_categories(organization_id, name, max_total_items, active) values
    (v_org_id, 'Warga', 2, true),
    (v_org_id, 'Pengurus', 10, true),
    (v_org_id, 'Siswa', 3, true),
    (v_org_id, 'Guru', 10, true),
    (v_org_id, 'Tamu', 1, true);

  insert into public.item_categories(organization_id, name) values
    (v_org_id, 'Fiksi'),
    (v_org_id, 'Pengembangan Diri'),
    (v_org_id, 'Sastra'),
    (v_org_id, 'Elektronik'),
    (v_org_id, 'Perkakas'),
    (v_org_id, 'Lainnya');

  insert into public.locations(organization_id, name, kind)
  values (v_org_id, 'Gedung Utama', 'GEDUNG') returning id into v_building_id;
  insert into public.locations(organization_id, parent_id, name, kind, active)
  values (v_org_id, v_building_id, 'Ruang Koleksi', 'RUANGAN', true) returning id into v_room_id;
  insert into public.locations(organization_id, parent_id, name, kind, active)
  values (v_org_id, v_room_id, 'Rak A', 'RAK', true);

  with defaults(member_name, item_kind, allowed, loan_days, max_items, max_renewals, renewal_days, fine_rate) as (
    values
      ('Warga','BUKU',true,7,2,1,7,500),
      ('Warga','PERALATAN',true,3,2,1,2,5000),
      ('Warga','LAINNYA',true,2,1,0,1,10000),
      ('Pengurus','BUKU',true,14,10,2,14,500),
      ('Pengurus','PERALATAN',true,3,5,1,2,5000),
      ('Pengurus','LAINNYA',true,3,5,1,2,5000),
      ('Siswa','BUKU',true,7,3,1,7,500),
      ('Siswa','PERALATAN',false,2,0,0,1,5000),
      ('Siswa','LAINNYA',false,7,0,0,1,500),
      ('Guru','BUKU',true,14,10,2,14,500),
      ('Guru','PERALATAN',true,2,1,0,1,5000),
      ('Guru','LAINNYA',true,2,1,0,1,5000),
      ('Tamu','BUKU',true,7,1,0,1,500),
      ('Tamu','PERALATAN',false,2,0,0,1,5000),
      ('Tamu','LAINNYA',false,7,0,0,1,500)
  )
  insert into public.loan_policies(
    organization_id, member_category_id, item_kind, allowed, loan_days,
    max_items, max_renewals, renewal_days, grace_days, fine_rule
  )
  select v_org_id, mc.id, d.item_kind, d.allowed, d.loan_days, d.max_items,
    d.max_renewals, greatest(1, d.renewal_days), 0,
    jsonb_build_object('type','flat','per_day',d.fine_rate,'grace_days',0,'cap',null)
  from defaults d
  join public.member_categories mc on mc.organization_id = v_org_id and mc.name = d.member_name;

  insert into public.notification_templates(organization_id, type, channel, subject, body)
  values
    (v_org_id, 'HOLD_READY', 'EMAIL', 'Koleksi siap diambil', 'Halo {nama}, {judul} sudah tersedia. Silakan ambil sebelum {batas_waktu}.'),
    (v_org_id, 'REMINDER_H2', 'EMAIL', 'Pengingat jatuh tempo', 'Halo {nama}, pinjaman {daftar_judul} jatuh tempo pada {tanggal_jatuh_tempo}.'),
    (v_org_id, 'REMINDER_H1', 'EMAIL', 'Pengingat jatuh tempo besok', 'Halo {nama}, pinjaman {daftar_judul} jatuh tempo besok.'),
    (v_org_id, 'REMINDER_DUE', 'EMAIL', 'Jatuh tempo hari ini', 'Halo {nama}, mohon kembalikan {daftar_judul} hari ini.'),
    (v_org_id, 'FINE_OUTSTANDING', 'EMAIL', 'Pengingat tunggakan', 'Halo {nama}, Anda memiliki tunggakan Rp{denda_total}. Hubungi {kontak_admin}.');

  raise notice 'Organisasi Pustaka Bersama dibuat. Organization ID: %', v_org_id;
end $$;

commit;
