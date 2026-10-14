import { supabase, supabaseConfigured } from "./supabase"

export type CatalogEntry = {
  id: string
  title: string
  kind: "BUKU" | "PERALATAN" | "LAINNYA"
  author: string
  isbn: string | null
  category: string
  location: string
  availableCopies: number
  totalCopies: number
  status: string
  barcodes: string[]
}

export type MemberEntry = {
  id: string
  code: string
  name: string
  category: string
  email: string
  phone: string
  activeLoans: number
  outstandingFine: number
  status: string
}

export type MemberCategory = { id: string; name: string; max_total_items: number }

export type DashboardStats = {
  activeLoans: number
  dueToday: number
  overdue: number
  readyHolds: number
  outstandingFines: number
  totalTitles: number
  totalCopies: number
}

async function activeOrganizationId() {
  if (!supabase || !supabaseConfigured) throw new Error("Supabase belum dikonfigurasi.")
  const { data: userResult, error: userError } = await supabase.auth.getUser()
  if (userError || !userResult.user) throw new Error("Sesi login tidak ditemukan. Silakan masuk kembali.")
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id,role")
    .eq("user_id", userResult.user.id)
    .eq("status", "ACTIVE")
    .in("role", ["SUPER_ADMIN", "ADMIN", "STEWARD"])
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data?.organization_id) throw new Error("Akun tidak memiliki akses staf aktif.")
  return data.organization_id as string
}

function fail(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message || fallback)
}

export async function listCatalogEntries(): Promise<CatalogEntry[]> {
  if (!supabase) return []
  const organizationId = await activeOrganizationId()
  const [typesResult, copiesResult, categoriesResult, locationsResult] = await Promise.all([
    supabase.from("item_types")
      .select("id,title,kind,author,isbn,category_id,archived_at")
      .eq("organization_id", organizationId).is("archived_at", null).order("title"),
    supabase.from("item_copies")
      .select("id,item_type_id,barcode,status,location_id,archived_at")
      .eq("organization_id", organizationId).is("archived_at", null),
    supabase.from("item_categories").select("id,name").eq("organization_id", organizationId),
    supabase.from("locations").select("id,name").eq("organization_id", organizationId),
  ])
  if (typesResult.error) fail(typesResult.error, "Gagal memuat katalog.")
  if (copiesResult.error) fail(copiesResult.error, "Gagal memuat eksemplar.")
  if (categoriesResult.error) fail(categoriesResult.error, "Gagal memuat kategori.")
  if (locationsResult.error) fail(locationsResult.error, "Gagal memuat lokasi.")
  const categoryNames = new Map((categoriesResult.data || []).map((row) => [row.id, row.name]))
  const locationNames = new Map((locationsResult.data || []).map((row) => [row.id, row.name]))
  const grouped = new Map<string, Array<{ barcode: string; status: string; location_id: string | null }>>()
  for (const copy of copiesResult.data || []) {
    const current = grouped.get(copy.item_type_id) || []
    current.push(copy)
    grouped.set(copy.item_type_id, current)
  }
  return (typesResult.data || []).map((row) => {
    const copies = grouped.get(row.id) || []
    const available = copies.filter((copy) => copy.status === "TERSEDIA").length
    const locationId = copies.find((copy) => copy.location_id)?.location_id
    return {
      id: row.id,
      title: row.title,
      kind: row.kind,
      author: row.author || "Belum diisi",
      isbn: row.isbn,
      category: categoryNames.get(row.category_id) || "Tanpa kategori",
      location: (locationId && locationNames.get(locationId)) || "Belum ditempatkan",
      availableCopies: available,
      totalCopies: copies.length,
      status: copies.length > 0 && available === 0 ? "TIDAK_TERSEDIA" : "TERSEDIA",
      barcodes: copies.map((copy) => copy.barcode),
    } satisfies CatalogEntry
  })
}

export async function createCatalogItem(input: {
  title: string
  kind: CatalogEntry["kind"]
  category: string
  author: string
  isbn: string
  copies: number
}) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.")
  const { data, error } = await supabase.rpc("create_catalog_item", {
    p_title: input.title,
    p_kind: input.kind,
    p_category_name: input.category || null,
    p_author: input.author || null,
    p_isbn: input.isbn || null,
    p_copy_count: input.copies,
  })
  if (error) fail(error, "Koleksi gagal disimpan.")
  return data
}

export async function listMemberCategories(): Promise<MemberCategory[]> {
  if (!supabase) return []
  const organizationId = await activeOrganizationId()
  const { data, error } = await supabase.from("member_categories")
    .select("id,name,max_total_items")
    .eq("organization_id", organizationId).eq("active", true).order("name")
  if (error) fail(error, "Gagal memuat kategori anggota.")
  return data || []
}

export async function listMembers(): Promise<MemberEntry[]> {
  if (!supabase) return []
  const organizationId = await activeOrganizationId()
  const { data, error } = await supabase.from("members")
    .select("id,member_number,full_name,email,phone,status,member_category_id,archived_at")
    .eq("organization_id", organizationId).is("archived_at", null).order("full_name")
  if (error) fail(error, "Gagal memuat anggota.")
  const rows = data || []
  if (rows.length === 0) return []
  const ids = rows.map((row) => row.id)
  const [categoriesResult, loansResult, finesResult] = await Promise.all([
    supabase.from("member_categories").select("id,name").eq("organization_id", organizationId),
    supabase.from("loans").select("member_id").eq("organization_id", organizationId)
      .eq("status", "AKTIF").is("returned_at", null).in("member_id", ids),
    supabase.from("fines").select("member_id,amount,amount_paid,status").eq("organization_id", organizationId)
      .in("member_id", ids).in("status", ["BELUM_BAYAR", "SEBAGIAN"]),
  ])
  if (categoriesResult.error) fail(categoriesResult.error, "Gagal memuat kategori anggota.")
  if (loansResult.error) fail(loansResult.error, "Gagal memuat pinjaman anggota.")
  if (finesResult.error) fail(finesResult.error, "Gagal memuat denda anggota.")
  const cats = new Map((categoriesResult.data || []).map((cat) => [cat.id, cat.name]))
  const loanCounts = new Map<string, number>()
  for (const loan of loansResult.data || []) loanCounts.set(loan.member_id, (loanCounts.get(loan.member_id) || 0) + 1)
  const fineAmounts = new Map<string, number>()
  for (const fine of finesResult.data || []) fineAmounts.set(fine.member_id, (fineAmounts.get(fine.member_id) || 0) + Math.max(0, Number(fine.amount) - Number(fine.amount_paid)))
  return rows.map((row) => ({
    id: row.id,
    code: row.member_number,
    name: row.full_name,
    category: cats.get(row.member_category_id) || "Lainnya",
    email: row.email || "",
    phone: row.phone || "",
    activeLoans: loanCounts.get(row.id) || 0,
    outstandingFine: fineAmounts.get(row.id) || 0,
    status: row.status,
  }))
}

export async function createMember(input: {
  name: string
  categoryId: string
  email: string
  phone: string
}) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.")
  const { data, error } = await supabase.rpc("create_member", {
    p_full_name: input.name,
    p_member_category_id: input.categoryId,
    p_email: input.email || null,
    p_phone: input.phone || null,
    p_expires_on: null,
  })
  if (error) fail(error, "Anggota gagal didaftarkan.")
  return data
}

export async function loadDashboardStats(): Promise<DashboardStats> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.")
  const organizationId = await activeOrganizationId()
  const localToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date())
  const [loans, holds, fines, titles, copies] = await Promise.all([
    supabase.from("loans").select("id,due_date,returned_at,status")
      .eq("organization_id", organizationId).eq("status", "AKTIF").is("returned_at", null),
    supabase.from("reservations").select("id").eq("organization_id", organizationId).eq("status", "SIAP_DIAMBIL"),
    supabase.from("fines").select("amount,amount_paid,status")
      .eq("organization_id", organizationId).in("status", ["BELUM_BAYAR", "SEBAGIAN"]),
    supabase.from("item_types").select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId).is("archived_at", null),
    supabase.from("item_copies").select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId).is("archived_at", null),
  ])
  if (loans.error) fail(loans.error, "Gagal memuat pinjaman.")
  if (holds.error) fail(holds.error, "Gagal memuat reservasi.")
  if (fines.error) fail(fines.error, "Gagal memuat denda.")
  if (titles.error) fail(titles.error, "Gagal memuat total katalog.")
  if (copies.error) fail(copies.error, "Gagal memuat total eksemplar.")
  const openLoans = loans.data || []
  return {
    activeLoans: openLoans.length,
    dueToday: openLoans.filter((row) => row.due_date === localToday).length,
    overdue: openLoans.filter((row) => row.due_date < localToday).length,
    readyHolds: (holds.data || []).length,
    outstandingFines: (fines.data || []).reduce((sum, fine) => sum + Math.max(0, Number(fine.amount) - Number(fine.amount_paid)), 0),
    totalTitles: titles.count || 0,
    totalCopies: copies.count || 0,
  }
}

export async function checkoutCopies(memberNumber: string, barcodes: string[]) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.")
  const { data, error } = await supabase.rpc("checkout_copies", {
    p_member_number: memberNumber,
    p_copy_barcodes: barcodes,
    p_idempotency_key: crypto.randomUUID(),
  })
  if (error) fail(error, "Peminjaman gagal diproses.")
  return data as { ok: boolean; count: number; loans?: Array<{ barcode: string; due_date?: string }> }
}

export async function returnCopy(barcode: string, condition: "BAIK" | "RUSAK" | "HILANG") {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.")
  const { data, error } = await supabase.rpc("return_copy", {
    p_copy_barcode: barcode,
    p_condition: condition,
    p_idempotency_key: crypto.randomUUID(),
  })
  if (error) fail(error, "Pengembalian gagal diproses.")
  return data as { ok: boolean; fine_amount?: number; overdue_days?: number; copy_status?: string; hold_expires_at?: string }
}

export async function renewCopy(barcode: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.")
  const { data, error } = await supabase.rpc("renew_copy", {
    p_copy_barcode: barcode,
    p_idempotency_key: crypto.randomUUID(),
  })
  if (error) fail(error, "Perpanjangan gagal diproses.")
  return data as { ok: boolean; due_date?: string }
}
