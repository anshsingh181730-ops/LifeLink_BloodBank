import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, ShieldAlert, FileText, CheckCircle2, RefreshCw, 
  LogOut, ShieldCheck, Calendar, User, Lock, AlertCircle, Heart
} from 'lucide-react';

export const DonorKycPendingScreen: React.FC = () => {
  const { currentUser, donorProfiles, kycSubmissions, refreshKycStatus, signOutDonor } = useApp();
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<{ message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  const profile = currentUser ? donorProfiles[currentUser.id] : undefined;
  const userSubmissions = kycSubmissions.filter(s => s.donorId === currentUser?.id);
  const latestSubmission = userSubmissions[0] || (currentUser?.simulatedKycRef ? kycSubmissions.find(s => s.id === currentUser.simulatedKycRef) : undefined);

  const donorName = currentUser?.name || 'Registered Donor';
  const maskedId = profile?.simulatedAadhaarMasked || latestSubmission?.idNumberMasked || 'XXXX-XXXX-****';
  const idTypeLabel = latestSubmission?.idType 
    ? latestSubmission.idType.replace('_', ' ').toUpperCase() 
    : profile?.idType 
    ? profile.idType.replace('_', ' ').toUpperCase() 
    : 'GOVERNMENT ID';
  const documentFileName = latestSubmission?.documentFileName || 'government_id_document.pdf';
  const submissionTimestamp = latestSubmission?.submittedAt 
    ? new Date(latestSubmission.submittedAt).toLocaleString('en-IN', {
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
      const updatedStatus = await refreshKycStatus();
      if (updatedStatus === 'verified') {
        setStatusFeedback({
          type: 'success',
          message: 'Congratulations! Your KYC verification has been approved. Redirecting to portal...'
        });
      } else if (updatedStatus === 'rejected') {
        setStatusFeedback({
          type: 'alert',
          message: 'Verification review completed with revisions required. Loading status...'
        });
      } else {
        setStatusFeedback({
          type: 'info',
          message: `Status re-checked at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}: Verification is still in progress with clinical staff.`
        });
      }
    } catch (err) {
      console.error('Error refreshing KYC status:', err);
      setStatusFeedback({
        type: 'info',
        message: 'Application is undergoing clinical verification. Please check back in a few minutes.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutDonor();
    } catch (err) {
      console.error('Error signing out:', err);
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
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: '0 20px 40px -15px rgba(13, 71, 161, 0.12), 0 0 0 1px rgba(13, 71, 161, 0.08)',
        overflow: 'hidden'
      }}>
        {/* Top Header Strip */}
        <div style={{
          background: 'linear-gradient(135deg, #0D47A1 0%, #1E3A8A 100%)',
          color: '#FFFFFF',
          padding: '2rem 2rem 1.75rem 2rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            padding: '0.35rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <ShieldCheck size={14} color="#60A5FA" />
            <span>Official LifeLink Donor Verification Queue</span>
          </div>

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#FEF3C7',
            border: '3px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            color: '#D97706',
            boxShadow: '0 8px 16px rgba(217, 119, 6, 0.2)'
          }}>
            <Clock size={32} />
          </div>

          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 0.4rem 0',
            letterSpacing: '-0.02em'
          }}>
            KYC Verification Under Review
          </h1>

          <p style={{
            fontSize: '0.9rem',
            color: '#DBEAFE',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: '1.5'
          }}>
            Thank you for volunteering to save lives. Your registration has been securely received and is awaiting authorization by clinical staff.
          </p>
        </div>

        {/* Status Banner / Feedback */}
        {statusFeedback && (
          <div style={{
            padding: '0.85rem 1.5rem',
            background: statusFeedback.type === 'success' ? '#F0FDF4' : statusFeedback.type === 'alert' ? '#FEF2F2' : '#EFF6FF',
            borderBottom: `1px solid ${statusFeedback.type === 'success' ? '#BBF7D0' : statusFeedback.type === 'alert' ? '#FECACA' : '#BFDBFE'}`,
            color: statusFeedback.type === 'success' ? '#166534' : statusFeedback.type === 'alert' ? '#991B1B' : '#1E40AF',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            {statusFeedback.type === 'success' ? (
              <CheckCircle2 size={17} color="#16A34A" />
            ) : statusFeedback.type === 'alert' ? (
              <AlertCircle size={17} color="#DC2626" />
            ) : (
              <RefreshCw size={17} color="#2563EB" className={isChecking ? 'animate-spin' : ''} />
            )}
            <span style={{ fontWeight: 600 }}>{statusFeedback.message}</span>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '2rem' }}>
          {/* Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '10px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#D97706',
                boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.2)'
              }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#92400E', display: 'block' }}>
                  Verification Status: Pending Staff Approval
                </strong>
                <span style={{ fontSize: '0.76rem', color: '#B45309' }}>
                  Awaiting review by NABH / CDSCO authorized blood bank staff
                </span>
              </div>
            </div>

            <span style={{
              background: '#FEF3C7',
              color: '#B45309',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              border: '1px solid #FCD34D'
            }}>
              Tier 1 Review
            </span>
          </div>

          {/* Submitted Details Grid */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid var(--border-subtle, #E2E8F0)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.75rem'
          }}>
            <h3 style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: 'var(--text-muted, #64748B)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <FileText size={14} />
              <span>Application Summary</span>
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem'
            }}>
              {/* Applicant Name */}
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Applicant Name
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={15} color="#0D47A1" />
                  <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{donorName}</strong>
                </div>
              </div>

              {/* Masked Government ID */}
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Government ID ({idTypeLabel})
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={15} color="#059669" />
                  <code style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    fontFamily: 'monospace',
                    background: '#EDF2F7',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}>
                    {maskedId}
                  </code>
                </div>
              </div>

              {/* Document Filename */}
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Submitted Document
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={15} color="#2563EB" />
                  <span style={{
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#1E40AF',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '220px'
                  }} title={documentFileName}>
                    {documentFileName}
                  </span>
                </div>
              </div>

              {/* Submission Timestamp */}
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Submission Timestamp
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} color="#D97706" />
                  <span style={{ fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                    {submissionTimestamp}
                  </span>
                </div>
              </div>
            </div>

            {profile?.bloodGroup && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Heart size={15} color="#DC2626" fill="#DC2626" />
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Registered Blood Group:</span>
                  <strong style={{ color: '#DC2626', fontSize: '0.9rem' }}>{profile.bloodGroup}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={14} />
                  <span>Document securely encrypted & hashed (DPDP Act 2023 compliant)</span>
                </div>
              </div>
            )}
          </div>

          {/* Compliance & Security Callout */}
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            fontSize: '0.82rem',
            color: '#1E40AF',
            lineHeight: '1.55'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', fontWeight: 800 }}>
              <ShieldAlert size={16} color="#2563EB" />
              <span>Portal Access Restriction Policy</span>
            </div>
            <span>
              Per the National Blood Transfusion Council regulations, donor matching and patient portal privileges are locked until an authorized medical reviewer verifies your government ID against public registries. Once verified, you will immediately gain full access to blood request matching and donor coordination.
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              id="btn-check-kyc-status"
              className="btn-primary"
              disabled={isChecking}
              onClick={handleCheckStatus}
              style={{
                flex: 2,
                minWidth: '220px',
                padding: '0.85rem 1.5rem',
                fontSize: '0.92rem',
                background: '#0D47A1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={17} className={isChecking ? 'animate-spin' : ''} />
              <span>{isChecking ? 'Checking Supabase Verification...' : 'Check Status'}</span>
            </button>

            <button
              type="button"
              id="btn-kyc-logout"
              className="btn-secondary"
              onClick={handleSignOut}
              style={{
                flex: 1,
                minWidth: '130px',
                padding: '0.85rem 1.25rem',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderColor: '#CBD5E1',
                color: '#475569'
              }}
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Bottom Clinical Help Notice */}
        <div style={{
          background: '#F8FAFC',
          borderTop: '1px solid var(--border-subtle, #E2E8F0)',
          padding: '0.9rem 2rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#64748B'
        }}>
          Need urgent assistance with your donor verification? Contact hospital transfusion desk at{' '}
          <strong style={{ color: '#0D47A1' }}>+91 (11) 2658-8500</strong> or email <strong style={{ color: '#0D47A1' }}>support@lifelink.gov.in</strong>
        </div>
      </div>
    </div>
  );
};
