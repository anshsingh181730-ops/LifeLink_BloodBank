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
  simulatedAadhaarMasked: string; // e.g. "XXXX-XXXX-4821 (Simulated)"
  currentLocation?: Location;
  locationUpdatedAt?: string;
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
