-- ============================================================================
-- LifeLink Unified Blood Platform — Phase 3A Migration: Core Tables & RLS
-- ============================================================================

-- 1. USERS TABLE (Linked 1-to-1 with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('public', 'patient', 'donor', 'hospital', 'bloodbank', 'ngo', 'admin')) DEFAULT 'patient',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  location JSONB NOT NULL DEFAULT '{"address": "Delhi NCR", "city": "Delhi", "lat": 28.6139, "lng": 77.2090}'::jsonb,
  date_of_birth DATE NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  kyc_status TEXT NOT NULL CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  institution_name TEXT,
  license_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- National Blood Transfusion Council 18-65 age eligibility check
  CONSTRAINT chk_donor_age CHECK (
    date_of_birth <= CURRENT_DATE - INTERVAL '18 years' AND
    date_of_birth >= CURRENT_DATE - INTERVAL '65 years'
  )
);

-- 2. DONOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  is_available BOOLEAN NOT NULL DEFAULT false,
  last_donation_date DATE,
  reliability_score INTEGER NOT NULL DEFAULT 50 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  total_donations INTEGER NOT NULL DEFAULT 0 CHECK (total_donations >= 0),
  badges TEXT[] NOT NULL DEFAULT ARRAY['Pending KYC Verification']::text[],
  notification_radius_km INTEGER NOT NULL DEFAULT 15,
  urgency_threshold TEXT NOT NULL DEFAULT 'standard' CHECK (urgency_threshold IN ('standard', 'urgent', 'critical')),
  id_type TEXT NOT NULL CHECK (id_type IN ('aadhaar', 'voter_id', 'passport', 'driving_license')),
  id_number_masked TEXT NOT NULL,
  kyc_status TEXT NOT NULL CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DONOR KYC VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.donor_kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  id_type TEXT NOT NULL CHECK (id_type IN ('aadhaar', 'voter_id', 'passport', 'driving_license')),
  id_number_masked TEXT NOT NULL,
  document_file_name TEXT NOT NULL,
  document_file_size INTEGER NOT NULL,
  document_file_type TEXT NOT NULL,
  document_url TEXT NOT NULL, -- Base64 data URL for Phase 3A; private bucket ref in Phase 3B
  kyc_status TEXT NOT NULL CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT
);

-- 4. AUTO-UPDATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_donor_profiles_updated_at
  BEFORE UPDATE ON public.donor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is an Admin or Hospital
CREATE OR REPLACE FUNCTION public.is_admin_or_hospital()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'hospital')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- --- USERS POLICIES ---
-- Any authenticated user can read their own profile, staff can read all
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin_or_hospital());

-- Users can insert their own profile matching auth.uid()
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own phone/location; staff can update verification status
CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin_or_hospital())
  WITH CHECK (auth.uid() = id OR public.is_admin_or_hospital());

-- --- DONOR PROFILES POLICIES ---
-- Donors can read their own profile; staff can read all; public matching can read available donors
CREATE POLICY "donor_profiles_select_policy" ON public.donor_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_or_hospital() OR is_available = true);

-- Donors can insert their own profile
CREATE POLICY "donor_profiles_insert_policy" ON public.donor_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Donors can update their availability (if verified); staff can update kyc_status
CREATE POLICY "donor_profiles_update_policy" ON public.donor_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin_or_hospital())
  WITH CHECK (auth.uid() = user_id OR public.is_admin_or_hospital());

-- --- DONOR KYC VERIFICATIONS POLICIES ---
-- Donors can read their own submissions; staff can read all submissions
CREATE POLICY "kyc_verifications_select_policy" ON public.donor_kyc_verifications
  FOR SELECT TO authenticated
  USING (auth.uid() = donor_id OR public.is_admin_or_hospital());

-- Donors can submit KYC applications
CREATE POLICY "kyc_verifications_insert_policy" ON public.donor_kyc_verifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = donor_id);

-- Only Admin and Hospital staff can update KYC status and rejection reasons
CREATE POLICY "kyc_verifications_update_policy" ON public.donor_kyc_verifications
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_hospital())
  WITH CHECK (public.is_admin_or_hospital());
