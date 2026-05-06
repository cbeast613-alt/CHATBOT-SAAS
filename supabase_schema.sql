-- ============================================================
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 0. Cleanup
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;

-- 1. TENANTS table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Business info
  business_name TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  website_url TEXT,
  logo_url TEXT,
  business_type TEXT DEFAULT 'general',
  
  -- Plan & billing
  plan TEXT DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'growth', 'agency')),
  plan_status TEXT DEFAULT 'active',
  subscription_status TEXT DEFAULT 'trial',
  billing_cycle TEXT DEFAULT 'monthly',
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  plan_started_at TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Usage & limits
  is_active BOOLEAN DEFAULT true,
  message_limit INTEGER DEFAULT 50,
  message_count INTEGER DEFAULT 0,
  messages_used INTEGER DEFAULT 0,
  messages_limit INTEGER DEFAULT 50,
  monthly_message_count INTEGER DEFAULT 0,
  monthly_message_limit INTEGER DEFAULT 50,
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  
  -- Chatbot config
  chatbot_name TEXT,
  chatbot_color TEXT DEFAULT '#1a56db',
  chatbot_welcome TEXT DEFAULT 'Hi! How can I help you?',
  chatbot_language TEXT DEFAULT 'auto',
  chatbot_prompt TEXT,
  quick_replies TEXT[] DEFAULT ARRAY[]::TEXT[],
  widget_config JSONB DEFAULT '{}',
  business_context TEXT,
  
  -- Payment
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PAYMENTS table
CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  razorpay_payment_id   TEXT UNIQUE NOT NULL,
  razorpay_order_id     TEXT,
  plan                  TEXT NOT NULL,
  amount_paise          INTEGER NOT NULL,
  currency              TEXT DEFAULT 'INR',
  invoice_number        TEXT UNIQUE,
  status                TEXT CHECK (status IN ('captured', 'failed', 'refunded')),
  paid_at               TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONVERSATIONS table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- 4. MESSAGES table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RPC function to safely increment message count
CREATE OR REPLACE FUNCTION increment_message_count(tenant_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tenants
  SET monthly_message_count = monthly_message_count + 1,
      messages_used = messages_used + 1
  WHERE id = tenant_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Tenants RLS
CREATE POLICY "tenants_select_own" ON tenants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tenants_insert_own" ON tenants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tenants_update_own" ON tenants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tenants_delete_own" ON tenants FOR DELETE USING (auth.uid() = user_id);

-- Other tables RLS (Link via tenant_id -> user_id)
CREATE POLICY "payments_select_own" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = payments.tenant_id AND tenants.user_id = auth.uid()));
CREATE POLICY "conversations_all_own" ON conversations FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = conversations.tenant_id AND tenants.user_id = auth.uid()));
CREATE POLICY "messages_all_own" ON messages FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = messages.tenant_id AND tenants.user_id = auth.uid()));

-- 7. Auto update timestamp
CREATE OR REPLACE FUNCTION update_tenants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_timestamp
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_tenants_updated_at();

-- 8. Analytics RPC Function
CREATE OR REPLACE FUNCTION get_daily_message_stats(tenant_id_input UUID, days_limit INTEGER DEFAULT 7)
RETURNS TABLE (date TEXT, count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(series.day, 'DD Mon') as date,
    COALESCE(count(m.id)::integer, 0) as count
  FROM (
    SELECT generate_series(
      now() - (days_limit - 1 || ' days')::interval,
      now(),
      '1 day'::interval
    )::date AS day
  ) series
  LEFT JOIN messages m ON m.created_at::date = series.day 
    AND m.tenant_id = tenant_id_input 
    AND m.role = 'user'
  GROUP BY series.day
  ORDER BY series.day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schema cache refresh
NOTIFY pgrst, 'reload schema';
