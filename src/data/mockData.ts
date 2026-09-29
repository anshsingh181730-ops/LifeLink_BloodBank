import { User, DonorProfile, BloodBank, BloodUnit, BloodRequest, Camp, ImpactNotification, DonorKycSubmission, InstitutionVerificationSubmission } from '../types';

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
    verificationStatus: 'verified',
    dateOfBirth: '1995-10-12',
    kycStatus: 'verified'
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
    verificationStatus: 'verified',
    dateOfBirth: '1990-06-15',
    kycStatus: 'verified'
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
    verificationStatus: 'verified',
    dateOfBirth: '1993-02-28',
    kycStatus: 'verified'
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
    verificationStatus: 'verified',
    dateOfBirth: '1988-11-04',
    kycStatus: 'verified'
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
    simulatedAadhaarMasked: 'XXXX-XXXX-4821',
    dateOfBirth: '1990-06-15',
    kycStatus: 'verified',
    idType: 'aadhaar'
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
    simulatedAadhaarMasked: 'XXXX-XXXX-9912',
    dateOfBirth: '1993-02-28',
    kycStatus: 'verified',
    idType: 'aadhaar'
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
    simulatedAadhaarMasked: 'XXXX-XXXX-1355',
    dateOfBirth: '1988-11-04',
    kycStatus: 'verified',
    idType: 'aadhaar'
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
    simulatedAadhaarMasked: 'XXXX-XXXX-9281',
    dateOfBirth: '1995-10-12',
    kycStatus: 'verified',
    idType: 'aadhaar'
  }
};

export const INITIAL_BLOOD_BANKS: BloodBank[] = [
  // ==============================
  // 1. DELHI NCR
  // ==============================
  {
    id: 'bb-delhi-01',
    name: 'Red Cross Central Blood Bank',
    license: 'CDSCO-LIC-DL-001',
    city: 'Delhi',
    location: { address: '1 Red Cross Road, Connaught Place, New Delhi', city: 'Delhi', lat: 28.6219, lng: 77.2088 },
    contactPhone: '+91 11 2371 6441',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 4, 'O+': 28, 'A-': 6, 'A+': 34, 'B-': 3, 'B+': 41, 'AB-': 2, 'AB+': 19 },
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
    inventorySummary: { 'O-': 8, 'O+': 52, 'A-': 9, 'A+': 45, 'B-': 5, 'B+': 62, 'AB-': 4, 'AB+': 27 },
    status: 'active'
  },
  {
    id: 'bb-delhi-03',
    name: 'Safdarjung Hospital Blood Bank',
    license: 'CDSCO-LIC-DL-022',
    city: 'Delhi',
    location: { address: 'Ring Road, Opposite AIIMS, New Delhi', city: 'Delhi', lat: 28.5684, lng: 77.2065 },
    contactPhone: '+91 11 2616 5060',
    operatingHours: '24x7 Trauma Service',
    inventorySummary: { 'O-': 6, 'O+': 42, 'A-': 7, 'A+': 38, 'B-': 6, 'B+': 49, 'AB-': 3, 'AB+': 22 },
    status: 'active'
  },
  {
    id: 'bb-delhi-04',
    name: 'Max Super Speciality Hospital Blood Centre',
    license: 'CDSCO-LIC-DL-045',
    city: 'Delhi',
    location: { address: '1, 2 Press Enclave Road, Saket, New Delhi', city: 'Delhi', lat: 28.5273, lng: 77.2117 },
    contactPhone: '+91 11 2651 5050',
    operatingHours: '24x7 Service',
    inventorySummary: { 'O-': 5, 'O+': 36, 'A-': 6, 'A+': 32, 'B-': 4, 'B+': 44, 'AB-': 2, 'AB+': 18 },
    status: 'active'
  },
  {
    id: 'bb-delhi-05',
    name: 'Indraprastha Apollo Hospital Blood Bank',
    license: 'CDSCO-LIC-DL-033',
    city: 'Delhi',
    location: { address: 'Sarita Vihar, Mathura Road, New Delhi', city: 'Delhi', lat: 28.5355, lng: 77.2910 },
    contactPhone: '+91 11 2692 5858',
    operatingHours: '24x7 Critical Care',
    inventorySummary: { 'O-': 7, 'O+': 44, 'A-': 8, 'A+': 40, 'B-': 5, 'B+': 53, 'AB-': 4, 'AB+': 21 },
    status: 'active'
  },
  {
    id: 'bb-delhi-06',
    name: 'Sir Ganga Ram Hospital Blood Bank',
    license: 'CDSCO-LIC-DL-019',
    city: 'Delhi',
    location: { address: 'Rajinder Nagar, New Delhi', city: 'Delhi', lat: 28.6385, lng: 77.1895 },
    contactPhone: '+91 11 2575 0000',
    operatingHours: '24x7 Apex Transfusion',
    inventorySummary: { 'O-': 6, 'O+': 39, 'A-': 7, 'A+': 35, 'B-': 5, 'B+': 47, 'AB-': 3, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-delhi-07',
    name: 'Fortis Memorial Research Institute Blood Bank',
    license: 'CDSCO-LIC-HR-012',
    city: 'Delhi',
    location: { address: 'Sector 44, Gurugram, Delhi NCR', city: 'Delhi', lat: 28.4595, lng: 77.0725 },
    contactPhone: '+91 124 496 2200',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 5, 'O+': 35, 'A-': 5, 'A+': 30, 'B-': 4, 'B+': 42, 'AB-': 3, 'AB+': 17 },
    status: 'active'
  },
  {
    id: 'bb-delhi-08',
    name: 'Jaypee Hospital Blood Centre',
    license: 'CDSCO-LIC-UP-029',
    city: 'Delhi',
    location: { address: 'Sector 128, Wish Town, Noida, Delhi NCR', city: 'Delhi', lat: 28.5135, lng: 77.3712 },
    contactPhone: '+91 120 412 2222',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 4, 'O+': 32, 'A-': 6, 'A+': 28, 'B-': 4, 'B+': 39, 'AB-': 2, 'AB+': 16 },
    status: 'active'
  },

  // ==============================
  // 2. MUMBAI & MMR
  // ==============================
  {
    id: 'bb-mum-01',
    name: 'KEM Hospital Blood Centre',
    license: 'CDSCO-LIC-MH-029',
    city: 'Mumbai',
    location: { address: 'Acharya Donde Marg, Parel, Mumbai', city: 'Mumbai', lat: 19.0028, lng: 72.8427 },
    contactPhone: '+91 22 2410 7000',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 2, 'O+': 30, 'A-': 4, 'A+': 25, 'B-': 3, 'B+': 38, 'AB-': 1, 'AB+': 15 },
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
    inventorySummary: { 'O-': 6, 'O+': 35, 'A-': 5, 'A+': 28, 'B-': 4, 'B+': 40, 'AB-': 3, 'AB+': 18 },
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
    inventorySummary: { 'O-': 5, 'O+': 38, 'A-': 6, 'A+': 31, 'B-': 4, 'B+': 42, 'AB-': 2, 'AB+': 17 },
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
    inventorySummary: { 'O-': 7, 'O+': 44, 'A-': 6, 'A+': 36, 'B-': 5, 'B+': 48, 'AB-': 3, 'AB+': 20 },
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
    inventorySummary: { 'O-': 8, 'O+': 52, 'A-': 7, 'A+': 42, 'B-': 6, 'B+': 56, 'AB-': 4, 'AB+': 24 },
    status: 'active'
  },
  {
    id: 'bb-mum-06',
    name: 'Lilavati Hospital & Research Centre Blood Bank',
    license: 'CDSCO-LIC-MH-088',
    city: 'Mumbai',
    location: { address: 'A-791, Bandra Reclamation, Bandra West, Mumbai', city: 'Mumbai', lat: 19.0514, lng: 72.8295 },
    contactPhone: '+91 22 2675 1000',
    operatingHours: '24x7 Service',
    inventorySummary: { 'O-': 5, 'O+': 36, 'A-': 5, 'A+': 30, 'B-': 4, 'B+': 40, 'AB-': 2, 'AB+': 19 },
    status: 'active'
  },
  {
    id: 'bb-mum-07',
    name: 'Kokilaben Dhirubhai Ambani Hospital Blood Centre',
    license: 'CDSCO-LIC-MH-094',
    city: 'Mumbai',
    location: { address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai', city: 'Mumbai', lat: 19.1314, lng: 72.8252 },
    contactPhone: '+91 22 4269 6969',
    operatingHours: '24x7 Critical Care',
    inventorySummary: { 'O-': 6, 'O+': 40, 'A-': 6, 'A+': 34, 'B-': 5, 'B+': 45, 'AB-': 3, 'AB+': 21 },
    status: 'active'
  },
  {
    id: 'bb-mum-08',
    name: 'D.Y. Patil Hospital Blood Centre',
    license: 'CDSCO-LIC-MH-102',
    city: 'Mumbai',
    location: { address: 'Sector 5, Nerul, Navi Mumbai', city: 'Mumbai', lat: 19.0435, lng: 73.0238 },
    contactPhone: '+91 22 3921 5999',
    operatingHours: '24x7 Regional Blood Centre',
    inventorySummary: { 'O-': 4, 'O+': 35, 'A-': 5, 'A+': 29, 'B-': 4, 'B+': 38, 'AB-': 2, 'AB+': 16 },
    status: 'active'
  },
  {
    id: 'bb-mum-09',
    name: 'Chhatrapati Shivaji Maharaj Hospital Blood Bank',
    license: 'CDSCO-LIC-MH-116',
    city: 'Mumbai',
    location: { address: 'Belapur Road, Kalwa, Thane', city: 'Mumbai', lat: 19.1983, lng: 72.9981 },
    contactPhone: '+91 22 2537 2041',
    operatingHours: '24x7 Trauma Service',
    inventorySummary: { 'O-': 5, 'O+': 37, 'A-': 6, 'A+': 32, 'B-': 5, 'B+': 43, 'AB-': 3, 'AB+': 18 },
    status: 'active'
  },

  // ==============================
  // 3. BENGALURU
  // ==============================
  {
    id: 'bb-blr-01',
    name: 'Victoria Hospital Rotary Blood Bank',
    license: 'CDSCO-LIC-KA-008',
    city: 'Bengaluru',
    location: { address: 'Fort, Kalasipalya, Bengaluru', city: 'Bengaluru', lat: 12.9647, lng: 77.5760 },
    contactPhone: '+91 80 2670 1150',
    operatingHours: '24x7 Service',
    inventorySummary: { 'O-': 5, 'O+': 42, 'A-': 7, 'A+': 38, 'B-': 4, 'B+': 45, 'AB-': 3, 'AB+': 22 },
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
    inventorySummary: { 'O-': 4, 'O+': 36, 'A-': 6, 'A+': 32, 'B-': 3, 'B+': 39, 'AB-': 2, 'AB+': 16 },
    status: 'active'
  },
  {
    id: 'bb-blr-03',
    name: 'NIMHANS Central Blood Bank',
    license: 'CDSCO-LIC-KA-024',
    city: 'Bengaluru',
    location: { address: 'Hosur Road, Lakkasandra, Bengaluru', city: 'Bengaluru', lat: 12.9392, lng: 77.5937 },
    contactPhone: '+91 80 2699 5000',
    operatingHours: '24x7 Neuro & Trauma Service',
    inventorySummary: { 'O-': 6, 'O+': 45, 'A-': 7, 'A+': 39, 'B-': 5, 'B+': 48, 'AB-': 4, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-blr-04',
    name: 'Manipal Hospital Blood Centre',
    license: 'CDSCO-LIC-KA-038',
    city: 'Bengaluru',
    location: { address: '98 HAL Old Airport Road, Kodihalli, Bengaluru', city: 'Bengaluru', lat: 12.9587, lng: 77.6508 },
    contactPhone: '+91 80 2502 4444',
    operatingHours: '24x7 Tertiary Care',
    inventorySummary: { 'O-': 7, 'O+': 48, 'A-': 8, 'A+': 42, 'B-': 6, 'B+': 52, 'AB-': 3, 'AB+': 24 },
    status: 'active'
  },
  {
    id: 'bb-blr-05',
    name: 'Narayana Health City Blood Centre',
    license: 'CDSCO-LIC-KA-052',
    city: 'Bengaluru',
    location: { address: '258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru', city: 'Bengaluru', lat: 12.8093, lng: 77.6974 },
    contactPhone: '+91 80 7122 2222',
    operatingHours: '24x7 Cardiac & Trauma',
    inventorySummary: { 'O-': 8, 'O+': 54, 'A-': 8, 'A+': 46, 'B-': 6, 'B+': 58, 'AB-': 5, 'AB+': 26 },
    status: 'active'
  },
  {
    id: 'bb-blr-06',
    name: "St. John's Medical College Hospital Blood Bank",
    license: 'CDSCO-LIC-KA-044',
    city: 'Bengaluru',
    location: { address: 'Sarjapur Road, John Nagar, Koramangala, Bengaluru', city: 'Bengaluru', lat: 12.9318, lng: 77.6206 },
    contactPhone: '+91 80 2206 5000',
    operatingHours: '24x7 Critical Transfusion',
    inventorySummary: { 'O-': 6, 'O+': 40, 'A-': 6, 'A+': 35, 'B-': 5, 'B+': 46, 'AB-': 3, 'AB+': 21 },
    status: 'active'
  },

  // ==============================
  // 4. KOLKATA
  // ==============================
  {
    id: 'bb-kol-01',
    name: 'Medical College & Hospital Central Blood Bank',
    license: 'CDSCO-LIC-WB-003',
    city: 'Kolkata',
    location: { address: '88 College Street, Bowbazar, Kolkata', city: 'Kolkata', lat: 22.5744, lng: 88.3629 },
    contactPhone: '+91 33 2255 1621',
    operatingHours: '24x7 Critical Care',
    inventorySummary: { 'O-': 7, 'O+': 48, 'A-': 8, 'A+': 41, 'B-': 5, 'B+': 55, 'AB-': 3, 'AB+': 24 },
    status: 'active'
  },
  {
    id: 'bb-kol-02',
    name: 'SSKM Hospital Blood Transfusion Unit (IPGMER)',
    license: 'CDSCO-LIC-WB-011',
    city: 'Kolkata',
    location: { address: '244 AJC Bose Road, Bhowanipore, Kolkata', city: 'Kolkata', lat: 22.5392, lng: 88.3426 },
    contactPhone: '+91 33 2223 1589',
    operatingHours: '24x7 Apex Transfusion',
    inventorySummary: { 'O-': 8, 'O+': 55, 'A-': 9, 'A+': 46, 'B-': 6, 'B+': 62, 'AB-': 4, 'AB+': 28 },
    status: 'active'
  },
  {
    id: 'bb-kol-03',
    name: 'NRS Medical College Blood Centre',
    license: 'CDSCO-LIC-WB-019',
    city: 'Kolkata',
    location: { address: '138 AJC Bose Road, Sealdah, Kolkata', city: 'Kolkata', lat: 22.5647, lng: 88.3712 },
    contactPhone: '+91 33 2286 0033',
    operatingHours: '24x7 Trauma & Emergency',
    inventorySummary: { 'O-': 5, 'O+': 42, 'A-': 7, 'A+': 37, 'B-': 5, 'B+': 50, 'AB-': 3, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-kol-04',
    name: 'R.G. Kar Medical College Blood Bank',
    license: 'CDSCO-LIC-WB-025',
    city: 'Kolkata',
    location: { address: '1 Khudiram Bose Sarani, Shyambazar, Kolkata', city: 'Kolkata', lat: 22.6045, lng: 88.3742 },
    contactPhone: '+91 33 2555 7656',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 6, 'O+': 40, 'A-': 6, 'A+': 35, 'B-': 6, 'B+': 48, 'AB-': 2, 'AB+': 19 },
    status: 'active'
  },
  {
    id: 'bb-kol-05',
    name: 'Chittaranjan National Cancer Institute (CNCI) Blood Centre',
    license: 'CDSCO-LIC-WB-037',
    city: 'Kolkata',
    location: { address: 'Street No. 299, Action Area I, New Town, Kolkata', city: 'Kolkata', lat: 22.5786, lng: 88.4682 },
    contactPhone: '+91 33 2324 5015',
    operatingHours: '24x7 Oncology Blood Transfusion',
    inventorySummary: { 'O-': 5, 'O+': 36, 'A-': 6, 'A+': 31, 'B-': 4, 'B+': 42, 'AB-': 3, 'AB+': 17 },
    status: 'active'
  },

  // ==============================
  // 5. CHENNAI
  // ==============================
  {
    id: 'bb-che-01',
    name: 'Rajiv Gandhi Government General Hospital Blood Bank',
    license: 'CDSCO-LIC-TN-007',
    city: 'Chennai',
    location: { address: 'EVR Periyar Salai, Park Town, Chennai', city: 'Chennai', lat: 13.0805, lng: 80.2785 },
    contactPhone: '+91 44 2530 5000',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 5, 'O+': 44, 'A-': 7, 'A+': 39, 'B-': 6, 'B+': 52, 'AB-': 4, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-che-02',
    name: 'Government Stanley Medical College Hospital Blood Bank',
    license: 'CDSCO-LIC-TN-015',
    city: 'Chennai',
    location: { address: '1 Old Jail Road, Royapuram, Chennai', city: 'Chennai', lat: 13.1075, lng: 80.2878 },
    contactPhone: '+91 44 2528 1351',
    operatingHours: '24x7 Trauma Care',
    inventorySummary: { 'O-': 6, 'O+': 48, 'A-': 8, 'A+': 41, 'B-': 5, 'B+': 54, 'AB-': 3, 'AB+': 22 },
    status: 'active'
  },
  {
    id: 'bb-che-03',
    name: 'Apollo Hospitals Blood Bank',
    license: 'CDSCO-LIC-TN-029',
    city: 'Chennai',
    location: { address: '21 Greams Lane, Thousand Lights, Chennai', city: 'Chennai', lat: 13.0604, lng: 80.2514 },
    contactPhone: '+91 44 2829 0200',
    operatingHours: '24x7 Critical Transfusion',
    inventorySummary: { 'O-': 7, 'O+': 50, 'A-': 7, 'A+': 43, 'B-': 6, 'B+': 57, 'AB-': 4, 'AB+': 25 },
    status: 'active'
  },
  {
    id: 'bb-che-04',
    name: 'Cancer Institute (WIA) Blood Centre',
    license: 'CDSCO-LIC-TN-042',
    city: 'Chennai',
    location: { address: 'Sardar Patel Road, Guindy-Adyar, Chennai', city: 'Chennai', lat: 13.0076, lng: 80.2443 },
    contactPhone: '+91 44 2220 9150',
    operatingHours: '24x7 Oncology Blood Unit',
    inventorySummary: { 'O-': 4, 'O+': 35, 'A-': 6, 'A+': 30, 'B-': 4, 'B+': 40, 'AB-': 2, 'AB+': 18 },
    status: 'active'
  },
  {
    id: 'bb-che-05',
    name: 'MIOT International Hospital Blood Bank',
    license: 'CDSCO-LIC-TN-058',
    city: 'Chennai',
    location: { address: '4/112, Mount-Poonamallee Road, Manapakkam, Chennai', city: 'Chennai', lat: 13.0189, lng: 80.1804 },
    contactPhone: '+91 44 4200 2288',
    operatingHours: '24x7 Orthopaedic & Emergency',
    inventorySummary: { 'O-': 6, 'O+': 41, 'A-': 6, 'A+': 34, 'B-': 5, 'B+': 46, 'AB-': 3, 'AB+': 19 },
    status: 'active'
  },

  // ==============================
  // 6. HYDERABAD
  // ==============================
  {
    id: 'bb-hyd-01',
    name: 'Osmania General Hospital Blood Bank',
    license: 'CDSCO-LIC-TG-011',
    city: 'Hyderabad',
    location: { address: 'Afzal Gunj, Hyderabad', city: 'Hyderabad', lat: 17.3753, lng: 78.4744 },
    contactPhone: '+91 40 2460 0121',
    operatingHours: '24x7 Trauma Care',
    inventorySummary: { 'O-': 4, 'O+': 50, 'A-': 6, 'A+': 43, 'B-': 5, 'B+': 58, 'AB-': 2, 'AB+': 25 },
    status: 'active'
  },
  {
    id: 'bb-hyd-02',
    name: 'Nizam’s Institute of Medical Sciences (NIMS) Blood Bank',
    license: 'CDSCO-LIC-TG-018',
    city: 'Hyderabad',
    location: { address: 'Punjagutta, Hyderabad', city: 'Hyderabad', lat: 17.4222, lng: 78.4502 },
    contactPhone: '+91 40 2348 9000',
    operatingHours: '24x7 Apex Care',
    inventorySummary: { 'O-': 7, 'O+': 54, 'A-': 8, 'A+': 46, 'B-': 6, 'B+': 62, 'AB-': 4, 'AB+': 27 },
    status: 'active'
  },
  {
    id: 'bb-hyd-03',
    name: 'Gandhi Hospital Blood Bank',
    license: 'CDSCO-LIC-TG-026',
    city: 'Hyderabad',
    location: { address: 'Bhoiguda Road, Musheerabad, Secunderabad', city: 'Hyderabad', lat: 17.4245, lng: 78.5032 },
    contactPhone: '+91 40 2750 5566',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 5, 'O+': 46, 'A-': 7, 'A+': 40, 'B-': 5, 'B+': 53, 'AB-': 3, 'AB+': 22 },
    status: 'active'
  },
  {
    id: 'bb-hyd-04',
    name: 'Apollo Health City Blood Bank',
    license: 'CDSCO-LIC-TG-039',
    city: 'Hyderabad',
    location: { address: 'Road No 92, Film Nagar, Jubilee Hills, Hyderabad', city: 'Hyderabad', lat: 17.4172, lng: 78.4116 },
    contactPhone: '+91 40 2360 7777',
    operatingHours: '24x7 Critical Transfusion',
    inventorySummary: { 'O-': 6, 'O+': 48, 'A-': 7, 'A+': 42, 'B-': 6, 'B+': 55, 'AB-': 4, 'AB+': 24 },
    status: 'active'
  },
  {
    id: 'bb-hyd-05',
    name: 'Yashoda Hospitals Blood Centre',
    license: 'CDSCO-LIC-TG-047',
    city: 'Hyderabad',
    location: { address: 'Raj Bhavan Road, Somajiguda, Hyderabad', city: 'Hyderabad', lat: 17.4278, lng: 78.4601 },
    contactPhone: '+91 40 4567 4567',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 5, 'O+': 42, 'A-': 6, 'A+': 36, 'B-': 5, 'B+': 48, 'AB-': 3, 'AB+': 21 },
    status: 'active'
  },

  // ==============================
  // 7. PUNE
  // ==============================
  {
    id: 'bb-pune-01',
    name: 'Sassoon General Hospital Blood Bank',
    license: 'CDSCO-LIC-MH-082',
    city: 'Pune',
    location: { address: 'Near Pune Railway Station, Sangamvadi, Pune', city: 'Pune', lat: 18.5255, lng: 73.8742 },
    contactPhone: '+91 20 2612 8000',
    operatingHours: '24x7 Regional Blood Centre',
    inventorySummary: { 'O-': 6, 'O+': 38, 'A-': 5, 'A+': 34, 'B-': 4, 'B+': 44, 'AB-': 3, 'AB+': 19 },
    status: 'active'
  },
  {
    id: 'bb-pune-02',
    name: 'KEM Hospital Blood Bank',
    license: 'CDSCO-LIC-MH-095',
    city: 'Pune',
    location: { address: '489 Rasta Peth, Sardar Moodliar Road, Pune', city: 'Pune', lat: 18.5192, lng: 73.8675 },
    contactPhone: '+91 20 2606 1000',
    operatingHours: '24x7 Critical Care',
    inventorySummary: { 'O-': 5, 'O+': 40, 'A-': 6, 'A+': 35, 'B-': 5, 'B+': 46, 'AB-': 3, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-pune-03',
    name: 'Deenanath Mangeshkar Hospital Blood Centre',
    license: 'CDSCO-LIC-MH-107',
    city: 'Pune',
    location: { address: 'Erandwane, Near Mhatre Bridge, Pune', city: 'Pune', lat: 18.5036, lng: 73.8308 },
    contactPhone: '+91 20 4015 1000',
    operatingHours: '24x7 Apex Transfusion',
    inventorySummary: { 'O-': 7, 'O+': 45, 'A-': 7, 'A+': 40, 'B-': 6, 'B+': 52, 'AB-': 4, 'AB+': 23 },
    status: 'active'
  },
  {
    id: 'bb-pune-04',
    name: 'Ruby Hall Clinic Blood Bank',
    license: 'CDSCO-LIC-MH-119',
    city: 'Pune',
    location: { address: '40 Sasoon Road, Sangamvadi, Pune', city: 'Pune', lat: 18.5312, lng: 73.8765 },
    contactPhone: '+91 20 6645 5100',
    operatingHours: '24x7 Cardiac & Trauma',
    inventorySummary: { 'O-': 5, 'O+': 36, 'A-': 6, 'A+': 32, 'B-': 4, 'B+': 42, 'AB-': 2, 'AB+': 18 },
    status: 'active'
  },
  {
    id: 'bb-pune-05',
    name: 'Janakalyan Raktakendra',
    license: 'CDSCO-LIC-MH-131',
    city: 'Pune',
    location: { address: 'Sarasbaug, Sadashiv Peth, Pune', city: 'Pune', lat: 18.5028, lng: 73.8542 },
    contactPhone: '+91 20 2444 9546',
    operatingHours: '24x7 Voluntary Blood Centre',
    inventorySummary: { 'O-': 8, 'O+': 50, 'A-': 8, 'A+': 44, 'B-': 6, 'B+': 58, 'AB-': 4, 'AB+': 26 },
    status: 'active'
  },

  // ==============================
  // 8. JAIPUR
  // ==============================
  {
    id: 'bb-jai-01',
    name: 'Sawai Man Singh (SMS) Hospital Blood Centre',
    license: 'CDSCO-LIC-RJ-005',
    city: 'Jaipur',
    location: { address: 'JLN Marg, Ashok Nagar, Jaipur', city: 'Jaipur', lat: 26.9054, lng: 75.8164 },
    contactPhone: '+91 141 256 0291',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 5, 'O+': 46, 'A-': 6, 'A+': 37, 'B-': 5, 'B+': 49, 'AB-': 3, 'AB+': 21 },
    status: 'active'
  },
  {
    id: 'bb-jai-02',
    name: 'SDMH Hospital Blood Bank',
    license: 'CDSCO-LIC-RJ-018',
    city: 'Jaipur',
    location: { address: 'Bhawani Singh Road, Bapu Nagar, Jaipur', city: 'Jaipur', lat: 26.8924, lng: 75.8087 },
    contactPhone: '+91 141 256 6251',
    operatingHours: '24x7 Emergency Transfusion',
    inventorySummary: { 'O-': 6, 'O+': 40, 'A-': 6, 'A+': 34, 'B-': 5, 'B+': 44, 'AB-': 3, 'AB+': 19 },
    status: 'active'
  },
  {
    id: 'bb-jai-03',
    name: 'Fortis Escorts Hospital Blood Centre',
    license: 'CDSCO-LIC-RJ-031',
    city: 'Jaipur',
    location: { address: 'Jawaharlal Nehru Marg, Malviya Nagar, Jaipur', city: 'Jaipur', lat: 26.8524, lng: 75.8052 },
    contactPhone: '+91 141 254 7000',
    operatingHours: '24x7 Critical Care',
    inventorySummary: { 'O-': 4, 'O+': 35, 'A-': 5, 'A+': 30, 'B-': 4, 'B+': 41, 'AB-': 2, 'AB+': 17 },
    status: 'active'
  },
  {
    id: 'bb-jai-04',
    name: 'Swasthya Kalyan Blood Centre',
    license: 'CDSCO-LIC-RJ-044',
    city: 'Jaipur',
    location: { address: '10 Gopalpura Bypass, Tonk Road, Jaipur', city: 'Jaipur', lat: 26.8624, lng: 75.7892 },
    contactPhone: '+91 141 276 0524',
    operatingHours: '24x7 Voluntary Blood Bank',
    inventorySummary: { 'O-': 7, 'O+': 48, 'A-': 7, 'A+': 40, 'B-': 6, 'B+': 52, 'AB-': 4, 'AB+': 23 },
    status: 'active'
  },

  // ==============================
  // 9. AHMEDABAD
  // ==============================
  {
    id: 'bb-ahm-01',
    name: 'Civil Hospital Ahmedabad Blood Centre',
    license: 'CDSCO-LIC-GJ-012',
    city: 'Ahmedabad',
    location: { address: 'Asarwa, Ahmedabad', city: 'Ahmedabad', lat: 23.0525, lng: 72.5991 },
    contactPhone: '+91 79 2268 0074',
    operatingHours: '24x7 State Transfusion Service',
    inventorySummary: { 'O-': 5, 'O+': 42, 'A-': 6, 'A+': 36, 'B-': 4, 'B+': 46, 'AB-': 3, 'AB+': 22 },
    status: 'active'
  },
  {
    id: 'bb-ahm-02',
    name: 'Prathama Blood Centre',
    license: 'CDSCO-LIC-GJ-028',
    city: 'Ahmedabad',
    location: { address: 'Near Mahalaxmi Cross Road, Paldi, Ahmedabad', city: 'Ahmedabad', lat: 23.0125, lng: 72.5642 },
    contactPhone: '+91 79 2658 8888',
    operatingHours: '24x7 Ultra-modern Blood Centre',
    inventorySummary: { 'O-': 8, 'O+': 55, 'A-': 8, 'A+': 48, 'B-': 6, 'B+': 60, 'AB-': 5, 'AB+': 26 },
    status: 'active'
  },
  {
    id: 'bb-ahm-03',
    name: 'Zydus Hospitals Blood Centre',
    license: 'CDSCO-LIC-GJ-041',
    city: 'Ahmedabad',
    location: { address: 'Zydus Hospital Road, SG Highway, Thaltej, Ahmedabad', city: 'Ahmedabad', lat: 23.0642, lng: 72.5085 },
    contactPhone: '+91 79 6619 0201',
    operatingHours: '24x7 Critical Care',
    inventorySummary: { 'O-': 6, 'O+': 40, 'A-': 6, 'A+': 34, 'B-': 5, 'B+': 44, 'AB-': 3, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-ahm-04',
    name: 'Indian Red Cross Society Blood Centre',
    license: 'CDSCO-LIC-GJ-055',
    city: 'Ahmedabad',
    location: { address: 'Vikas Gruh Road, Paldi, Ahmedabad', city: 'Ahmedabad', lat: 23.0165, lng: 72.5582 },
    contactPhone: '+91 79 2658 0888',
    operatingHours: '24x7 Voluntary Transfusion',
    inventorySummary: { 'O-': 7, 'O+': 46, 'A-': 7, 'A+': 39, 'B-': 6, 'B+': 50, 'AB-': 4, 'AB+': 22 },
    status: 'active'
  },

  // ==============================
  // 10. LUCKNOW
  // ==============================
  {
    id: 'bb-lko-01',
    name: "King George's Medical University (KGMU) Blood Bank",
    license: 'CDSCO-LIC-UP-018',
    city: 'Lucknow',
    location: { address: 'Shah Mina Road, Chowk, Lucknow', city: 'Lucknow', lat: 26.8687, lng: 80.9168 },
    contactPhone: '+91 522 225 7540',
    operatingHours: '24x7 Trauma & Critical Care',
    inventorySummary: { 'O-': 4, 'O+': 40, 'A-': 5, 'A+': 35, 'B-': 6, 'B+': 48, 'AB-': 2, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-lko-02',
    name: 'SGPGI Central Blood Bank',
    license: 'CDSCO-LIC-UP-032',
    city: 'Lucknow',
    location: { address: 'Raebareli Road, Lucknow', city: 'Lucknow', lat: 26.7456, lng: 80.9385 },
    contactPhone: '+91 522 249 4000',
    operatingHours: '24x7 Apex Transfusion Medicine',
    inventorySummary: { 'O-': 7, 'O+': 52, 'A-': 8, 'A+': 44, 'B-': 7, 'B+': 58, 'AB-': 4, 'AB+': 25 },
    status: 'active'
  },
  {
    id: 'bb-lko-03',
    name: 'Dr. Ram Manohar Lohia Institute (RMLIMS) Blood Centre',
    license: 'CDSCO-LIC-UP-045',
    city: 'Lucknow',
    location: { address: 'Vibhuti Khand, Gomti Nagar, Lucknow', city: 'Lucknow', lat: 26.8654, lng: 81.0025 },
    contactPhone: '+91 522 491 8504',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 5, 'O+': 38, 'A-': 6, 'A+': 32, 'B-': 5, 'B+': 45, 'AB-': 3, 'AB+': 18 },
    status: 'active'
  },
  {
    id: 'bb-lko-04',
    name: 'Balrampur Hospital Blood Bank',
    license: 'CDSCO-LIC-UP-059',
    city: 'Lucknow',
    location: { address: 'Golaganj, Kaiserbagh, Lucknow', city: 'Lucknow', lat: 26.8572, lng: 80.9284 },
    contactPhone: '+91 522 262 4040',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 4, 'O+': 34, 'A-': 5, 'A+': 28, 'B-': 5, 'B+': 41, 'AB-': 2, 'AB+': 16 },
    status: 'active'
  },

  // ==============================
  // 11. CHANDIGARH TRICITY
  // ==============================
  {
    id: 'bb-chd-01',
    name: 'PGIMER Rotary Central Blood Bank',
    license: 'CDSCO-LIC-CH-002',
    city: 'Chandigarh',
    location: { address: 'Sector 12, Chandigarh', city: 'Chandigarh', lat: 30.7634, lng: 76.7770 },
    contactPhone: '+91 172 275 6480',
    operatingHours: '24x7 Apex Blood Centre',
    inventorySummary: { 'O-': 7, 'O+': 45, 'A-': 7, 'A+': 40, 'B-': 5, 'B+': 50, 'AB-': 4, 'AB+': 23 },
    status: 'active'
  },
  {
    id: 'bb-chd-02',
    name: 'GMCH Sector 32 Blood Bank',
    license: 'CDSCO-LIC-CH-014',
    city: 'Chandigarh',
    location: { address: 'Sector 32-B, Chandigarh', city: 'Chandigarh', lat: 30.7092, lng: 76.7765 },
    contactPhone: '+91 172 266 5253',
    operatingHours: '24x7 Trauma & Critical Care',
    inventorySummary: { 'O-': 6, 'O+': 42, 'A-': 6, 'A+': 36, 'B-': 5, 'B+': 46, 'AB-': 3, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-chd-03',
    name: 'Rotary Blood Bank Resource Centre',
    license: 'CDSCO-LIC-CH-027',
    city: 'Chandigarh',
    location: { address: 'Sector 37-A, Chandigarh', city: 'Chandigarh', lat: 30.7428, lng: 76.7542 },
    contactPhone: '+91 172 269 0000',
    operatingHours: '24x7 Voluntary Transfusion',
    inventorySummary: { 'O-': 6, 'O+': 38, 'A-': 5, 'A+': 32, 'B-': 4, 'B+': 43, 'AB-': 3, 'AB+': 18 },
    status: 'active'
  },
  {
    id: 'bb-chd-04',
    name: 'Max Super Speciality Hospital Blood Centre',
    license: 'CDSCO-LIC-PB-033',
    city: 'Chandigarh',
    location: { address: 'Phase 6, Mohali, Chandigarh Tricity', city: 'Chandigarh', lat: 30.7258, lng: 76.7142 },
    contactPhone: '+91 172 521 2000',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 5, 'O+': 35, 'A-': 5, 'A+': 30, 'B-': 4, 'B+': 39, 'AB-': 2, 'AB+': 16 },
    status: 'active'
  },

  // ==============================
  // 12. PATNA
  // ==============================
  {
    id: 'bb-pat-01',
    name: 'Patna Medical College & Hospital (PMCH) Blood Bank',
    license: 'CDSCO-LIC-BR-006',
    city: 'Patna',
    location: { address: 'Ashok Rajpath, Patna', city: 'Patna', lat: 25.6205, lng: 85.1582 },
    contactPhone: '+91 612 230 0080',
    operatingHours: '24x7 Trauma & Critical Care',
    inventorySummary: { 'O-': 5, 'O+': 44, 'A-': 6, 'A+': 38, 'B-': 6, 'B+': 50, 'AB-': 3, 'AB+': 21 },
    status: 'active'
  },
  {
    id: 'bb-pat-02',
    name: 'AIIMS Patna Blood Transfusion Centre',
    license: 'CDSCO-LIC-BR-019',
    city: 'Patna',
    location: { address: 'Phulwari Sharif, Patna', city: 'Patna', lat: 25.5615, lng: 85.0442 },
    contactPhone: '+91 612 245 1000',
    operatingHours: '24x7 Apex Care',
    inventorySummary: { 'O-': 6, 'O+': 48, 'A-': 7, 'A+': 42, 'B-': 5, 'B+': 55, 'AB-': 4, 'AB+': 24 },
    status: 'active'
  },

  // ==============================
  // 13. KOCHI
  // ==============================
  {
    id: 'bb-cok-01',
    name: 'Ernakulam General Hospital Blood Bank',
    license: 'CDSCO-LIC-KL-008',
    city: 'Kochi',
    location: { address: 'Hospital Road, Marine Drive, Kochi', city: 'Kochi', lat: 9.9725, lng: 76.2825 },
    contactPhone: '+91 484 236 1251',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 6, 'O+': 42, 'A-': 7, 'A+': 36, 'B-': 5, 'B+': 46, 'AB-': 3, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-cok-02',
    name: 'Amrita Institute of Medical Sciences Blood Centre',
    license: 'CDSCO-LIC-KL-021',
    city: 'Kochi',
    location: { address: 'AIMS Ponekkara, Edappally, Kochi', city: 'Kochi', lat: 10.0324, lng: 76.2915 },
    contactPhone: '+91 484 285 1234',
    operatingHours: '24x7 Critical Care',
    inventorySummary: { 'O-': 7, 'O+': 50, 'A-': 8, 'A+': 44, 'B-': 6, 'B+': 54, 'AB-': 4, 'AB+': 24 },
    status: 'active'
  },

  // ==============================
  // 14. BHOPAL
  // ==============================
  {
    id: 'bb-bho-01',
    name: 'Hamidia Hospital Blood Bank (GMC)',
    license: 'CDSCO-LIC-MP-007',
    city: 'Bhopal',
    location: { address: 'GMC Campus, Sultania Road, Bhopal', city: 'Bhopal', lat: 23.2592, lng: 77.3892 },
    contactPhone: '+91 755 405 0000',
    operatingHours: '24x7 Trauma & Critical Care',
    inventorySummary: { 'O-': 5, 'O+': 40, 'A-': 6, 'A+': 34, 'B-': 5, 'B+': 45, 'AB-': 3, 'AB+': 19 },
    status: 'active'
  },
  {
    id: 'bb-bho-02',
    name: 'AIIMS Bhopal Blood Transfusion Centre',
    license: 'CDSCO-LIC-MP-022',
    city: 'Bhopal',
    location: { address: 'Saket Nagar, Bhopal', city: 'Bhopal', lat: 23.2085, lng: 77.4582 },
    contactPhone: '+91 755 267 2355',
    operatingHours: '24x7 Apex Care',
    inventorySummary: { 'O-': 6, 'O+': 46, 'A-': 7, 'A+': 40, 'B-': 6, 'B+': 52, 'AB-': 4, 'AB+': 22 },
    status: 'active'
  },

  // ==============================
  // 15. INDORE
  // ==============================
  {
    id: 'bb-ind-01',
    name: 'Maharaja Yeshwantrao Hospital (MYH) Blood Bank',
    license: 'CDSCO-LIC-MP-033',
    city: 'Indore',
    location: { address: 'MGM Medical College, AB Road, Indore', city: 'Indore', lat: 22.7196, lng: 75.8715 },
    contactPhone: '+91 731 252 7383',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 6, 'O+': 44, 'A-': 7, 'A+': 38, 'B-': 5, 'B+': 48, 'AB-': 3, 'AB+': 21 },
    status: 'active'
  },
  {
    id: 'bb-ind-02',
    name: 'Sri Aurobindo Institute (SAIMS) Blood Centre',
    license: 'CDSCO-LIC-MP-048',
    city: 'Indore',
    location: { address: 'Indore-Ujjain Highway, Sanwer Road, Indore', city: 'Indore', lat: 22.7842, lng: 75.8452 },
    contactPhone: '+91 731 423 1000',
    operatingHours: '24x7 Critical Care',
    inventorySummary: { 'O-': 5, 'O+': 38, 'A-': 6, 'A+': 32, 'B-': 4, 'B+': 42, 'AB-': 2, 'AB+': 18 },
    status: 'active'
  },

  // ==============================
  // 16. NAGPUR
  // ==============================
  {
    id: 'bb-nag-01',
    name: 'Government Medical College (GMCH) Blood Bank',
    license: 'CDSCO-LIC-MH-142',
    city: 'Nagpur',
    location: { address: 'Hanuman Nagar, Medical Square, Nagpur', city: 'Nagpur', lat: 21.1275, lng: 79.0985 },
    contactPhone: '+91 712 274 4441',
    operatingHours: '24x7 Regional Transfusion',
    inventorySummary: { 'O-': 6, 'O+': 42, 'A-': 6, 'A+': 36, 'B-': 5, 'B+': 46, 'AB-': 3, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-nag-02',
    name: 'Jeevan Jyoti Blood Bank',
    license: 'CDSCO-LIC-MH-155',
    city: 'Nagpur',
    location: { address: 'Ramdaspeth, Central Bazar Road, Nagpur', city: 'Nagpur', lat: 21.1395, lng: 79.0742 },
    contactPhone: '+91 712 242 1211',
    operatingHours: '24x7 Voluntary Transfusion',
    inventorySummary: { 'O-': 7, 'O+': 46, 'A-': 7, 'A+': 40, 'B-': 6, 'B+': 50, 'AB-': 4, 'AB+': 22 },
    status: 'active'
  },

  // ==============================
  // 17. VARANASI
  // ==============================
  {
    id: 'bb-var-01',
    name: 'Sir Sunderlal Hospital (IMS-BHU) Blood Bank',
    license: 'CDSCO-LIC-UP-067',
    city: 'Varanasi',
    location: { address: 'Banaras Hindu University Campus, Varanasi', city: 'Varanasi', lat: 25.2755, lng: 82.9982 },
    contactPhone: '+91 542 230 7500',
    operatingHours: '24x7 Apex Care',
    inventorySummary: { 'O-': 6, 'O+': 45, 'A-': 7, 'A+': 39, 'B-': 6, 'B+': 52, 'AB-': 3, 'AB+': 22 },
    status: 'active'
  },
  {
    id: 'bb-var-02',
    name: 'Pandit Deen Dayal Upadhyay Govt Hospital Blood Bank',
    license: 'CDSCO-LIC-UP-081',
    city: 'Varanasi',
    location: { address: 'Pandeypur, Varanasi', city: 'Varanasi', lat: 25.3425, lng: 82.9915 },
    contactPhone: '+91 542 258 5022',
    operatingHours: '24x7 Trauma Service',
    inventorySummary: { 'O-': 4, 'O+': 36, 'A-': 5, 'A+': 30, 'B-': 4, 'B+': 40, 'AB-': 2, 'AB+': 17 },
    status: 'active'
  },

  // ==============================
  // 18. SURAT
  // ==============================
  {
    id: 'bb-sur-01',
    name: 'New Civil Hospital Blood Centre',
    license: 'CDSCO-LIC-GJ-068',
    city: 'Surat',
    location: { address: 'Majura Gate, Surat', city: 'Surat', lat: 21.1765, lng: 72.8215 },
    contactPhone: '+91 261 224 4456',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 5, 'O+': 42, 'A-': 6, 'A+': 35, 'B-': 5, 'B+': 47, 'AB-': 3, 'AB+': 20 },
    status: 'active'
  },
  {
    id: 'bb-sur-02',
    name: 'Surat Raktadan Kendra & Research Centre',
    license: 'CDSCO-LIC-GJ-082',
    city: 'Surat',
    location: { address: 'Khatodara, Near Police Station, Surat', city: 'Surat', lat: 21.1742, lng: 72.8342 },
    contactPhone: '+91 261 263 5555',
    operatingHours: '24x7 Apex Voluntary Centre',
    inventorySummary: { 'O-': 8, 'O+': 55, 'A-': 8, 'A+': 46, 'B-': 6, 'B+': 62, 'AB-': 4, 'AB+': 26 },
    status: 'active'
  },

  // ==============================
  // 19. VISAKHAPATNAM
  // ==============================
  {
    id: 'bb-viz-01',
    name: 'King George Hospital (KGH) Blood Bank',
    license: 'CDSCO-LIC-AP-011',
    city: 'Visakhapatnam',
    location: { address: 'Maharanipeta, Visakhapatnam', city: 'Visakhapatnam', lat: 17.7085, lng: 83.3052 },
    contactPhone: '+91 891 256 4891',
    operatingHours: '24x7 Coastal Apex Centre',
    inventorySummary: { 'O-': 5, 'O+': 45, 'A-': 7, 'A+': 38, 'B-': 5, 'B+': 50, 'AB-': 3, 'AB+': 22 },
    status: 'active'
  },
  {
    id: 'bb-viz-02',
    name: 'Rotary Blood Centre Visakhapatnam',
    license: 'CDSCO-LIC-AP-024',
    city: 'Visakhapatnam',
    location: { address: 'Daba Gardens, Visakhapatnam', city: 'Visakhapatnam', lat: 17.7195, lng: 83.2985 },
    contactPhone: '+91 891 254 3322',
    operatingHours: '24x7 Voluntary Transfusion',
    inventorySummary: { 'O-': 6, 'O+': 38, 'A-': 6, 'A+': 32, 'B-': 4, 'B+': 42, 'AB-': 3, 'AB+': 18 },
    status: 'active'
  },

  // ==============================
  // 20. GUWAHATI
  // ==============================
  {
    id: 'bb-guw-01',
    name: 'Gauhati Medical College & Hospital (GMCH) Blood Bank',
    license: 'CDSCO-LIC-AS-005',
    city: 'Guwahati',
    location: { address: 'Narakasur Hilltop, Bhangagarh, Guwahati', city: 'Guwahati', lat: 26.1554, lng: 91.7712 },
    contactPhone: '+91 361 252 9457',
    operatingHours: '24x7 North-East Apex Care',
    inventorySummary: { 'O-': 6, 'O+': 46, 'A-': 7, 'A+': 40, 'B-': 6, 'B+': 52, 'AB-': 3, 'AB+': 22 },
    status: 'active'
  },
  {
    id: 'bb-guw-02',
    name: 'Dr. B. Borooah Cancer Institute Blood Bank',
    license: 'CDSCO-LIC-AS-017',
    city: 'Guwahati',
    location: { address: 'Gopinath Nagar, AK Azad Road, Guwahati', city: 'Guwahati', lat: 26.1685, lng: 91.7452 },
    contactPhone: '+91 361 247 2364',
    operatingHours: '24x7 Oncology Blood Unit',
    inventorySummary: { 'O-': 4, 'O+': 34, 'A-': 5, 'A+': 28, 'B-': 4, 'B+': 38, 'AB-': 2, 'AB+': 16 },
    status: 'active'
  },

  // ==============================
  // 21. BHUBANESWAR
  // ==============================
  {
    id: 'bb-bhu-01',
    name: 'AIIMS Bhubaneswar Blood Transfusion Centre',
    license: 'CDSCO-LIC-OD-009',
    city: 'Bhubaneswar',
    location: { address: 'Sijua, Patrapada, Bhubaneswar', city: 'Bhubaneswar', lat: 20.2285, lng: 85.7745 },
    contactPhone: '+91 674 247 6789',
    operatingHours: '24x7 Apex Transfusion',
    inventorySummary: { 'O-': 7, 'O+': 48, 'A-': 7, 'A+': 42, 'B-': 6, 'B+': 54, 'AB-': 4, 'AB+': 24 },
    status: 'active'
  },
  {
    id: 'bb-bhu-02',
    name: 'Capital Hospital Central Blood Bank',
    license: 'CDSCO-LIC-OD-021',
    city: 'Bhubaneswar',
    location: { address: 'Unit 6, Ganga Nagar, Bhubaneswar', city: 'Bhubaneswar', lat: 20.2642, lng: 85.8242 },
    contactPhone: '+91 674 239 1983',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 5, 'O+': 40, 'A-': 6, 'A+': 35, 'B-': 5, 'B+': 46, 'AB-': 3, 'AB+': 19 },
    status: 'active'
  },

  // ==============================
  // 22. THIRUVANANTHAPURAM
  // ==============================
  {
    id: 'bb-trv-01',
    name: 'Government Medical College Hospital Blood Bank',
    license: 'CDSCO-LIC-KL-035',
    city: 'Thiruvananthapuram',
    location: { address: 'Medical College Junction, Thiruvananthapuram', city: 'Thiruvananthapuram', lat: 8.5245, lng: 76.9285 },
    contactPhone: '+91 471 252 8300',
    operatingHours: '24x7 Emergency Service',
    inventorySummary: { 'O-': 6, 'O+': 44, 'A-': 7, 'A+': 38, 'B-': 5, 'B+': 48, 'AB-': 3, 'AB+': 21 },
    status: 'active'
  },
  {
    id: 'bb-trv-02',
    name: 'Sree Chitra Tirunal Institute (SCTIMST) Blood Bank',
    license: 'CDSCO-LIC-KL-049',
    city: 'Thiruvananthapuram',
    location: { address: 'Medical College PO, Thiruvananthapuram', city: 'Thiruvananthapuram', lat: 8.5215, lng: 76.9242 },
    contactPhone: '+91 471 252 4444',
    operatingHours: '24x7 Cardiac & Neuro Transfusion',
    inventorySummary: { 'O-': 5, 'O+': 38, 'A-': 6, 'A+': 32, 'B-': 4, 'B+': 42, 'AB-': 2, 'AB+': 18 },
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

export const INITIAL_KYC_SUBMISSIONS: DonorKycSubmission[] = [
  {
    id: 'kyc-sub-1001',
    donorId: 'usr-donor-1',
    donorName: 'Vikram Malhotra',
    donorEmail: 'vikram.m@example.com',
    donorPhone: '+91 98765 43210',
    bloodGroup: 'O-',
    dateOfBirth: '1990-06-15',
    idType: 'aadhaar',
    idNumberMasked: 'XXXX-XXXX-4821',
    documentFileName: 'aadhaar_front_vikram.pdf',
    documentFileSize: 1420500,
    documentFileType: 'application/pdf',
    documentUrl: 'https://lifelink.storage.private/kyc/usr-donor-1/aadhaar.pdf',
    status: 'verified',
    submittedAt: '2026-04-10T11:20:00Z',
    reviewedAt: '2026-04-10T14:15:00Z',
    reviewedBy: 'Hospital Admin (Dr. Ananya Roy)'
  },
  {
    id: 'kyc-sub-1002',
    donorId: 'usr-donor-2',
    donorName: 'Priya Nair',
    donorEmail: 'priya.nair@example.com',
    donorPhone: '+91 98223 88441',
    bloodGroup: 'A+',
    dateOfBirth: '1993-02-28',
    idType: 'aadhaar',
    idNumberMasked: 'XXXX-XXXX-9912',
    documentFileName: 'priya_voter_id.jpg',
    documentFileSize: 890400,
    documentFileType: 'image/jpeg',
    documentUrl: 'https://lifelink.storage.private/kyc/usr-donor-2/voter_id.jpg',
    status: 'verified',
    submittedAt: '2026-04-12T09:40:00Z',
    reviewedAt: '2026-04-12T10:05:00Z',
    reviewedBy: 'Hospital Admin (Dr. Ananya Roy)'
  }
];

export const INITIAL_INSTITUTION_SUBMISSIONS: InstitutionVerificationSubmission[] = [
  {
    id: 'inst-verif-101',
    institutionId: 'usr-hosp-1',
    institutionName: 'Indraprastha Apollo Hospital',
    institutionType: 'hospital',
    licenseType: 'nabh',
    licenseNumber: 'NABH-DL-2024-88',
    nodalOfficerName: 'Dr. Ananya Roy',
    nodalOfficerPhone: '+91 11 2692 5858',
    nodalOfficerDesignation: 'Chief Medical Officer / Transfusion Head',
    documentFileName: 'apollo_nabh_accreditation.pdf',
    documentFileSize: 2450000,
    documentFileType: 'application/pdf',
    documentUrl: 'https://lifelink.storage.private/licenses/apollo_nabh.pdf',
    verificationStatus: 'verified',
    submittedAt: '2026-03-01T10:00:00Z',
    reviewedAt: '2026-03-02T15:30:00Z',
    reviewedBy: 'Platform Directorate (Dr. Sharma)'
  },
  {
    id: 'inst-verif-102',
    institutionId: 'usr-bb-1',
    institutionName: 'Indian Red Cross Society Blood Centre',
    institutionType: 'bloodbank',
    licenseType: 'cdsco',
    licenseNumber: 'CDSCO-LIC-DL-001',
    nodalOfficerName: 'Dr. Rajiv Malhotra',
    nodalOfficerPhone: '+91 11 2371 6441',
    nodalOfficerDesignation: 'Blood Centre Director',
    documentFileName: 'red_cross_cdsco_form28c.pdf',
    documentFileSize: 1890000,
    documentFileType: 'application/pdf',
    documentUrl: 'https://lifelink.storage.private/licenses/red_cross_cdsco.pdf',
    verificationStatus: 'verified',
    submittedAt: '2026-03-05T11:20:00Z',
    reviewedAt: '2026-03-06T09:45:00Z',
    reviewedBy: 'Platform Directorate (Dr. Sharma)'
  },
  {
    id: 'inst-verif-103',
    institutionId: 'usr-ngo-1',
    institutionName: 'Rotary Life Foundation India',
    institutionType: 'ngo',
    licenseType: 'darpan_ngo',
    licenseNumber: 'DARPAN-DL-98214',
    nodalOfficerName: 'Kabir Mehra',
    nodalOfficerPhone: '+91 99990 12345',
    nodalOfficerDesignation: 'Executive Coordinator',
    documentFileName: 'rotary_darpan_registration.pdf',
    documentFileSize: 1120000,
    documentFileType: 'application/pdf',
    documentUrl: 'https://lifelink.storage.private/licenses/rotary_darpan.pdf',
    verificationStatus: 'verified',
    submittedAt: '2026-03-10T14:10:00Z',
    reviewedAt: '2026-03-11T12:00:00Z',
    reviewedBy: 'Platform Directorate (Dr. Sharma)'
  }
];


