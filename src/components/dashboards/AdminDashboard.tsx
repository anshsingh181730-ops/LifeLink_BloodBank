import React from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLogDemo } from '../common/AuditLogDemo';
import { StatusChip } from '../common/StatusChip';
import { ShieldCheck, Check, X, Clock } from 'lucide-react';
import { BloodDemandHeatmap } from '../common/BloodDemandHeatmap';

export const AdminDashboard: React.FC = () => {
  const { users, verifyInstitution, slaConfig, t } = useApp();

  const institutionalUsers = users.filter(u => u.role === 'hospital' || u.role === 'bloodbank' || u.role === 'ngo');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Admin Header */}
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderLeft: '4px solid var(--primary-navy)'
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
            <ShieldCheck size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Clinical Platform Directorate
              </h1>
              <span style={{
                background: 'rgba(13, 71, 161, 0.08)',
                color: 'var(--primary-navy)',
                border: '1px solid rgba(13, 71, 161, 0.2)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                Platform Authority
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              National Blood Coordination Overlay • Institutional Telemetry & Audit Logs
            </div>
          </div>
        </div>

        <div style={{
          background: '#F8FAFC',
          border: '1px solid var(--border-subtle)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          Server Target: <strong style={{ color: 'var(--primary-navy)' }}>99.9% Uptime</strong> • DPDP Act 2023 Compliant Policy
        </div>
      </div>

      {/* Institutional Verification Queue */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">{t.admin.verificationQueue}</h2>
            <div className="card-desc">
              Review institutional licenses and <strong>(Simulated)</strong> Aadhaar/ABHA e-KYC documents prior to granting broadcast privileges.
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--secondary-blue)', fontWeight: 700 }}>
            {institutionalUsers.length} Institutions Enrolled
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Institution Name</th>
                <th>Role Type</th>
                <th>Official License / Darpan Ref</th>
                <th>Simulated e-KYC Status</th>
                <th>Approval Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutionalUsers.map(inst => (
                <tr key={inst.id}>
                  <td>
                    <strong style={{ color: 'var(--primary-navy)' }}>{inst.institutionName || inst.name}</strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Contact: {inst.phone}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: inst.role === 'hospital' ? '#0D47A1' : inst.role === 'bloodbank' ? '#E53935' : '#10B981'
                    }}>
                      {inst.role}
                    </span>
                  </td>
                  <td>
                    <code style={{ color: 'var(--primary-navy)', background: '#F1F5F9', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.78rem' }}>
                      {inst.licenseNumber || 'PENDING-REG-01'}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Check size={13} /> {inst.simulatedKycRef} <span style={{ color: 'var(--text-muted)' }}>(Simulated)</span>
                    </span>
                  </td>
                  <td>
                    <StatusChip status={inst.verificationStatus} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn-success"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => verifyInstitution(inst.id, 'verified')}
                        title="Approve simulated institutional verification"
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', color: '#E53935', borderColor: '#FECACA' }}
                        onClick={() => verifyInstitution(inst.id, 'rejected')}
                        title="Reject verification"
                      >
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Tier SLA Escalation Timers Configuration */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--primary-navy)" />
              <h2 className="card-title">{t.admin.slaConfig}</h2>
            </div>
            <div className="card-desc">
              Automatic escalation timeout thresholds: If a tier does not fulfill the emergency in time, the system auto-promotes to the next tier.
            </div>
          </div>
        </div>

        <div className="grid-3">
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', borderTop: '3px solid #2979FF', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: '#2979FF', fontWeight: 800 }}>TIER 1 (NEARBY DONORS &lt;10KM)</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0.4rem 0' }}>
              {slaConfig.tier1DonorResponseSeconds}s <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Demo Window)</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Nearby ranked donors receive push alerts. If no acceptance within window, Tier 2 initiates.
            </p>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', borderTop: '3px solid #0D47A1', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: '#0D47A1', fontWeight: 800 }}>TIER 2 (CITY-WIDE COMMUNITY)</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0.4rem 0' }}>
              {slaConfig.tier2CityWideResponseSeconds}s <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Demo Window)</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Expands donor broadcast radius to 35 km city-wide with SMS fallback dispatch.
            </p>
          </div>

          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderTop: '3px solid #E53935', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: '#E53935', fontWeight: 800 }}>TIER 3 (BLOOD BANK STOCK BACKUP)</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C62828', margin: '0.4rem 0' }}>
              {slaConfig.tier3BankAllocationSeconds}s <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Demo Window)</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Auto-allocates cold storage reserve units from nearest partner blood center with courier dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Feature 5: Blood Demand Prediction & Regional Heatmap */}
      <BloodDemandHeatmap />

      {/* Embedded Audit Log Demo Component */}
      <AuditLogDemo />
    </div>
  );
};
