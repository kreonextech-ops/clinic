INSERT INTO payments (visit_id, patient_id, amount, payment_date, payment_method, notes)
SELECT
    e.visit_id,
    e.patient_id,
    ((COALESCE(e.consultation_fee::numeric, 0) + COALESCE(e.medicine_charge::numeric, 0) + COALESCE(e.procedure_fee_paid::numeric, 0)) - COALESCE(p.total_payments, 0)) AS amount,
    v.visit_date,
    'cash',
    'Initial payment (auto-recovered)'
FROM earnings e
JOIN visits v ON e.visit_id = v.id
LEFT JOIN (
    SELECT visit_id, SUM(amount::numeric) as total_payments
    FROM payments
    GROUP BY visit_id
) p ON p.visit_id = e.visit_id
WHERE ((COALESCE(e.consultation_fee::numeric, 0) + COALESCE(e.medicine_charge::numeric, 0) + COALESCE(e.procedure_fee_paid::numeric, 0)) - COALESCE(p.total_payments, 0)) > 0;
