import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  XCircle, AlertTriangle, UploadCloud, CheckCircle2, 
  LogOut, ShieldAlert, X
} from 'lucide-react';
import { GovIdType } from '../../types';

export const DonorKycRejectedScreen: React.FC = () => {
  const { currentUser, kycSubmissions, resubmitDonorKyc, signOutDonor } = useApp();

  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState<boolean>(false);
  const [idType, setIdType] = useState<GovIdType>('aadhaar');
  const [idNumber, setIdNumber] = useState<string>('');
  const [documentFile, setDocumentFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [dpdpConsent, setDpdpConsent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userSubmissions = kycSubmissions.filter(s => s.donorId === currentUser?.id);
  const latestSubmission = userSubmissions[0] || (currentUser?.simulatedKycRef ? kycSubmissions.find(s => s.id === currentUser.simulatedKycRef) : undefined);

  const donorName = currentUser?.name || 'Registered Donor';
  const rejectionReason = latestSubmission?.rejectionReason || 
    'The uploaded document photo was blurry or could not be matched with official government records. Please ensure your name and ID digits are clearly legible.';
  const reviewerName = latestSubmission?.reviewedBy || 'Authorized Medical Staff';
  const reviewTime = latestSubmission?.reviewedAt 
    ? new Date(latestSubmission.reviewedAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Recently reviewed';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5MB limit. Please upload a compressed JPG, PNG, or PDF.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file format. Please upload JPG, PNG, WebP, or PDF.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      setDocumentFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber.trim()) {
      setErrorMessage('Please enter your government ID number.');
      return;
    }
    if (idType === 'aadhaar' && idNumber.replace(/\D/g, '').length !== 12) {
      setErrorMessage('Aadhaar number must contain exactly 12 digits.');
      return;
    }
    if (!documentFile) {
      setErrorMessage('Please upload a clear scan or photo of your Government ID.');
      return;
    }
    if (!dpdpConsent) {
      setErrorMessage('Consent to DPDP Act 2023 verification terms is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await resubmitDonorKyc({
        idType,
        idNumber: idNumber.trim(),
        documentFile
      });
      setIsResubmitModalOpen(false);
    } catch (err: any) {
      console.error('Failed to resubmit donor KYC:', err);
      setErrorMessage(err.message || 'Failed to submit document. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      background: 'linear-gradient(180deg, #FEF2F2 0%, #FFF1F2 100%)'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: '0 20px 40px -15px rgba(220, 38, 38, 0.15), 0 0 0 1px rgba(220, 38, 38, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)',
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
            <ShieldAlert size={14} color="#FCA5A5" />
            <span>Verification Status: Action Required</span>
          </div>

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#FEE2E2',
            border: '3px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            color: '#DC2626',
            boxShadow: '0 8px 16px rgba(220, 38, 38, 0.2)'
          }}>
            <XCircle size={34} />
          </div>

          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 0.4rem 0',
            letterSpacing: '-0.02em'
          }}>
            Government ID Verification Rejected
          </h1>

          <p style={{
            fontSize: '0.9rem',
            color: '#FECDD3',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: '1.5'
          }}>
            Your voluntary donor submission could not be verified by hospital clinical reviewers. Portal privileges remain locked until valid credentials are provided.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '2rem' }}>
          {/* Reason for Rejection Box */}
          <div style={{
            background: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertTriangle size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#991B1B', display: 'block', marginBottom: '0.35rem' }}>
                  Reviewer's Stated Reason for Rejection:
                </strong>
                <p style={{
                  fontSize: '0.88rem',
                  color: '#7F1D1D',
                  lineHeight: '1.6',
                  margin: 0,
                  background: '#FFFFFF',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #FECACA'
                }}>
                  "{rejectionReason}"
                </p>
                <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span>Reviewed by: <strong>{reviewerName}</strong></span>
                  <span>Date: <strong>{reviewTime}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines on Resubmission */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.75rem'
          }}>
            <h3 style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 0.75rem 0'
            }}>
              Tips for Faster Approval on Resubmission:
            </h3>
            <ul style={{
              fontSize: '0.84rem',
              color: '#334155',
              paddingLeft: '1.25rem',
              margin: 0,
              lineHeight: '1.7'
            }}>
              <li>Ensure the entire document (all 4 corners) is visible without glares or shadows.</li>
              <li>Your name on the ID must match your registered name (<strong>{donorName}</strong>).</li>
              <li>Aadhaar, Voter ID, Passport, or Driving License must be officially issued and unexpired.</li>
              <li>Upload a high-resolution JPG or PDF file (up to 5MB).</li>
            </ul>
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
              id="btn-resubmit-gov-id"
              className="btn-primary"
              onClick={() => setIsResubmitModalOpen(true)}
              style={{
                flex: 2,
                minWidth: '220px',
                padding: '0.85rem 1.5rem',
                fontSize: '0.92rem',
                background: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <UploadCloud size={18} />
              <span>Resubmit Government ID</span>
            </button>

            <button
              type="button"
              id="btn-rejected-logout"
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

        {/* Resubmission Modal */}
        {isResubmitModalOpen && (
          <div className="modal-overlay" onClick={() => setIsResubmitModalOpen(false)} style={{ zIndex: 1200 }}>
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()} 
              style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="modal-header" style={{ background: '#0D47A1', color: '#FFFFFF', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <UploadCloud size={22} color="#60A5FA" />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                      Resubmit Government ID
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#BFDBFE' }}>
                      Updates your verification status to Pending Review
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResubmitModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleResubmit} style={{ padding: '1.5rem' }}>
                {errorMessage && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertTriangle size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ID Type Selection */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="resubmit-id-type">Select Government ID Type *</label>
                  <select
                    id="resubmit-id-type"
                    className="form-select"
                    value={idType}
                    onChange={(e) => setIdType(e.target.value as GovIdType)}
                  >
                    <option value="aadhaar">Aadhaar Card (12 Digits UID)</option>
                    <option value="voter_id">Election Commission Voter ID</option>
                    <option value="passport">Indian Passport</option>
                    <option value="driving_license">State Driving License</option>
                  </select>
                </div>

                {/* ID Number */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="resubmit-id-number">
                    {idType === 'aadhaar' ? 'Aadhaar Number (12 Digits) *' : 'Government Document Number *'}
                  </label>
                  <input
                    id="resubmit-id-number"
                    type="text"
                    required
                    className="form-input"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder={idType === 'aadhaar' ? 'e.g. 5421 8912 3456' : 'e.g. DL-1420110012345'}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    🔒 Document number is masked immediately upon storage.
                  </span>
                </div>

                {/* Document File Upload */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Upload New Document Scan/Photo *</label>
                  <div style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <input
                      type="file"
                      id="resubmit-doc-file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleFileUpload}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    {documentFile ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#166534' }}>
                        <CheckCircle2 size={20} color="#16A34A" />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.85rem' }}>{documentFile.name}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                            ({(documentFile.size / 1024).toFixed(1)} KB) • Ready to upload
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={30} color="#0D47A1" style={{ margin: '0 auto 0.5rem auto' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0D47A1', display: 'block' }}>
                          Click to browse or drag & drop fresh ID document
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                          Supports JPG, PNG, WebP, or PDF (Max 5MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* DPDP Consent Checkbox */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <input
                    type="checkbox"
                    id="resubmit-dpdp-consent"
                    checked={dpdpConsent}
                    onChange={(e) => setDpdpConsent(e.target.checked)}
                    style={{ marginTop: '2px', cursor: 'pointer' }}
                  />
                  <label htmlFor="resubmit-dpdp-consent" style={{ fontSize: '0.75rem', color: '#0369A1', lineHeight: '1.45', cursor: 'pointer' }}>
                    I hereby certify under the DPDP Act 2023 that the uploaded document belongs to me (<strong>{donorName}</strong>) and authorize hospital transfusion staff to re-verify this document for voluntary donor safety.
                  </label>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setIsResubmitModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting || !documentFile || !dpdpConsent}
                    style={{
                      flex: 2,
                      background: '#0D47A1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      opacity: (isSubmitting || !documentFile || !dpdpConsent) ? 0.6 : 1
                    }}
                  >
                    {isSubmitting ? (
                      <span>Submitting New Document...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Submit for Re-Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
