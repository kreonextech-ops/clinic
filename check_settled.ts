import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const res = await db.execute(sql`
    SELECT p.id, p.amount, p.payment_date, p.visit_id, pat.name
    FROM payments p
    JOIN patients pat ON pat.id = p.patient_id
    WHERE pat.name ILIKE '%sonakshi%'
  `);
  console.log("Payments for Sonakshi:", res.rows);
}
main();