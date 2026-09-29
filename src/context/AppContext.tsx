import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, User, DonorProfile, BloodRequest, BloodBank, BloodUnit, 
  Camp, ImpactNotification, AuditLogEntry, SlaConfig, BloodGroup, BloodComponent, UrgencyLevel, UnitStatus, Location,
  DonorKycSubmission, DonorRegistrationInput, KycStatus, GovIdType,
  InstitutionType, InstitutionLicenseType, InstitutionVerificationSubmission, InstitutionRegistrationInput
} from '../types';
import { 
  INITIAL_USERS, INITIAL_DONOR_PROFILES, INITIAL_BLOOD_BANKS, 
  INITIAL_BLOOD_UNITS, INITIAL_REQUESTS, INITIAL_CAMPS, INITIAL_IMPACTS,
  INITIAL_KYC_SUBMISSIONS, INITIAL_INSTITUTION_SUBMISSIONS
} from '../data/mockData';
import { rankDonors, findNearbyBloodBanksWithStock } from '../services/matchingSim';
import { AuditLogSimulator } from '../services/auditSim';
import { Language, translations, TranslationSchema } from '../services/i18n';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AppContextType {
  currentRole: Role;
  currentUser: User;
  currentLanguage: Language;
  t: TranslationSchema;
  requests: BloodRequest[];
  donorProfiles: Record<string, DonorProfile>;
  users: User[];
  bloodBanks: BloodBank[];
  bloodUnits: BloodUnit[];
  camps: Camp[];
  impactNotifications: ImpactNotification[];
  auditLogs: AuditLogEntry[];
  slaConfig: SlaConfig;
  selectedRequestId: string | null;
  activeQrUnit: BloodUnit | null;
  isEmergencyModalOpen: boolean;
  kycSubmissions: DonorKycSubmission[];
  institutionSubmissions: InstitutionVerificationSubmission[];
  isDonorRegistrationModalOpen: boolean;
  googleOAuthPendingData: { id: string; name: string; email: string } | null;
  setGoogleOAuthPendingData: (data: { id: string; name: string; email: string } | null) => void;

  // Actions
  switchRole: (role: Role) => void;
  setLanguage: (lang: Language) => void;
  setSelectedRequestId: (id: string | null) => void;
  setActiveQrUnit: (unit: BloodUnit | null) => void;
  setIsEmergencyModalOpen: (open: boolean) => void;
  setIsDonorRegistrationModalOpen: (open: boolean) => void;
  registerDonor: (input: DonorRegistrationInput) => Promise<{ user: User; profile: DonorProfile; submission: DonorKycSubmission }>;
  signInDonor: (email: string, password: string) => Promise<{ user: User; kycStatus: KycStatus }>;
  refreshKycStatus: () => Promise<KycStatus>;
  signOutDonor: () => Promise<void>;
  resubmitDonorKyc: (input: { idType: GovIdType; idNumber: string; documentFile: { name: string; size: number; type: string; dataUrl: string; } }) => Promise<void>;
  approveDonorKyc: (submissionId: string, reviewerName?: string) => Promise<void>;
  rejectDonorKyc: (submissionId: string, reason: string, reviewerName?: string) => Promise<void>;
  registerInstitution: (input: InstitutionRegistrationInput) => Promise<User>;
  approveInstitutionVerification: (submissionId: string, reviewerName?: string) => Promise<void>;
  rejectInstitutionVerification: (submissionId: string, reason: string, reviewerName?: string) => Promise<void>;
  resubmitInstitutionVerification: (input: { licenseType: InstitutionLicenseType; licenseNumber: string; documentFile: { name: string; size: number; type: string; dataUrl: string; } }) => Promise<void>;
  refreshInstitutionStatus: () => Promise<KycStatus>;
  signInStaff: (email: string, password: string) => Promise<User>;
  signOutStaff: () => Promise<void>;
  isStaffAuthenticated: boolean;
  supabaseSessionUser: User | null;
  
  createRequest: (data: {
    bloodGroup: BloodGroup;
    component: BloodComponent;
    units: number;
    urgency: UrgencyLevel;
    address: string;
    city: string;
    lat: number;
    lng: number;
    patientCaseId?: string;
    hospitalName?: string;
    notes?: string;
    locationSource?: 'browser' | 'manual' | 'default';
  }) => BloodRequest;

  acceptMatch: (requestId: string, donorId: string) => void;
  declineMatch: (requestId: string, donorId: string) => void;
  escalateRequest: (requestId: string) => void;
  confirmTransfusion: (unitCode: string, hospitalName: string) => void;
  toggleDonorAvailability: (donorId: string, location?: Location) => void;
  addBloodUnit: (data: Omit<BloodUnit, 'id' | 'status'>) => BloodUnit;
  advanceUnitStatus: (unitId: string, nextStatus: UnitStatus) => void;
  scheduleCamp: (camp: Omit<Camp, 'id' | 'collectedUnits'>) => void;
  verifyInstitution: (userId: string, status: 'verified' | 'rejected') => void;
  loginWithGoogleUser: (role: Role, googleProfile: { email: string; name: string; picture?: string }) => void;
  setActiveUser: (userId: string) => void;
  registerUser: (userData: {
    role: Role;
    name: string;
    email: string;
    phone: string;
    password?: string;
    bloodGroup?: BloodGroup;
    city?: string;
    institutionName?: string;
    licenseNumber?: string;
    designation?: string;
    isAvailableAsDonor?: boolean;
  }) => User;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role>('public');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [donorProfiles, setDonorProfiles] = useState<Record<string, DonorProfile>>(INITIAL_DONOR_PROFILES);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>(INITIAL_BLOOD_BANKS);
  const [bloodUnits, setBloodUnits] = useState<BloodUnit[]>(INITIAL_BLOOD_UNITS);
  const [requests, setRequests] = useState<BloodRequest[]>(INITIAL_REQUESTS);
  const [camps, setCamps] = useState<Camp[]>(INITIAL_CAMPS);
  const [impactNotifications, setImpactNotifications] = useState<ImpactNotification[]>(INITIAL_IMPACTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(AuditLogSimulator.getLogs());

  // Clean up any legacy theme attributes & storage
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('lifelink_theme');
    }
  }, []);

  // Language State with LocalStorage Persistence (default 'en')
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifelink_language') as Language;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) return saved;
    }
    return 'en';
  });

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeQrUnit, setActiveQrUnit] = useState<BloodUnit | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isDonorRegistrationModalOpen, setIsDonorRegistrationModalOpen] = useState<boolean>(false);
  const [googleOAuthPendingData, setGoogleOAuthPendingData] = useState<{ id: string; name: string; email: string } | null>(null);
  const [kycSubmissions, setKycSubmissions] = useState<DonorKycSubmission[]>(INITIAL_KYC_SUBMISSIONS);
  const [institutionSubmissions, setInstitutionSubmissions] = useState<InstitutionVerificationSubmission[]>(INITIAL_INSTITUTION_SUBMISSIONS);

  const [slaConfig] = useState<SlaConfig>({
    tier1DonorResponseSeconds: 45, // Demo timing
    tier2CityWideResponseSeconds: 90,
    tier3BankAllocationSeconds: 120
  });

  // Selected active user ID for demo perspectives
  const [selectedUserId, setSelectedUserId] = useState<string>('usr-donor-1');
  const [supabaseSessionUser, setSupabaseSessionUser] = useState<User | null>(null);
  const [authenticatedDonorId, setAuthenticatedDonorId] = useState<string | null>(null);

  // Active current user matching selectedUserId or currentRole
  const currentUser = users.find(u => u.id === selectedUserId) || users.find(u => u.role === currentRole) || users[0];

  const isStaffAuthenticated = Boolean(
    supabaseSessionUser && (supabaseSessionUser.role === 'admin' || supabaseSessionUser.role === 'hospital' || supabaseSessionUser.role === 'bloodbank' || supabaseSessionUser.role === 'ngo')
  );

  // Session & Data Hydration on Mount: Restores logged-in Supabase user & KYC data on refresh
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;

    const restoreSessionAndData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('[Supabase Auth] Session restoration error:', sessionError);
          if (isMounted) {
            setSupabaseSessionUser(null);
            setAuthenticatedDonorId(null);
            try {
              localStorage.removeItem('lifelink_authenticated_donor_id');
              localStorage.removeItem('lifelink_authenticated_donor_email');
            } catch {}
          }
          return;
        }

        if (session?.user && isMounted) {
          const authUser = session.user;

          // 1. Fetch user record from public.users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (userError) {
            console.error('[Supabase] Failed to fetch user record:', userError);
          }

          if (!userData) {
            console.warn('[Supabase] Auth session exists but no matching public.users row found. Prompting first-time Google donor registration.');
            if (isMounted) {
              const googleName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || '';
              const googleEmail = authUser.email || '';
              setGoogleOAuthPendingData({
                id: authUser.id,
                name: googleName,
                email: googleEmail
              });
              setIsDonorRegistrationModalOpen(true);
              setCurrentRole('public');
              setAuthenticatedDonorId(null);
            }
            return;
          }

          // 2. Fetch donor profile from public.donor_profiles
          const { data: profileData, error: profileError } = await supabase
            .from('donor_profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .maybeSingle();

          if (profileError) {
            console.error('[Supabase] Failed to fetch donor profile:', profileError);
          }

          // 3. Fetch donor KYC submissions from public.donor_kyc_verifications
          const { data: kycData, error: kycError } = await supabase
            .from('donor_kyc_verifications')
            .select('*')
            .eq('donor_id', authUser.id)
            .order('submitted_at', { ascending: false });

          if (kycError) {
            console.error('[Supabase] Failed to fetch KYC verifications:', kycError);
          }

          if (isMounted) {
            const userKycStatus: KycStatus = (userData.kyc_status as KycStatus) || 
              (profileData?.kyc_status as KycStatus) || 
              (kycData?.[0]?.kyc_status as KycStatus) || 
              'pending';

            const restoredUser: User = {
              id: userData.id,
              role: (userData.role as Role) || 'patient',
              name: userData.name || authUser.user_metadata?.name || 'Registered User',
              phone: userData.phone || authUser.user_metadata?.phone || '',
              email: userData.email || authUser.email || '',
              location: userData.location || { address: 'Delhi NCR', city: 'Delhi', lat: 28.6139, lng: 77.2090 },
              isSimulatedKycVerified: userKycStatus === 'verified',
              simulatedKycRef: kycData?.[0]?.id || `kyc-${userData.id.slice(0, 8)}`,
              verificationStatus: userData.verification_status || (userKycStatus === 'verified' ? 'verified' : 'pending'),
              dateOfBirth: userData.date_of_birth,
              kycStatus: userKycStatus,
              institutionName: userData.institution_name,
              licenseNumber: userData.license_number
            };

            setUsers(prev => {
              const withoutRestored = prev.filter(u => u.id !== restoredUser.id && u.email.toLowerCase() !== restoredUser.email.toLowerCase());
              return [restoredUser, ...withoutRestored];
            });

            setSelectedUserId(restoredUser.id);
            setSupabaseSessionUser(restoredUser);

            if (restoredUser.role === 'patient' || restoredUser.role === 'donor') {
              setCurrentRole('patient');
              setAuthenticatedDonorId(restoredUser.id);
              try { 
                localStorage.setItem('lifelink_authenticated_donor_id', restoredUser.id); 
                localStorage.setItem('lifelink_authenticated_donor_email', restoredUser.email.toLowerCase());
              } catch {}
            } else {
              // Institutional/staff accounts (admin, hospital, bloodbank, ngo) must NEVER
              // auto-navigate on app load or refresh — keep the user on the Public view!
              setCurrentRole('public');
            }

            if (profileData) {
              const restoredProfile: DonorProfile = {
                userId: profileData.user_id,
                bloodGroup: profileData.blood_group,
                isAvailable: profileData.is_available,
                lastDonationDate: profileData.last_donation_date || '',
                reliabilityScore: profileData.reliability_score || 50,
                totalDonations: profileData.total_donations || 0,
                badges: profileData.badges || (userKycStatus === 'verified' ? ['Verified Lifesaver'] : ['Pending KYC Verification']),
                notificationRadiusKm: profileData.notification_radius_km || 15,
                urgencyThreshold: profileData.urgency_threshold || 'standard',
                simulatedAadhaarMasked: profileData.id_number_masked,
                dateOfBirth: userData.date_of_birth,
                kycStatus: userKycStatus,
                kycSubmissionId: kycData?.[0]?.id,
                idType: profileData.id_type
              };

              setDonorProfiles(prev => ({
                ...prev,
                [restoredUser.id]: restoredProfile
              }));
            }

            if (kycData && kycData.length > 0) {
              const restoredKycList: DonorKycSubmission[] = kycData.map((k: any) => ({
                id: k.id,
                donorId: k.donor_id,
                donorName: userData.name,
                donorEmail: userData.email,
                donorPhone: userData.phone,
                bloodGroup: profileData?.blood_group || 'O+',
                dateOfBirth: userData.date_of_birth,
                idType: k.id_type,
                idNumberMasked: k.id_number_masked,
                documentFileName: k.document_file_name,
                documentFileSize: k.document_file_size,
                documentFileType: k.document_file_type,
                documentUrl: k.document_url,
                status: k.kyc_status,
                submittedAt: k.submitted_at,
                reviewedAt: k.reviewed_at,
                reviewedBy: k.reviewed_by,
                rejectionReason: k.rejection_reason
              }));

              setKycSubmissions(prev => {
                const existingIds = new Set(restoredKycList.map(item => item.id));
                return [...restoredKycList, ...prev.filter(item => !existingIds.has(item.id))];
              });
            }
          }
        } else if (isMounted) {
          // NO VALID SUPABASE SESSION ON APP LOAD / REFRESH:
          // Stay on the Public landing page and ensure state is clean
          setCurrentRole('public');
          setSupabaseSessionUser(null);
          setAuthenticatedDonorId(null);
          setSelectedUserId('usr-donor-1');
          try {
            localStorage.removeItem('lifelink_authenticated_donor_id');
            localStorage.removeItem('lifelink_authenticated_donor_email');
          } catch {}
        }

        // Fetch all KYC verifications for administrative review queue (subject to Supabase RLS)
        const { data: dbKyc, error: dbKycErr } = await supabase
          .from('donor_kyc_verifications')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (!dbKycErr && dbKyc && dbKyc.length > 0 && isMounted) {
          const donorIds = [...new Set(dbKyc.map((k: any) => k.donor_id))];
          const { data: donorUsers } = await supabase.from('users').select('*').in('id', donorIds);
          const { data: donorProfs } = await supabase.from('donor_profiles').select('*').in('user_id', donorIds);

          const userMap = new Map((donorUsers || []).map((u: any) => [u.id, u]));
          const profMap = new Map((donorProfs || []).map((p: any) => [p.user_id, p]));

          const mappedSubmissions: DonorKycSubmission[] = dbKyc.map((k: any) => {
            const u = userMap.get(k.donor_id);
            const p = profMap.get(k.donor_id);
            return {
              id: k.id,
              donorId: k.donor_id,
              donorName: u?.name || 'Registered Donor',
              donorEmail: u?.email || '',
              donorPhone: u?.phone || '',
              bloodGroup: p?.blood_group || 'O+',
              dateOfBirth: u?.date_of_birth || '',
              idType: k.id_type,
              idNumberMasked: k.id_number_masked,
              documentFileName: k.document_file_name,
              documentFileSize: k.document_file_size,
              documentFileType: k.document_file_type,
              documentUrl: k.document_url,
              status: k.kyc_status,
              submittedAt: k.submitted_at,
              reviewedAt: k.reviewed_at,
              reviewedBy: k.reviewed_by,
              rejectionReason: k.rejection_reason
            };
          });

          setKycSubmissions(prev => {
            const dbIds = new Set(mappedSubmissions.map(s => s.id));
            return [...mappedSubmissions, ...prev.filter(s => !dbIds.has(s.id))];
          });
        }

        // Fetch institutional verifications for review queue and institutional users (subject to Supabase RLS)
        const { data: dbInstVerif, error: dbInstErr } = await supabase
          .from('institution_verifications')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (!dbInstErr && dbInstVerif && dbInstVerif.length > 0 && isMounted) {
          const mappedInstSubmissions: InstitutionVerificationSubmission[] = dbInstVerif.map((row: any) => ({
            id: row.id,
            institutionId: row.institution_id,
            institutionName: row.institution_name,
            institutionType: row.institution_type,
            licenseType: row.license_type,
            licenseNumber: row.license_number,
            nodalOfficerName: row.nodal_officer_name,
            nodalOfficerPhone: row.nodal_officer_phone,
            nodalOfficerDesignation: row.nodal_officer_designation,
            documentFileName: row.document_file_name,
            documentFileSize: row.document_file_size,
            documentFileType: row.document_file_type,
            documentUrl: row.document_url,
            verificationStatus: row.verification_status,
            submittedAt: row.submitted_at,
            reviewedAt: row.reviewed_at,
            reviewedBy: row.reviewed_by,
            rejectionReason: row.rejection_reason
          }));

          setInstitutionSubmissions(prev => {
            const dbIds = new Set(mappedInstSubmissions.map(s => s.id));
            return [...mappedInstSubmissions, ...prev.filter(s => !dbIds.has(s.id))];
          });
        }
      } catch (err) {
        console.error('[Supabase] Error restoring session and data:', err);
      }
    };

    restoreSessionAndData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && isMounted) {
        restoreSessionAndData();
      } else if (!session?.user && isMounted) {
        setSupabaseSessionUser(null);
        setAuthenticatedDonorId(null);
        setCurrentRole('public');
        setSelectedUserId('usr-donor-1');
        try {
          localStorage.removeItem('lifelink_authenticated_donor_id');
          localStorage.removeItem('lifelink_authenticated_donor_email');
        } catch {}
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const setActiveUser = (userId: string) => {
    setSelectedUserId(userId);
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      if (targetUser.role === 'donor') {
        setCurrentRole('patient');
      } else {
        setCurrentRole(targetUser.role);
      }
    }
  };

  const t = translations[currentLanguage] || translations['en'];

  const switchRole = (role: Role) => {
    setCurrentRole(role);
    if (role === 'patient' || role === 'donor') {
      // Only prioritize an authenticated donor if there is an active Supabase session
      if (supabaseSessionUser && (supabaseSessionUser.role === 'patient' || supabaseSessionUser.role === 'donor')) {
        setSelectedUserId(supabaseSessionUser.id);
      } else {
        const isExistingPatientOrDonor = users.some(u => u.id === selectedUserId && (u.role === 'patient' || u.role === 'donor'));
        if (!isExistingPatientOrDonor) {
          setSelectedUserId('usr-donor-1');
        }
      }
    } else {
      const roleUser = users.find(u => u.role === role);
      if (roleUser) {
        setSelectedUserId(roleUser.id);
      }
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    AuditLogSimulator.record(
      'sys-client',
      'Role Switcher Simulator',
      role,
      'ROLE_SWITCH_DEMO',
      'User',
      role,
      `Switched client-side demo perspective to ${role} (Simulation Only, Not RBAC Enforced)`
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  const loginWithGoogleUser = (role: Role, googleProfile: { email: string; name: string; picture?: string }) => {
    const targetRole = (role === 'donor' || role === 'patient') ? 'patient' : role;
    const targetUserId = (role === 'donor' || role === 'patient') ? 'usr-donor-1' : (users.find(u => u.role === role)?.id || `usr-${role}-1`);

    setUsers(prevUsers => {
      return prevUsers.map(u => {
        // If patient or donor, update both usr-donor-1 and usr-patient-1
        if ((role === 'patient' || role === 'donor') && (u.id === 'usr-donor-1' || u.id === 'usr-patient-1' || u.role === 'donor' || u.role === 'patient')) {
          return {
            ...u,
            name: googleProfile.name || u.name,
            email: googleProfile.email || u.email,
            kycStatus: 'verified' as KycStatus,
            verificationStatus: 'verified' as const,
            isSimulatedKycVerified: true
          };
        }
        // If institutional or other role, update matching role
        if (u.role === role) {
          return {
            ...u,
            name: googleProfile.name || u.name,
            email: googleProfile.email || u.email,
            verificationStatus: 'verified' as const,
            isSimulatedKycVerified: true
          };
        }
        return u;
      });
    });

    if (role === 'patient' || role === 'donor') {
      setDonorProfiles(prev => ({
        ...prev,
        'usr-donor-1': {
          ...(prev['usr-donor-1'] || {}),
          kycStatus: 'verified',
          isAvailable: true
        } as DonorProfile
      }));
      setCurrentRole('patient');
      setSelectedUserId('usr-donor-1');
    } else {
      setCurrentRole(role);
      setSelectedUserId(targetUserId);
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    AuditLogSimulator.record(
      'google-oauth',
      'Google Identity Services (GIS)',
      targetRole,
      'GOOGLE_OAUTH_LOGIN',
      'User',
      googleProfile.email,
      `Verified Google SSO session authenticated for ${targetRole}: ${googleProfile.name} (${googleProfile.email})`
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  const registerUser = (userData: {
    role: Role;
    name: string;
    email: string;
    phone: string;
    password?: string;
    bloodGroup?: BloodGroup;
    city?: string;
    institutionName?: string;
    licenseNumber?: string;
    designation?: string;
    isAvailableAsDonor?: boolean;
  }): User => {
    const isInstitutional = userData.role === 'hospital' || userData.role === 'bloodbank' || userData.role === 'ngo';
    const targetRole = (userData.role === 'donor' || userData.role === 'patient') ? 'patient' : userData.role;
    
    const newUser: User = {
      id: `usr-${targetRole}-${Date.now().toString().slice(-4)}`,
      role: targetRole,
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      institutionName: userData.institutionName || (isInstitutional ? userData.name : undefined),
      licenseNumber: userData.licenseNumber || (isInstitutional ? `LIC-${Date.now().toString().slice(-4)}` : undefined),
      location: {
        address: userData.city ? `${userData.city}, Delhi NCR` : `${userData.institutionName || 'Healthcare Corridor'}, Delhi NCR`,
        city: userData.city || 'Delhi',
        lat: 28.5355,
        lng: 77.2410
      },
      isSimulatedKycVerified: !isInstitutional,
      simulatedKycRef: isInstitutional ? `PENDING-AUDIT-${Date.now().toString().slice(-4)}` : `KYC-SIM-${Date.now().toString().slice(-4)}`,
      verificationStatus: isInstitutional ? 'pending' : 'verified'
    };

    setUsers(prevUsers => {
      const filtered = prevUsers.filter(u => !(u.role === targetRole && u.email.toLowerCase() === userData.email.toLowerCase()));
      return [...filtered, newUser];
    });

    if (userData.role === 'patient' || userData.role === 'donor') {
      const isAvailable = userData.isAvailableAsDonor !== undefined ? userData.isAvailableAsDonor : true;
      const newDonorProfile: DonorProfile = {
        userId: newUser.id,
        bloodGroup: userData.bloodGroup || 'O+',
        isAvailable,
        lastDonationDate: '2026-06-15',
        reliabilityScore: isAvailable ? 85 : 0,
        totalDonations: 0,
        badges: ['Registered Lifesaver'],
        notificationRadiusKm: 15,
        urgencyThreshold: 'standard',
        simulatedAadhaarMasked: `XXXX-XXXX-${Date.now().toString().slice(-4)} (Simulated)`
      };
      setDonorProfiles(prev => ({
        ...prev,
        [newUser.id]: newDonorProfile
      }));
    }

    if (!isInstitutional) {
      setCurrentRole(targetRole);
      setSelectedUserId(newUser.id);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
      AuditLogSimulator.record(
        'portal-register',
        'Self-Service Portal Registration',
        targetRole,
        'USER_REGISTRATION_SUCCESS',
        'User',
        newUser.email,
        `New ${targetRole} registered: ${newUser.name} (${newUser.email}). Immediate access granted.`
      );
    } else {
      AuditLogSimulator.record(
        'portal-register',
        'Institutional Registration Gateway',
        targetRole,
        'INSTITUTIONAL_REGISTRATION_SUBMITTED',
        'Verification',
        newUser.email,
        `Institutional registration submitted for ${newUser.name} (${newUser.institutionName}). License: ${newUser.licenseNumber}. Pending Administrator audit.`
      );
    }

    setAuditLogs(AuditLogSimulator.getLogs());
    return newUser;
  };

  const registerDonor = async (input: DonorRegistrationInput): Promise<{ user: User; profile: DonorProfile; submission: DonorKycSubmission }> => {
    // 1. Server-side age eligibility enforcement (18–65 years)
    if (!input.dateOfBirth) {
      throw new Error('Date of birth is required.');
    }
    const birthDate = new Date(input.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (isNaN(age) || age < 18 || age > 65) {
      throw new Error('Donor age eligibility failed: Voluntary blood donors must be between 18 and 65 years old per national transfusion guidelines.');
    }

    // 2. ID masking - never store raw unmasked ID in exposed fields
    const cleanId = (input.idNumber || '').replace(/[\s-]/g, '');
    const last4 = cleanId.slice(-4) || 'XXXX';
    const idNumberMasked = `XXXX-XXXX-${last4}`;

    let newUserId = `usr-donor-${Date.now().toString().slice(-4)}`;
    let submissionId = `kyc-sub-${Date.now().toString().slice(-4)}`;

    // 3. Supabase Auth & Core Tables Persistence (Phase 3A)
    if (isSupabaseConfigured()) {
      // Check if an authenticated Supabase user already exists (e.g. from Google OAuth)
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      const existingAuthUser = existingSession?.user;

      if (existingAuthUser) {
        newUserId = existingAuthUser.id;
      } else {
        // (a) Supabase Auth signUp: delegates secure password hashing to Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: input.email.trim().toLowerCase(),
          password: input.password || 'LifeLink2026!Secure',
          options: {
            data: {
              name: input.name,
              phone: input.phone,
              role: 'patient',
              blood_group: input.bloodGroup,
              date_of_birth: input.dateOfBirth
            }
          }
        });

        if (authError) {
          console.error('[Supabase Auth] SignUp failed:', authError);
          throw new Error(authError.message);
        }

        if (!authData.user) {
          console.error('[Supabase Auth] SignUp returned no user object');
          throw new Error('Failed to create authentication user in Supabase.');
        }

        newUserId = authData.user.id;
      }

      // (b) Insert record into public.users table
      const { error: userInsertError } = await supabase
        .from('users')
        .upsert({
          id: newUserId,
          role: 'patient',
          name: input.name,
          phone: input.phone,
          email: input.email.trim().toLowerCase(),
          location: input.location,
          date_of_birth: input.dateOfBirth,
          verification_status: 'pending',
          kyc_status: 'pending'
        });

      if (userInsertError) {
        console.error('[Supabase] Failed to insert user profile into public.users:', userInsertError);
        throw new Error(`Failed to save user record: ${userInsertError.message}`);
      }

      // (c) Insert record into public.donor_profiles table
      const { error: profileInsertError } = await supabase
        .from('donor_profiles')
        .upsert({
          user_id: newUserId,
          blood_group: input.bloodGroup,
          is_available: false, // Locked until KYC is approved
          reliability_score: 50,
          total_donations: 0,
          badges: ['Pending KYC Verification'],
          notification_radius_km: 15,
          urgency_threshold: 'standard',
          id_type: input.idType,
          id_number_masked: idNumberMasked,
          kyc_status: 'pending'
        });

      if (profileInsertError) {
        console.error('[Supabase] Failed to insert donor profile into public.donor_profiles:', profileInsertError);
        throw new Error(`Failed to save donor profile: ${profileInsertError.message}`);
      }

      // (d) Insert record into public.donor_kyc_verifications (Phase 3A: base64 document_url)
      const { data: kycData, error: kycInsertError } = await supabase
        .from('donor_kyc_verifications')
        .insert({
          donor_id: newUserId,
          id_type: input.idType,
          id_number_masked: idNumberMasked,
          document_file_name: input.documentFile.name,
          document_file_size: input.documentFile.size,
          document_file_type: input.documentFile.type,
          document_url: input.documentFile.dataUrl,
          kyc_status: 'pending'
        })
        .select()
        .single();

      if (kycInsertError) {
        console.error('[Supabase] Failed to insert KYC submission into public.donor_kyc_verifications:', kycInsertError);
        throw new Error(`Failed to submit KYC record: ${kycInsertError.message}`);
      }

      if (kycData) {
        submissionId = kycData.id;
      }
    }

    // 4. Update local React state
    const newUser: User = {
      id: newUserId,
      role: 'patient',
      name: input.name,
      phone: input.phone,
      email: input.email,
      location: input.location,
      isSimulatedKycVerified: false,
      simulatedKycRef: submissionId,
      verificationStatus: 'pending',
      dateOfBirth: input.dateOfBirth,
      kycStatus: 'pending'
    };

    const newDonorProfile: DonorProfile = {
      userId: newUserId,
      bloodGroup: input.bloodGroup,
      isAvailable: false, // Locked until KYC is verified
      lastDonationDate: '',
      reliabilityScore: 50,
      totalDonations: 0,
      badges: ['Pending KYC Verification'],
      notificationRadiusKm: 15,
      urgencyThreshold: 'standard',
      simulatedAadhaarMasked: idNumberMasked,
      dateOfBirth: input.dateOfBirth,
      kycStatus: 'pending',
      kycSubmissionId: submissionId,
      idType: input.idType
    };

    const newSubmission: DonorKycSubmission = {
      id: submissionId,
      donorId: newUserId,
      donorName: input.name,
      donorEmail: input.email,
      donorPhone: input.phone,
      bloodGroup: input.bloodGroup,
      dateOfBirth: input.dateOfBirth,
      idType: input.idType,
      idNumberMasked,
      documentFileName: input.documentFile.name,
      documentFileSize: input.documentFile.size,
      documentFileType: input.documentFile.type,
      documentUrl: input.documentFile.dataUrl,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    setUsers(prev => [...prev.filter(u => u.email.toLowerCase() !== input.email.toLowerCase()), newUser]);
    setDonorProfiles(prev => ({ ...prev, [newUserId]: newDonorProfile }));
    setKycSubmissions(prev => [newSubmission, ...prev.filter(s => s.id !== submissionId)]);

    AuditLogSimulator.record(
      newUserId,
      input.name,
      'donor',
      'DONOR_KYC_SUBMITTED',
      'Verification',
      submissionId,
      `New donor registration submitted by ${input.name} (${input.email}) with ${input.idType.toUpperCase()} (${idNumberMasked}). Stored in Supabase. Awaiting staff verification.`
    );
    setAuditLogs(AuditLogSimulator.getLogs());

    setSelectedUserId(newUserId);
    setCurrentRole('patient');
    setAuthenticatedDonorId(newUserId);
    setGoogleOAuthPendingData(null);
    setIsDonorRegistrationModalOpen(false);
    try {
      localStorage.setItem('lifelink_authenticated_donor_id', newUserId);
      localStorage.setItem('lifelink_authenticated_donor_email', input.email.trim().toLowerCase());
    } catch {}

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    return { user: newUser, profile: newDonorProfile, submission: newSubmission };
  };

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lifelink_language', lang);
    }
  };

  // Create Request Action with Smart Matching & Contribution-Based Priority Boost
  const createRequest = (data: {
    bloodGroup: BloodGroup;
    component: BloodComponent;
    units: number;
    urgency: UrgencyLevel;
    address: string;
    city: string;
    lat: number;
    lng: number;
    patientCaseId?: string;
    hospitalName?: string;
    notes?: string;
    locationSource?: 'browser' | 'manual' | 'default';
  }): BloodRequest => {
    // Check requesting user's own donor contribution history (must be fully KYC verified)
    const userDonorProfile = donorProfiles[currentUser.id];
    const isDonorKycVerified = userDonorProfile?.kycStatus === 'verified' || currentUser.verificationStatus === 'verified';
    const hasDonationHistory = !!(userDonorProfile && userDonorProfile.totalDonations > 0 && isDonorKycVerified);
    const donorScore = userDonorProfile?.reliabilityScore || 0;
    const totalDonations = userDonorProfile?.totalDonations || 0;

    const newId = `req-${Date.now()}`;
    const newRequest: BloodRequest = {
      id: newId,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role === 'hospital' ? 'hospital' : 'patient',
      patientCaseId: data.patientCaseId,
      bloodGroup: data.bloodGroup,
      component: data.component,
      units: data.units,
      urgency: data.urgency,
      location: {
        address: data.address,
        city: data.city,
        lat: data.lat,
        lng: data.lng,
        source: data.locationSource || 'manual'
      },
      hospitalName: data.hospitalName || 'Emergency Referral',
      status: 'matching',
      currentTier: 1,
      isPriority: hasDonationHistory,
      priorityReason: hasDonationHistory ? 'Verified Donor' : undefined,
      donorContributionScore: hasDonationHistory ? donorScore : undefined,
      donorTotalDonations: hasDonationHistory ? totalDonations : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes
    };

    // Prepare candidate donors (excluding requester themselves)
    const donorPairs = Object.values(donorProfiles).map(p => {
      const user = users.find(u => u.id === p.userId)!;
      return { user, profile: p };
    }).filter(pair => pair.user && pair.user.id !== currentUser.id);

    // Run Smart Matching Engine with priority boost applied if verified donor
    const matches = rankDonors(
      data.bloodGroup, 
      data.component, 
      data.lat, 
      data.lng, 
      donorPairs,
      hasDonationHistory,
      donorScore
    );

    if (matches.length > 0) {
      newRequest.status = 'notified';
      // Pick top candidate
      newRequest.matchedDonorId = matches[0].donorId;
      newRequest.matchedDonorName = matches[0].donorName;
    } else {
      // Direct escalation check to Blood Banks
      const bankBackups = findNearbyBloodBanksWithStock(data.lat, data.lng, data.bloodGroup, data.units, bloodBanks);
      if (bankBackups.length > 0) {
        newRequest.currentTier = 3;
        newRequest.matchedBankId = bankBackups[0].bank.id;
        newRequest.matchedBankName = bankBackups[0].bank.name;
        newRequest.status = 'notified';
      }
    }

    setRequests(prev => [newRequest, ...prev]);
    setSelectedRequestId(newId);

    // Record in Audit Log
    AuditLogSimulator.record(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'CREATE_BLOOD_REQUEST',
      'Request',
      newId,
      `Raised ${data.urgency.toUpperCase()} request for ${data.units} units of ${data.bloodGroup} ${data.component}.${hasDonationHistory ? ` [PRIORITY GRANTED — Verified Donor with ${totalDonations} donations (${donorScore}% score)]` : ''} Matched with ${newRequest.matchedDonorName || newRequest.matchedBankName || 'Broadcasting'}`,
      'none',
      newRequest.status
    );
    setAuditLogs(AuditLogSimulator.getLogs());

    return newRequest;
  };

  // Donor accepts match
  const acceptMatch = (requestId: string, donorId: string) => {
    const donorUser = users.find(u => u.id === donorId);
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'accepted',
          matchedDonorId: donorId,
          matchedDonorName: donorUser ? donorUser.name : 'Verified Donor',
          matchedDonorPhone: donorUser ? donorUser.phone : '+91 98765 43210',
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));

    // Auto progress to en_route after 3 seconds to demonstrate dynamic tracker
    setTimeout(() => {
      setRequests(prev => prev.map(req => {
        if (req.id === requestId && req.status === 'accepted') {
          return { ...req, status: 'en_route', updatedAt: new Date().toISOString() };
        }
        return req;
      }));
    }, 3000);

    AuditLogSimulator.record(
      donorId,
      donorUser ? donorUser.name : 'Donor',
      'donor',
      'ACCEPT_MATCH',
      'Request',
      requestId,
      `Donor accepted blood donation request ${requestId}`,
      'notified',
      'accepted'
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Donor declines match -> escalate to next
  const declineMatch = (requestId: string, donorId: string) => {
    AuditLogSimulator.record(
      donorId,
      'Donor',
      'donor',
      'DECLINE_MATCH',
      'Request',
      requestId,
      `Donor declined request ${requestId}. Re-routing to next eligible donor / bank backup.`,
      'notified',
      'escalating'
    );
    escalateRequest(requestId);
  };

  // Tiered escalation
  const escalateRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const nextTier = (req.currentTier < 3 ? req.currentTier + 1 : 3) as 1 | 2 | 3;
        // If reached tier 3, assign blood bank backup
        const bankBackups = findNearbyBloodBanksWithStock(req.location.lat, req.location.lng, req.bloodGroup, req.units, bloodBanks);
        const matchedBank = bankBackups[0]?.bank;

        return {
          ...req,
          currentTier: nextTier,
          status: 'notified',
          matchedBankId: matchedBank ? matchedBank.id : 'bb-delhi-01',
          matchedBankName: matchedBank ? matchedBank.name : 'Red Cross Central Blood Bank',
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));

    AuditLogSimulator.record(
      'sys-escalation',
      'Escalation Service (Simulation)',
      'admin',
      'ESCALATE_TIER',
      'Escalation',
      requestId,
      `Request promoted to Tier via SLA trigger. Partner blood bank notified.`
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Confirm Transfusion (Hospital Action) -> Closes loop and notifies donor (Sweden Blodcentralen Model)
  const confirmTransfusion = (unitCode: string, hospitalName: string) => {
    // Find unit
    const unit = bloodUnits.find(u => u.unitCode === unitCode) || bloodUnits[0];
    const targetDonorId = unit.donorId || 'usr-donor-1';

    // Update unit status
    setBloodUnits(prev => prev.map(u => {
      if (u.unitCode === unitCode) {
        return {
          ...u,
          status: 'transfused' as UnitStatus,
          transfusedHospitalId: hospitalName,
          transfusedAt: new Date().toISOString()
        };
      }
      return u;
    }));

    // Generate Sweden-Style Impact Notification
    const newImpact: ImpactNotification = {
      id: `imp-${Date.now()}`,
      donorId: targetDonorId,
      unitCode: unit.unitCode,
      hospitalName,
      city: 'New Delhi',
      message: `Your donated ${unit.bloodGroup} unit was just transfused at ${hospitalName}. You helped save a patient's life!`,
      timestamp: new Date().toISOString(),
      transfusionDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    setImpactNotifications(prev => [newImpact, ...prev]);

    // Mark active request fulfilled if matches
    setRequests(prev => prev.map(r => {
      if (r.status === 'en_route' || r.status === 'accepted') {
        return { ...r, status: 'fulfilled', updatedAt: new Date().toISOString() };
      }
      return r;
    }));

    // Update donor stats
    setDonorProfiles(prev => {
      const p = prev[targetDonorId];
      if (p) {
        return {
          ...prev,
          [targetDonorId]: {
            ...p,
            totalDonations: p.totalDonations + 1,
            reliabilityScore: Math.min(100, p.reliabilityScore + 1)
          }
        };
      }
      return prev;
    });

    AuditLogSimulator.record(
      currentUser.id,
      currentUser.name,
      'hospital',
      'CONFIRM_TRANSFUSION',
      'BloodUnit',
      unit.unitCode,
      `Hospital ${hospitalName} confirmed transfusion of unit ${unit.unitCode}. Closed donor impact feedback loop.`,
      'issued',
      'transfused'
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Toggle donor availability with optional real location capture
  const toggleDonorAvailability = (donorId: string, location?: Location) => {
    setDonorProfiles(prev => {
      const p = prev[donorId];
      if (!p) {
        const targetUser = users.find(u => u.id === donorId);
        const newProf: DonorProfile = {
          userId: donorId,
          bloodGroup: 'O+',
          isAvailable: true,
          lastDonationDate: '2026-06-15',
          reliabilityScore: 85,
          totalDonations: 0,
          badges: ['Registered Lifesaver'],
          notificationRadiusKm: 15,
          urgencyThreshold: 'standard',
          simulatedAadhaarMasked: 'XXXX-XXXX-8821 (Simulated)',
          currentLocation: location,
          locationUpdatedAt: location ? new Date().toISOString() : undefined
        };
        AuditLogSimulator.record(
          donorId,
          targetUser ? targetUser.name : 'Donor',
          'donor',
          'TOGGLE_AVAILABILITY',
          'User',
          donorId,
          `Donor availability initialized to Available${location ? ` at ${location.address}` : ''}`
        );
        return {
          ...prev,
          [donorId]: newProf
        };
      }
      const nextState = !p.isAvailable;
      AuditLogSimulator.record(
        donorId,
        'Donor',
        'donor',
        'TOGGLE_AVAILABILITY',
        'User',
        donorId,
        `Donor availability updated to ${nextState ? 'Available' : 'Unavailable'}${location ? ` at ${location.address}` : ''}`
      );
      return {
        ...prev,
        [donorId]: { 
          ...p, 
          isAvailable: nextState,
          currentLocation: location || p.currentLocation,
          locationUpdatedAt: location ? new Date().toISOString() : p.locationUpdatedAt
        }
      };
    });

    if (location) {
      setUsers(prev => prev.map(u => u.id === donorId ? { ...u, location } : u));
    }

    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Add blood unit
  const addBloodUnit = (data: Omit<BloodUnit, 'id' | 'status'>): BloodUnit => {
    const newUnit: BloodUnit = {
      ...data,
      id: `unit-${Date.now()}`,
      status: 'collected'
    };
    setBloodUnits(prev => [newUnit, ...prev]);

    // Update bank summary
    setBloodBanks(prev => prev.map(b => {
      if (b.id === data.bloodBankId) {
        return {
          ...b,
          inventorySummary: {
            ...b.inventorySummary,
            [data.bloodGroup]: (b.inventorySummary[data.bloodGroup] || 0) + 1
          }
        };
      }
      return b;
    }));

    AuditLogSimulator.record(
      currentUser.id,
      currentUser.name,
      'bloodbank',
      'COLLECT_BLOOD_UNIT',
      'BloodUnit',
      newUnit.unitCode,
      `Collected unit ${newUnit.unitCode} (${data.bloodGroup} ${data.component}). QR registered.`,
      'none',
      'collected'
    );
    setAuditLogs(AuditLogSimulator.getLogs());
    return newUnit;
  };

  // Advance unit status: collected -> tested -> stored -> issued
  const advanceUnitStatus = (unitId: string, nextStatus: UnitStatus) => {
    setBloodUnits(prev => prev.map(u => {
      if (u.id === unitId) {
        AuditLogSimulator.record(
          currentUser.id,
          currentUser.name,
          'bloodbank',
          'UPDATE_UNIT_STATUS',
          'BloodUnit',
          u.unitCode,
          `Unit ${u.unitCode} status transitioned from ${u.status} to ${nextStatus}`,
          u.status,
          nextStatus
        );
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Schedule NGO camp
  const scheduleCamp = (campData: Omit<Camp, 'id' | 'collectedUnits'>) => {
    const newCamp: Camp = {
      ...campData,
      id: `camp-${Date.now()}`,
      collectedUnits: 0
    };
    setCamps(prev => [newCamp, ...prev]);
    AuditLogSimulator.record(
      currentUser.id,
      currentUser.name,
      'ngo',
      'SCHEDULE_CAMP',
      'User',
      newCamp.id,
      `Scheduled blood drive "${newCamp.title}" at ${newCamp.venue} with target ${newCamp.targetUnits} units.`
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Verify institution (Admin)
  const verifyInstitution = (userId: string, status: 'verified' | 'rejected') => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, verificationStatus: status, isSimulatedKycVerified: status === 'verified' };
      }
      return u;
    }));
    AuditLogSimulator.record(
      currentUser.id,
      currentUser.name,
      'admin',
      'INSTITUTION_VERIFICATION',
      'Verification',
      userId,
      `Admin changed verification status for user ${userId} to ${status} (Simulated KYC)`,
      'pending',
      status
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Approve Donor Government ID KYC
  const approveDonorKyc = async (submissionId: string, reviewerName: string = 'Authorized Medical Staff'): Promise<void> => {
    const submission = kycSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      // 1. Update donor_kyc_verifications table
      const { data: verifData, error: subErr } = await supabase
        .from('donor_kyc_verifications')
        .update({
          kyc_status: 'verified',
          reviewed_at: now,
          reviewed_by: reviewerName
        })
        .eq('id', submissionId)
        .select();

      if (subErr) {
        console.error('[Supabase] Failed to update KYC verification:', subErr);
        throw new Error(`Supabase update error: ${subErr.message}`);
      }
      if (!verifData || verifData.length === 0) {
        throw new Error('Database update blocked (0 rows updated). You must be signed in with an authorized Admin or Hospital staff account.');
      }

      // 2. Update donor_profiles table
      const { data: profData, error: profErr } = await supabase
        .from('donor_profiles')
        .update({
          kyc_status: 'verified',
          is_available: true,
          badges: ['Verified Lifesaver']
        })
        .eq('user_id', submission.donorId)
        .select();

      if (profErr) {
        console.error('[Supabase] Failed to update donor profile:', profErr);
        throw new Error(`Donor profile update error: ${profErr.message}`);
      }
      if (!profData || profData.length === 0) {
        throw new Error('Database update blocked on donor profile (0 rows updated). Verify staff permissions.');
      }

      // 3. Update users table
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .update({
          kyc_status: 'verified',
          verification_status: 'verified'
        })
        .eq('id', submission.donorId)
        .select();

      if (userErr) {
        console.error('[Supabase] Failed to update user:', userErr);
        throw new Error(`User status update error: ${userErr.message}`);
      }
      if (!userData || userData.length === 0) {
        throw new Error('Database update blocked on user record (0 rows updated). Verify staff permissions.');
      }
    }

    // 1. Update submission status in React state
    setKycSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          status: 'verified' as KycStatus,
          reviewedAt: now,
          reviewedBy: reviewerName
        };
      }
      return s;
    }));

    // 2. Update user status in React state
    setUsers(prev => prev.map(u => {
      if (u.id === submission.donorId) {
        return {
          ...u,
          kycStatus: 'verified' as KycStatus,
          verificationStatus: 'verified',
          isSimulatedKycVerified: true
        };
      }
      return u;
    }));

    // 3. Update donor profile: set verified, enable availability, update badges
    setDonorProfiles(prev => {
      const existing = prev[submission.donorId];
      if (!existing) return prev;
      return {
        ...prev,
        [submission.donorId]: {
          ...existing,
          kycStatus: 'verified' as KycStatus,
          isAvailable: true,
          badges: existing.badges.includes('Verified Lifesaver')
            ? existing.badges.filter(b => b !== 'Pending KYC Verification')
            : ['Verified Lifesaver', ...existing.badges.filter(b => b !== 'Pending KYC Verification')]
        }
      };
    });

    // 4. Audit Log
    AuditLogSimulator.record(
      currentUser.id,
      reviewerName,
      currentUser.role,
      'DONOR_KYC_APPROVED',
      'Verification',
      submissionId,
      `Government ID verification approved for donor ${submission.donorName} (${submission.donorEmail}). ID Type: ${submission.idType.toUpperCase()}, Masked ID: ${submission.idNumberMasked}. Donor availability unlocked.`
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Reject Donor Government ID KYC
  const rejectDonorKyc = async (submissionId: string, reason: string, reviewerName: string = 'Authorized Medical Staff'): Promise<void> => {
    const submission = kycSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      // 1. Update donor_kyc_verifications table
      const { data: verifData, error: subErr } = await supabase
        .from('donor_kyc_verifications')
        .update({
          kyc_status: 'rejected',
          rejection_reason: reason,
          reviewed_at: now,
          reviewed_by: reviewerName
        })
        .eq('id', submissionId)
        .select();

      if (subErr) {
        console.error('[Supabase] Failed to update KYC verification:', subErr);
        throw new Error(`Supabase update error: ${subErr.message}`);
      }
      if (!verifData || verifData.length === 0) {
        throw new Error('Database update blocked (0 rows updated). You must be signed in with an authorized Admin or Hospital staff account.');
      }

      // 2. Update donor_profiles table
      const { data: profData, error: profErr } = await supabase
        .from('donor_profiles')
        .update({
          kyc_status: 'rejected',
          is_available: false
        })
        .eq('user_id', submission.donorId)
        .select();

      if (profErr) {
        console.error('[Supabase] Failed to update donor profile:', profErr);
        throw new Error(`Donor profile update error: ${profErr.message}`);
      }
      if (!profData || profData.length === 0) {
        throw new Error('Database update blocked on donor profile (0 rows updated). Verify staff permissions.');
      }

      // 3. Update users table
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .update({
          kyc_status: 'rejected',
          verification_status: 'rejected'
        })
        .eq('id', submission.donorId)
        .select();

      if (userErr) {
        console.error('[Supabase] Failed to update user:', userErr);
        throw new Error(`User status update error: ${userErr.message}`);
      }
      if (!userData || userData.length === 0) {
        throw new Error('Database update blocked on user record (0 rows updated). Verify staff permissions.');
      }
    }

    // 1. Update submission status in React state
    setKycSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          status: 'rejected' as KycStatus,
          rejectionReason: reason,
          reviewedAt: now,
          reviewedBy: reviewerName
        };
      }
      return s;
    }));

    // 2. Update user status in React state
    setUsers(prev => prev.map(u => {
      if (u.id === submission.donorId) {
        return {
          ...u,
          kycStatus: 'rejected' as KycStatus,
          verificationStatus: 'rejected'
        };
      }
      return u;
    }));

    // 3. Update donor profile: set rejected, lock availability
    setDonorProfiles(prev => {
      const existing = prev[submission.donorId];
      if (!existing) return prev;
      return {
        ...prev,
        [submission.donorId]: {
          ...existing,
          kycStatus: 'rejected' as KycStatus,
          isAvailable: false,
          badges: existing.badges.filter(b => b !== 'Pending KYC Verification')
        }
      };
    });

    // 4. Audit Log
    AuditLogSimulator.record(
      currentUser.id,
      reviewerName,
      currentUser.role,
      'DONOR_KYC_REJECTED',
      'Verification',
      submissionId,
      `Government ID verification rejected for donor ${submission.donorName}. Reason: ${reason}. ID Type: ${submission.idType.toUpperCase()}, Masked ID: ${submission.idNumberMasked}.`
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Sign In Donor with Email & Password (Phase 3A)
  const signInDonor = async (email: string, password: string): Promise<{ user: User; kycStatus: KycStatus }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (authError) {
        console.error('[Supabase Auth] signInWithPassword error:', authError);
        throw new Error(authError.message || 'Invalid email or password. Please verify your credentials.');
      }

      if (!authData.user) {
        console.error('[Supabase Auth] signInWithPassword returned no user object');
        throw new Error('No user profile found for this account.');
      }

      const authUser = authData.user;

      // 1. Fetch user record from public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (userError) {
        console.error('[Supabase] Failed to fetch user record on sign-in:', userError);
      }

      // 2. Fetch donor profile from public.donor_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('donor_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('[Supabase] Failed to fetch donor profile on sign-in:', profileError);
      }

      // 3. Fetch donor KYC submissions from public.donor_kyc_verifications
      const { data: kycData, error: kycError } = await supabase
        .from('donor_kyc_verifications')
        .select('*')
        .eq('donor_id', authUser.id)
        .order('submitted_at', { ascending: false });

      if (kycError) {
        console.error('[Supabase] Failed to fetch KYC verifications on sign-in:', kycError);
      }

      const donorKycStatus: KycStatus = (userData?.kyc_status as KycStatus) || (profileData?.kyc_status as KycStatus) || 'pending';

      const restoredUser: User = {
        id: authUser.id,
        role: (userData?.role as Role) || 'patient',
        name: userData?.name || authUser.user_metadata?.name || 'Registered Donor',
        phone: userData?.phone || authUser.user_metadata?.phone || '',
        email: userData?.email || authUser.email || cleanEmail,
        location: userData?.location || { address: 'Delhi NCR', city: 'Delhi', lat: 28.6139, lng: 77.2090 },
        isSimulatedKycVerified: donorKycStatus === 'verified',
        simulatedKycRef: kycData?.[0]?.id || `kyc-${authUser.id.slice(0, 8)}`,
        verificationStatus: userData?.verification_status || (donorKycStatus === 'verified' ? 'verified' : 'pending'),
        dateOfBirth: userData?.date_of_birth,
        kycStatus: donorKycStatus
      };

      setUsers(prev => {
        const withoutRestored = prev.filter(u => u.id !== restoredUser.id && u.email.toLowerCase() !== cleanEmail);
        return [restoredUser, ...withoutRestored];
      });

      if (profileData) {
        const restoredProfile: DonorProfile = {
          userId: profileData.user_id,
          bloodGroup: profileData.blood_group,
          isAvailable: profileData.is_available,
          lastDonationDate: profileData.last_donation_date || '',
          reliabilityScore: profileData.reliability_score || 50,
          totalDonations: profileData.total_donations || 0,
          badges: profileData.badges || (donorKycStatus === 'verified' ? ['Verified Lifesaver'] : ['Pending KYC Verification']),
          notificationRadiusKm: profileData.notification_radius_km || 15,
          urgencyThreshold: profileData.urgency_threshold || 'standard',
          simulatedAadhaarMasked: profileData.id_number_masked,
          dateOfBirth: userData?.date_of_birth,
          kycStatus: donorKycStatus,
          kycSubmissionId: kycData?.[0]?.id,
          idType: profileData.id_type
        };

        setDonorProfiles(prev => ({
          ...prev,
          [restoredUser.id]: restoredProfile
        }));
      }

      if (kycData && kycData.length > 0) {
        const restoredKycList: DonorKycSubmission[] = kycData.map((k: any) => ({
          id: k.id,
          donorId: k.donor_id,
          donorName: userData?.name || restoredUser.name,
          donorEmail: userData?.email || cleanEmail,
          donorPhone: userData?.phone || restoredUser.phone,
          bloodGroup: profileData?.blood_group || 'O+',
          dateOfBirth: userData?.date_of_birth || '',
          idType: k.id_type,
          idNumberMasked: k.id_number_masked,
          documentFileName: k.document_file_name,
          documentFileSize: k.document_file_size,
          documentFileType: k.document_file_type,
          documentUrl: k.document_url,
          status: k.kyc_status,
          submittedAt: k.submitted_at,
          reviewedAt: k.reviewed_at,
          reviewedBy: k.reviewed_by,
          rejectionReason: k.rejection_reason
        }));

        setKycSubmissions(prev => {
          const existingIds = new Set(restoredKycList.map(item => item.id));
          return [...restoredKycList, ...prev.filter(item => !existingIds.has(item.id))];
        });
      }

      setSelectedUserId(restoredUser.id);
      setCurrentRole('patient');
      setAuthenticatedDonorId(restoredUser.id);
      try {
        localStorage.setItem('lifelink_authenticated_donor_id', restoredUser.id);
        localStorage.setItem('lifelink_authenticated_donor_email', restoredUser.email.toLowerCase());
      } catch {}

      return { user: restoredUser, kycStatus: donorKycStatus };
    } else {
      // Local fallback / demo accounts
      const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existingUser) {
        setSelectedUserId(existingUser.id);
        setCurrentRole('patient');
        return { user: existingUser, kycStatus: existingUser.kycStatus || 'pending' };
      }
      throw new Error('No registered account found with this email. Please verify your email or register as a donor.');
    }
  };

  // Re-fetch KYC status from Supabase for real authenticated donor
  const refreshKycStatus = async (): Promise<KycStatus> => {
    if (!isSupabaseConfigured()) {
      return currentUser?.kycStatus || 'pending';
    }

    try {
      // 1. Determine target donor ID:
      // Check active Supabase Auth user first
      const { data: { user: authUser }, error: authUserError } = await supabase.auth.getUser();
      if (authUserError) {
        console.warn('[Supabase Auth] getUser warning in refreshKycStatus:', authUserError);
      }

      let targetDonorId: string | null = null;
      if (authUser?.id) {
        const { data: authUserData } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', authUser.id)
          .maybeSingle();

        if (authUserData && (authUserData.role === 'patient' || authUserData.role === 'donor')) {
          targetDonorId = authUserData.id;
        }
      }

      // Fallback to persisted authenticated donor ID if authUser is staff or session switch happened
      if (!targetDonorId) {
        const storedId = authenticatedDonorId || (typeof localStorage !== 'undefined' ? localStorage.getItem('lifelink_authenticated_donor_id') : null);
        if (storedId) {
          targetDonorId = storedId;
        }
      }

      // Fallback to current donor user if not demo accounts
      if (!targetDonorId && currentUser?.id && currentUser.id !== 'usr-donor-1' && currentUser.id !== 'usr-patient-1') {
        targetDonorId = currentUser.id;
      }

      // Last fallback: getSession user id
      if (!targetDonorId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          targetDonorId = session.user.id;
        }
      }

      if (!targetDonorId) {
        return currentUser?.kycStatus || 'pending';
      }

      // 2. Fetch fresh user record directly from public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetDonorId)
        .maybeSingle();

      if (userError) {
        console.error('[Supabase] Failed to re-fetch user in refreshKycStatus:', userError);
      }

      // 3. Fetch fresh donor profile directly from public.donor_profiles
      const { data: profData, error: profError } = await supabase
        .from('donor_profiles')
        .select('*')
        .eq('user_id', targetDonorId)
        .maybeSingle();

      if (profError) {
        console.error('[Supabase] Failed to re-fetch donor profile in refreshKycStatus:', profError);
      }

      // 4. Fetch latest KYC submission directly from public.donor_kyc_verifications
      const { data: kycData, error: kycError } = await supabase
        .from('donor_kyc_verifications')
        .select('*')
        .eq('donor_id', targetDonorId)
        .order('submitted_at', { ascending: false });

      if (kycError) {
        console.error('[Supabase] Failed to re-fetch KYC submissions in refreshKycStatus:', kycError);
      }

      const updatedKycStatus: KycStatus = (userData?.kyc_status as KycStatus) || 
        (profData?.kyc_status as KycStatus) || 
        (kycData?.[0]?.kyc_status as KycStatus) || 
        currentUser?.kycStatus || 
        'pending';

      if (userData) {
        const refreshedUser: User = {
          id: userData.id,
          role: (userData.role as Role) || 'patient',
          name: userData.name || (authUser?.id === targetDonorId ? authUser.user_metadata?.name : '') || currentUser.name || 'Registered Donor',
          phone: userData.phone || currentUser.phone || '',
          email: userData.email || currentUser.email || '',
          location: userData.location || currentUser.location || { address: 'Delhi NCR', city: 'Delhi', lat: 28.6139, lng: 77.2090 },
          isSimulatedKycVerified: updatedKycStatus === 'verified',
          simulatedKycRef: kycData?.[0]?.id || `kyc-${userData.id.slice(0, 8)}`,
          verificationStatus: userData.verification_status || (updatedKycStatus === 'verified' ? 'verified' : 'pending'),
          dateOfBirth: userData.date_of_birth,
          kycStatus: updatedKycStatus
        };

        setUsers(prev => {
          const withoutUser = prev.filter(u => u.id !== targetDonorId && u.email.toLowerCase() !== refreshedUser.email.toLowerCase());
          return [refreshedUser, ...withoutUser];
        });

        // Point active selection directly to the real verified donor
        setSelectedUserId(targetDonorId);
        setCurrentRole('patient');
        setAuthenticatedDonorId(targetDonorId);
        try {
          localStorage.setItem('lifelink_authenticated_donor_id', targetDonorId);
        } catch {}
      }

      if (profData) {
        const refreshedProfile: DonorProfile = {
          userId: profData.user_id,
          bloodGroup: profData.blood_group || 'O+',
          isAvailable: profData.is_available,
          lastDonationDate: profData.last_donation_date || '',
          reliabilityScore: profData.reliability_score || 50,
          totalDonations: profData.total_donations || 0,
          badges: profData.badges || (updatedKycStatus === 'verified' ? ['Verified Lifesaver'] : ['Pending KYC Verification']),
          notificationRadiusKm: profData.notification_radius_km || 15,
          urgencyThreshold: profData.urgency_threshold || 'standard',
          simulatedAadhaarMasked: profData.id_number_masked,
          dateOfBirth: userData?.date_of_birth,
          kycStatus: updatedKycStatus,
          kycSubmissionId: kycData?.[0]?.id,
          idType: profData.id_type
        };

        setDonorProfiles(prev => ({
          ...prev,
          [targetDonorId]: refreshedProfile
        }));
      }

      if (kycData && kycData.length > 0) {
        const mappedSubmissions: DonorKycSubmission[] = kycData.map((k: any) => ({
          id: k.id,
          donorId: k.donor_id,
          donorName: userData?.name || currentUser.name,
          donorEmail: userData?.email || currentUser.email,
          donorPhone: userData?.phone || currentUser.phone,
          bloodGroup: profData?.blood_group || 'O+',
          dateOfBirth: userData?.date_of_birth || '',
          idType: k.id_type,
          idNumberMasked: k.id_number_masked,
          documentFileName: k.document_file_name,
          documentFileSize: k.document_file_size,
          documentFileType: k.document_file_type,
          documentUrl: k.document_url,
          status: k.kyc_status,
          submittedAt: k.submitted_at,
          reviewedAt: k.reviewed_at,
          reviewedBy: k.reviewed_by,
          rejectionReason: k.rejection_reason
        }));

        setKycSubmissions(prev => {
          const dbIds = new Set(mappedSubmissions.map(s => s.id));
          return [...mappedSubmissions, ...prev.filter(s => !dbIds.has(s.id))];
        });
      }

      return updatedKycStatus;
    } catch (err) {
      console.error('[Supabase] Error during refreshKycStatus:', err);
      return currentUser?.kycStatus || 'pending';
    }
  };

  // Sign out donor & return to public
  const signOutDonor = async (): Promise<void> => {
    setAuthenticatedDonorId(null);
    setGoogleOAuthPendingData(null);
    try {
      localStorage.removeItem('lifelink_authenticated_donor_id');
      localStorage.removeItem('lifelink_authenticated_donor_email');
    } catch {}
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('[Supabase Auth] Sign out error:', err);
      }
    }
    setSupabaseSessionUser(null);
    setSelectedUserId('usr-donor-1');
    setCurrentRole('public');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Sign In Staff (Admin or Hospital) with Email & Password
  const signInStaff = async (email: string, password: string): Promise<User> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured in .env.local');
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (authError) {
      console.error('[Supabase Auth] Staff sign in error:', authError);
      throw new Error(authError.message || 'Invalid staff credentials.');
    }

    if (!authData.user) {
      throw new Error('No user profile found for this staff account.');
    }

    const authUser = authData.user;

    // Fetch user record from public.users to verify role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (userError || !userData) {
      console.error('[Supabase] Failed to fetch staff user record:', userError);
      throw new Error('Staff account record not found in public.users. Please create the matching public.users row with role admin or hospital.');
    }

    const allowedRoles: Role[] = ['admin', 'hospital', 'bloodbank', 'ngo'];
    if (!allowedRoles.includes(userData.role as Role)) {
      throw new Error(`Account has role "${userData.role}". Only institutional and administrative staff accounts are authorized.`);
    }

    const staffUser: User = {
      id: authUser.id,
      role: userData.role as Role,
      name: userData.name || (userData.role === 'admin' ? 'Platform Administrator' : userData.institution_name || 'Institutional Officer'),
      phone: userData.phone || '',
      email: userData.email || cleanEmail,
      location: userData.location || { address: 'Delhi NCR', city: 'Delhi', lat: 28.6139, lng: 77.2090 },
      isSimulatedKycVerified: userData.verification_status === 'verified',
      simulatedKycRef: `kyc-staff-${authUser.id.slice(0, 8)}`,
      verificationStatus: userData.verification_status || 'pending',
      kycStatus: userData.verification_status === 'verified' ? 'verified' : 'pending',
      institutionName: userData.institution_name,
      licenseNumber: userData.license_number,
      dateOfBirth: userData.date_of_birth
    };

    setUsers(prev => {
      const without = prev.filter(u => u.id !== staffUser.id && u.email.toLowerCase() !== cleanEmail);
      return [staffUser, ...without];
    });

    setSupabaseSessionUser(staffUser);
    setSelectedUserId(staffUser.id);
    setCurrentRole(userData.role as Role);

    // Refresh KYC queue with staff credentials
    const { data: dbKyc } = await supabase
      .from('donor_kyc_verifications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (dbKyc && dbKyc.length > 0) {
      const donorIds = [...new Set(dbKyc.map((k: any) => k.donor_id))];
      const { data: donorUsers } = await supabase.from('users').select('*').in('id', donorIds);
      const { data: donorProfs } = await supabase.from('donor_profiles').select('*').in('user_id', donorIds);

      const userMap = new Map((donorUsers || []).map((u: any) => [u.id, u]));
      const profMap = new Map((donorProfs || []).map((p: any) => [p.user_id, p]));

      const mappedSubmissions: DonorKycSubmission[] = dbKyc.map((k: any) => {
        const u = userMap.get(k.donor_id);
        const p = profMap.get(k.donor_id);
        return {
          id: k.id,
          donorId: k.donor_id,
          donorName: u?.name || 'Registered Donor',
          donorEmail: u?.email || '',
          donorPhone: u?.phone || '',
          bloodGroup: p?.blood_group || 'O+',
          dateOfBirth: u?.date_of_birth || '',
          idType: k.id_type,
          idNumberMasked: k.id_number_masked,
          documentFileName: k.document_file_name,
          documentFileSize: k.document_file_size,
          documentFileType: k.document_file_type,
          documentUrl: k.document_url,
          status: k.kyc_status,
          submittedAt: k.submitted_at,
          reviewedAt: k.reviewed_at,
          reviewedBy: k.reviewed_by,
          rejectionReason: k.rejection_reason
        };
      });

      setKycSubmissions(prev => {
        const dbIds = new Set(mappedSubmissions.map(s => s.id));
        return [...mappedSubmissions, ...prev.filter(s => !dbIds.has(s.id))];
      });
    }

    // Refresh institutional verifications
    const { data: dbInstVerif } = await supabase
      .from('institution_verifications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (dbInstVerif && dbInstVerif.length > 0) {
      const mappedInstSubmissions: InstitutionVerificationSubmission[] = dbInstVerif.map((row: any) => ({
        id: row.id,
        institutionId: row.institution_id,
        institutionName: row.institution_name,
        institutionType: row.institution_type,
        licenseType: row.license_type,
        licenseNumber: row.license_number,
        nodalOfficerName: row.nodal_officer_name,
        nodalOfficerPhone: row.nodal_officer_phone,
        nodalOfficerDesignation: row.nodal_officer_designation,
        documentFileName: row.document_file_name,
        documentFileSize: row.document_file_size,
        documentFileType: row.document_file_type,
        documentUrl: row.document_url,
        verificationStatus: row.verification_status,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at,
        reviewedBy: row.reviewed_by,
        rejectionReason: row.rejection_reason
      }));

      setInstitutionSubmissions(prev => {
        const dbIds = new Set(mappedInstSubmissions.map(s => s.id));
        return [...mappedInstSubmissions, ...prev.filter(s => !dbIds.has(s.id))];
      });
    }

    return staffUser;
  };

  // Sign out staff
  const signOutStaff = async (): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('[Supabase Auth] Staff sign out error:', err);
      }
    }
    setSupabaseSessionUser(null);
    setSelectedUserId('usr-donor-1');
    setCurrentRole('public');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Resubmit Government ID for rejected donors
  const resubmitDonorKyc = async (input: {
    idType: GovIdType;
    idNumber: string;
    documentFile: {
      name: string;
      size: number;
      type: string;
      dataUrl: string;
    };
  }): Promise<void> => {
    const cleanId = (input.idNumber || '').replace(/[\s-]/g, '');
    const last4 = cleanId.slice(-4) || 'XXXX';
    const idNumberMasked = `XXXX-XXXX-${last4}`;
    const submissionId = `kyc-sub-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      // 1. Insert into donor_kyc_verifications
      const { error: kycErr } = await supabase
        .from('donor_kyc_verifications')
        .insert({
          donor_id: currentUser.id,
          id_type: input.idType,
          id_number_masked: idNumberMasked,
          document_file_name: input.documentFile.name,
          document_file_size: input.documentFile.size,
          document_file_type: input.documentFile.type,
          document_url: input.documentFile.dataUrl,
          kyc_status: 'pending'
        });

      if (kycErr) {
        console.error('[Supabase] Failed to insert resubmitted KYC verification:', kycErr);
        throw new Error(`Failed to submit document: ${kycErr.message}`);
      }

      // 2. Update donor_profiles
      const { error: profErr } = await supabase
        .from('donor_profiles')
        .update({
          kyc_status: 'pending',
          is_available: false,
          id_type: input.idType,
          id_number_masked: idNumberMasked
        })
        .eq('user_id', currentUser.id);

      if (profErr) {
        console.error('[Supabase] Failed to update donor profile on resubmission:', profErr);
      }

      // 3. Update users
      const { error: userErr } = await supabase
        .from('users')
        .update({
          kyc_status: 'pending',
          verification_status: 'pending'
        })
        .eq('id', currentUser.id);

      if (userErr) {
        console.error('[Supabase] Failed to update user status on resubmission:', userErr);
      }
    }

    const newSubmission: DonorKycSubmission = {
      id: submissionId,
      donorId: currentUser.id,
      donorName: currentUser.name,
      donorEmail: currentUser.email,
      donorPhone: currentUser.phone,
      bloodGroup: donorProfiles[currentUser.id]?.bloodGroup || 'O+',
      dateOfBirth: currentUser.dateOfBirth || '',
      idType: input.idType,
      idNumberMasked,
      documentFileName: input.documentFile.name,
      documentFileSize: input.documentFile.size,
      documentFileType: input.documentFile.type,
      documentUrl: input.documentFile.dataUrl,
      status: 'pending',
      submittedAt: now
    };

    setKycSubmissions(prev => [newSubmission, ...prev.filter(s => s.id !== submissionId)]);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, kycStatus: 'pending' as KycStatus, verificationStatus: 'pending' } : u));
    setDonorProfiles(prev => {
      const existing = prev[currentUser.id];
      if (!existing) return prev;
      return {
        ...prev,
        [currentUser.id]: {
          ...existing,
          kycStatus: 'pending' as KycStatus,
          isAvailable: false,
          idType: input.idType,
          simulatedAadhaarMasked: idNumberMasked
        }
      };
    });

    AuditLogSimulator.record(
      currentUser.id,
      currentUser.name,
      'donor',
      'DONOR_KYC_SUBMITTED',
      'Verification',
      submissionId,
      `Government ID resubmitted by ${currentUser.name} (${input.idType.toUpperCase()}: ${idNumberMasked}). Awaiting staff verification.`
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Register Institution (Hospital, Blood Bank, NGO)
  const registerInstitution = async (input: InstitutionRegistrationInput): Promise<User> => {
    if (!input.institutionName?.trim()) {
      throw new Error('Institution legal name is required.');
    }
    if (!input.nodalOfficerName?.trim() || !input.nodalOfficerPhone?.trim()) {
      throw new Error('Authorized Nodal Officer name and phone are required.');
    }
    if (!input.licenseNumber?.trim()) {
      throw new Error('Official operating license number is required.');
    }
    if (!input.documentFile?.dataUrl) {
      throw new Error('Statutory operating license certificate is required.');
    }

    let newUserId = `usr-${input.role}-${Date.now().toString().slice(-4)}`;
    let submissionId = `inst-verif-${Date.now().toString().slice(-4)}`;
    const cleanEmail = input.email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      // 1. Supabase Auth signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: input.password || 'LifeLink2026!Secure',
        options: {
          data: {
            name: input.nodalOfficerName,
            phone: input.nodalOfficerPhone,
            role: input.role,
            institution_name: input.institutionName,
            license_number: input.licenseNumber
          }
        }
      });

      if (authError) {
        console.error('[Supabase Auth] Institution signUp failed:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create institutional user in Supabase Auth.');
      }

      newUserId = authData.user.id;

      // 2. Upsert into public.users
      const { error: userInsertError } = await supabase
        .from('users')
        .upsert({
          id: newUserId,
          role: input.role,
          name: input.nodalOfficerName,
          institution_name: input.institutionName,
          license_number: input.licenseNumber,
          phone: input.nodalOfficerPhone,
          email: cleanEmail,
          date_of_birth: input.officerDateOfBirth || '1985-05-15',
          verification_status: 'pending',
          kyc_status: 'pending',
          location: {
            address: input.address,
            city: input.city,
            lat: 28.5355,
            lng: 77.2410
          }
        });

      if (userInsertError) {
        console.error('[Supabase] Failed to insert institutional user into public.users:', userInsertError);
        throw new Error(`Failed to save institution record: ${userInsertError.message}`);
      }

      // 3. Insert into public.institution_verifications
      const { data: verifData, error: verifInsertError } = await supabase
        .from('institution_verifications')
        .insert({
          institution_id: newUserId,
          institution_name: input.institutionName,
          institution_type: input.role,
          license_type: input.licenseType,
          license_number: input.licenseNumber,
          nodal_officer_name: input.nodalOfficerName,
          nodal_officer_phone: input.nodalOfficerPhone,
          nodal_officer_designation: input.nodalOfficerDesignation,
          document_file_name: input.documentFile.name,
          document_file_size: input.documentFile.size,
          document_file_type: input.documentFile.type,
          document_url: input.documentFile.dataUrl,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (verifInsertError) {
        console.error('[Supabase] Failed to insert into public.institution_verifications:', verifInsertError);
        throw new Error(`Failed to save verification submission: ${verifInsertError.message}`);
      }

      if (verifData) {
        submissionId = verifData.id;
      }
    }

    const newInstUser: User = {
      id: newUserId,
      role: input.role,
      name: input.nodalOfficerName,
      institutionName: input.institutionName,
      licenseNumber: input.licenseNumber,
      phone: input.nodalOfficerPhone,
      email: cleanEmail,
      location: {
        address: input.address,
        city: input.city,
        lat: 28.5355,
        lng: 77.2410
      },
      isSimulatedKycVerified: false,
      simulatedKycRef: submissionId,
      verificationStatus: 'pending',
      kycStatus: 'pending',
      dateOfBirth: input.officerDateOfBirth
    };

    const newInstSubmission: InstitutionVerificationSubmission = {
      id: submissionId,
      institutionId: newUserId,
      institutionName: input.institutionName,
      institutionType: input.role,
      licenseType: input.licenseType,
      licenseNumber: input.licenseNumber,
      nodalOfficerName: input.nodalOfficerName,
      nodalOfficerPhone: input.nodalOfficerPhone,
      nodalOfficerDesignation: input.nodalOfficerDesignation,
      documentFileName: input.documentFile.name,
      documentFileSize: input.documentFile.size,
      documentFileType: input.documentFile.type,
      documentUrl: input.documentFile.dataUrl,
      verificationStatus: 'pending',
      submittedAt: new Date().toISOString()
    };

    setUsers(prev => [...prev.filter(u => u.email.toLowerCase() !== cleanEmail), newInstUser]);
    setInstitutionSubmissions(prev => [newInstSubmission, ...prev.filter(s => s.id !== submissionId)]);
    setSelectedUserId(newUserId);
    setSupabaseSessionUser(newInstUser);
    setCurrentRole(input.role);

    AuditLogSimulator.record(
      newUserId,
      input.institutionName,
      input.role,
      'INSTITUTIONAL_REGISTRATION_SUBMITTED',
      'Verification',
      submissionId,
      `Institutional registration submitted for ${input.institutionName} (${input.role.toUpperCase()}). License: ${input.licenseNumber} (${input.licenseType.toUpperCase()}). Stored in Supabase. Awaiting Directorate audit.`
    );
    setAuditLogs(AuditLogSimulator.getLogs());

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    return newInstUser;
  };

  // Approve Institution Statutory License Verification
  const approveInstitutionVerification = async (submissionId: string, reviewerName: string = 'Platform Directorate (Dr. Sharma)'): Promise<void> => {
    const submission = institutionSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { data: verifData, error: subErr } = await supabase
        .from('institution_verifications')
        .update({
          verification_status: 'verified',
          reviewed_at: now,
          reviewed_by: reviewerName
        })
        .eq('id', submissionId)
        .select();

      if (subErr) {
        console.error('[Supabase] Failed to update institution verification:', subErr);
        throw new Error(`Supabase update error: ${subErr.message}`);
      }
      if (!verifData || verifData.length === 0) {
        throw new Error('Database update blocked (0 rows updated). You must be signed in with an authorized Admin staff account.');
      }

      const { data: userData, error: userErr } = await supabase
        .from('users')
        .update({
          verification_status: 'verified',
          kyc_status: 'verified'
        })
        .eq('id', submission.institutionId)
        .select();

      if (userErr) {
        console.error('[Supabase] Failed to update user verification status:', userErr);
        throw new Error(`User status update error: ${userErr.message}`);
      }
      if (!userData || userData.length === 0) {
        throw new Error('Database update blocked on user record (0 rows updated). Verify staff permissions.');
      }
    }

    setInstitutionSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          verificationStatus: 'verified' as KycStatus,
          reviewedAt: now,
          reviewedBy: reviewerName
        };
      }
      return s;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === submission.institutionId) {
        return {
          ...u,
          verificationStatus: 'verified',
          kycStatus: 'verified',
          isSimulatedKycVerified: true
        };
      }
      return u;
    }));

    AuditLogSimulator.record(
      currentUser.id,
      reviewerName,
      currentUser.role,
      'INSTITUTION_VERIFICATION_APPROVED',
      'Verification',
      submissionId,
      `Statutory operating license approved for ${submission.institutionName} (${submission.institutionType.toUpperCase()}). License: ${submission.licenseNumber}. Institutional network privileges unlocked.`
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Reject Institution Statutory License Verification
  const rejectInstitutionVerification = async (submissionId: string, reason: string, reviewerName: string = 'Platform Directorate (Dr. Sharma)'): Promise<void> => {
    const submission = institutionSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { data: verifData, error: subErr } = await supabase
        .from('institution_verifications')
        .update({
          verification_status: 'rejected',
          rejection_reason: reason,
          reviewed_at: now,
          reviewed_by: reviewerName
        })
        .eq('id', submissionId)
        .select();

      if (subErr) {
        console.error('[Supabase] Failed to reject institution verification:', subErr);
        throw new Error(`Supabase update error: ${subErr.message}`);
      }
      if (!verifData || verifData.length === 0) {
        throw new Error('Database update blocked (0 rows updated). You must be signed in with an authorized Admin staff account.');
      }

      const { data: userData, error: userErr } = await supabase
        .from('users')
        .update({
          verification_status: 'rejected',
          kyc_status: 'rejected'
        })
        .eq('id', submission.institutionId)
        .select();

      if (userErr) {
        console.error('[Supabase] Failed to update user status on rejection:', userErr);
        throw new Error(`User status update error: ${userErr.message}`);
      }
      if (!userData || userData.length === 0) {
        throw new Error('Database update blocked on user record (0 rows updated). Verify staff permissions.');
      }
    }

    setInstitutionSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          verificationStatus: 'rejected' as KycStatus,
          rejectionReason: reason,
          reviewedAt: now,
          reviewedBy: reviewerName
        };
      }
      return s;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === submission.institutionId) {
        return {
          ...u,
          verificationStatus: 'rejected',
          kycStatus: 'rejected'
        };
      }
      return u;
    }));

    AuditLogSimulator.record(
      currentUser.id,
      reviewerName,
      currentUser.role,
      'INSTITUTION_VERIFICATION_REJECTED',
      'Verification',
      submissionId,
      `Statutory operating license rejected for ${submission.institutionName}. Reason: ${reason}. License: ${submission.licenseNumber}.`
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Resubmit Institution Statutory License
  const resubmitInstitutionVerification = async (input: {
    licenseType: InstitutionLicenseType;
    licenseNumber: string;
    documentFile: {
      name: string;
      size: number;
      type: string;
      dataUrl: string;
    };
  }): Promise<void> => {
    const submissionId = `inst-verif-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { error: verifErr } = await supabase
        .from('institution_verifications')
        .insert({
          institution_id: currentUser.id,
          institution_name: currentUser.institutionName || currentUser.name,
          institution_type: currentUser.role,
          license_type: input.licenseType,
          license_number: input.licenseNumber,
          nodal_officer_name: currentUser.name,
          nodal_officer_phone: currentUser.phone,
          nodal_officer_designation: 'Authorized Representative',
          document_file_name: input.documentFile.name,
          document_file_size: input.documentFile.size,
          document_file_type: input.documentFile.type,
          document_url: input.documentFile.dataUrl,
          verification_status: 'pending'
        });

      if (verifErr) {
        console.error('[Supabase] Failed to insert resubmitted institution verification:', verifErr);
        throw new Error(`Failed to submit corrected license: ${verifErr.message}`);
      }

      const { error: userErr } = await supabase
        .from('users')
        .update({
          verification_status: 'pending',
          kyc_status: 'pending',
          license_number: input.licenseNumber
        })
        .eq('id', currentUser.id);

      if (userErr) {
        console.error('[Supabase] Failed to update user status on resubmission:', userErr);
      }
    }

    const newSubmission: InstitutionVerificationSubmission = {
      id: submissionId,
      institutionId: currentUser.id,
      institutionName: currentUser.institutionName || currentUser.name,
      institutionType: currentUser.role as InstitutionType,
      licenseType: input.licenseType,
      licenseNumber: input.licenseNumber,
      nodalOfficerName: currentUser.name,
      nodalOfficerPhone: currentUser.phone,
      nodalOfficerDesignation: 'Authorized Representative',
      documentFileName: input.documentFile.name,
      documentFileSize: input.documentFile.size,
      documentFileType: input.documentFile.type,
      documentUrl: input.documentFile.dataUrl,
      verificationStatus: 'pending',
      submittedAt: now
    };

    setInstitutionSubmissions(prev => [newSubmission, ...prev.filter(s => s.id !== submissionId)]);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, verificationStatus: 'pending', kycStatus: 'pending', licenseNumber: input.licenseNumber } : u));

    AuditLogSimulator.record(
      currentUser.id,
      currentUser.institutionName || currentUser.name,
      currentUser.role,
      'INSTITUTION_VERIFICATION_RESUBMITTED',
      'Verification',
      submissionId,
      `Corrected operating license resubmitted by ${currentUser.institutionName || currentUser.name} (${input.licenseType.toUpperCase()}: ${input.licenseNumber}). Awaiting Directorate audit.`
    );
    setAuditLogs(AuditLogSimulator.getLogs());
  };

  // Re-fetch institutional verification status from Supabase
  const refreshInstitutionStatus = async (): Promise<KycStatus> => {
    if (!isSupabaseConfigured() || !currentUser?.id) {
      return (currentUser?.verificationStatus as KycStatus) || 'pending';
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (userError) {
        console.error('[Supabase] Error in refreshInstitutionStatus:', userError);
      }

      const { data: verifData, error: verifError } = await supabase
        .from('institution_verifications')
        .select('*')
        .eq('institution_id', currentUser.id)
        .order('submitted_at', { ascending: false });

      if (verifError) {
        console.error('[Supabase] Error fetching institution_verifications:', verifError);
      }

      const updatedStatus: KycStatus = (userData?.verification_status as KycStatus) || 
        (verifData?.[0]?.verification_status as KycStatus) || 
        (currentUser.verificationStatus as KycStatus) || 
        'pending';

      if (userData) {
        setUsers(prev => prev.map(u => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              verificationStatus: updatedStatus,
              kycStatus: updatedStatus,
              isSimulatedKycVerified: updatedStatus === 'verified',
              institutionName: userData.institution_name || u.institutionName,
              licenseNumber: userData.license_number || u.licenseNumber
            };
          }
          return u;
        }));
      }

      if (verifData && verifData.length > 0) {
        const mappedSubmissions: InstitutionVerificationSubmission[] = verifData.map((row: any) => ({
          id: row.id,
          institutionId: row.institution_id,
          institutionName: row.institution_name,
          institutionType: row.institution_type,
          licenseType: row.license_type,
          licenseNumber: row.license_number,
          nodalOfficerName: row.nodal_officer_name,
          nodalOfficerPhone: row.nodal_officer_phone,
          nodalOfficerDesignation: row.nodal_officer_designation,
          documentFileName: row.document_file_name,
          documentFileSize: row.document_file_size,
          documentFileType: row.document_file_type,
          documentUrl: row.document_url,
          verificationStatus: row.verification_status,
          submittedAt: row.submitted_at,
          reviewedAt: row.reviewed_at,
          reviewedBy: row.reviewed_by,
          rejectionReason: row.rejection_reason
        }));

        setInstitutionSubmissions(prev => {
          const dbIds = new Set(mappedSubmissions.map(s => s.id));
          return [...mappedSubmissions, ...prev.filter(s => !dbIds.has(s.id))];
        });
      }

      return updatedStatus;
    } catch (err) {
      console.error('[Supabase] Error in refreshInstitutionStatus:', err);
      return (currentUser?.verificationStatus as KycStatus) || 'pending';
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentUser,
        currentLanguage,
        t,
        requests,
        donorProfiles,
        users,
        bloodBanks,
        bloodUnits,
        camps,
        impactNotifications,
        auditLogs,
        slaConfig,
        selectedRequestId,
        activeQrUnit,
        isEmergencyModalOpen,
        kycSubmissions,
        institutionSubmissions,
        isDonorRegistrationModalOpen,
        googleOAuthPendingData,
        setGoogleOAuthPendingData,
        switchRole,
        setLanguage,
        setSelectedRequestId,
        setActiveQrUnit,
        setIsEmergencyModalOpen,
        setIsDonorRegistrationModalOpen,
        registerDonor,
        signInDonor,
        refreshKycStatus,
        signOutDonor,
        resubmitDonorKyc,
        approveDonorKyc,
        rejectDonorKyc,
        registerInstitution,
        approveInstitutionVerification,
        rejectInstitutionVerification,
        resubmitInstitutionVerification,
        refreshInstitutionStatus,
        signInStaff,
        signOutStaff,
        isStaffAuthenticated,
        supabaseSessionUser,
        createRequest,
        acceptMatch,
        declineMatch,
        escalateRequest,
        confirmTransfusion,
        toggleDonorAvailability,
        addBloodUnit,
        advanceUnitStatus,
        scheduleCamp,
        verifyInstitution,
        loginWithGoogleUser,
        setActiveUser,
        registerUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
