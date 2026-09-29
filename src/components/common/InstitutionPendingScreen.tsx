import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, ShieldAlert, FileText, CheckCircle2, RefreshCw, 
  LogOut, Building2, AlertCircle 
} from 'lucide-react';

export const InstitutionPendingScreen: React.FC = () => {
  const { currentUser, institutionSubmissions, refreshInstitutionStatus, signOutStaff } = useApp();
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<{ message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  const submission = institutionSubmissions.find(s => s.institutionId === currentUser?.id) || 
    institutionSubmissions[0];

  const facilityName = currentUser?.institutionName || currentUser?.name || 'Registered Institution';
  const roleType = currentUser?.role || 'hospital';
  const licenseNum = currentUser?.licenseNumber || submission?.licenseNumber || 'PENDING-REG';
  const licenseTypeLabel = submission?.licenseType 
    ? submission.licenseType.toUpperCase().replace('_', ' ') 
    : 'OPERATING LICENSE';
  const documentName = submission?.documentFileName || 'facility_license_document.pdf';

  const submissionDate = submission?.submittedAt 
    ? new Date(submission.submittedAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Recently submitted';

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setStatusFeedback(null);
    try {
      const updatedStatus = await refreshInstitutionStatus();
      if (updatedStatus === 'verified') {
        setStatusFeedback({
          type: 'success',
          message: 'Congratulations! Your institution has been verified. Redirecting to your operational dashboard...'
        });
      } else if (updatedStatus === 'rejected') {
        setStatusFeedback({
          type: 'alert',
          message: 'License verification was reviewed with revisions required. Loading status...'
        });
      } else {
        setStatusFeedback({
          type: 'info',
          message: 'Application is actively pending review by the National Directorate audit team.'
        });
      }
    } catch (err) {
      console.error('Error refreshing institution status:', err);
      setStatusFeedback({
        type: 'info',
        message: 'Application is undergoing administrative verification. Please check back shortly.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutStaff();
    } catch (err) {
      console.error('Error signing out staff:', err);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #BFDBFE',
        boxShadow: '0 10px 25px -5px rgba(13, 71, 161, 0.1), 0 8px 10px -6px rgba(13, 71, 161, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
          padding: '2rem',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            border: '2px solid rgba(255, 255, 255, 0.4)'
          }}>
            <Clock size={32} color="#FFFFFF" />
          </div>

          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(254, 243, 199, 0.25)',
            border: '1px solid #FCD34D',
            color: '#FEF3C7',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            marginBottom: '0.75rem'
          }}>
            INSTITUTIONAL AUDIT IN PROGRESS
          </span>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#FFFFFF' }}>
            Operating License Under Directorate Audit
          </h1>
          <p style={{ fontSize: '0.9rem', opacity: 0.9, maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
            Thank you for enrolling {facilityName} on the LifeLink National Grid. Your statutory license is pending clinical compliance audit.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '2rem' }}>
          {statusFeedback && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: statusFeedback.type === 'success' ? '#ECFDF5' : statusFeedback.type === 'alert' ? '#FEF2F2' : '#EFF6FF',
              border: `1px solid ${statusFeedback.type === 'success' ? '#A7F3D0' : statusFeedback.type === 'alert' ? '#FECACA' : '#BFDBFE'}`,
              color: statusFeedback.type === 'success' ? '#065F46' : statusFeedback.type === 'alert' ? '#991B1B' : '#1E40AF'
            }}>
              {statusFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{statusFeedback.message}</span>
            </div>
          )}

          {/* Submission Record Details Card */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Building2 size={16} /> Enrolment Dossier Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>INSTITUTION NAME</span>
                <strong style={{ color: 'var(--primary-navy)' }}>{facilityName}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>ROLE TYPE</span>
                <strong style={{ textTransform: 'uppercase', color: '#0D47A1' }}>{roleType}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>LICENSE NUMBER</span>
                <code style={{ background: '#E2E8F0', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>{licenseNum}</code>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>LICENSE TYPE</span>
                <span>{licenseTypeLabel}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>ATTACHED CERTIFICATE</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#0D47A1', fontWeight: 600 }}>
                  <FileText size={13} /> {documentName}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>SUBMISSION DATE</span>
                <span>{submissionDate}</span>
              </div>
            </div>
          </div>

          {/* Clinical Security Notice */}
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.75rem',
            fontSize: '0.8rem',
            color: '#92400E',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <ShieldAlert size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Why is institutional verification mandatory?</strong>
              <p style={{ margin: '0.25rem 0 0 0', lineHeight: 1.5, opacity: 0.9 }}>
                Under National Blood Transfusion Council regulations, hospital blood requests and central blood bank dispatch privileges require verified institutional licensure to safeguard recipient clinical safety.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              onClick={handleSignOut}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.15rem', fontSize: '0.85rem' }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>

            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}
            >
              <RefreshCw size={16} className={isChecking ? 'spin' : ''} />
              <span>{isChecking ? 'Checking Audit Status...' : 'Check Verification Status'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
