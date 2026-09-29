import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusChip } from '../common/StatusChip';
import { LiveTracker } from '../common/LiveTracker';
import { 
  Building2, Plus, Clock, MapPin, CheckCircle2, Eye, Award, ShieldCheck 
} from 'lucide-react';
import { SmartDonorRanking } from '../common/SmartDonorRanking';
import { AutoEscalationWorkflow } from '../common/AutoEscalationWorkflow';
import { BloodDemandHeatmap } from '../common/BloodDemandHeatmap';
import { DonorKycQueue } from '../common/DonorKycQueue';

export const HospitalDashboard: React.FC = () => {
  const { 
    currentUser, requests, bloodBanks, confirmTransfusion, 
    setIsEmergencyModalOpen, setSelectedRequestId, selectedRequestId, kycSubmissions, t 
  } = useApp();

  const [confirmModalUnit, setConfirmModalUnit] = useState<string | null>(null);

  // Active requests
  const hospitalRequests = requests.filter(r => r.requesterRole === 'hospital' || r.hospitalName?.includes('Apollo') || r.isPriority);
  const activeRequest = requests.find(r => r.id === selectedRequestId) || hospitalRequests[0] || requests[0];

  const handleTransfusionConfirm = (unitCode: string) => {
    confirmTransfusion(unitCode, currentUser.institutionName || 'Indraprastha Apollo Hospital');
    setConfirmModalUnit(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hospital Identity Header */}
      <div className="card" style={{
        background: '#FFFFFF',
        borderLeft: '4px solid var(--primary-navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            background: 'var(--secondary-blue-light)',
            border: '1px solid var(--secondary-blue-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-navy)'
          }}>
            <Building2 size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                {currentUser.institutionName || 'Indraprastha Apollo Hospital'}
              </h1>
              <span style={{
                background: 'rgba(13, 71, 161, 0.08)',
                color: 'var(--primary-navy)',
                border: '1px solid rgba(13, 71, 161, 0.2)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                Verified Hospital ({currentUser.licenseNumber})
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Clinical Transfusion Department • Medical Officer: <strong>{currentUser.name}</strong> • 24x7 Emergency Liaison
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsEmergencyModalOpen(true)}
        >
          <Plus size={18} />
          <span>{t.hospital.raiseRequest}</span>
        </button>
      </div>

      {/* Active Hospital Live Tracker */}
      {activeRequest && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary-navy)" />
              Clinical Dispatch & Emergency Progress
            </h2>

            {/* Close Loop Action */}
            {activeRequest.status === 'en_route' && (
              <button
                type="button"
                className="btn-success"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                onClick={() => setConfirmModalUnit('LL-DL-26-0922-O-01')}
              >
                <CheckCircle2 size={16} />
                <span>Confirm Transfusion (Close Loop)</span>
              </button>
            )}
          </div>

          <LiveTracker request={activeRequest} />
        </section>
      )}

      {/* Feature 2: Visual Automatic Escalation Workflow */}
      <AutoEscalationWorkflow />

      {/* Active Requests Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">{t.hospital.activeRequests}</h2>
            <div className="card-desc">Real-time status of blood components ordered for surgery and inpatient wards.</div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Case Ref</th>
                <th>Component / Units</th>
                <th>Urgency & Priority</th>
                <th>Assigned Provider</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {hospitalRequests.map(req => (
                <tr key={req.id}>
                  <td>
                    <strong style={{ color: 'var(--primary-navy)' }}>{req.patientCaseId || 'Emergency'}</strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: req.bloodGroup === 'O-' ? '#E53935' : 'var(--primary-navy)' }}>{req.bloodGroup}</strong> ({req.units} Units {req.component})
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                      <span className={`urgency-badge ${req.urgency}`}>{req.urgency}</span>
                      {req.isPriority && (
                        <span className="priority-verified-donor-badge" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                          <Award size={11} color="#D97706" />
                          Priority Request — Verified Donor
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {req.matchedDonorName ? (
                      <div>
                        <strong>{req.matchedDonorName}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#10B981' }}>Nearby Volunteer</span>
                      </div>
                    ) : req.matchedBankName ? (
                      <div>
                        <strong>{req.matchedBankName}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#2979FF' }}>Blood Centre Stock</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Matching in progress</span>
                    )}
                  </td>
                  <td>
                    <StatusChip status={req.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => setSelectedRequestId(req.id)}
                      >
                        <Eye size={12} />
                      </button>
                      {req.status !== 'fulfilled' && (
                        <button
                          type="button"
                          className="btn-success"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => setConfirmModalUnit('LL-DL-26-0922-O-01')}
                          title="Marks transfusion complete and automatically sends gratitude notification to donor"
                        >
                          Mark Transfused
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nearby Blood Bank Live Stock Inspector */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">{t.hospital.nearbyBanksTitle}</h2>
            <div className="card-desc">
              Inspect partner blood bank reserves before initiating public emergency matching.
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Blood Bank</th>
                <th>Location / Distance</th>
                <th>O- Stock</th>
                <th>O+ Stock</th>
                <th>A+ Stock</th>
                <th>B+ Stock</th>
                <th>Emergency Contact</th>
              </tr>
            </thead>
            <tbody>
              {bloodBanks.map(bank => {
                const oNegCount = bank.inventorySummary['O-'] || 0;
                const isONegShortage = oNegCount < 5;
                return (
                  <tr key={bank.id}>
                    <td>
                      <strong style={{ color: 'var(--primary-navy)' }}>{bank.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Licence: {bank.license}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                        <MapPin size={13} color="var(--secondary-blue)" /> {bank.location.address}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 800,
                        color: isONegShortage ? '#E53935' : '#0D47A1',
                        background: isONegShortage ? '#FEF2F2' : 'transparent',
                        padding: isONegShortage ? '0.15rem 0.4rem' : '0',
                        borderRadius: '3px'
                      }}>
                        {oNegCount} units
                      </span>
                    </td>
                    <td>{bank.inventorySummary['O+'] || 0} units</td>
                    <td>{bank.inventorySummary['A+'] || 0} units</td>
                    <td>{bank.inventorySummary['B+'] || 0} units</td>
                    <td>
                      <a
                        href={`tel:${bank.contactPhone}`}
                        style={{ color: 'var(--secondary-blue)', textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        {bank.contactPhone}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospital Staff Voluntary Donor KYC Queue */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--primary-navy)" />
              <h2 className="card-title">Voluntary Donor Government e-KYC Queue</h2>
            </div>
            <div className="card-desc">
              Hospital transfusion ward staff review and verify voluntary donors to mobilize emergency donor pools.
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>
            {kycSubmissions.filter(s => s.status === 'pending').length} Awaiting Verification
          </span>
        </div>

        <DonorKycQueue 
          reviewerRole="hospital" 
          reviewerName={`Hospital Clinical Officer (${currentUser.name})`} 
        />
      </div>

      {/* Feature 1: Smart Donor Ranking System */}
      <SmartDonorRanking 
        targetBloodGroup={activeRequest?.bloodGroup || 'O-'} 
        targetComponent={activeRequest?.component || 'Packed Red Blood Cells'} 
      />

      {/* Feature 5: Blood Demand Prediction & Regional Heatmap */}
      <BloodDemandHeatmap />

      {/* Confirm Transfusion Modal */}
      {confirmModalUnit && (
        <div className="modal-overlay" onClick={() => setConfirmModalUnit(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ background: 'var(--primary-navy)', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF' }}>
                <CheckCircle2 size={20} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>Confirm Transfusion</h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Confirming transfusion of unit <code style={{ color: 'var(--primary-navy)', fontWeight: 700, background: '#EDF2F7', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{confirmModalUnit}</code>:
              </p>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-primary)', paddingLeft: '1.25rem', lineHeight: '1.7' }}>
                <li>Status recorded as <strong>Transfused</strong> in clinical inventory log.</li>
                <li>Hospital order marked <strong>Fulfilled</strong>.</li>
                <li><strong>Sweden Feedback Loop:</strong> Dispatches confirmation notification to donor.</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setConfirmModalUnit(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-success"
                onClick={() => handleTransfusionConfirm(confirmModalUnit)}
              >
                Confirm & Dispatch Impact Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
