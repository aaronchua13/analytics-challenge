# Analytics Challenge

A modern analytics dashboard built with Next.js 15, Supabase, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Secure sign-up and sign-in flows using Supabase Auth.
- 📊 **Dashboard**: Real-time analytics visualization using Recharts/Visx.
- 📱 **Responsive Design**: Built with Tailwind CSS and Shadcn UI.
- 🛡️ **Security**: Row Level Security (RLS) and Middleware protection.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: Zustand, React Query

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase project created

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the SQL migrations found in `supabase/migrations` in your Supabase project's SQL Editor to set up the schema and RLS policies:

1. `20240523000000_init_schema.sql` (Creates tables and RLS)
2. `20240523000001_add_dashboard_stats.sql` (Adds dashboard RPCs)
3. `20240523000002_add_daily_metrics_rpc.sql` (Adds metrics RPCs)

### 4. Run the Application

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
