import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup } from '../../types';
import { Activity, ShieldCheck, Heart, Clock, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { SignInPortals } from '../common/SignInPortals';

export const PublicDashboard: React.FC = () => {
  const { bloodBanks, camps, setIsEmergencyModalOpen, switchRole, t } = useApp();
  const [selectedCity, setSelectedCity] = useState<string>('Delhi');

  const filteredBanks = bloodBanks.filter(b => b.city.toLowerCase() === selectedCity.toLowerCase());

  // Aggregate stock for selected city
  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const aggregateStock: Record<BloodGroup, number> = {
    'O-': 0, 'O+': 0, 'A-': 0, 'A+': 0, 'B-': 0, 'B+': 0, 'AB-': 0, 'AB+': 0
  };

  filteredBanks.forEach(bank => {
    bloodGroups.forEach(bg => {
      aggregateStock[bg] += (bank.inventorySummary[bg] || 0);
    });
  });

  const getStockStatus = (count: number) => {
    // Supportive Medical Red (#E53935) used strictly for critical shortages
    if (count < 8) return { label: 'CRITICAL SHORTAGE', color: '#E53935', barColor: '#E53935' };
    if (count < 20) return { label: 'MODERATE RESERVE', color: '#2979FF', barColor: '#2979FF' };
    return { label: 'OPTIMAL SUPPLY', color: '#0D47A1', barColor: '#0D47A1' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Section — Modern Clinical & Data Theme */}
      <div className="card hero-card" style={{
        background: 'linear-gradient(135deg, #FFFFFF, #F0F7FF)',
        border: '1px solid #D0E2FF',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{
            background: 'rgba(41, 121, 255, 0.1)',
            color: '#0D47A1',
            border: '1px solid rgba(41, 121, 255, 0.25)',
            fontWeight: 800,
            fontSize: '0.78rem',
            padding: '0.35rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-block',
            marginBottom: '1rem',
            letterSpacing: '0.04em'
          }}>
            {t.hero.eyebrow}
          </span>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: '1.2', color: '#0D47A1' }}>
            {t.hero.tagline}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            {t.hero.subtagline}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.95rem', padding: '0.8rem 1.8rem' }}
              onClick={() => setIsEmergencyModalOpen(true)}
            >
              <Activity size={18} />
              <span>{t.emergency.requestBloodNow}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.95rem', padding: '0.8rem 1.8rem' }}
              onClick={() => switchRole('donor')}
            >
              <Heart size={18} color="#0D47A1" />
              <span>{t.hero.registerAsDonor}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sign In Portal Selection Section */}
      <SignInPortals />

      {/* Global Benchmark Metrics */}
      <div className="grid-4">
        <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #0D47A1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0D47A1', marginBottom: '0.4rem' }}>
            <Clock size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Fulfillment Speed</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0D47A1' }}>12.4 min</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Target: &lt;15 min (Rwanda Zipline benchmark)
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #2979FF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2979FF', marginBottom: '0.4rem' }}>
            <TrendingUp size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Repeat Donor Rate</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0D47A1' }}>64.2%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Uplifted by Sweden-style impact feedback
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', marginBottom: '0.4rem' }}>
            <ShieldCheck size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Wastage Rate</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0D47A1' }}>2.8%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Industry baseline ~10% (US/Canada ML target)
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderTop: '3px solid #0D47A1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0D47A1', marginBottom: '0.4rem' }}>
            <Heart size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Lives Impacted</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0D47A1' }}>14,280+</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Across 3,800+ coordinated units
          </div>
        </div>
      </div>

      {/* Real-Time Live Stock Data Grid (Navy Blue Data Visualization & Supportive Medical Red for Shortages) */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#0D47A1" />
              <h2 className="card-title">Clinical Blood Reserve Data Dashboard</h2>
            </div>
            <div className="card-desc">
              Real-time stock across participating licensed blood centers. Updated continuously via telemetry.
            </div>
          </div>

          {/* City Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              style={{ width: 'auto', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            >
              <option value="Delhi">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
            </select>
          </div>
        </div>

        {/* Stock Grid */}
        <div className="grid-2">
          {bloodGroups.map(bg => {
            const count = aggregateStock[bg] || 0;
            const status = getStockStatus(count);
            const percent = Math.min(100, Math.round((count / 60) * 100));

            return (
              <div
                key={bg}
                style={{
                  background: count < 8 ? '#FEF2F2' : '#F8FAFC',
                  padding: '1.1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: count < 8 ? '1px solid #FECACA' : '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: count < 8 ? '#E53935' : '#0D47A1',
                      width: '45px'
                    }}>
                      {bg}
                    </span>
                    <div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: status.color,
                        background: count < 8 ? 'rgba(229, 57, 53, 0.1)' : 'rgba(13, 71, 161, 0.08)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {status.label}
                      </span>
                      {bg === 'O-' && (
                        <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Universal Donor • Emergency Priority
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: count < 8 ? '#E53935' : '#0D47A1' }}>{count}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> units</span>
                  </div>
                </div>

                {/* Progress bar — Primary Navy Blue or Supportive Medical Red */}
                <div style={{ height: '8px', background: '#E2E8F0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: status.barColor,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Community Donation Camps */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#0D47A1" />
              <h2 className="card-title">Scheduled Clinical Donation Drives</h2>
            </div>
            <div className="card-desc">
              Targeted camps addressing regional blood inventory deficits.
            </div>
          </div>
          <button type="button" className="btn-secondary" onClick={() => switchRole('ngo')}>
            View Deficit Heatmap
          </button>
        </div>

        <div className="grid-2">
          {camps.map(camp => (
            <div
              key={camp.id}
              style={{
                background: '#F8FAFC',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', color: '#0D47A1', fontWeight: 700 }}>
                    {camp.ngoName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Calendar size={12} /> {camp.date}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.4rem', color: '#0D47A1' }}>
                  {camp.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} color="#2979FF" /> {camp.venue}
                </p>
              </div>

              <div style={{
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Target: <strong style={{ color: '#0D47A1' }}>{camp.targetUnits} units</strong>
                </span>
                <span style={{ color: '#2979FF', fontWeight: 600 }}>
                  {camp.registeredVolunteers} Volunteers Registered
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
