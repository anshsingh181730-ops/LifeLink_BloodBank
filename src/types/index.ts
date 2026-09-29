// Core Types & Entities according to Documents 01-05

export type Role = 'public' | 'patient' | 'donor' | 'hospital' | 'bloodbank' | 'ngo' | 'admin';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type BloodComponent = 'Whole Blood' | 'Packed Red Blood Cells' | 'Platelets' | 'Fresh Frozen Plasma';

export type UrgencyLevel = 'standard' | 'urgent' | 'critical';

export type RequestStatus = 
  | 'matching'    // smart matching running
  | 'notified'    // candidate donors/banks alerted
  | 'accepted'    // matched donor or bank accepted
  | 'en_route'    // donor traveling / courier dispatched
  | 'fulfilled'   // blood arrived/donated
  | 'cancelled';

export type UnitStatus = 
  | 'collected' 
  | 'tested' 
  | 'stored' 
  | 'issued' 
  | 'transfused' 
  | 'disposed';

export interface Location {
  address: string;
  city: string;
  lat: number;
  lng: number;
  source?: 'browser' | 'manual' | 'default';
  accuracy?: number; // accuracy in meters from GPS
  timestamp?: number;
}

export type KycStatus = 'pending' | 'verified' | 'rejected';

export type GovIdType = 'aadhaar' | 'voter_id' | 'passport' | 'driving_license';

export interface DonorKycSubmission {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  bloodGroup: BloodGroup;
  dateOfBirth: string;
  idType: GovIdType;
  idNumberMasked: string; // e.g. "XXXX-XXXX-4821"
  documentFileName: string;
  documentFileSize: number; // bytes
  documentFileType: string; // mime type
  documentUrl: string; // Expiring / restricted view URL
  status: KycStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface DonorRegistrationInput {
  name: string;
  phone: string;
  email: string;
  password?: string;
  bloodGroup: BloodGroup;
  dateOfBirth: string;
  location: Location;
  idType: GovIdType;
  idNumber: string;
  documentFile: {
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  };
}

export type InstitutionType = 'hospital' | 'bloodbank' | 'ngo';

export type InstitutionLicenseType = 
  | 'nabh' 
  | 'cdsco' 
  | 'state_transfusion_council' 
  | 'darpan_ngo' 
  | 'clinical_establishment';

export interface InstitutionVerificationSubmission {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionType: InstitutionType;
  licenseType: InstitutionLicenseType;
  licenseNumber: string;
  nodalOfficerName: string;
  nodalOfficerPhone: string;
  nodalOfficerDesignation: string;
  documentFileName: string;
  documentFileSize: number;
  documentFileType: string;
  documentUrl: string;
  verificationStatus: KycStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface InstitutionRegistrationInput {
  role: InstitutionType;
  institutionName: string;
  city: string;
  address: string;
  nodalOfficerName: string;
  nodalOfficerPhone: string;
  nodalOfficerDesignation: string;
  officerDateOfBirth: string;
  email: string;
  password?: string;
  licenseType: InstitutionLicenseType;
  licenseNumber: string;
  documentFile: {
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  };
}

export interface User {
  id: string;
  role: Role;
  name: string;
  phone: string;
  email: string;
  location: Location;
  isSimulatedKycVerified: boolean;
  simulatedKycRef: string; // tokenized reference
  institutionName?: string;
  licenseNumber?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  dateOfBirth?: string;
  kycStatus?: KycStatus;
}

export interface DonorProfile {
  userId: string;
  bloodGroup: BloodGroup;
  isAvailable: boolean;
  lastDonationDate: string; // YYYY-MM-DD
  reliabilityScore: number; // 0 - 100
  totalDonations: number;
  badges: string[];
  notificationRadiusKm: number;
  urgencyThreshold: UrgencyLevel;
  simulatedAadhaarMasked: string; // e.g. "XXXX-XXXX-4821"
  currentLocation?: Location;
  locationUpdatedAt?: string;
  dateOfBirth?: string;
  kycStatus?: KycStatus;
  kycSubmissionId?: string;
  idType?: GovIdType;
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: 'patient' | 'hospital';
  patientCaseId?: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  units: number;
  urgency: UrgencyLevel;
  location: Location;
  hospitalName?: string;
  status: RequestStatus;
  currentTier: 1 | 2 | 3 | 4; // 1: Nearby Donors, 2: City-wide, 3: Partner Banks, 4: Inter-city
  matchedDonorId?: string;
  matchedDonorName?: string;
  matchedDonorPhone?: string;
  matchedBankId?: string;
  matchedBankName?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  isPriority?: boolean;
  priorityReason?: string;
  donorContributionScore?: number;
  donorTotalDonations?: number;
}

export interface MatchCandidate {
  id: string;
  requestId: string;
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  reliabilityScore: number;
  daysSinceDonation: number;
  rankScore: number;
  tier: 1 | 2 | 3;
  status: 'pending' | 'accepted' | 'declined' | 'timeout';
}

export interface BloodUnit {
  id: string;
  unitCode: string; // QR identifier
  bloodBankId: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  collectionDate: string;
  expiryDate: string;
  status: UnitStatus;
  donorId?: string;
  transfusedHospitalId?: string;
  transfusedAt?: string;
  temperatureCelsius: number;
}

export interface BloodBank {
  id: string;
  name: string;
  license: string;
  city: string;
  location: Location;
  contactPhone: string;
  operatingHours: string;
  inventorySummary: Record<BloodGroup, number>; // total units per group
  status: 'active' | 'pending_verification';
}

export interface Camp {
  id: string;
  ngoId: string;
  ngoName: string;
  title: string;
  venue: string;
  city: string;
  targetUnits: number;
  registeredVolunteers: number;
  collectedUnits: number;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  partnerBank: string;
}

export interface ImpactNotification {
  id: string;
  donorId: string;
  unitCode: string;
  hospitalName: string;
  city: string;
  message: string;
  timestamp: string;
  transfusionDate: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entityType: 'Request' | 'BloodUnit' | 'User' | 'Verification' | 'Escalation';
  entityId: string;
  details: string;
  timestamp: string;
  beforeState?: string;
  afterState?: string;
}

export interface SlaConfig {
  tier1DonorResponseSeconds: number;
  tier2CityWideResponseSeconds: number;
  tier3BankAllocationSeconds: number;
}
