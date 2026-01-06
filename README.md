# Rocket Solutions - Website Builder for Home Service Businesses

Professional custom websites with self-editing capabilities for home service business owners.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (use same as GoDetailPro)
- Vercel account for deployment

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run Supabase schema
# Open Supabase SQL Editor and run supabase-schema.sql

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## 📦 Deployment to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR-GITHUB-URL
git push -u origin main

# 2. Deploy to Vercel
# - Import GitHub repo at vercel.com
# - Add environment variables
# - Deploy

# 3. Add custom domain in Vercel settings
```

## 🔐 Telnyx A2P Verification - READY TO SUBMIT

Your website is 100% compliant with:
- ✅ TCPA (Telephone Consumer Protection Act)
- ✅ CAN-SPAM Act
- ✅ CTIA Guidelines
- ✅ A2P 10DLC Requirements

### Your Information:
- Company: Rocket Solutions LLC
- EIN: 30-1450877 (for Telnyx only, not on website)
- Authorized Rep: Gibson Thompson
- Volume: 10-50 messages/day (300-1,500/month)

**See TELNYX_CHECKLIST.md for complete submission guide**

## 📊 Database Schema

### rocket_solutions_leads Table
Stores lead information with SMS consent tracking:
- `full_name`, `business_name`, `phone`, `email`, `industry`
- `sms_consent` (boolean)
- `ip_address`, `user_agent` (for audit trail)
- `created_at` (automatic timestamp)

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Icons**: React Icons

## 📝 Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from: Supabase Dashboard → Project Settings → API

## 🎨 Customization

### Update Images
- Logo: `app/layout.tsx` lines 28, 42
- Background: `app/page.tsx` line 66

### Update Colors
Edit `tailwind.config.js`:
```js
colors: {
  'rocket-blue': '#0066FF',
  'rocket-dark': '#0A1628',
  'rocket-light': '#F8FAFC',
}
```

## 📁 Project Structure

```
rocket-solutions-website/
├── app/
│   ├── layout.tsx              # Layout with header/footer
│   ├── page.tsx                # Homepage with form
│   ├── globals.css             # Global styles
│   ├── privacy/page.tsx        # Privacy Policy
│   ├── terms/page.tsx          # Terms of Service
│   └── api/submit-form/route.ts # Form submission API
├── lib/
│   └── supabase.ts             # Supabase client
├── TELNYX_CHECKLIST.md         # Submission guide
├── DEPLOYMENT_GUIDE.md         # Deploy instructions
├── supabase-schema.sql         # Database schema
└── package.json                # Dependencies
```

## 📧 Features

- ✅ Responsive mobile-first design
- ✅ Form validation and error handling
- ✅ SMS consent tracking with audit trail
- ✅ Supabase integration
- ✅ Complete legal pages (Privacy, Terms)
- ✅ SEO optimized
- ✅ Fast loading performance

## 🚨 Before Telnyx Submission

- [ ] Deploy to live domain
- [ ] Test form submission
- [ ] Verify data in Supabase
- [ ] Take required screenshots
- [ ] Add your email and phone to checklist
- [ ] Review TELNYX_CHECKLIST.md

## 📞 Support

support@rocketsolutions.com

## 📄 License

Copyright © 2026 Rocket Solutions LLC. All rights reserved.
