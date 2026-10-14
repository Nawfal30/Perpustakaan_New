import { readFileSync } from "node:fs"
import { strict as assert } from "node:assert"

const sql = readFileSync(new URL("../supabase/migrations/20261014000000_initial_schema.sql", import.meta.url), "utf8").toLowerCase()
const tx = readFileSync(new URL("../supabase/migrations/20261014010000_domain_transactions.sql", import.meta.url), "utf8").toLowerCase()

for (const table of [
  "organizations", "organization_members", "members", "member_categories", "item_types",
  "item_copies", "loan_policies", "loans", "reservations", "fines", "payments",
  "payment_allocations", "notifications", "audit_logs",
]) {
  assert.ok(sql.includes(`create table public.${table} (`), `missing table ${table}`)
}
assert.ok(sql.includes("enable row level security"), "RLS enabling block is missing")
assert.ok(sql.includes("'organizations','organization_members','member_categories'"), "RLS table list is incomplete")
assert.ok(sql.includes("loans_one_open_per_copy_uidx") || sql.includes("uq_loans_open_per_copy"), "missing unique constraint against duplicate active loans")
assert.ok(sql.includes("create or replace function public.has_org_role"), "missing organization RBAC helper")

for (const fn of ["calculate_fine", "create_catalog_item", "create_member", "checkout_copies", "return_copy", "renew_copy", "record_payment"]) {
  assert.ok(tx.includes(`create or replace function public.${fn}(`), `missing RPC ${fn}`)
}
assert.ok(tx.includes("for update skip locked"), "reservation queue must lock the oldest eligible row")
assert.ok(tx.includes("idempotency_key"), "transaction RPCs must support idempotency keys")
assert.ok(tx.includes("grant execute on function public.checkout_copies"), "checkout RPC must be explicitly granted to authenticated users")
console.log("Static schema checks passed.")
