# Dental Clinic Management System — Setup Guide

## Prerequisites
- Oracle Cloud VM (Ubuntu 22.04) or any Linux VPS
- Node.js 18+
- PostgreSQL 14+
- Cloudflare account (for R2 storage)
- Resend account (for email)

---

## 1. Clone & Install

```bash
git clone <your-repo> dental-clinic
cd dental-clinic
npm install
```

---

## 2. PostgreSQL Database

```bash
sudo -u postgres psql
CREATE USER dental_user WITH PASSWORD 'your_strong_password';
CREATE DATABASE dental_clinic OWNER dental_user;
GRANT ALL PRIVILEGES ON DATABASE dental_clinic TO dental_user;
\q
```

Then run the migration:
```bash
psql -U dental_user -d dental_clinic -f lib/db/migrations/0001_initial.sql
```

---

## 3. Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your values
nano .env.local
```

Generate VAPID keys for push notifications:
```bash
npx web-push generate-vapid-keys
```

---

## 4. Create Doctor Account (First Time)

Start the app temporarily, then run:
```bash
curl -X POST https://yourclinic.com/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "setupSecret": "YOUR_CRON_SECRET",
    "username": "doctor",
    "password": "YourSecurePassword123",
    "clinicName": "My Dental Clinic",
    "doctorName": "Dr. Your Name",
    "email": "doctor@gmail.com"
  }'
```

⚠️ **Delete or disable `/app/api/setup/route.ts` after creating the account.**

---

## 5. Build & Run

```bash
npm run build
npm start
# or with PM2:
pm2 start npm --name "dental-clinic" -- start
pm2 save
```

---

## 6. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourclinic.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then enable SSL:
```bash
sudo certbot --nginx -d yourclinic.com
```

---

## 7. Daily Reminder Cron

Add to crontab (`crontab -e`):
```bash
# Run every day at 8:00 AM
0 8 * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourclinic.com/api/cron/reminders
```

---

## 8. Cloudflare R2 Setup

1. Go to Cloudflare Dashboard → R2
2. Create a bucket named `dental-clinic-files`
3. Enable public access and copy the Public URL
4. Create an API token with R2 read/write permissions
5. Add credentials to `.env.local`

---

## 9. Resend Email Setup

1. Sign up at resend.com
2. Add and verify your domain
3. Create an API key
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `.env.local`
5. Set `DOCTOR_EMAIL` to the Gmail address that should receive reminders

---

## Feature Summary

| Feature | Status |
|---|---|
| Doctor login with JWT session | ✅ |
| Forgot password (security questions) | ✅ |
| Patient registration & profile (PT-XXXX) | ✅ |
| Appointments (scheduled + walk-in) | ✅ |
| Visit records (treatments, billing, follow-ups, inventory deduction) | ✅ |
| Billing with partial payment tracking | ✅ |
| Follow-up reminders with auto-overdue marking | ✅ |
| Inventory management with low-stock alerts | ✅ |
| File uploads to Cloudflare R2 (X-rays, photos) | ✅ |
| Push notifications (service worker) | ✅ |
| Email reminders via Resend | ✅ |
| Daily cron: summary email + push | ✅ |
| Reports: Earnings, Treatments, Pending Payments, Reorder | ✅ |
| Print-ready receipts (browser print-to-PDF) | ✅ |
| Responsive UI (desktop sidebar + mobile bottom nav) | ✅ |
| PWA manifest | ✅ |

---

Built by Kreonex Technologies
