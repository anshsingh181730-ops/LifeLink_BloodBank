import { BloodGroup, BloodComponent, DonorProfile, User, MatchCandidate, BloodBank } from '../types';
import { isBloodCompatible, checkDonorEligibility } from './compatibility';

// Calculate Haversine distance in km between two lat/lng pairs
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}

/**
 * Smart Matching Simulator for candidate donors:
 * Weights:
 * - Compatibility: 40% (Exact match = 100, Compatible group = 80)
 * - Distance: 30% (Closer distance = higher score, scaled up to 35km)
 * - Reliability Score: 20% (Donor historical reliability 0-100)
 * - Eligibility Gap: 10% (Time elapsed since cooldown)
 * - Donor Priority Boost: Up to 20 pts when requester is a verified donor (higher contribution score = higher priority weight)
 */
export function rankDonors(
  recipientBloodGroup: BloodGroup,
  component: BloodComponent,
  targetLat: number,
  targetLng: number,
  donors: { user: User; profile: DonorProfile }[],
  isPriorityRequest: boolean = false,
  donorContributionScore: number = 0
): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];

  for (const { user, profile } of donors) {
    // 1. Availability check
    if (!profile.isAvailable) continue;

    // 2. Compatibility check
    if (!isBloodCompatible(profile.bloodGroup, recipientBloodGroup, component)) continue;

    // 3. Eligibility check (e.g. 90-day cooldown)
    const eligibility = checkDonorEligibility(profile.lastDonationDate, component);
    if (!eligibility.isEligible) continue;

    // 4. Real Distance using Haversine formula
    const donorLat = profile.currentLocation?.lat ?? user.location.lat;
    const donorLng = profile.currentLocation?.lng ?? user.location.lng;
    const dist = calculateDistance(targetLat, targetLng, donorLat, donorLng);
    if (dist > profile.notificationRadiusKm) continue; // outside donor's willing radius

    // Compatibility Score (40 pts max)
    const isExact = profile.bloodGroup === recipientBloodGroup;
    const compScore = isExact ? 40 : 32;

    // Distance Score (30 pts max) - closer gets higher
    const maxDist = 35;
    const distScore = Math.max(0, (1 - dist / maxDist) * 30);

    // Reliability Score (20 pts max)
    const relScore = (profile.reliabilityScore / 100) * 20;

    // Recency Score (10 pts max) - having longer recovery gap is better
    const recencyScore = Math.min(10, (eligibility.daysSinceLast / 180) * 10);

    // Contribution-Based Priority Boost: Higher contribution score = higher priority weight
    const priorityBoost = isPriorityRequest ? Math.round((donorContributionScore / 100) * 15 + 5) : 0;

    const totalRank = Math.round(compScore + distScore + relScore + recencyScore + priorityBoost);

    // Determine Tier (Priority requests grant 15km Tier-1 response window)
    let tier: 1 | 2 | 3 = 1;
    if (dist <= (isPriorityRequest ? 15 : 10)) tier = 1; // Nearby
    else if (dist <= 30) tier = 2; // City-wide
    else tier = 3; // Regional

    candidates.push({
      id: `match-${user.id}-${Date.now()}`,
      requestId: '',
      donorId: user.id,
      donorName: user.name,
      bloodGroup: profile.bloodGroup,
      distanceKm: dist,
      reliabilityScore: profile.reliabilityScore,
      daysSinceDonation: eligibility.daysSinceLast,
      rankScore: totalRank,
      tier,
      status: 'pending'
    });
  }

  // Sort descending by rank score
  return candidates.sort((a, b) => b.rankScore - a.rankScore);
}

/**
 * Filter Blood Banks that have stock for fallback
 */
export function findNearbyBloodBanksWithStock(
  targetLat: number,
  targetLng: number,
  bloodGroup: BloodGroup,
  unitsNeeded: number,
  banks: BloodBank[]
): { bank: BloodBank; distanceKm: number; availableUnits: number }[] {
  return banks
    .map(bank => {
      const distanceKm = calculateDistance(targetLat, targetLng, bank.location.lat, bank.location.lng);
      const availableUnits = bank.inventorySummary[bloodGroup] || 0;
      return { bank, distanceKm, availableUnits };
    })
    .filter(item => item.availableUnits >= unitsNeeded)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
