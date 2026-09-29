-- ============================================================================
-- LifeLink Unified Blood Platform — Phase 3A: Security Hardening Migration
-- ============================================================================
-- Description:
-- 1. Prevents non-staff authenticated callers from tampering with sensitive columns
--    (role, kyc_status, verification_status on public.users; kyc_status, is_available on public.donor_profiles)
--    via BEFORE UPDATE triggers. Allows service role / SQL Editor (auth.uid() IS NULL).
-- 2. Restricts self-registration INSERT policies to safe initial values:
--    - users: role IN ('patient', 'donor'), kyc_status = 'pending', verification_status = 'pending'
--    - donor_profiles: kyc_status = 'pending', is_available = false
--    - donor_kyc_verifications: kyc_status = 'pending'
-- 3. Tightens donor_profiles SELECT policy: available donors visible only to staff or verified users.
-- ============================================================================

-- Ensure helper function exists to identify administrative or hospital staff
CREATE OR REPLACE FUNCTION public.is_admin_or_hospital()
RETURNS BOOLEAN 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('admin', 'hospital')
  );
$$;


-- ============================================================================
-- 1. BEFORE UPDATE TRIGGERS TO PREVENT NON-STAFF COLUMN TAMPERING
-- ============================================================================

-- Trigger on public.users:
-- Prevents non-staff from self-promoting role, kyc_status, verification_status, institution_name, or license_number
-- Allows resubmission: non-staff may change kyc_status / verification_status ONLY from 'rejected' to 'pending'
CREATE OR REPLACE FUNCTION public.trg_users_guard_update()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service role, backend migrations, and Supabase SQL Editor calls (where auth.uid() is NULL)
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

  -- Allow non-staff to transition kyc_status ONLY from 'rejected' to 'pending' (KYC resubmit flow)
  IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status THEN
    IF NOT (OLD.kyc_status = 'rejected' AND NEW.kyc_status = 'pending') THEN
      RAISE EXCEPTION 'Access Denied: Only authorized clinical or administrative staff can update kyc_status (non-staff may only resubmit from rejected to pending).';
    END IF;
  END IF;

  -- Allow non-staff to transition verification_status ONLY from 'rejected' to 'pending'
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    IF NOT (OLD.verification_status = 'rejected' AND NEW.verification_status = 'pending') THEN
      RAISE EXCEPTION 'Access Denied: Only authorized clinical or administrative staff can update verification_status (non-staff may only resubmit from rejected to pending).';
    END IF;
  END IF;

  -- Block non-staff from modifying institution_name on their own row
  IF NEW.institution_name IS DISTINCT FROM OLD.institution_name THEN
    RAISE EXCEPTION 'Access Denied: Non-staff users cannot modify institution_name.';
  END IF;

  -- Block non-staff from modifying license_number on their own row
  IF NEW.license_number IS DISTINCT FROM OLD.license_number THEN
    RAISE EXCEPTION 'Access Denied: Non-staff users cannot modify license_number.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_users_update ON public.users;
CREATE TRIGGER trg_guard_users_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_users_guard_update();


-- Trigger on public.donor_profiles:
-- Prevents non-staff from modifying kyc_status, badges, total_donations, reliability_score, last_donation_date,
-- or setting is_available = true when not verified.
-- Allows resubmission: non-staff may change kyc_status ONLY from 'rejected' to 'pending'.
CREATE OR REPLACE FUNCTION public.trg_donor_profiles_guard_update()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service role, backend migrations, and Supabase SQL Editor calls (where auth.uid() is NULL)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Allow authorized administrative and hospital personnel
  IF public.is_admin_or_hospital() THEN
    RETURN NEW;
  END IF;

  -- Allow non-staff to transition kyc_status ONLY from 'rejected' to 'pending' (KYC resubmit flow)
  IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status THEN
    IF NOT (OLD.kyc_status = 'rejected' AND NEW.kyc_status = 'pending') THEN
      RAISE EXCEPTION 'Access Denied: Only authorized clinical staff can update kyc_status on donor profiles (non-staff may only resubmit from rejected to pending).';
    END IF;
  END IF;

  -- Block regular authenticated donors from setting is_available = true if their KYC is not verified
  IF (NEW.is_available = true AND OLD.kyc_status != 'verified' AND NEW.kyc_status != 'verified') THEN
    RAISE EXCEPTION 'Access Denied: Donor availability cannot be enabled until government ID KYC verification is approved by clinical staff.';
  END IF;

  -- Block non-staff from modifying badges on their own row
  IF NEW.badges IS DISTINCT FROM OLD.badges THEN
    RAISE EXCEPTION 'Access Denied: Non-staff users cannot modify badges.';
  END IF;

  -- Block non-staff from modifying total_donations on their own row
  IF NEW.total_donations IS DISTINCT FROM OLD.total_donations THEN
    RAISE EXCEPTION 'Access Denied: Non-staff users cannot modify total_donations.';
  END IF;

  -- Block non-staff from modifying reliability_score on their own row
  IF NEW.reliability_score IS DISTINCT FROM OLD.reliability_score THEN
    RAISE EXCEPTION 'Access Denied: Non-staff users cannot modify reliability_score.';
  END IF;

  -- Block non-staff from modifying last_donation_date on their own row
  IF NEW.last_donation_date IS DISTINCT FROM OLD.last_donation_date THEN
    RAISE EXCEPTION 'Access Denied: Non-staff users cannot modify last_donation_date.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_donor_profiles_update ON public.donor_profiles;
CREATE TRIGGER trg_guard_donor_profiles_update
  BEFORE UPDATE ON public.donor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_donor_profiles_guard_update();


-- ============================================================================
-- 2. TIGHTEN INSERT POLICIES (SAFE SELF-REGISTRATION CONSTRAINTS)
-- ============================================================================

-- (a) public.users: Self-registration restricted to patient/donor role with pending status
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = id 
    AND role IN ('patient', 'donor')
    AND kyc_status = 'pending'
    AND verification_status = 'pending'
  );

-- (b) public.donor_profiles: Self-creation restricted to pending status and unavailable state
DROP POLICY IF EXISTS "donor_profiles_insert_policy" ON public.donor_profiles;
CREATE POLICY "donor_profiles_insert_policy" ON public.donor_profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND kyc_status = 'pending'
    AND is_available = false
  );

-- (c) public.donor_kyc_verifications: Submissions forced to pending status
DROP POLICY IF EXISTS "kyc_verifications_insert_policy" ON public.donor_kyc_verifications;
CREATE POLICY "kyc_verifications_insert_policy" ON public.donor_kyc_verifications
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = donor_id
    AND kyc_status = 'pending'
  );


-- ============================================================================
-- 3. TIGHTEN DONOR PROFILES SELECT POLICY
-- ============================================================================
-- Available donor profiles directory is visible only to:
-- - The donor themselves (auth.uid() = user_id)
-- - Administrative and Hospital clinical staff (is_admin_or_hospital())
-- - Other donors whose own account is already verified (kyc_status = 'verified')
DROP POLICY IF EXISTS "donor_profiles_select_policy" ON public.donor_profiles;
CREATE POLICY "donor_profiles_select_policy" ON public.donor_profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR public.is_admin_or_hospital() 
    OR (
      is_available = true 
      AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND kyc_status = 'verified'
      )
    )
  );
