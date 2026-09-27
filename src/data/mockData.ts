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
  },
  'usr-patient-1': {
    userId: 'usr-patient-1',
    bloodGroup: 'O+',
    isAvailable: false,
    lastDonationDate: '2026-01-01',
    reliabilityScore: 0,
    totalDonations: 0,
    badges: [],
    notificationRadiusKm: 15,
    urgencyThreshold: 'standard',
    simulatedAadhaarMasked: 'XXXX-XXXX-9281 (Simulated e-KYC)'
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
  },
  {
    id: 'bb-mum-02',
    name: 'Tata Memorial Centre Blood Bank',
    license: 'CDSCO-LIC-MH-041',
    city: 'Mumbai',
    location: { address: 'Dr. E Borges Road, Parel, Mumbai', city: 'Mumbai', lat: 19.0041, lng: 72.8436 },
    contactPhone: '+91 22 2417 7000',
    operatingHours: '24x7 Oncology Blood Bank',
    inventorySummary: {
      'O-': 6,
      'O+': 35,
      'A-': 5,
      'A+': 28,
      'B-': 4,
      'B+': 40,
      'AB-': 3,
      'AB+': 18
    },
    status: 'active'
  },
  {
    id: 'bb-mum-03',
    name: 'Shatabdi Hospital Municipal Blood Centre',
    license: 'CDSCO-LIC-MH-055',
    city: 'Mumbai',
    location: { address: 'S.V. Road, Kandivali-Borivali West, Mumbai', city: 'Mumbai', lat: 19.2065, lng: 72.8495 },
    contactPhone: '+91 22 2805 0100',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: {
      'O-': 5,
      'O+': 38,
      'A-': 6,
      'A+': 31,
      'B-': 4,
      'B+': 42,
      'AB-': 2,
      'AB+': 17
    },
    status: 'active'
  },
  {
    id: 'bb-mum-04',
    name: 'Dr. R. N. Cooper Municipal Hospital Blood Centre',
    license: 'CDSCO-LIC-MH-063',
    city: 'Mumbai',
    location: { address: 'Gulmohar Road, Juhu-Andheri West, Mumbai', city: 'Mumbai', lat: 19.1080, lng: 72.8360 },
    contactPhone: '+91 22 2620 7254',
    operatingHours: '24x7 Trauma & Critical Care',
    inventorySummary: {
      'O-': 7,
      'O+': 44,
      'A-': 6,
      'A+': 36,
      'B-': 5,
      'B+': 48,
      'AB-': 3,
      'AB+': 20
    },
    status: 'active'
  },
  {
    id: 'bb-mum-05',
    name: 'LTMG (Sion) Hospital Blood Bank',
    license: 'CDSCO-LIC-MH-071',
    city: 'Mumbai',
    location: { address: 'Sion West, Mumbai', city: 'Mumbai', lat: 19.0368, lng: 72.8601 },
    contactPhone: '+91 22 2407 6381',
    operatingHours: '24x7 Apex Trauma Center',
    inventorySummary: {
      'O-': 8,
      'O+': 52,
      'A-': 7,
      'A+': 42,
      'B-': 6,
      'B+': 56,
      'AB-': 4,
      'AB+': 24
    },
    status: 'active'
  },
  {
    id: 'bb-blr-02',
    name: 'Bowring and Lady Curzon Hospital Blood Centre',
    license: 'CDSCO-LIC-KA-019',
    city: 'Bengaluru',
    location: { address: 'Lady Curzon Road, Shivajinagar, Bengaluru', city: 'Bengaluru', lat: 12.9815, lng: 77.6046 },
    contactPhone: '+91 80 2559 1325',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: {
      'O-': 4,
      'O+': 36,
      'A-': 6,
      'A+': 32,
      'B-': 3,
      'B+': 39,
      'AB-': 2,
      'AB+': 16
    },
    status: 'active'
  },
  {
    id: 'bb-kol-01',
    name: 'Medical College & Hospital Central Blood Bank',
    license: 'CDSCO-LIC-WB-003',
    city: 'Kolkata',
    location: { address: '88 College Street, Bowbazar, Kolkata', city: 'Kolkata', lat: 22.5744, lng: 88.3629 },
    contactPhone: '+91 33 2255 1621',
    operatingHours: '24x7 Critical Care',
    inventorySummary: {
      'O-': 7,
      'O+': 48,
      'A-': 8,
      'A+': 41,
      'B-': 5,
      'B+': 55,
      'AB-': 3,
      'AB+': 24
    },
    status: 'active'
  },
  {
    id: 'bb-che-01',
    name: 'Rajiv Gandhi Government General Hospital Blood Bank',
    license: 'CDSCO-LIC-TN-007',
    city: 'Chennai',
    location: { address: 'EVR Periyar Salai, Park Town, Chennai', city: 'Chennai', lat: 13.0805, lng: 80.2785 },
    contactPhone: '+91 44 2530 5000',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: {
      'O-': 5,
      'O+': 44,
      'A-': 7,
      'A+': 39,
      'B-': 6,
      'B+': 52,
      'AB-': 4,
      'AB+': 20
    },
    status: 'active'
  },
  {
    id: 'bb-hyd-01',
    name: 'Osmania General Hospital Blood Bank',
    license: 'CDSCO-LIC-TG-011',
    city: 'Hyderabad',
    location: { address: 'Afzal Gunj, Hyderabad', city: 'Hyderabad', lat: 17.3753, lng: 78.4744 },
    contactPhone: '+91 40 2460 0121',
    operatingHours: '24x7 Trauma Care',
    inventorySummary: {
      'O-': 4,
      'O+': 50,
      'A-': 6,
      'A+': 43,
      'B-': 5,
      'B+': 58,
      'AB-': 2,
      'AB+': 25
    },
    status: 'active'
  },
  {
    id: 'bb-pune-01',
    name: 'Sassoon General Hospital Blood Bank',
    license: 'CDSCO-LIC-MH-082',
    city: 'Pune',
    location: { address: 'Near Pune Railway Station, Pune', city: 'Pune', lat: 18.5255, lng: 73.8742 },
    contactPhone: '+91 20 2612 8000',
    operatingHours: '24x7 Regional Blood Centre',
    inventorySummary: {
      'O-': 6,
      'O+': 38,
      'A-': 5,
      'A+': 34,
      'B-': 4,
      'B+': 44,
      'AB-': 3,
      'AB+': 19
    },
    status: 'active'
  },
  {
    id: 'bb-jai-01',
    name: 'Sawai Man Singh (SMS) Hospital Blood Centre',
    license: 'CDSCO-LIC-RJ-005',
    city: 'Jaipur',
    location: { address: 'JLN Marg, Ashok Nagar, Jaipur', city: 'Jaipur', lat: 26.9054, lng: 75.8164 },
    contactPhone: '+91 141 256 0291',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: {
      'O-': 5,
      'O+': 46,
      'A-': 6,
      'A+': 37,
      'B-': 5,
      'B+': 49,
      'AB-': 3,
      'AB+': 21
    },
    status: 'active'
  },
  {
    id: 'bb-lko-01',
    name: "King George's Medical University (KGMU) Blood Bank",
    license: 'CDSCO-LIC-UP-018',
    city: 'Lucknow',
    location: { address: 'Shah Mina Road, Chowk, Lucknow', city: 'Lucknow', lat: 26.8687, lng: 80.9168 },
    contactPhone: '+91 522 225 7540',
    operatingHours: '24x7 Trauma & Critical Care',
    inventorySummary: {
      'O-': 4,
      'O+': 40,
      'A-': 5,
      'A+': 35,
      'B-': 6,
      'B+': 48,
      'AB-': 2,
      'AB+': 20
    },
    status: 'active'
  },
  {
    id: 'bb-ahm-01',
    name: 'Civil Hospital Ahmedabad Blood Centre',
    license: 'CDSCO-LIC-GJ-012',
    city: 'Ahmedabad',
    location: { address: 'Asarwa, Ahmedabad', city: 'Ahmedabad', lat: 23.0525, lng: 72.5991 },
    contactPhone: '+91 79 2268 0074',
    operatingHours: '24x7 State Transfusion Service',
    inventorySummary: {
      'O-': 5,
      'O+': 42,
      'A-': 6,
      'A+': 36,
      'B-': 4,
      'B+': 46,
      'AB-': 3,
      'AB+': 22
    },
    status: 'active'
  },
  {
    id: 'bb-chd-01',
    name: 'PGIMER Rotary Central Blood Bank',
    license: 'CDSCO-LIC-CH-002',
    city: 'Chandigarh',
    location: { address: 'Sector 12, Chandigarh', city: 'Chandigarh', lat: 30.7634, lng: 76.7770 },
    contactPhone: '+91 172 275 6480',
    operatingHours: '24x7 Apex Blood Centre',
    inventorySummary: {
      'O-': 7,
      'O+': 45,
      'A-': 7,
      'A+': 40,
      'B-': 5,
      'B+': 50,
      'AB-': 4,
      'AB+': 23
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
  },
  {
    id: 'req-003',
    requesterId: 'usr-donor-1',
    requesterName: 'Vikram Malhotra',
    requesterRole: 'patient',
    patientCaseId: 'CASE-MAX-EMG-304',
    bloodGroup: 'O-',
    component: 'Packed Red Blood Cells',
    units: 1,
    urgency: 'critical',
    location: { address: 'Max Super Speciality Hospital, Saket', city: 'Delhi', lat: 28.5284, lng: 77.2114 },
    hospitalName: 'Max Super Speciality Hospital',
    status: 'notified',
    currentTier: 1,
    matchedDonorId: 'usr-donor-2',
    matchedDonorName: 'Priya Nair',
    matchedDonorPhone: '+91 98223 88441',
    isPriority: true,
    priorityReason: 'Verified Donor',
    donorContributionScore: 98,
    donorTotalDonations: 9,
    createdAt: '2026-09-22T12:00:00Z',
    updatedAt: '2026-09-22T12:05:00Z',
    notes: 'Emergency unit requested by verified donor lifesaver. Priority matching active.'
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
