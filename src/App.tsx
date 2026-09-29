import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { AIChatbot } from './components/common/AIChatbot';
import { EmergencyModal } from './components/common/EmergencyModal';
import { PublicDashboard } from './components/dashboards/PublicDashboard';
import { PatientDonorDashboard } from './components/dashboards/PatientDonorDashboard';
import { DonorKycPendingScreen } from './components/common/DonorKycPendingScreen';
import { DonorKycRejectedScreen } from './components/common/DonorKycRejectedScreen';
import { InstitutionPendingScreen } from './components/common/InstitutionPendingScreen';
import { InstitutionRejectedScreen } from './components/common/InstitutionRejectedScreen';
import { HospitalDashboard } from './components/dashboards/HospitalDashboard';
import { BloodBankDashboard } from './components/dashboards/BloodBankDashboard';
import { NgoDashboard } from './components/dashboards/NgoDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { Heart } from 'lucide-react';

const DashboardRenderer: React.FC = () => {
  const { currentRole, currentUser } = useApp();

  // Scroll to header level of the portal synchronously before browser paint
  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentRole]);

  // Secondary verification to ensure dynamic elements or asynchronous layout updates don't keep scroll position
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const frameId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    const timerId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
    };
  }, [currentRole]);

  switch (currentRole) {
    case 'public':
      return <PublicDashboard />;
    case 'patient':
    case 'donor': {
      // Route Guard for Patient & Donor Portal:
      // Unverified donors get NO access to PatientDonorDashboard until KYC approval
      const kycStatus = currentUser?.kycStatus || 'pending';
      if (kycStatus === 'pending') {
        return <DonorKycPendingScreen />;
      }
      if (kycStatus === 'rejected') {
        return <DonorKycRejectedScreen />;
      }
      return <PatientDonorDashboard />;
    }
    case 'hospital': {
      if (currentUser?.verificationStatus === 'pending') {
        return <InstitutionPendingScreen />;
      }
      if (currentUser?.verificationStatus === 'rejected') {
        return <InstitutionRejectedScreen />;
      }
      return <HospitalDashboard />;
    }
    case 'bloodbank': {
      if (currentUser?.verificationStatus === 'pending') {
        return <InstitutionPendingScreen />;
      }
      if (currentUser?.verificationStatus === 'rejected') {
        return <InstitutionRejectedScreen />;
      }
      return <BloodBankDashboard />;
    }
    case 'ngo': {
      if (currentUser?.verificationStatus === 'pending') {
        return <InstitutionPendingScreen />;
      }
      if (currentUser?.verificationStatus === 'rejected') {
        return <InstitutionRejectedScreen />;
      }
      return <NgoDashboard />;
    }
    case 'admin':
      return <AdminDashboard />;
    default:
      return <PublicDashboard />;
  }
};

export const AppContent: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <DashboardRenderer />
      </main>

      <AIChatbot />
      <EmergencyModal />

      {/* Footer with Modern Clinical & Data styling */}
      <footer className="app-footer" style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '2.5rem 1.75rem',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          <div style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-navy)', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.4rem' }}>
              <Heart size={18} fill="#0D47A1" color="#0D47A1" />
              {t.footer.title}
            </div>
            <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              {t.footer.desc}
            </p>
            <span style={{ display: 'block', marginTop: '0.6rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {t.footer.themeNotice}
            </span>
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>{t.footer.ecosystem}</div>
            <ul style={{ listStyle: 'none', lineHeight: '1.8' }}>
              <li>• e-RaktKosh / C-DAC System of Record</li>
              <li>• ABHA / Aadhaar e-KYC (Simulated)</li>
              <li>• CDSCO & State Blood Transfusion Councils</li>
              <li>• SMS & WhatsApp Dual-Alerting Gateway</li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>{t.footer.standards}</div>
            <ul style={{ listStyle: 'none', lineHeight: '1.8' }}>
              <li>• Digital Personal Data Protection (DPDP) Act 2023</li>
              <li>• Least Privilege & Purpose Limitation Matrix</li>
              <li>• WCAG AA Contrast & Low-Bandwidth Optimizations</li>
              <li>• ISO 15189 / ISBT-128 Traceability Standard</li>
            </ul>
          </div>
        </div>

        <div style={{
          maxWidth: '1280px',
          margin: '1.75rem auto 0 auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          {t.footer.copyright}
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
