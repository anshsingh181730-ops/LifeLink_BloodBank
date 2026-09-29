import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InstitutionLicenseType } from '../../types';
import { 
  XCircle, AlertTriangle, UploadCloud, FileText, 
  LogOut, Building2, RefreshCw, AlertCircle 
} from 'lucide-react';

export const InstitutionRejectedScreen: React.FC = () => {
  const { currentUser, institutionSubmissions, resubmitInstitutionVerification, signOutStaff } = useApp();

  const [licenseType, setLicenseType] = useState<InstitutionLicenseType>('nabh');
  const [licenseNumber, setLicenseNumber] = useState<string>(currentUser?.licenseNumber || '');
  const [documentFile, setDocumentFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submission = institutionSubmissions.find(s => s.institutionId === currentUser?.id) || 
    institutionSubmissions[0];

  const facilityName = currentUser?.institutionName || currentUser?.name || 'Registered Institution';
  const rejectionReason = submission?.rejectionReason || 'Uploaded license documentation was expired, illegible, or failed clinical accreditation verification.';

  const handleFileUpload = (file: File) => {
    setErrorMessage(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Please upload a PDF, PNG, or JPEG certificate.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File exceeds maximum size limit of 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setDocumentFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: e.target?.result as string
      });
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file. Please try selecting the document again.');
    };
    reader.readAsDataURL(file);
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!licenseNumber.trim()) {
      setErrorMessage('Please enter your statutory license number.');
      return;
    }
    if (!documentFile) {
      setErrorMessage('Please upload your corrected license certificate.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resubmitInstitutionVerification({
        licenseType,
        licenseNumber: licenseNumber.trim(),
        documentFile
      });
    } catch (err: any) {
      console.error('Error resubmitting institution license:', err);
      setErrorMessage(err.message || 'Failed to resubmit license. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutStaff();
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
      background: 'linear-gradient(180deg, #F8FAFC 0%, #FEF2F2 100%)'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #FECACA',
        boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.1), 0 8px 10px -6px rgba(220, 38, 38, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
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
            <XCircle size={36} color="#FFFFFF" />
          </div>

          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            color: '#FFFFFF',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            marginBottom: '0.75rem'
          }}>
            LICENSING VERIFICATION REJECTED
          </span>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#FFFFFF' }}>
            Action Required: Resubmit License Certificate
          </h1>
          <p style={{ fontSize: '0.9rem', opacity: 0.9, maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
            The operating license application for {facilityName} was reviewed by the Directorate and requires revisions before network privileges can be granted.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '2rem' }}>
          {/* Rejection Reason Notice */}
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            gap: '0.85rem'
          }}>
            <AlertTriangle size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#991B1B', display: 'block', marginBottom: '0.25rem' }}>
                Directorate Audit Review Remarks:
              </strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#7F1D1D', lineHeight: 1.5 }}>
                {rejectionReason}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Resubmission Form */}
          <form onSubmit={handleResubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Building2 size={17} /> Resubmit Operating License Dossier
            </h2>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                Regulatory License Type *
              </label>
              <select
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value as InstitutionLicenseType)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem', background: '#FFFFFF' }}
              >
                <option value="nabh">NABH Hospital Accreditation Certificate</option>
                <option value="cdsco">CDSCO Form 28-C Blood Centre License</option>
                <option value="clinical_establishment">State Clinical Establishments Act Registration</option>
                <option value="state_transfusion_council">State Blood Transfusion Council (SBTC) Permit</option>
                <option value="darpan_ngo">NITI Aayog NGO Darpan Unique ID</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                Corrected License Number *
              </label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.04em' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                Upload Certified Document Scan * (PDF, PNG, JPG ≤ 10MB)
              </label>
              <div
                style={{
                  border: '2px dashed var(--border-subtle)',
                  background: '#FAFCFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('inst-resubmit-file-input')?.click()}
              >
                <input
                  id="inst-resubmit-file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {documentFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <FileText size={28} color="#0D47A1" />
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--primary-navy)', display: 'block' }}>
                        {documentFile.name}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {(documentFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={32} color="#0D47A1" style={{ margin: '0 auto 0.4rem auto' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block' }}>
                      Click to Browse Replacement Certificate
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Ensure license validity and regulatory authority stamps are legible
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
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
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}
              >
                {isSubmitting ? (
                  <span>Resubmitting to Directorate...</span>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Resubmit for Approval</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
