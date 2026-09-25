import React from 'react';
import { BloodRequest } from '../../types';
import { useApp } from '../../context/AppContext';
import { Clock, Phone, ArrowUpRight, CheckCircle } from 'lucide-react';

interface LiveTrackerProps {
  request: BloodRequest;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({ request }) => {
  const { escalateRequest, t } = useApp();

  const steps = [
    { key: 'matching', label: t.status.matching, num: 1 },
    { key: 'notified', label: t.status.notified, num: 2 },
    { key: 'accepted', label: t.status.accepted, num: 3 },
    { key: 'en_route', label: t.status.en_route, num: 4 },
    { key: 'fulfilled', label: t.status.fulfilled, num: 5 }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'matching': return 0;
      case 'notified': return 1;
      case 'accepted': return 2;
      case 'en_route': return 3;
      case 'fulfilled': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(request.status);

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--primary-navy)' }}>
      <div className="card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className={`urgency-badge ${request.urgency}`}>
              {request.urgency}
            </span>
            <h3 className="card-title">
              {request.units} Units of {request.bloodGroup} {request.component}
            </h3>
          </div>
          <div className="card-desc">
            Clinical Reference: <strong>{request.patientCaseId || 'Emergency Case'}</strong> • Delivery: {request.location.address}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Escalation Layer</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--secondary-blue)' }}>
            {request.currentTier === 1 && "Tier 1: Nearby Donors (<10km)"}
            {request.currentTier === 2 && "Tier 2: City-wide Donors"}
            {request.currentTier >= 3 && "Tier 3: Partner Blood Bank Reserve"}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="tracker-container">
        <div className="tracker-steps">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex || request.status === 'fulfilled';
            const isActive = idx === currentIndex && request.status !== 'fulfilled';
            return (
              <div 
                key={step.key} 
                className={`tracker-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="tracker-node">
                  {isCompleted ? <CheckCircle size={16} /> : step.num}
                </div>
                <span className="tracker-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matched Details & Escalation Controls */}
      <div style={{
        marginTop: '1.25rem',
        padding: '0.9rem 1.1rem',
        background: '#F8FAFC',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          {request.matchedDonorName && (
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Volunteer: </span>
              <strong style={{ color: 'var(--primary-navy)' }}>{request.matchedDonorName}</strong>
              {request.matchedDonorPhone && (
                <a 
                  href={`tel:${request.matchedDonorPhone}`}
                  style={{ marginLeft: '0.6rem', color: 'var(--secondary-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', fontWeight: 700 }}
                >
                  <Phone size={13} /> {request.matchedDonorPhone}
                </a>
              )}
            </div>
          )}

          {request.matchedBankName && (
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Reserve Center: </span>
              <strong style={{ color: 'var(--primary-navy)' }}>{request.matchedBankName}</strong> (Stock Reserved)
            </div>
          )}

          {!request.matchedDonorName && !request.matchedBankName && (
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-blue)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <Clock size={15} /> Telemetry search running across donor pool...
            </div>
          )}
        </div>

        {/* Demo Trigger: Force Escalation */}
        {request.status !== 'fulfilled' && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => escalateRequest(request.id)}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            title="Simulate SLA timer timeout to test automatic tier promotion"
          >
            <ArrowUpRight size={13} />
            <span>Simulate SLA Timeout (Escalate Tier)</span>
          </button>
        )}
      </div>
    </div>
  );
};
