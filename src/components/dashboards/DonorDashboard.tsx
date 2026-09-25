import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Heart, Award, Check, X, MapPin, Clock, 
  Sparkles, CheckCircle2, Sliders 
} from 'lucide-react';
import { DonorReliabilityProfile } from '../common/DonorReliabilityProfile';
import { SmartDonorRanking } from '../common/SmartDonorRanking';

export const DonorDashboard: React.FC = () => {
  const { 
    currentUser, donorProfiles, toggleDonorAvailability, requests, 
    acceptMatch, declineMatch, impactNotifications, t 
  } = useApp();

  const profile = donorProfiles[currentUser.id] || donorProfiles['usr-donor-1'];
  const [responseTimer, setResponseTimer] = useState<number>(45);

  // Find incoming matches directed to this donor
  const incomingMatch = requests.find(r => 
    r.status === 'notified' && 
    (r.matchedDonorId === currentUser.id || (!r.matchedDonorId && r.bloodGroup === profile.bloodGroup))
  );

  // Response countdown timer simulation
  useEffect(() => {
    let interval: any;
    if (incomingMatch && responseTimer > 0) {
      interval = setInterval(() => {
        setResponseTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [incomingMatch, responseTimer]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Donor Profile Header & Availability Toggle */}
      <div className="card" style={{
        background: '#FFFFFF',
        borderLeft: '4px solid var(--primary-navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#FFFFFF',
            boxShadow: '0 4px 10px rgba(13, 71, 161, 0.25)'
          }}>
            {profile.bloodGroup}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                {currentUser.name}
              </h1>
              <span style={{
                background: 'var(--secondary-blue-light)',
                color: 'var(--primary-navy)',
                border: '1px solid var(--secondary-blue-border)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                {profile.simulatedAadhaarMasked}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Universal Lifesaver Donor • Last Donated: <strong>{profile.lastDonationDate}</strong> (Eligible to Donate)
            </div>
          </div>
        </div>

        {/* Availability Toggle Switch */}
        <div style={{
          background: 'var(--bg-input)',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Donor Status</span>
            <strong style={{ fontSize: '0.85rem', color: profile.isAvailable ? '#10B981' : 'var(--text-secondary)' }}>
              {profile.isAvailable ? t.donor.availableStatus : t.donor.unavailableStatus}
            </strong>
          </div>

          <button
            type="button"
            onClick={() => toggleDonorAvailability(currentUser.id)}
            style={{
              width: 50,
              height: 28,
              borderRadius: 'var(--radius-full)',
              background: profile.isAvailable ? '#10B981' : '#CBD5E1',
              position: 'relative',
              padding: 2
            }}
            aria-label="Toggle availability"
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#FFFFFF',
              transform: profile.isAvailable ? 'translateX(22px)' : 'translateX(0)',
              transition: 'transform 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
            }} />
          </button>
        </div>
      </div>

      {/* Incoming Emergency Match Card (Supportive Medical Red Highlight) */}
      {incomingMatch && profile.isAvailable && (
        <div className="card" style={{
          background: '#FFF5F5',
          border: '2px solid #E53935',
          boxShadow: '0 4px 12px rgba(229, 57, 53, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#E53935'
              }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#C62828' }}>
                Incoming Critical Match Notification
              </h2>
            </div>

            <div style={{
              background: '#FEF2F2',
              color: '#E53935',
              border: '1px solid #FECACA',
              padding: '0.35rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Clock size={15} />
              Response SLA: {responseTimer}s
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required Component</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#E53935' }}>
                {incomingMatch.bloodGroup} {incomingMatch.component}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{incomingMatch.units} Units Needed</span>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hospital Destination</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                {incomingMatch.hospitalName || 'Apollo Emergency Hospital'}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <MapPin size={12} /> Approx 3.8 km away
              </span>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clinical Indication</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {incomingMatch.notes || 'Emergency surgical requirement.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => declineMatch(incomingMatch.id, currentUser.id)}
            >
              <X size={16} />
              <span>{t.donor.declineMatch}</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.75rem 1.8rem', background: '#E53935' }}
              onClick={() => acceptMatch(incomingMatch.id, currentUser.id)}
            >
              <Check size={18} />
              <span>{t.donor.acceptMatch}</span>
            </button>
          </div>
        </div>
      )}

      {/* Reliability Score, Badges, and Stats */}
      <div className="grid-3">
        <div className="card" style={{ borderTop: '3px solid #0D47A1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0D47A1', marginBottom: '0.5rem' }}>
            <Award size={20} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
              {t.donor.reliabilityScore}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0D47A1' }}>
              {profile.reliabilityScore}%
            </span>
            <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 700 }}>Optimal</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Calculated from 100% response rate to nearby emergency matches.
          </p>
        </div>

        <div className="card" style={{ borderTop: '3px solid #2979FF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2979FF', marginBottom: '0.5rem' }}>
            <Heart size={20} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Transfusions</h3>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0D47A1' }}>
            {profile.totalDonations} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>Units</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Up to <strong>{profile.totalDonations * 3} lives</strong> potentially saved or improved.
          </p>
        </div>

        <div className="card" style={{ borderTop: '3px solid #0D47A1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0D47A1', marginBottom: '0.5rem' }}>
            <Sparkles size={20} />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
              {t.donor.badges}
            </h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
            {profile.badges.map(b => (
              <span
                key={b}
                style={{
                  background: 'rgba(13, 71, 161, 0.08)',
                  color: '#0D47A1',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(13, 71, 161, 0.2)'
                }}
              >
                ★ {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sweden-Style Closed Impact Loop ("Your Blood Saved a Life!") */}
      <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} color="#10B981" />
              <h2 className="card-title" style={{ color: '#0F172A' }}>{t.donor.impactFeedTitle}</h2>
            </div>
            <div className="card-desc">
              Direct verification messages triggered when a hospital marks your unit as transfused.
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
            {impactNotifications.length} Confirmed Transfusions
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {impactNotifications.map(imp => (
            <div
              key={imp.id}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderLeft: '4px solid #10B981',
                padding: '1.1rem 1.25rem',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Heart size={16} fill="#E53935" color="#E53935" />
                  <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
                    {imp.message}
                  </strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {imp.transfusionDate}
                </span>
              </div>

              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Transfused at <strong>{imp.hospitalName}</strong> • Unit Tracking Code: <code style={{ color: '#0D47A1', background: '#EDF2F7', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>{imp.unitCode}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={18} /> Notification & Dispatch Settings
            </h3>
            <div className="card-desc">Prevent alert fatigue by tailoring emergency response radius and channels.</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label className="form-label">Alert Radius: {profile.notificationRadiusKm} km</label>
            <input type="range" min="5" max="50" step="5" defaultValue={profile.notificationRadiusKm} style={{ width: '100%' }} />
          </div>

          <div>
            <label className="form-label">Minimum Urgency Threshold</label>
            <select className="form-select" defaultValue={profile.urgencyThreshold}>
              <option value="standard">Standard, Urgent & Critical</option>
              <option value="urgent">Urgent & Critical Only</option>
              <option value="critical">Critical Only (Life-Threatening)</option>
            </select>
          </div>

          <div>
            <label className="form-label">Delivery Channels</label>
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.4rem', fontSize: '0.85rem' }}>
              <label><input type="checkbox" defaultChecked /> SMS</label>
              <label><input type="checkbox" defaultChecked /> WhatsApp</label>
              <label><input type="checkbox" defaultChecked /> Push</label>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 4: Donor Contribution & Reliability Score */}
      <DonorReliabilityProfile />

      {/* Feature 1: Smart Donor Match & Ranking System */}
      <SmartDonorRanking />
    </div>
  );
};
