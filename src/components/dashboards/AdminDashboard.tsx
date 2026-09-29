import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLogDemo } from '../common/AuditLogDemo';
import { ShieldCheck, Clock, UserCheck, LogOut } from 'lucide-react';
import { BloodDemandHeatmap } from '../common/BloodDemandHeatmap';
import { DonorKycQueue } from '../common/DonorKycQueue';
import { InstitutionKycQueue } from '../common/InstitutionKycQueue';

export const AdminDashboard: React.FC = () => {
  const { kycSubmissions, institutionSubmissions, slaConfig, t, signOutStaff } = useApp();
  const [activeQueueTab, setActiveQueueTab] = useState<'donor' | 'institutional'>('donor');

  const pendingDonorCount = kycSubmissions.filter(s => s.status === 'pending').length;
  const pendingInstitutionCount = institutionSubmissions.filter(s => s.verificationStatus === 'pending').length;

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

          <button
            type="button"
            id="btn-admin-signout"
            onClick={signOutStaff}
            style={{
              fontSize: '0.82rem',
              padding: '0.48rem 0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#FFFFFF',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md)',
              color: '#DC2626',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Sign out of administrative account"
          >
            <LogOut size={15} color="#DC2626" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Verification Management Card with Tabs */}
      <div className="card">
        {/* Verification Queue Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.75rem 1.25rem',
          gap: '0.6rem',
          alignItems: 'center',
          background: '#F8FAFC',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
        }}>
          <button
            type="button"
            id="tab-donor-kyc-queue"
            onClick={() => setActiveQueueTab('donor')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: activeQueueTab === 'donor' ? '1px solid var(--primary-navy)' : '1px solid transparent',
              background: activeQueueTab === 'donor' ? 'var(--primary-navy)' : 'transparent',
              color: activeQueueTab === 'donor' ? '#FFFFFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <UserCheck size={15} />
            <span>Donor KYC Verification Queue</span>
            {pendingDonorCount > 0 ? (
              <span style={{
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)'
              }}>
                {pendingDonorCount} Pending
              </span>
            ) : (
              <span style={{
                background: activeQueueTab === 'donor' ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
                color: activeQueueTab === 'donor' ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)'
              }}>
                {kycSubmissions.length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="tab-institutional-queue"
            onClick={() => setActiveQueueTab('institutional')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              border: activeQueueTab === 'institutional' ? '1px solid var(--primary-navy)' : '1px solid transparent',
              background: activeQueueTab === 'institutional' ? 'var(--primary-navy)' : 'transparent',
              color: activeQueueTab === 'institutional' ? '#FFFFFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={15} />
            <span>Institutional Verification Queue</span>
            {pendingInstitutionCount > 0 ? (
              <span style={{
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)'
              }}>
                {pendingInstitutionCount} Pending
              </span>
            ) : (
              <span style={{
                background: activeQueueTab === 'institutional' ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
                color: activeQueueTab === 'institutional' ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)'
              }}>
                {institutionSubmissions.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Donor Government ID KYC Queue */}
        {activeQueueTab === 'donor' && (
          <div style={{ padding: '1.25rem' }}>
            <div className="card-header" style={{ padding: '0 0 1rem 0', borderBottom: 'none' }}>
              <div>
                <h2 className="card-title">Voluntary Donor Government e-KYC Queue</h2>
                <div className="card-desc">
                  Inspect government ID credentials (Aadhaar, Voter ID, Passport, DL) uploaded by voluntary donors. Approving verified donors unlocks availability dispatch and priority weighting.
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>
                {pendingDonorCount} Awaiting Review
              </span>
            </div>

            <DonorKycQueue reviewerRole="admin" reviewerName="Platform Directorate (Dr. Sharma)" />
          </div>
        )}

        {/* Tab 2: Institutional Verification Queue */}
        {activeQueueTab === 'institutional' && (
          <div style={{ padding: '1.25rem' }}>
            <div className="card-header" style={{ padding: '0 0 1rem 0', borderBottom: 'none' }}>
              <div>
                <h2 className="card-title">Institutional Operating License Queue</h2>
                <div className="card-desc">
                  Audit and approve statutory health operating licenses (NABH, CDSCO Form 28-C, State Transfusion Council, Darpan NGO) before granting clinical network and emergency broadcast privileges.
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>
                {pendingInstitutionCount} Awaiting Directorate Review
              </span>
            </div>

            <InstitutionKycQueue reviewerName="Platform Directorate (Dr. Sharma)" />
          </div>
        )}
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
