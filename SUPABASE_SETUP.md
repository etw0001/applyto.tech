# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: `applyto-tech` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

## 2. Get Your API Keys

1. Go to Project Settings (gear icon)
2. Click on "API" in the sidebar
3. Copy:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## 3. Set Up Environment Variables

1. Create a `.env` file in the root of your project:
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the values with your actual Supabase URL and anon key

## 4. Run Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Click "New query"
4. Copy and paste the contents of `supabase/schema.sql`
5. Click "Run" to execute the SQL

This will create:
- `applications` table for storing job applications
- `profiles` table for user metadata
- Row Level Security (RLS) policies
- Automatic profile creation on signup
- Indexes for better query performance

## 4b. Run Additional Migrations

After running the main schema, also run these migrations in the SQL Editor:

1. **Theme Support** (optional) - Run `supabase/migration_add_theme.sql`
   - Adds theme preference to user profiles

## 4c. Deploy the Delete User Edge Function

The "Delete Account" button uses a Supabase Edge Function that deletes the auth user (profile + applications cascade automatically via `ON DELETE CASCADE`).

### Deploy via Supabase CLI

1. **Install Supabase CLI:**
   ```bash
   brew install supabase/tap/supabase
   ```

2. **Login, init, and link:**
   ```bash
   supabase login
   supabase init
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find your project ref in your Supabase URL: `https://YOUR_PROJECT_REF.supabase.co`)

3. **Deploy the function:**
   ```bash
   supabase functions deploy delete-user --no-verify-jwt
   ```
   (`--no-verify-jwt` is needed because the function handles its own auth verification internally)

## 5. Enable Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Create or Select a Project:**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing one
   - Give it a name (e.g., "ApplyTo Tech")
   - Click "Create"

3. **Enable Google+ API:**
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google+ API" and click on it
   - Click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" (unless you have a Google Workspace)
     - Fill in:
       - App name: "ApplyTo Tech" (or your app name)
       - User support email: Your email
       - Developer contact: Your email
     - Click "Save and Continue" through the scopes (defaults are fine)
     - Add test users if needed, then "Save and Continue"
     - Click "Back to Dashboard"
   
5. **Create OAuth Client ID:**
   - Application type: Select "Web application"
   - Name: "ApplyTo Tech" (or any name)
   - **Authorized redirect URIs:** Click "ADD URI" and add:
     ```
     https://rwcizpntvgdhkjjimrai.supabase.co/auth/v1/callback
     ```
     (Replace `rwcizpntvgdhkjjimrai` with your actual project reference if different)
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these in the next step)

### Step 2: Configure Supabase

1. Go back to your Supabase dashboard
2. Navigate to: **Project Settings** → **Authentication** → **Providers**
3. Find "Google" in the list and click on it
4. **Enable Google:**
   - Toggle "Enable Google provider" to ON
   - Paste your **Client ID** (from Google Cloud Console)
   - Paste your **Client Secret** (from Google Cloud Console)
   - Click "Save"

### Step 3: Add Redirect URLs (if needed)

1. Still in Supabase, go to **Project Settings** → **Authentication** → **URL Configuration**
2. Under "Redirect URLs", add your app's URL:
   - For local development: `http://localhost:5173` (or your Vite dev port)
   - For production: `https://yourdomain.com`
   - Click "Add" for each URL

That's it! Google OAuth should now be configured. Users can sign in with their Google accounts.

### Step 4: Publish Your App (Allow All Google Users)

**Important:** By default, your OAuth app is in "Testing" mode, which only allows test users. To allow all Google users to sign in:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **OAuth consent screen**
3. Scroll to the bottom of the page
4. Click **"PUBLISH APP"** button
5. Confirm by clicking **"CONFIRM"** in the dialog

**What this does:**
- Changes your app from "Testing" to "In production"
- Allows any Google user to sign in (no test user list needed)
- Your app will be publicly available for Google sign-in

**Note:** 
- You may need to verify your app identity if you haven't already
- For production apps, Google may require additional verification if you request sensitive scopes
- For basic profile/email scopes, publishing is usually straightforward

## 6. Test It Out

1. Start your dev server: `npm run dev`
2. Click "Sign in with Google"
3. You should be redirected to Google for authentication
4. After signing in, you'll be redirected back to your app

## Database Schema

### Applications Table
- `id` - UUID primary key
- `user_id` - Foreign key to auth.users
- `company` - Company name
- `position` - Job position/role
- `link` - Application URL (optional)
- `status` - One of: 'applied', 'interviewing', 'offered', 'rejected'
- `date_applied` - Date when application was submitted
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Profiles Table
- `id` - UUID (matches auth.users.id)
- `name` - User's full name
- `email` - User's email
- `avatar_url` - Profile picture URL
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Security

Row Level Security (RLS) is enabled, so:
- Users can only see/edit their own applications
- Users can only see/edit their own profile
- All queries are automatically filtered by user_id
