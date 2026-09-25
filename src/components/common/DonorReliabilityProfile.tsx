import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Award, Heart, ShieldCheck, 
  CheckCircle2, CalendarCheck, Zap 
} from 'lucide-react';

export const DonorReliabilityProfile: React.FC = () => {
  const { currentUser, donorProfiles } = useApp();

  const profile = donorProfiles[currentUser.id] || donorProfiles['usr-donor-1'];
  const reliabilityScore = profile.reliabilityScore || 94;

  // Determine Tier Badge based on the composite score
  const getTierDetails = (score: number) => {
    if (score >= 95) {
      return {
        tier: 'Platinum Legend',
        color: '#7C3AED',
        bg: '#F5F3FF',
        border: '#DDD6FE',
        description: 'Elite response speed: sub-10 minute arrival probability. Priority Tier-1 emergency routing.'
      };
    }
    if (score >= 85) {
      return {
        tier: 'Gold Lifesaver',
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FDE68A',
        description: 'Top-tier reliability: 96% emergency response SLA. First wave candidate for surgery backups.'
      };
    }
    if (score >= 70) {
      return {
        tier: 'Silver Champion',
        color: '#475569',
        bg: '#F8FAFC',
        border: '#CBD5E1',
        description: 'Consistent contributor with solid availability track record across scheduled drives.'
      };
    }
    return {
      tier: 'Bronze Guardian',
      color: '#B45309',
      bg: '#FEF3C7',
      border: '#FDE68A',
      description: 'Active donor building verified transfusion history on the LifeLink network.'
    };
  };

  const tierDetails = getTierDetails(reliabilityScore);

  // Breakdown metrics factor calculations (summing to 100 pts)
  const breakdownFactors = [
    {
      id: 'donations',
      title: 'Successful Donations',
      value: `${profile.totalDonations} Completed Units`,
      earnedPts: 25,
      maxPts: 25,
      pct: 100,
      icon: <Heart size={18} color="#DC2626" />,
      description: 'Verified units collected, screened, and transfused to hospital recipients.'
    },
    {
      id: 'response_rate',
      title: 'Emergency Response Rate',
      value: '96% Within SLA',
      earnedPts: 28,
      maxPts: 30,
      pct: 93,
      icon: <Zap size={18} color="#D97706" />,
      description: 'Speed and consistency in answering sub-15 minute critical surgical alerts.'
    },
    {
      id: 'no_show',
      title: 'No-Show Rate',
      value: '0% Missed (Perfect)',
      earnedPts: 25,
      maxPts: 25,
      pct: 100,
      icon: <CheckCircle2 size={18} color="#16A34A" />,
      description: 'Zero unnotified cancellations upon confirming donation appointments.'
    },
    {
      id: 'consistency',
      title: 'Consistency Over Time',
      value: '85% Cooldown Adherence',
      earnedPts: 16,
      maxPts: 20,
      pct: 80,
      icon: <CalendarCheck size={18} color="#2563EB" />,
      description: 'Regular donation cadence following clinical 90-day whole blood recovery windows.'
    }
  ];

  return (
    <div className="card" style={{ borderLeft: '4px solid #D97706' }}>
      {/* Header */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} color="#D97706" />
            <h2 className="card-title">Donor Contribution & Reliability Score</h2>
          </div>
          <div className="card-desc">
            Algorithmic score evaluated across 4 objective metrics, directly referenced by LifeLink's Smart Ranking Engine (Feature 1).
          </div>
        </div>

        {/* Tier Badge */}
        <div style={{
          background: tierDetails.bg,
          border: `1px solid ${tierDetails.border}`,
          color: tierDetails.color,
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 800,
          fontSize: '0.85rem'
        }}>
          <ShieldCheck size={16} />
          <span>{tierDetails.tier}</span>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)',
        border: '1px solid #FDE68A',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Big Score Ring */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '4px solid #F59E0B',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', lineHeight: 1 }}>
              {reliabilityScore}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              OUT OF 100
            </span>
          </div>

          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Top 4% Regional Donor Rating
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem', maxWidth: '520px' }}>
              {tierDetails.description}
            </p>
            <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700, marginTop: '0.35rem' }}>
              ✓ Direct Smart Matching Link: Donors with scores &ge; 90 earn highest Tier-1 dispatch priority.
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          textAlign: 'right'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Audit Score Status
          </span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
            Verified Active
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Updated: 2026-09-22
          </span>
        </div>
      </div>

      {/* 4 Factor Breakdown Grid */}
      <div className="grid-2">
        {breakdownFactors.map((factor) => (
          <div
            key={factor.id}
            style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {factor.icon}
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {factor.title}
                  </strong>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                    {factor.earnedPts}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / {factor.maxPts} pts</span>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D47A1', marginBottom: '0.35rem' }}>
                {factor.value}
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                {factor.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '0.85rem' }}>
              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  width: `${factor.pct}%`,
                  height: '100%',
                  background: factor.pct >= 90 ? '#10B981' : factor.pct >= 75 ? '#2979FF' : '#F59E0B',
                  borderRadius: 'var(--radius-full)'
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
