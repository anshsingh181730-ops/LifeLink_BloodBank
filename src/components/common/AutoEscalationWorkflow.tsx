import React, { useState, useEffect } from 'react';
import { 
  Clock, FastForward, RotateCcw, 
  CheckCircle2, Users, Building2, Radio, Play, Pause 
} from 'lucide-react';

interface TierStep {
  tierNumber: 1 | 2 | 3;
  title: string;
  subtitle: string;
  scope: string;
  slaWindow: string;
  channelDetails: string;
  icon: React.ReactNode;
}

export const AutoEscalationWorkflow: React.FC = () => {
  // Current active tier: 1, 2, or 3
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(14);
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(true);

  // SLA Thresholds in seconds: Tier 1 -> Tier 2 at 45s, Tier 2 -> Tier 3 at 90s
  const TIER_1_LIMIT = 45;
  const TIER_2_LIMIT = 90;

  // Auto-simulation timer: ticks elapsed time and steps through tiers
  useEffect(() => {
    let timer: any = null;
    if (isAutoSimulating) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= TIER_2_LIMIT) {
            setCurrentTier(3);
          } else if (next >= TIER_1_LIMIT) {
            setCurrentTier(2);
          } else {
            setCurrentTier(1);
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoSimulating]);

  const handleManualAdvance = () => {
    if (currentTier === 1) {
      setCurrentTier(2);
      setElapsedSeconds(TIER_1_LIMIT + 5);
    } else if (currentTier === 2) {
      setCurrentTier(3);
      setElapsedSeconds(TIER_2_LIMIT + 10);
    } else {
      // Loop back or stay at 3
      setCurrentTier(3);
    }
  };

  const handleReset = () => {
    setCurrentTier(1);
    setElapsedSeconds(0);
    setIsAutoSimulating(true);
  };

  const tierSteps: TierStep[] = [
    {
      tierNumber: 1,
      title: 'Tier 1: Nearby Ranked Donors Notified',
      subtitle: 'Target radius: < 10 km',
      scope: 'Top 5 algorithmically ranked compatible donors alerted.',
      slaWindow: '00:00 – 00:45 SLA',
      channelDetails: 'Dual-Channel Gateway: Urgent SMS & WhatsApp push notification with Google Maps hospital route link.',
      icon: <Users size={20} color="#2563EB" />
    },
    {
      tierNumber: 2,
      title: 'Tier 2: Partner Hospitals & Blood Banks Notified',
      subtitle: 'City-wide network: < 25 km',
      scope: 'Telemetry inventory search across CDSCO licensed partner blood banks.',
      slaWindow: '00:45 – 01:30 SLA',
      channelDetails: 'Automated reserve allocation query pinging Red Cross Central, AIIMS, and Apollo Blood Transfusion Banks.',
      icon: <Building2 size={20} color="#EA580C" />
    },
    {
      tierNumber: 3,
      title: 'Tier 3: NGO / Camp Network + Wider City Broadcast',
      subtitle: 'Regional & Community Escrow',
      scope: 'Mass standby notification to Rotary & Red Cross registered camp volunteers.',
      slaWindow: '01:30 – 03:00+ Failsafe',
      channelDetails: 'Open regional community broadcast on LifeLink live deficit board; mobile donation vans dispatched if critical.',
      icon: <Radio size={20} color="#DC2626" />
    }
  ];

  // Helper formatting for seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--secondary-blue)' }}>
      {/* Header */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock size={22} color="var(--primary-navy)" />
            <h2 className="card-title">Automatic Multi-Tier Escalation Workflow</h2>
          </div>
          <div className="card-desc">
            Autonomous emergency protocol that progressively expands response tiers if a critical blood request is unfulfilled.
          </div>
        </div>

        {/* Demo Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Elapsed Timer Pill */}
          <div style={{
            background: '#F0F7FF',
            border: '1px solid #BFDBFE',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--primary-navy)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Clock size={14} color="#2563EB" />
            <span>Elapsed: {formatTime(elapsedSeconds)}</span>
          </div>

          {/* Toggle Auto Simulation */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            title={isAutoSimulating ? 'Pause timer' : 'Resume auto timer'}
          >
            {isAutoSimulating ? <Pause size={14} /> : <Play size={14} />}
            <span>{isAutoSimulating ? 'Pause Auto' : 'Auto Play'}</span>
          </button>

          {/* Manual Step Forward */}
          <button
            type="button"
            className="btn-secondary"
            onClick={handleManualAdvance}
            disabled={currentTier === 3}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            title="Simulate time passing to jump to next tier"
          >
            <FastForward size={14} />
            <span>Simulate Time (+45s)</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
            title="Reset to Tier 1"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Stepper / Timeline Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
        {tierSteps.map((step) => {
          const isPassed = currentTier > step.tierNumber;
          const isCurrent = currentTier === step.tierNumber;
          const isPending = currentTier < step.tierNumber;

          return (
            <div
              key={step.tierNumber}
              style={{
                position: 'relative',
                background: isCurrent ? '#F0F7FF' : isPassed ? '#F8FAFC' : '#FFFFFF',
                border: isCurrent
                  ? '2px solid #2979FF'
                  : isPassed
                  ? '1px solid #CBD5E1'
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: isCurrent ? '0 4px 14px rgba(41, 121, 255, 0.12)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                {/* Left: Icon Badge & Tier Details */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: isCurrent
                      ? 'rgba(41, 121, 255, 0.15)'
                      : isPassed
                      ? '#DCFCE7'
                      : '#F1F5F9',
                    border: isCurrent
                      ? '1px solid #2979FF'
                      : isPassed
                      ? '1px solid #86EFAC'
                      : '1px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isPassed ? (
                      <CheckCircle2 size={22} color="#16A34A" />
                    ) : (
                      step.icon
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <h3 style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: isCurrent ? 'var(--primary-navy)' : isPassed ? '#1E293B' : 'var(--text-muted)'
                      }}>
                        {step.title}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ({step.subtitle})
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.85rem',
                      color: isPending ? 'var(--text-muted)' : 'var(--text-secondary)',
                      marginTop: '0.35rem',
                      lineHeight: '1.45'
                    }}>
                      {step.scope}
                    </p>

                    <div style={{
                      fontSize: '0.78rem',
                      color: isCurrent ? '#1D4ED8' : 'var(--text-muted)',
                      background: isCurrent ? 'rgba(41, 121, 255, 0.08)' : 'transparent',
                      padding: isCurrent ? '0.35rem 0.65rem' : '0.2rem 0',
                      borderRadius: 'var(--radius-sm)',
                      marginTop: '0.45rem',
                      display: 'inline-block'
                    }}>
                      📡 {step.channelDetails}
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill & SLA Window */}
                <div style={{ textAlign: 'right', minWidth: '160px' }}>
                  {isCurrent && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #93C5FD',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.03em',
                      animation: 'pulse 2s infinite'
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
                      ACTIVE TIER
                    </span>
                  )}

                  {isPassed && (
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
                      ESCALATED
                    </span>
                  )}

                  {isPending && (
                    <span style={{
                      display: 'inline-block',
                      background: '#F1F5F9',
                      color: '#64748B',
                      border: '1px solid #E2E8F0',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.74rem',
                      fontWeight: 700
                    }}>
                      STANDBY
                    </span>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Window: <strong>{step.slaWindow}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
