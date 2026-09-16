import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const res = await db.execute(sql`
      SELECT id, procedure_fee_balance, payment_status, total_amount, procedure_fee_paid 
      FROM earnings 
      WHERE (procedure_fee_balance::numeric > 0 AND payment_status = 'settled')
         OR (procedure_fee_balance::numeric = 0 AND payment_status = 'pending');
    `);
    console.log("Inconsistent records:", res.rows);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
main();