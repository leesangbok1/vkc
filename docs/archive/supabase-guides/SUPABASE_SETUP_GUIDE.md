# 🗄️ Supabase 실제 프로젝트 설정 가이드

**Week 3 목표**: Mock 모드에서 실제 프로덕션 데이터베이스로 전환

**Current Status**: ✅ Week 2 MVP 완료 → Week 3 베타 출시 준비
**Goal**: 실제 Supabase 프로젝트로 베타 사용자 테스트 환경 구성

## Step 1: Create Supabase Project (5 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" → Sign in
3. Click "New Project"
4. Fill in project details:
   - **Name**: `viet-kconnect`
   - **Database Password**: Choose strong password (SAVE THIS!)
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait 2-3 minutes for initialization

## Step 2: Get Project Credentials (2 minutes)

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these three values:

```
Project URL: https://[your-project-id].supabase.co
Public anon key: eyJ[...long-key...]
Service role key: eyJ[...different-long-key...]
```

## Step 3: Update Environment Variables (1 minute)

Replace your `.env.local` file with real credentials:

```bash
# Copy template and edit with your values
cp .env.local.template .env.local.new

# Edit .env.local.new with your credentials:
# - Replace [YOUR-PROJECT-ID] with your project ID
# - Replace [YOUR-ANON-KEY-HERE] with your anon key
# - Replace [YOUR-SERVICE-ROLE-KEY-HERE] with your service key
# - Replace [YOUR-DB-PASSWORD] with your database password

# Backup current file and switch
mv .env.local .env.local.backup
mv .env.local.new .env.local
```

**Critical Values to Replace:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- Set `NEXT_PUBLIC_MOCK_MODE=false`

## Step 4: Apply Database Schema (5 minutes)

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project → **SQL Editor**
2. Copy and paste contents of `supabase/migrations/001_initial_schema.sql`
3. Click "Run"
4. Copy and paste contents of `supabase/migrations/002_rls_policies.sql`
5. Click "Run"

### Option B: Using Supabase CLI

```bash
# Install CLI if not installed
npm install -g supabase

# Apply migrations
supabase db push
```

## Step 5: Configure OAuth Providers (10 minutes)

### In Supabase Dashboard:

1. Go to **Authentication** → **Settings** → **Auth Providers**
2. Configure each provider:

#### Google OAuth:
1. Enable Google provider in Supabase
2. Go to [Google Cloud Console](https://console.cloud.google.com/)
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `https://[your-project-id].supabase.co/auth/v1/callback`
5. Copy Client ID and Secret to Supabase

#### Kakao OAuth:
1. Enable Kakao provider in Supabase
2. Go to [Kakao Developers](https://developers.kakao.com/)
3. Create app and get REST API key
4. Set redirect URI: `https://[your-project-id].supabase.co/auth/v1/callback`
5. Copy credentials to Supabase

#### Facebook OAuth:
1. Enable Facebook provider in Supabase
2. Go to [Meta for Developers](https://developers.facebook.com/)
3. Create app and configure Facebook Login
4. Set Valid OAuth Redirect URI: `https://[your-project-id].supabase.co/auth/v1/callback`
5. Copy App ID and Secret to Supabase

## Step 6: Test Setup (2 minutes)

```bash
# Start development server
npm run dev

# Test API endpoint
curl http://localhost:3000/api/questions

# Expected: Empty array with pagination data
# {"data":[],"pagination":{"page":1,"limit":10,"total":0,"totalPages":0,"hasNext":false,"hasPrev":false}}
```

## Step 7: Generate Mock Data (5 minutes)

```bash
# Run the mock data generation script
node scripts/generate-mock-data.js

# Verify data was created
curl http://localhost:3000/api/questions?limit=5
```

## Verification Checklist

- ✅ Supabase project created and accessible
- ✅ Environment variables updated with real credentials
- ✅ Database schema applied successfully
- ✅ OAuth providers configured
- ✅ API endpoints returning data (not errors)
- ✅ Mock data generated successfully

## Troubleshooting

### Error: "Invalid API key"
- Double-check your API keys in `.env.local`
- Ensure no extra spaces or characters
- Verify keys are from the correct project

### Error: "relation does not exist"
- Database schema not applied
- Run the migration files in SQL Editor

### Error: "Authentication failed"
- Check service role key is correct
- Verify OAuth provider configuration

### Error: "CORS policy"
- Check allowed origins in Supabase dashboard
- Ensure localhost:3000 is allowed for development

## Files Created/Modified

- `.env.local` - Updated with real Supabase credentials
- `.env.local.template` - Template for future setups
- `scripts/setup-supabase.sh` - Automated setup helper
- `docs/SUPABASE_SETUP_GUIDE.md` - This guide

## Next Steps

After successful setup:
1. **Generate mock data**: Run data generation scripts
2. **Test authentication**: Try social login flows
3. **Test API endpoints**: Verify all CRUD operations work
4. **Deploy to staging**: Test in production-like environment

## Support

If you encounter issues:
1. Check Supabase project logs in Dashboard
2. Verify all environment variables are correct
3. Test individual API endpoints
4. Check browser network tab for specific error messages

---
**Status**: Ready for production use once all steps completed ✅