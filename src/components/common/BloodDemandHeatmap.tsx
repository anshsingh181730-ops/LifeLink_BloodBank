import React, { useState } from 'react';
import { 
  TrendingUp, MapPin, Sparkles, BarChart3 
} from 'lucide-react';

interface ZoneDemandData {
  zoneName: string;
  zoneArea: string;
  demandIndex: number; // 0 - 100
  criticalBloodType: string;
  projectedDeficitUnits: number;
  status: 'critical' | 'moderate' | 'stable' | 'opportunity';
  primaryCause: string;
}

export const BloodDemandHeatmap: React.FC = () => {
  const [forecastHorizon, setForecastHorizon] = useState<'7d' | '30d'>('7d');

  const zones: ZoneDemandData[] = [
    {
      zoneName: 'South Delhi Medical Cluster',
      zoneArea: 'Saket, AIIMS, Apollo, Sarita Vihar',
      demandIndex: 94,
      criticalBloodType: 'O- & Platelets',
      projectedDeficitUnits: -24,
      status: 'critical',
      primaryCause: 'High trauma ICU volume & cardiac surgeries'
    },
    {
      zoneName: 'Central Delhi Core Zone',
      zoneArea: 'Connaught Place, Karol Bagh, Daryaganj',
      demandIndex: 88,
      criticalBloodType: 'O-',
      projectedDeficitUnits: -16,
      status: 'critical',
      primaryCause: 'Regional government hospital referral influx'
    },
    {
      zoneName: 'East Delhi & Shahdara Cluster',
      zoneArea: 'Preet Vihar, Anand Vihar, Mayur Vihar',
      demandIndex: 64,
      criticalBloodType: 'B+',
      projectedDeficitUnits: -8,
      status: 'moderate',
      primaryCause: 'Seasonal dengue fever platelet requirements'
    },
    {
      zoneName: 'West Delhi Sub-Zone',
      zoneArea: 'Janakpuri, Rajouri Garden, Rohini',
      demandIndex: 42,
      criticalBloodType: 'None (Stable Buffer)',
      projectedDeficitUnits: +12,
      status: 'stable',
      primaryCause: 'Sufficient local voluntary donor pool'
    },
    {
      zoneName: 'Noida / NCR Expressway Sector',
      zoneArea: 'Sector 18, Expressway, Greater Noida',
      demandIndex: 58,
      criticalBloodType: 'A-',
      projectedDeficitUnits: -5,
      status: 'moderate',
      primaryCause: 'Highway trauma emergency backup reserve'
    },
    {
      zoneName: 'Gurugram Corporate Corridor',
      zoneArea: 'DLF Cyber City, Golf Course Road',
      demandIndex: 78,
      criticalBloodType: 'Camp Surplus Target',
      projectedDeficitUnits: +35,
      status: 'opportunity',
      primaryCause: 'High corporate drive volunteer conversion'
    }
  ];

  // 7-day forecast points (Expected Demand vs Typical Supply in units)
  const forecast7Days = [
    { label: 'Day 1 (Today)', demand: 42, supply: 38 },
    { label: 'Day 2', demand: 46, supply: 39 },
    { label: 'Day 3', demand: 52, supply: 40 },
    { label: 'Day 4 (Trauma Surge)', demand: 68, supply: 42 },
    { label: 'Day 5 (Weekend)', demand: 74, supply: 45 },
    { label: 'Day 6', demand: 61, supply: 48 },
    { label: 'Day 7', demand: 48, supply: 50 },
  ];

  // 30-day weekly forecast points
  const forecast30Days = [
    { label: 'Week 1', demand: 320, supply: 290 },
    { label: 'Week 2 (Dengue Peak)', demand: 410, supply: 310 },
    { label: 'Week 3 (Diwali Break)', demand: 385, supply: 280 },
    { label: 'Week 4 (Post-Festive)', demand: 340, supply: 350 },
  ];

  const currentForecast = forecastHorizon === '7d' ? forecast7Days : forecast30Days;
  const maxForecastUnit = forecastHorizon === '7d' ? 80 : 450;

  const getStatusBadge = (status: ZoneDemandData['status']) => {
    switch (status) {
      case 'critical':
        return {
          bg: '#FEF2F2',
          text: '#DC2626',
          border: '#FECACA',
          label: 'CRITICAL DEFICIT'
        };
      case 'moderate':
        return {
          bg: '#FFFBEB',
          text: '#D97706',
          border: '#FDE68A',
          label: 'MODERATE DEMAND'
        };
      case 'stable':
        return {
          bg: '#ECFDF5',
          text: '#059669',
          border: '#A7F3D0',
          label: 'STABLE RESERVE'
        };
      case 'opportunity':
        return {
          bg: '#EFF6FF',
          text: '#2563EB',
          border: '#BFDBFE',
          label: 'CAMP SURPLUS ZONE'
        };
    }
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid #2563EB' }}>
      {/* Header */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <TrendingUp size={22} color="var(--primary-navy)" />
            <h2 className="card-title">Blood Demand Prediction & Spatial Heatmap</h2>

            {/* Explicit Notice Badge required by prompt */}
            <span style={{
              background: 'rgba(41, 121, 255, 0.08)',
              color: 'var(--primary-navy)',
              border: '1px solid rgba(41, 121, 255, 0.25)',
              padding: '0.15rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 800,
              fontSize: '0.72rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <Sparkles size={12} color="#D97706" />
              ML Forecasting (Simulated for UX Review)
            </span>
          </div>

          <div className="card-desc">
            Geospatial demand heat matrix and multi-horizon demand forecasting modeled from trauma admissions and seasonal deficit patterns.
          </div>
        </div>

        {/* Forecast Horizon Toggle */}
        <div style={{
          background: '#F1F5F9',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '0.2rem',
          display: 'flex',
          gap: '0.2rem'
        }}>
          <button
            type="button"
            className={`role-btn ${forecastHorizon === '7d' ? 'active' : ''}`}
            onClick={() => setForecastHorizon('7d')}
            style={{
              fontSize: '0.78rem',
              padding: '0.35rem 0.8rem',
              background: forecastHorizon === '7d' ? '#FFFFFF' : 'transparent',
              color: forecastHorizon === '7d' ? 'var(--primary-navy)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700
            }}
          >
            Next 7 Days
          </button>

          <button
            type="button"
            className={`role-btn ${forecastHorizon === '30d' ? 'active' : ''}`}
            onClick={() => setForecastHorizon('30d')}
            style={{
              fontSize: '0.78rem',
              padding: '0.35rem 0.8rem',
              background: forecastHorizon === '30d' ? '#FFFFFF' : 'transparent',
              color: forecastHorizon === '30d' ? 'var(--primary-navy)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700
            }}
          >
            Next 30 Days
          </button>
        </div>
      </div>

      {/* City/Region Demand Heatmap Grid */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={16} color="#2563EB" />
          <span>Regional Deficit & Demand Heat Zones (Delhi NCR)</span>
        </div>

        <div className="grid-3">
          {zones.map((zone) => {
            const badge = getStatusBadge(zone.status);

            return (
              <div
                key={zone.zoneName}
                style={{
                  background: '#FFFFFF',
                  border: zone.status === 'critical' ? '1px solid #FECACA' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: zone.status === 'critical' ? '0 2px 8px rgba(220, 38, 38, 0.08)' : 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        {zone.zoneName}
                      </h3>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {zone.zoneArea}
                      </span>
                    </div>

                    <span style={{
                      display: 'inline-block',
                      background: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      whiteSpace: 'nowrap'
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 0.75rem',
                    margin: '0.6rem 0',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Projected Deficit:</span>
                      <strong style={{ color: zone.projectedDeficitUnits < 0 ? '#DC2626' : '#16A34A' }}>
                        {zone.projectedDeficitUnits > 0 ? `+${zone.projectedDeficitUnits}` : zone.projectedDeficitUnits} units ({zone.criticalBloodType})
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Demand Index:</span>
                      <strong style={{ color: 'var(--primary-navy)' }}>{zone.demandIndex} / 100</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    • {zone.primaryCause}
                  </p>
                </div>

                {/* Demand Heat Bar */}
                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ height: '6px', background: '#E2E8F0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${zone.demandIndex}%`,
                      height: '100%',
                      background: zone.demandIndex >= 85 ? '#DC2626' : zone.demandIndex >= 60 ? '#D97706' : '#2563EB',
                      borderRadius: 'var(--radius-full)'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple Forecast Chart: Expected Demand vs Typical Supply */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BarChart3 size={16} color="#0D47A1" />
              <span>Projected Clinical Demand vs Supply Timeline ({forecastHorizon === '7d' ? 'Next 7 Days' : 'Next 30 Days'})</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Comparing projected emergency transfusion requests against expected voluntary donations.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 12, height: 12, background: '#DC2626', borderRadius: '2px', display: 'inline-block' }} />
              Expected Demand
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 12, height: 12, background: '#0D47A1', borderRadius: '2px', display: 'inline-block' }} />
              Typical Supply
            </span>
          </div>
        </div>

        {/* Visual Bar Comparison Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {currentForecast.map((point) => {
            const demandPct = Math.round((point.demand / maxForecastUnit) * 100);
            const supplyPct = Math.round((point.supply / maxForecastUnit) * 100);
            const isDeficit = point.demand > point.supply;

            return (
              <div key={point.label} style={{ fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{point.label}</strong>
                  <span style={{ fontSize: '0.74rem', color: isDeficit ? '#DC2626' : '#16A34A', fontWeight: 700 }}>
                    {isDeficit ? `Deficit: -${point.demand - point.supply} units` : `Surplus: +${point.supply - point.demand} units`}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {/* Demand Bar (Red) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '55px', fontSize: '0.7rem', color: '#DC2626', fontWeight: 700 }}>Demand</span>
                    <div style={{ flex: 1, height: '10px', background: '#E2E8F0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${demandPct}%`, height: '100%', background: '#DC2626', borderRadius: 'var(--radius-full)' }} />
                    </div>
                    <span style={{ width: '45px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#DC2626' }}>
                      {point.demand}u
                    </span>
                  </div>

                  {/* Supply Bar (Navy) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '55px', fontSize: '0.7rem', color: '#0D47A1', fontWeight: 700 }}>Supply</span>
                    <div style={{ flex: 1, height: '10px', background: '#E2E8F0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${supplyPct}%`, height: '100%', background: '#0D47A1', borderRadius: 'var(--radius-full)' }} />
                    </div>
                    <span style={{ width: '45px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#0D47A1' }}>
                      {point.supply}u
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ML Strategic Recommendations */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Sparkles size={16} color="#D97706" style={{ flexShrink: 0 }} />
          <span>
            <strong>AI Allocation Advisory:</strong> Recommend initiating automated Tier-2 reservation transfers for <strong>O-Negative</strong> and scheduling emergency weekend donation drives in Gurugram Cyber City to counteract the Day 4–5 trauma deficit.
          </span>
        </div>
      </div>
    </div>
  );
};
