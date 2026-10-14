import { readFileSync } from "node:fs"
import { strict as assert } from "node:assert"

const sql = readFileSync(new URL("../supabase/migrations/20261014000000_initial_schema.sql", import.meta.url), "utf8")
const tx = readFileSync(new URL("../supabase/migrations/20261014010000_domain_transactions.sql", import.meta.url), "utf8")

for (const table of [
  "organizations", "organization_members", "members", "member_categories", "item_types",
  "item_copies", "loan_policies", "loans", "reservations", "fines", "payments",
  "payment_allocations", "notifications", "audit_logs",
]) {
  assert.match(sql, new RegExp(\`create table public\\\\.\${table}\\\\s*\\\\(\`, "i"), \`missing table \${table}\`)
  assert.match(sql, new RegExp(\`alter table public\\\\.\${table} enable row level security\`, "i"), \`RLS not enabled for \${table}\`)
}
assert.match(sql, /loans_one_open_per_copy_uidx|uq_loans_open_per_copy/i, "missing unique constraint against duplicate active loans")
assert.match(sql, /create or replace function public\\.has_org_role/i, "missing organization RBAC helper")
for (const fn of ["calculate_fine", "create_catalog_item", "create_member", "checkout_copies", "return_copy", "renew_copy", "record_payment"]) {
  assert.match(tx, new RegExp(\`create or replace function public\\\\.\${fn}\\\\s*\\\\(\`, "i"), \`missing RPC \${fn}\`)
}
assert.match(tx, /for update skip locked/i, "reservation queue must lock the oldest eligible row")
assert.match(tx, /idempotency_key/i, "transaction RPCs must support idempotency keys")
assert.match(tx, /grant execute on function public\\.checkout_copies/i, "checkout RPC must be explicitly granted to authenticated users")
console.log("Static schema checks passed.")
