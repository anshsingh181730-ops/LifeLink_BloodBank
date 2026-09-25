import { BloodGroup, BloodComponent } from '../types';

// ABO and Rh compatibility matrix for Red Blood Cells & Whole Blood
// Recipient Blood Group -> Compatible Donor Blood Groups
export const RBC_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Recipient
};

// Plasma Compatibility matrix (Plasma is opposite of RBC: AB is universal donor, O is universal recipient)
export const PLASMA_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Recipient for Plasma
  'O+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A-', 'A+', 'AB-', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B-', 'B+', 'AB-', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB-', 'AB+'], // Can only receive from AB
};

/**
 * Checks if a donor blood group is compatible for a recipient and component
 */
export function isBloodCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup, component: BloodComponent): boolean {
  if (component === 'Fresh Frozen Plasma') {
    const allowedDonors = PLASMA_COMPATIBILITY[recipientGroup] || [];
    return allowedDonors.includes(donorGroup);
  }
  // For RBC, Platelets, and Whole Blood:
  const allowedDonors = RBC_COMPATIBILITY[recipientGroup] || [];
  return allowedDonors.includes(donorGroup);
}

/**
 * Checks donor eligibility based on last donation date (standard 90 days for whole blood, 14 days for platelets)
 */
export function checkDonorEligibility(lastDonationDate: string, component: BloodComponent = 'Whole Blood'): {
  isEligible: boolean;
  daysRemaining: number;
  daysSinceLast: number;
} {
  const last = new Date(lastDonationDate).getTime();
  const now = new Date('2026-09-22').getTime(); // Current system date
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  
  const requiredCooldown = component === 'Platelets' ? 14 : 90;
  const isEligible = diffDays >= requiredCooldown;
  const daysRemaining = Math.max(0, requiredCooldown - diffDays);

  return {
    isEligible,
    daysRemaining,
    daysSinceLast: diffDays
  };
}
