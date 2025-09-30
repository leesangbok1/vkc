#!/bin/bash

# Viet K-Connect Supabase Setup Script
# This script helps you set up your Supabase project step by step

echo "🚀 Viet K-Connect Supabase Setup"
echo "================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local file with your Supabase credentials."
    exit 1
fi

# Check if we're still in mock mode
if grep -q "NEXT_PUBLIC_MOCK_MODE=true" .env.local; then
    echo "⚠️  Currently in MOCK MODE"
    echo "Please update your .env.local file with real Supabase credentials."
    echo ""
    echo "📋 Steps to get your credentials:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Create new project named 'viet-kconnect'"
    echo "3. Go to Project Settings > API"
    echo "4. Copy your Project URL and API keys"
    echo "5. Update .env.local file (use .env.local.template as reference)"
    echo ""
    exit 1
fi

echo "✅ Environment variables configured"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    if command -v npm &> /dev/null; then
        npm install -g supabase
    elif command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
    else
        echo "❌ Please install Supabase CLI manually:"
        echo "https://supabase.com/docs/guides/cli"
        exit 1
    fi
fi

echo "✅ Supabase CLI ready"

# Apply migrations
echo "🗄️  Applying database migrations..."

# Check if migration files exist
if [ ! -f "supabase/migrations/001_initial_schema.sql" ]; then
    echo "❌ Migration files not found!"
    echo "Please ensure migration files exist in supabase/migrations/"
    exit 1
fi

echo "📝 Available migrations:"
ls -la supabase/migrations/

echo ""
echo "🎯 Next steps:"
echo "1. Apply migrations in Supabase Dashboard:"
echo "   - Go to https://supabase.com/dashboard/project/[your-project]/sql"
echo "   - Copy and run contents of supabase/migrations/001_initial_schema.sql"
echo "   - Copy and run contents of supabase/migrations/002_rls_policies.sql"
echo ""
echo "2. Configure OAuth providers in Dashboard:"
echo "   - Go to Authentication > Settings > Auth Providers"
echo "   - Enable Google, Kakao, Facebook OAuth"
echo ""
echo "3. Test API endpoints:"
echo "   npm run dev"
echo "   curl http://localhost:3000/api/questions"
echo ""

echo "✅ Setup script completed!"
echo "Follow the manual steps above to complete Supabase setup."