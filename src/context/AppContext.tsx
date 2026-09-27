import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, User, DonorProfile, BloodRequest, BloodBank, BloodUnit, 
  Camp, ImpactNotification, AuditLogEntry, SlaConfig, BloodGroup, BloodComponent, UrgencyLevel, UnitStatus, Location 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_DONOR_PROFILES, INITIAL_BLOOD_BANKS, 
  INITIAL_BLOOD_UNITS, INITIAL_REQUESTS, INITIAL_CAMPS, INITIAL_IMPACTS 
} from '../data/mockData';
import { rankDonors, findNearbyBloodBanksWithStock } from '../services/matchingSim';
import { AuditLogSimulator } from '../services/auditSim';
import { Language, translations, TranslationSchema } from '../services/i18n';

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

  // Actions
  switchRole: (role: Role) => void;
  setLanguage: (lang: Language) => void;
  setSelectedRequestId: (id: string | null) => void;
  setActiveQrUnit: (unit: BloodUnit | null) => void;
  setIsEmergencyModalOpen: (open: boolean) => void;
  
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

  const [slaConfig] = useState<SlaConfig>({
    tier1DonorResponseSeconds: 45, // Demo timing
    tier2CityWideResponseSeconds: 90,
    tier3BankAllocationSeconds: 120
  });

  // Selected active user ID for demo perspectives
  const [selectedUserId, setSelectedUserId] = useState<string>('usr-donor-1');

  // Active current user matching selectedUserId or currentRole
  const currentUser = users.find(u => u.id === selectedUserId) || users.find(u => u.role === currentRole) || users[0];

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
      if (selectedUserId !== 'usr-donor-1' && selectedUserId !== 'usr-patient-1') {
        setSelectedUserId('usr-donor-1');
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
    setUsers(prevUsers => {
      const existingUserIndex = prevUsers.findIndex(u => u.role === role);
      if (existingUserIndex >= 0) {
        const updated = [...prevUsers];
        updated[existingUserIndex] = {
          ...updated[existingUserIndex],
          name: googleProfile.name || updated[existingUserIndex].name,
          email: googleProfile.email || updated[existingUserIndex].email
        };
        return updated;
      }
      return prevUsers;
    });

    if (role === 'patient' || role === 'donor') {
      setCurrentRole('patient');
      setSelectedUserId('usr-donor-1');
    } else {
      setCurrentRole(role);
      const targetUser = users.find(u => u.role === role);
      if (targetUser) setSelectedUserId(targetUser.id);
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    AuditLogSimulator.record(
      'google-oauth',
      'Google Identity Services (GIS)',
      role,
      'GOOGLE_OAUTH_LOGIN',
      'User',
      googleProfile.email,
      `Verified Google SSO session authenticated for ${role}: ${googleProfile.name} (${googleProfile.email})`
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
    // Check requesting user's own donor contribution history
    const userDonorProfile = donorProfiles[currentUser.id];
    const hasDonationHistory = !!(userDonorProfile && userDonorProfile.totalDonations > 0);
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
        switchRole,
        setLanguage,
        setSelectedRequestId,
        setActiveQrUnit,
        setIsEmergencyModalOpen,
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
