import React from 'react';
import { useApp } from '../../context/AppContext';
import { LiveTracker } from '../common/LiveTracker';
import { StatusChip } from '../common/StatusChip';
import { Activity, Plus } from 'lucide-react';
import { AutoEscalationWorkflow } from '../common/AutoEscalationWorkflow';

export const PatientDashboard: React.FC = () => {
  const { requests, currentUser, setIsEmergencyModalOpen, selectedRequestId, setSelectedRequestId, t } = useApp();

  // Find active requests raised by patient
  const patientRequests = requests.filter(r => r.requesterRole === 'patient' || r.requesterId === currentUser.id);
  const activeRequest = requests.find(r => r.id === selectedRequestId) || patientRequests[0] || requests[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header and Quick Action */}
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderLeft: '4px solid var(--primary-navy)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--secondary-blue)' }} />
            <h1 className="card-title" style={{ fontSize: '1.4rem' }}>
              Patient Coordination Portal
            </h1>
          </div>
          <div className="card-desc">
            Logged in as <strong>{currentUser.name}</strong> • Contact: {currentUser.phone} • Region: {currentUser.location.address}
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsEmergencyModalOpen(true)}
        >
          <Plus size={18} />
          <span>{t.emergency.requestBloodNow}</span>
        </button>
      </div>

      {/* Active Request Live Tracker */}
      {activeRequest && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--primary-navy)" />
              Active Coordination & Telemetry Tracker
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live telemetry via matching engine
            </span>
          </div>

          <LiveTracker request={activeRequest} />
        </section>
      )}

      {/* Feature 2: Automatic Multi-Tier Escalation Workflow */}
      <AutoEscalationWorkflow />

      {/* Request History */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">My Clinical Request Records</h2>
            <div className="card-desc">All past and ongoing requests raised for hospital or outpatient cases.</div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Blood Needed</th>
                <th>Urgency</th>
                <th>Hospital / Destination</th>
                <th>Matched Provider</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patientRequests.map(req => (
                <tr key={req.id} style={{ background: activeRequest?.id === req.id ? '#F0F7FF' : 'transparent' }}>
                  <td style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary-navy)' }}>{req.id}</td>
                  <td>
                    <strong style={{ color: req.bloodGroup === 'O-' ? '#E53935' : 'var(--primary-navy)', fontSize: '0.95rem' }}>
                      {req.bloodGroup}
                    </strong> ({req.units} Units {req.component})
                  </td>
                  <td>
                    <span className={`urgency-badge ${req.urgency}`}>{req.urgency}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{req.hospitalName || 'Emergency Ward'}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.location.city}</span>
                  </td>
                  <td>
                    {req.matchedDonorName ? (
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{req.matchedDonorName}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#10B981' }}>Nearby Donor</span>
                      </div>
                    ) : req.matchedBankName ? (
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{req.matchedBankName}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--secondary-blue)' }}>Blood Bank Backup</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Matching in progress...</span>
                    )}
                  </td>
                  <td>
                    <StatusChip status={req.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedRequestId(req.id)}
                    >
                      Track Live
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
