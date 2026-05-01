# Team Task Manager

A minimal working React + Supabase MVP for team task management.

## Features
- **Dashboard**: View count of total, pending, and completed tasks.
- **Projects**: Create projects and list them.
- **Tasks**: Create tasks assigned to projects and toggle their status (todo/done).
- **Mock Login**: Enter any username to access the app.

## Setup Instructions

### 1. Database Setup (Supabase)
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the `database.sql` file in this repository and run the queries to create the `projects` and `tasks` tables with required policies.

### 2. Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Update `.env.local` with your Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public key.
   *(You can find these in Project Settings -> API in Supabase)*

### 3. Run Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Deployment (Railway/Vercel)
This is a standard Vite React application. 
- You can deploy it to **Vercel** or **Netlify** by simply linking the GitHub repository.
- Make sure to add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Environment Variables in your deployment platform settings.
