import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const res = await db.execute(sql`
      SELECT e.visit_id, e.patient_id, p.name, e.procedure_fee_paid, 
             (SELECT SUM(amount::numeric) FROM payments WHERE visit_id = e.visit_id) as total_payments
      FROM earnings e
      JOIN patients p ON p.id = e.patient_id
      WHERE p.name ILIKE '%sonakshi%'
    `);
    console.log("Sonakshi records:", res.rows);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
main();