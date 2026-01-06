-- Rocket Solutions Leads Table
-- Run this in Supabase SQL Editor

CREATE TABLE rocket_solutions_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  industry TEXT NOT NULL,
  sms_consent BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  contacted_at TIMESTAMP WITH TIME ZONE,
  website_url TEXT
);

-- Create indexes
CREATE INDEX idx_rocket_solutions_leads_created_at ON rocket_solutions_leads(created_at DESC);
CREATE INDEX idx_rocket_solutions_leads_email ON rocket_solutions_leads(email);
CREATE INDEX idx_rocket_solutions_leads_phone ON rocket_solutions_leads(phone);
CREATE INDEX idx_rocket_solutions_leads_status ON rocket_solutions_leads(status);

-- Enable Row Level Security
ALTER TABLE rocket_solutions_leads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public inserts" ON rocket_solutions_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON rocket_solutions_leads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates" ON rocket_solutions_leads
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- View for SMS consents
CREATE OR REPLACE VIEW rocket_solutions_sms_consents AS
SELECT id, created_at, full_name, business_name, phone, email, sms_consent, ip_address, user_agent
FROM rocket_solutions_leads
WHERE sms_consent = true;

GRANT SELECT ON rocket_solutions_sms_consents TO authenticated;

COMMENT ON TABLE rocket_solutions_leads IS 'Stores lead information from Rocket Solutions website with SMS consent tracking for A2P compliance';
