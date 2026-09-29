-- ============================================================================
-- LifeLink Unified Blood Platform — Phase 3C: Institutional Verifications
-- ============================================================================

-- 1. INSTITUTION VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.institution_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('hospital', 'bloodbank', 'ngo')),
  license_type TEXT NOT NULL CHECK (license_type IN ('nabh', 'cdsco', 'state_transfusion_council', 'darpan_ngo', 'clinical_establishment')),
  license_number TEXT NOT NULL,
  nodal_officer_name TEXT NOT NULL,
  nodal_officer_phone TEXT NOT NULL,
  nodal_officer_designation TEXT NOT NULL,
  document_file_name TEXT NOT NULL,
  document_file_size INTEGER NOT NULL,
  document_file_type TEXT NOT NULL,
  document_url TEXT NOT NULL, -- Base64 data URL for Phase 3A/3C
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT
);

-- 2. ENABLE RLS
ALTER TABLE public.institution_verifications ENABLE ROW LEVEL SECURITY;

-- 3. HELPER FUNCTION: Check if current authenticated user is Platform Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. RLS POLICIES FOR INSTITUTION VERIFICATIONS
-- (a) SELECT: An institution can read its own submissions; Admins can read all submissions
DROP POLICY IF EXISTS "institution_verifications_select_policy" ON public.institution_verifications;
CREATE POLICY "institution_verifications_select_policy" ON public.institution_verifications
  FOR SELECT TO authenticated
  USING (
    auth.uid() = institution_id 
    OR public.is_admin()
  );

-- (b) INSERT: Institutional users can self-submit their own application with pending status
DROP POLICY IF EXISTS "institution_verifications_insert_policy" ON public.institution_verifications;
CREATE POLICY "institution_verifications_insert_policy" ON public.institution_verifications
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = institution_id 
    AND verification_status = 'pending'
  );

-- (c) UPDATE: Only Admins can approve/reject verification status and enter rejection reasons
DROP POLICY IF EXISTS "institution_verifications_update_policy" ON public.institution_verifications;
CREATE POLICY "institution_verifications_update_policy" ON public.institution_verifications
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. UPDATE USERS INSERT POLICY TO ALLOW INSTITUTIONAL REGISTRATIONS
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = id 
    AND role IN ('patient', 'donor', 'hospital', 'bloodbank', 'ngo')
    AND kyc_status = 'pending'
    AND verification_status = 'pending'
  );

-- 6. UPDATE GUARD TRIGGER ON USERS TABLE
CREATE OR REPLACE FUNCTION public.trg_users_guard_update()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service role, backend migrations, and SQL Editor calls (where auth.uid() is NULL)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Allow authorized administrative and hospital personnel to update all fields
  IF public.is_admin_or_hospital() THEN
    RETURN NEW;
  END IF;

  -- Block regular authenticated users from modifying their role
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Access Denied: Regular users are not permitted to change their role.';
  END IF;

  -- Allow non-staff to transition kyc_status ONLY from 'rejected' to 'pending' (Donor KYC resubmit flow)
  IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status THEN
    IF NOT (OLD.kyc_status = 'rejected' AND NEW.kyc_status = 'pending') THEN
      RAISE EXCEPTION 'Access Denied: Only authorized clinical or administrative staff can update kyc_status.';
    END IF;
  END IF;

  -- Allow non-staff to transition verification_status ONLY from 'rejected' to 'pending' (Institutional resubmit flow)
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    IF NOT (OLD.verification_status = 'rejected' AND NEW.verification_status = 'pending') THEN
      RAISE EXCEPTION 'Access Denied: Only authorized administrative staff can update verification_status.';
    END IF;
  END IF;

  -- Block non-staff from modifying institution_name on their own row
  IF NEW.institution_name IS DISTINCT FROM OLD.institution_name THEN
    RAISE EXCEPTION 'Access Denied: Non-staff users cannot modify institution_name.';
  END IF;

  -- Allow non-staff to correct license_number ONLY if their previous verification was rejected
  IF NEW.license_number IS DISTINCT FROM OLD.license_number THEN
    IF NOT (OLD.verification_status = 'rejected') THEN
      RAISE EXCEPTION 'Access Denied: Non-staff users cannot modify license_number unless re-applying after rejection.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
