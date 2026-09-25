import React, { useState } from 'react';
import { BloodGroup, BloodComponent } from '../../types';
import { 
  Award, MapPin, CheckCircle2, Clock, 
  Send, SlidersHorizontal, ShieldCheck 
} from 'lucide-react';

interface RankedDonorItem {
  id: string;
  name: string;
  donorCode: string;
  bloodGroup: BloodGroup;
  matchType: 'exact' | 'compatible';
  distanceKm: number;
  locationArea: string;
  daysSinceLastDonation: number;
  isEligible: boolean;
  reliabilityScore: number;
  totalDonations: number;
  compositeRankScore: number;
  readyStatus: 'immediate' | '15_min' | 'on_call';
}

interface SmartDonorRankingProps {
  targetBloodGroup?: BloodGroup;
  targetComponent?: BloodComponent;
}

export const SmartDonorRanking: React.FC<SmartDonorRankingProps> = ({
  targetBloodGroup: initialBloodGroup = 'O-',
  targetComponent: initialComponent = 'Whole Blood'
}) => {
  const [targetBloodGroup, setTargetBloodGroup] = useState<BloodGroup>(initialBloodGroup);
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>(initialComponent);
  const [notifiedDonorIds, setNotifiedDonorIds] = useState<Record<string, boolean>>({});

  // Comprehensive mock donor pool for ranking simulation
  const mockDonors: RankedDonorItem[] = [
    {
      id: 'donor-rank-1',
      name: 'Vikram Malhotra',
      donorCode: 'LL-DN-4821',
      bloodGroup: 'O-',
      matchType: 'exact',
      distanceKm: 2.4,
      locationArea: 'Hauz Khas, New Delhi',
      daysSinceLastDonation: 135,
      isEligible: true,
      reliabilityScore: 98,
      totalDonations: 12,
      compositeRankScore: 98,
      readyStatus: 'immediate'
    },
    {
      id: 'donor-rank-2',
      name: 'Priya Nair',
      donorCode: 'LL-DN-9912',
      bloodGroup: 'O-',
      matchType: 'exact',
      distanceKm: 4.8,
      locationArea: 'Lajpat Nagar, New Delhi',
      daysSinceLastDonation: 104,
      isEligible: true,
      reliabilityScore: 95,
      totalDonations: 8,
      compositeRankScore: 94,
      readyStatus: 'immediate'
    },
    {
      id: 'donor-rank-3',
      name: 'Rohan Deshmukh',
      donorCode: 'LL-DN-3155',
      bloodGroup: 'O+',
      matchType: 'compatible',
      distanceKm: 3.1,
      locationArea: 'Saket, New Delhi',
      daysSinceLastDonation: 120,
      isEligible: true,
      reliabilityScore: 92,
      totalDonations: 6,
      compositeRankScore: 88,
      readyStatus: '15_min'
    },
    {
      id: 'donor-rank-4',
      name: 'Ananya Roy',
      donorCode: 'LL-DN-7740',
      bloodGroup: 'A-',
      matchType: 'compatible',
      distanceKm: 6.2,
      locationArea: 'Greater Kailash, New Delhi',
      daysSinceLastDonation: 98,
      isEligible: true,
      reliabilityScore: 89,
      totalDonations: 5,
      compositeRankScore: 84,
      readyStatus: '15_min'
    },
    {
      id: 'donor-rank-5',
      name: 'Arjun Mehra',
      donorCode: 'LL-DN-1822',
      bloodGroup: 'O-',
      matchType: 'exact',
      distanceKm: 12.5,
      locationArea: 'Noida Sector 18, NCR',
      daysSinceLastDonation: 160,
      isEligible: true,
      reliabilityScore: 96,
      totalDonations: 14,
      compositeRankScore: 82,
      readyStatus: 'on_call'
    },
    {
      id: 'donor-rank-6',
      name: 'Deepak Verma',
      donorCode: 'LL-DN-6531',
      bloodGroup: 'B-',
      matchType: 'compatible',
      distanceKm: 8.9,
      locationArea: 'Vasant Kunj, New Delhi',
      daysSinceLastDonation: 45, // <90 days cooldown
      isEligible: false,
      reliabilityScore: 88,
      totalDonations: 3,
      compositeRankScore: 65,
      readyStatus: 'on_call'
    }
  ];

  // Dynamically recalculate match based on target selection
  const rankedDonors = mockDonors
    .map(d => {
      const isExact = d.bloodGroup === targetBloodGroup;
      // Exact match gets bonus score
      const score = isExact ? d.compositeRankScore : Math.max(50, d.compositeRankScore - 12);
      return {
        ...d,
        matchType: isExact ? ('exact' as const) : ('compatible' as const),
        compositeRankScore: score
      };
    })
    .sort((a, b) => {
      // Eligible first, then descending by composite score
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      return b.compositeRankScore - a.compositeRankScore;
    });

  const handleNotifyDonor = (id: string) => {
    setNotifiedDonorIds(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--primary-navy)' }}>
      {/* Header */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} color="var(--primary-navy)" />
            <h2 className="card-title">Smart Donor Match & Ranking System</h2>
          </div>
          <div className="card-desc">
            Algorithmic ranking weighted by proximity, ABO/Rh match tier, 90-day cooldown window, and historical response reliability.
          </div>
        </div>

        {/* Quick Filter Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <SlidersHorizontal size={14} />
            <span>Target Blood:</span>
          </div>

          <select
            className="form-select"
            value={targetBloodGroup}
            onChange={(e) => setTargetBloodGroup(e.target.value as BloodGroup)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value as BloodComponent)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="Whole Blood">Whole Blood</option>
            <option value="Packed Red Blood Cells">Packed RBCs</option>
            <option value="Platelets">Platelets</option>
            <option value="Fresh Frozen Plasma">Plasma</option>
          </select>
        </div>
      </div>

      {/* Algorithm Weights Banner */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.65rem 1rem',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1.25rem'
      }}>
        <span>
          <strong>Ranking Formula:</strong> Compatibility Tier (40%) + Distance (30%) + Reliability History (20%) + Recency Recovery (10%)
        </span>
        <span style={{ color: 'var(--primary-navy)', fontWeight: 700 }}>
          {rankedDonors.filter(d => d.isEligible).length} Eligible Donors in Buffer Radius
        </span>
      </div>

      {/* Ranked Donor List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {rankedDonors.map((donor, idx) => {
          const isTopThree = idx < 3 && donor.isEligible;
          const isNotified = notifiedDonorIds[donor.id];

          return (
            <div
              key={donor.id}
              style={{
                background: idx === 0 && donor.isEligible ? '#F0FDF4' : '#FFFFFF',
                border: idx === 0 && donor.isEligible ? '1px solid #86EFAC' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Left: Rank Badge + Donor Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
                {/* Rank Number */}
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: isTopThree ? 'var(--primary-navy)' : '#F1F5F9',
                  color: isTopThree ? '#FFFFFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  flexShrink: 0
                }}>
                  #{idx + 1}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                      {donor.name}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ({donor.donorCode})
                    </span>
                    <span title="ABHA & Aadhaar KYC Verified" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <ShieldCheck size={14} color="#0D47A1" />
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <MapPin size={12} color="#2979FF" /> {donor.distanceKm} km away ({donor.locationArea})
                    </span>
                    <span>•</span>
                    <span>{donor.totalDonations} total donations</span>
                  </div>
                </div>
              </div>

              {/* Middle: Blood Type + Compatibility Tier + Cooldown Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Blood Group Badge */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    background: donor.bloodGroup === 'O-' ? '#FEF2F2' : '#F0F7FF',
                    color: donor.bloodGroup === 'O-' ? '#DC2626' : '#0D47A1',
                    border: donor.bloodGroup === 'O-' ? '1px solid #FECACA' : '1px solid #BFDBFE',
                    fontWeight: 800,
                    fontSize: '1rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {donor.bloodGroup}
                  </span>
                  <span style={{
                    display: 'block',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    marginTop: '2px',
                    color: donor.matchType === 'exact' ? '#16A34A' : '#2563EB'
                  }}>
                    {donor.matchType === 'exact' ? '★ EXACT' : 'COMPATIBLE'}
                  </span>
                </div>

                {/* 90-Day Cooldown Eligibility */}
                <div>
                  {donor.isEligible ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.74rem',
                      fontWeight: 700
                    }}>
                      <CheckCircle2 size={13} />
                      Eligible ({donor.daysSinceLastDonation}d ago)
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.74rem',
                      fontWeight: 700
                    }}>
                      <Clock size={13} />
                      Cooldown ({90 - donor.daysSinceLastDonation}d left)
                    </span>
                  )}

                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Response SLA: {donor.reliabilityScore}% reliability
                  </span>
                </div>
              </div>

              {/* Right: Composite Score Bar + Dispatch Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ textAlign: 'right', minWidth: '85px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.2rem' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      {donor.compositeRankScore}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Match Score
                  </span>
                </div>

                <button
                  type="button"
                  className={isNotified ? 'btn-secondary' : 'btn-primary'}
                  disabled={!donor.isEligible || isNotified}
                  onClick={() => handleNotifyDonor(donor.id)}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.5rem 0.95rem',
                    background: isNotified ? '#F1F5F9' : donor.isEligible ? 'var(--primary-navy)' : '#E2E8F0',
                    color: isNotified ? '#16A34A' : donor.isEligible ? '#FFFFFF' : '#94A3B8',
                    cursor: donor.isEligible ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isNotified ? (
                    <>
                      <CheckCircle2 size={14} color="#16A34A" />
                      <span>Notified</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Alert Donor</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
