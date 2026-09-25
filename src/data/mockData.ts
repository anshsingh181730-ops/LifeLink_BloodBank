import { User, DonorProfile, BloodBank, BloodUnit, BloodRequest, Camp, ImpactNotification } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-patient-1',
    role: 'patient',
    name: 'Rahul Varma',
    phone: '+91 98112 34567',
    email: 'rahul.varma@example.com',
    location: { address: 'Saket, New Delhi', city: 'Delhi', lat: 28.5244, lng: 77.2167 },
    isSimulatedKycVerified: true,
    simulatedKycRef: 'KYC-SIM-IND-9281',
    verificationStatus: 'verified'
  },
  {
    id: 'usr-donor-1',
    role: 'donor',
    name: 'Vikram Malhotra',
    phone: '+91 98765 43210',
    email: 'vikram.m@example.com',
    location: { address: 'Hauz Khas, New Delhi', city: 'Delhi', lat: 28.5494, lng: 77.2001 },
    isSimulatedKycVerified: true,
    simulatedKycRef: 'KYC-SIM-IND-8831',
    verificationStatus: 'verified'
  },
  {
    id: 'usr-donor-2',
    role: 'donor',
    name: 'Priya Nair',
    phone: '+91 98223 88441',
    email: 'priya.nair@example.com',
    location: { address: 'Lajpat Nagar, New Delhi', city: 'Delhi', lat: 28.5677, lng: 77.2433 },
    isSimulatedKycVerified: true,
    simulatedKycRef: 'KYC-SIM-IND-4412',
    verificationStatus: 'verified'
  },
  {
    id: 'usr-donor-3',
    role: 'donor',
    name: 'Amit Patel',
    phone: '+91 98334 11223',
    email: 'amit.patel@example.com',
    location: { address: 'Noida Sector 18', city: 'Delhi NCR', lat: 28.5708, lng: 77.3261 },
    isSimulatedKycVerified: true,
    simulatedKycRef: 'KYC-SIM-IND-7762',
    verificationStatus: 'verified'
  },
  {
    id: 'usr-hosp-1',
    role: 'hospital',
    name: 'Dr. Ananya Roy',
    phone: '+91 11 2692 5858',
    email: 'bloodtransfusion@apollo-delhi.org',
    location: { address: 'Sarita Vihar, Mathura Road', city: 'Delhi', lat: 28.5355, lng: 77.2910 },
    isSimulatedKycVerified: true,
    simulatedKycRef: 'HOSP-VERIF-DEL-1029',
    institutionName: 'Indraprastha Apollo Hospital',
    licenseNumber: 'NABH-DL-2024-88',
    verificationStatus: 'verified'
  },
  {
    id: 'usr-bb-1',
    role: 'bloodbank',
    name: 'Red Cross Central Blood Bank',
    phone: '+91 11 2371 6441',
    email: 'central@indianredcross.org',
    location: { address: '1 Red Cross Road, Connaught Place', city: 'Delhi', lat: 28.6219, lng: 77.2088 },
    isSimulatedKycVerified: true,
    simulatedKycRef: 'BB-LIC-CDSCO-551',
    institutionName: 'Indian Red Cross Society Blood Centre',
    licenseNumber: 'CDSCO-LIC-DL-001',
    verificationStatus: 'verified'
  },
  {
    id: 'usr-ngo-1',
    role: 'ngo',
    name: 'Kabir Mehra',
    phone: '+91 99990 12345',
    email: 'kabir@rotarylifelink.org',
    location: { address: 'Barakhamba Road, Connaught Place', city: 'Delhi', lat: 28.6289, lng: 77.2270 },
    isSimulatedKycVerified: true,
    simulatedKycRef: 'NGO-DARPAN-DL-492',
    institutionName: 'Rotary Life Foundation India',
    licenseNumber: 'DARPAN-DL-98214',
    verificationStatus: 'verified'
  },
  {
    id: 'usr-admin-1',
    role: 'admin',
    name: 'Dr. S. K. Sharma',
    phone: '+91 11 2306 1450',
    email: 'director@bloodcoord.gov.in',
    location: { address: 'Nirman Bhawan, New Delhi', city: 'Delhi', lat: 28.6119, lng: 77.2193 },
    isSimulatedKycVerified: true,
    simulatedKycRef: 'GOV-ADM-SEC-01',
    institutionName: 'National Blood Transfusion Council / Coordination Directorate',
    verificationStatus: 'verified'
  }
];

export const INITIAL_DONOR_PROFILES: Record<string, DonorProfile> = {
  'usr-donor-1': {
    userId: 'usr-donor-1',
    bloodGroup: 'O-', // Universal Donor
    isAvailable: true,
    lastDonationDate: '2026-05-10', // >90 days, eligible!
    reliabilityScore: 98,
    totalDonations: 9,
    badges: ['Universal Lifesaver', 'Rapid 15-Min Responder', 'Centurion Club'],
    notificationRadiusKm: 25,
    urgencyThreshold: 'standard',
    simulatedAadhaarMasked: 'XXXX-XXXX-4821 (Simulated e-KYC)'
  },
  'usr-donor-2': {
    userId: 'usr-donor-2',
    bloodGroup: 'A+',
    isAvailable: true,
    lastDonationDate: '2026-04-18',
    reliabilityScore: 94,
    totalDonations: 5,
    badges: ['Silver Lifesaver', 'Consistent Donor'],
    notificationRadiusKm: 15,
    urgencyThreshold: 'urgent',
    simulatedAadhaarMasked: 'XXXX-XXXX-9912 (Simulated e-KYC)'
  },
  'usr-donor-3': {
    userId: 'usr-donor-3',
    bloodGroup: 'B+',
    isAvailable: false, // Currently toggled off
    lastDonationDate: '2026-08-20', // < 90 days
    reliabilityScore: 88,
    totalDonations: 3,
    badges: ['Platelet Champion'],
    notificationRadiusKm: 20,
    urgencyThreshold: 'critical',
    simulatedAadhaarMasked: 'XXXX-XXXX-1355 (Simulated e-KYC)'
  }
};

export const INITIAL_BLOOD_BANKS: BloodBank[] = [
  {
    id: 'bb-delhi-01',
    name: 'Red Cross Central Blood Bank',
    license: 'CDSCO-LIC-DL-001',
    city: 'Delhi',
    location: { address: '1 Red Cross Road, Connaught Place', city: 'Delhi', lat: 28.6219, lng: 77.2088 },
    contactPhone: '+91 11 2371 6441',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: {
      'O-': 4,
      'O+': 28,
      'A-': 6,
      'A+': 34,
      'B-': 3,
      'B+': 41,
      'AB-': 2,
      'AB+': 19
    },
    status: 'active'
  },
  {
    id: 'bb-delhi-02',
    name: 'AIIMS Blood Transfusion Centre',
    license: 'CDSCO-LIC-DL-014',
    city: 'Delhi',
    location: { address: 'Ansari Nagar, New Delhi', city: 'Delhi', lat: 28.5672, lng: 77.2100 },
    contactPhone: '+91 11 2659 4444',
    operatingHours: '24x7 Critical Care',
    inventorySummary: {
      'O-': 8,
      'O+': 52,
      'A-': 9,
      'A+': 45,
      'B-': 5,
      'B+': 62,
      'AB-': 4,
      'AB+': 27
    },
    status: 'active'
  },
  {
    id: 'bb-mum-01',
    name: 'KEM Hospital Blood Centre',
    license: 'CDSCO-LIC-MH-029',
    city: 'Mumbai',
    location: { address: 'Parel, Mumbai', city: 'Mumbai', lat: 19.0028, lng: 72.8427 },
    contactPhone: '+91 22 2410 7000',
    operatingHours: '24x7 Emergency',
    inventorySummary: {
      'O-': 2,
      'O+': 30,
      'A-': 4,
      'A+': 25,
      'B-': 3,
      'B+': 38,
      'AB-': 1,
      'AB+': 15
    },
    status: 'active'
  },
  {
    id: 'bb-blr-01',
    name: 'Victoria Hospital Rotary Blood Bank',
    license: 'CDSCO-LIC-KA-008',
    city: 'Bengaluru',
    location: { address: 'Kalasipalya, Bengaluru', city: 'Bengaluru', lat: 12.9647, lng: 77.5760 },
    contactPhone: '+91 80 2670 1150',
    operatingHours: '24x7 Service',
    inventorySummary: {
      'O-': 5,
      'O+': 42,
      'A-': 7,
      'A+': 38,
      'B-': 4,
      'B+': 45,
      'AB-': 3,
      'AB+': 22
    },
    status: 'active'
  }
];

export const INITIAL_BLOOD_UNITS: BloodUnit[] = [
  {
    id: 'unit-101',
    unitCode: 'LL-DL-26-0922-O-01',
    bloodBankId: 'bb-delhi-01',
    bloodBankName: 'Red Cross Central Blood Bank',
    bloodGroup: 'O-',
    component: 'Packed Red Blood Cells',
    collectionDate: '2026-09-10',
    expiryDate: '2026-10-15',
    status: 'stored',
    temperatureCelsius: 4.2
  },
  {
    id: 'unit-102',
    unitCode: 'LL-DL-26-0921-PLT-02',
    bloodBankId: 'bb-delhi-01',
    bloodBankName: 'Red Cross Central Blood Bank',
    bloodGroup: 'B+',
    component: 'Platelets',
    collectionDate: '2026-09-19',
    expiryDate: '2026-09-24', // Expiring in 2 days! Near expiry alert
    status: 'stored',
    temperatureCelsius: 22.0
  },
  {
    id: 'unit-103',
    unitCode: 'LL-DL-26-0918-FFP-03',
    bloodBankId: 'bb-delhi-02',
    bloodBankName: 'AIIMS Blood Transfusion Centre',
    bloodGroup: 'AB-',
    component: 'Fresh Frozen Plasma',
    collectionDate: '2026-08-01',
    expiryDate: '2027-08-01',
    status: 'stored',
    temperatureCelsius: -24.5
  },
  {
    id: 'unit-104',
    unitCode: 'LL-DL-26-0902-WB-04',
    bloodBankId: 'bb-delhi-01',
    bloodBankName: 'Red Cross Central Blood Bank',
    bloodGroup: 'A+',
    component: 'Whole Blood',
    collectionDate: '2026-08-25',
    expiryDate: '2026-09-29', // Expiring in 7 days
    status: 'stored',
    temperatureCelsius: 3.8
  }
];

export const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'req-001',
    requesterId: 'usr-patient-1',
    requesterName: 'Rahul Varma (for Father)',
    requesterRole: 'patient',
    patientCaseId: 'CASE-APOLLO-EMG-819',
    bloodGroup: 'O-',
    component: 'Packed Red Blood Cells',
    units: 2,
    urgency: 'critical',
    location: { address: 'Indraprastha Apollo Hospital, New Delhi', city: 'Delhi', lat: 28.5355, lng: 77.2910 },
    hospitalName: 'Apollo Hospital ICU Ward 4',
    status: 'matching',
    currentTier: 1,
    createdAt: '2026-09-22T11:45:00Z',
    updatedAt: '2026-09-22T11:45:00Z',
    notes: 'Emergency bypass surgery scheduled. Immediate O- units required.'
  },
  {
    id: 'req-002',
    requesterId: 'usr-hosp-1',
    requesterName: 'Indraprastha Apollo Hospital',
    requesterRole: 'hospital',
    patientCaseId: 'CASE-APOLLO-TRAUMA-102',
    bloodGroup: 'B+',
    component: 'Platelets',
    units: 3,
    urgency: 'urgent',
    location: { address: 'Sarita Vihar, Mathura Road', city: 'Delhi', lat: 28.5355, lng: 77.2910 },
    hospitalName: 'Indraprastha Apollo Hospital',
    status: 'accepted',
    currentTier: 1,
    matchedDonorId: 'usr-donor-2',
    matchedDonorName: 'Priya Nair',
    matchedDonorPhone: '+91 98223 88441',
    createdAt: '2026-09-22T10:10:00Z',
    updatedAt: '2026-09-22T10:25:00Z',
    notes: 'Dengue with severe thrombocytopenia. Platelet count below 15,000.'
  }
];

export const INITIAL_CAMPS: Camp[] = [
  {
    id: 'camp-001',
    ngoId: 'usr-ngo-1',
    ngoName: 'Rotary Life Foundation India',
    title: 'Mega Delhi Lifesaver Blood Drive',
    venue: 'Connaught Place Central Park, New Delhi',
    city: 'Delhi',
    targetUnits: 250,
    registeredVolunteers: 38,
    collectedUnits: 0,
    date: '2026-09-27',
    status: 'upcoming',
    partnerBank: 'Red Cross Central Blood Bank'
  },
  {
    id: 'camp-002',
    ngoId: 'usr-ngo-1',
    ngoName: 'Rotary Life Foundation India',
    title: 'Cyber City Corporate Donation Camp',
    venue: 'DLF Cyber Hub Amphitheatre, Gurugram',
    city: 'Delhi NCR',
    targetUnits: 150,
    registeredVolunteers: 22,
    collectedUnits: 0,
    date: '2026-10-02',
    status: 'upcoming',
    partnerBank: 'AIIMS Blood Transfusion Centre'
  }
];

export const INITIAL_IMPACTS: ImpactNotification[] = [
  {
    id: 'imp-001',
    donorId: 'usr-donor-1',
    unitCode: 'LL-DL-26-0510-O-09',
    hospitalName: 'Fortis Escorts Heart Institute',
    city: 'New Delhi',
    message: 'Your donated O- unit was transfused during a critical cardiac surgery. You helped save a life!',
    timestamp: '2026-05-14T14:30:00Z',
    transfusionDate: '14 May 2026'
  },
  {
    id: 'imp-002',
    donorId: 'usr-donor-1',
    unitCode: 'LL-DL-26-0120-O-08',
    hospitalName: 'Safdarjung Emergency Trauma Centre',
    city: 'New Delhi',
    message: 'Your unit was issued to an emergency road trauma victim. Thank you for being a reliable lifesaver.',
    timestamp: '2026-01-22T09:15:00Z',
    transfusionDate: '22 Jan 2026'
  }
];

// Shortage Heatmap Data for NGOs & Health Authorities
export const REGIONAL_HEATMAP_DATA = [
  { region: 'East Delhi & Shahdara', deficitLevel: 'high', deficitPercent: 34, primaryNeed: 'O-, B-', hospitalCount: 14 },
  { region: 'South Delhi & Saket', deficitLevel: 'medium', deficitPercent: 18, primaryNeed: 'Platelets, AB-', hospitalCount: 22 },
  { region: 'Central Delhi / NDMC', deficitLevel: 'low', deficitPercent: 6, primaryNeed: 'A-', hospitalCount: 18 },
  { region: 'Noida & Greater Noida', deficitLevel: 'critical', deficitPercent: 42, primaryNeed: 'O-, RBC', hospitalCount: 19 },
  { region: 'Gurugram & Manesar', deficitLevel: 'medium', deficitPercent: 21, primaryNeed: 'Platelets, O+', hospitalCount: 26 },
  { region: 'North West Delhi & Rohini', deficitLevel: 'high', deficitPercent: 31, primaryNeed: 'B+, FFP', hospitalCount: 16 }
];
