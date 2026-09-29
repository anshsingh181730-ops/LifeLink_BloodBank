import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DonorKycSubmission } from '../../types';
import { 
  ShieldCheck, Check, X, Clock, FileText, Eye, 
  Lock, Search, ShieldAlert, LogIn, LogOut, AlertCircle,
  ExternalLink, Download
} from 'lucide-react';

const base64ToBlobUrl = (dataUrl: string): string | null => {
  try {
    if (!dataUrl) return null;
    if (!dataUrl.startsWith('data:')) return dataUrl;
    const parts = dataUrl.split(',');
    if (parts.length < 2) return dataUrl;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binaryStr = atob(parts[1]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error generating Blob URL from base64:', err);
    return null;
  }
};

interface DonorKycQueueProps {
  reviewerRole?: 'admin' | 'hospital';
  reviewerName?: string;
}

export const DonorKycQueue: React.FC<DonorKycQueueProps> = ({ 
  reviewerRole: _reviewerRole = 'admin',
  reviewerName = 'Clinical Platform Directorate'
}) => {
  const { 
    kycSubmissions, 
    approveDonorKyc, 
    rejectDonorKyc, 
    isStaffAuthenticated, 
    currentUser, 
    signInStaff, 
    signOutStaff 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewSubmission, setPreviewSubmission] = useState<DonorKycSubmission | null>(null);
  const [rejectingSubmission, setRejectingSubmission] = useState<DonorKycSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Uploaded document is unreadable or blurry');
  const [customReason, setCustomReason] = useState<string>('');

  const [actionError, setActionError] = useState<string | null>(null);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState<boolean>(false);
  const [staffEmail, setStaffEmail] = useState<string>('');
  const [staffPassword, setStaffPassword] = useState<string>('');
  const [staffLoginError, setStaffLoginError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const pendingCount = kycSubmissions.filter(s => s.status === 'pending').length;
  const verifiedCount = kycSubmissions.filter(s => s.status === 'verified').length;
  const rejectedCount = kycSubmissions.filter(s => s.status === 'rejected').length;

  // Filter submissions by status and search query
  const filteredSubmissions = kycSubmissions.filter(s => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch = !searchQuery.trim() || 
      s.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.donorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.idNumberMasked.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.idType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (submission: DonorKycSubmission) => {
    setActionError(null);
    try {
      await approveDonorKyc(submission.id, reviewerName);
      if (previewSubmission?.id === submission.id) {
        setPreviewSubmission(null);
      }
    } catch (err: any) {
      console.error('Failed to approve donor KYC:', err);
      setActionError(err?.message || 'Failed to approve donor KYC. Ensure an authorized staff account is signed in.');
    }
  };

  const handleOpenRejectModal = (submission: DonorKycSubmission) => {
    setRejectingSubmission(submission);
    setRejectionReason('Uploaded document is unreadable or blurry');
    setCustomReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingSubmission) return;
    const finalReason = customReason.trim() ? customReason.trim() : rejectionReason;
    setActionError(null);
    try {
      await rejectDonorKyc(rejectingSubmission.id, finalReason, reviewerName);
      setRejectingSubmission(null);
      if (previewSubmission?.id === rejectingSubmission.id) {
        setPreviewSubmission(null);
      }
    } catch (err: any) {
      console.error('Failed to reject donor KYC:', err);
      setActionError(err?.message || 'Failed to reject donor KYC. Ensure an authorized staff account is signed in.');
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoginError(null);
    if (!staffEmail.trim() || !staffPassword) {
      setStaffLoginError('Please enter both email and password.');
      return;
    }
    setIsSigningIn(true);
    try {
      await signInStaff(staffEmail.trim(), staffPassword);
      setIsStaffLoginOpen(false);
      setStaffPassword('');
      setActionError(null);
    } catch (err: any) {
      console.error('Staff login error:', err);
      setStaffLoginError(err?.message || 'Invalid staff credentials.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleStaffSignOut = async () => {
    try {
      await signOutStaff();
      setActionError(null);
    } catch (err) {
      console.error('Failed to sign out staff:', err);
    }
  };

  const formatIdTypeLabel = (type: string) => {
    switch (type) {
      case 'aadhaar': return 'Aadhaar Card';
      case 'voter_id': return 'Voter ID';
      case 'passport': return 'Indian Passport';
      case 'driving_license': return 'Driving License';
      default: return type.toUpperCase();
    }
  };

  return (
    <div>
      {/* Staff Supabase Authentication Bar */}
      <div style={{
        background: isStaffAuthenticated ? '#F0FDF4' : '#FFFBEB',
        border: `1px solid ${isStaffAuthenticated ? '#BBF7D0' : '#FDE68A'}`,
        borderRadius: 'var(--radius-md)',
        padding: '0.65rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem',
        fontSize: '0.8rem'
      }}>
        {isStaffAuthenticated ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534' }}>
              <ShieldCheck size={18} color="#16A34A" />
              <span>
                <strong>Authenticated Staff Session:</strong> {currentUser.email} &bull; Role: <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{currentUser.role}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleStaffSignOut}
              style={{
                background: 'none',
                border: '1px solid #FECACA',
                color: '#DC2626',
                borderRadius: 'var(--radius-sm)',
                padding: '0.25rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <LogOut size={13} />
              <span>Sign Out Staff</span>
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400E' }}>
              <Lock size={16} color="#D97706" />
              <span>
                <strong>Staff Sign-in Required:</strong> Database approval/rejection requires an authenticated Supabase staff session (Admin or Hospital). Demo accounts are simulated.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStaffLoginError(null);
                setIsStaffLoginOpen(true);
              }}
              style={{
                background: 'var(--primary-navy)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <LogIn size={14} />
              <span>Staff Sign In (Supabase)</span>
            </button>
          </>
        )}
      </div>

      {/* Action Error Alert Banner */}
      {actionError && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          color: '#991B1B',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="#DC2626" style={{ flexShrink: 0 }} />
            <span><strong>Operation Blocked:</strong> {actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 800 }}
            title="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'pending', label: 'Pending Review', count: pendingCount, color: '#D97706' },
            { key: 'all', label: 'All Submissions', count: kycSubmissions.length, color: 'var(--primary-navy)' },
            { key: 'verified', label: 'Verified', count: verifiedCount, color: '#10B981' },
            { key: 'rejected', label: 'Rejected', count: rejectedCount, color: '#DC2626' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as any)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: statusFilter === tab.key ? 700 : 500,
                border: statusFilter === tab.key ? `1px solid ${tab.color}` : '1px solid var(--border-subtle)',
                background: statusFilter === tab.key ? 'rgba(13, 71, 161, 0.08)' : '#FFFFFF',
                color: statusFilter === tab.key ? 'var(--primary-navy)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: statusFilter === tab.key ? tab.color : '#E2E8F0',
                color: statusFilter === tab.key ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.05rem 0.4rem',
                borderRadius: 'var(--radius-full)'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Search Input */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search donor, email, ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.65rem 0.4rem 2rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem'
            }}
          />
        </div>
      </div>

      {/* Submissions Table */}
      {filteredSubmissions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1rem',
          background: '#F8FAFC',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-subtle)'
        }}>
          <ShieldCheck size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
          <strong style={{ display: 'block', color: 'var(--primary-navy)', fontSize: '0.9rem' }}>
            No KYC submissions found
          </strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {statusFilter === 'pending' ? 'All donor registration submissions have been audited.' : 'No records match the selected filter.'}
          </span>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Donor Information</th>
                <th>Blood Group</th>
                <th>Government ID Type</th>
                <th>Masked ID Number</th>
                <th>Uploaded Document</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Reviewer Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <strong style={{ color: 'var(--primary-navy)' }}>{sub.donorName}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                      <span>{sub.donorEmail}</span> • <span>{sub.donorPhone}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{
                      background: '#FEF2F2',
                      color: '#B91C1C',
                      border: '1px solid #FECACA',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {sub.bloodGroup}
                    </span>
                  </td>

                  <td>
                    <span style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: 'var(--primary-navy)',
                      background: '#F1F5F9',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {formatIdTypeLabel(sub.idType)}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary-navy)' }}>
                      <Lock size={12} color="#0D47A1" />
                      <span>{sub.idNumberMasked}</span>
                    </div>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => setPreviewSubmission(sub)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        border: '1px solid var(--secondary-blue-border)',
                        background: 'var(--secondary-blue-light)',
                        color: 'var(--primary-navy)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title="Inspect government identification document"
                    >
                      <Eye size={13} color="#2563EB" />
                      <span>View Proof</span>
                    </button>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </td>

                  <td>
                    {sub.status === 'verified' ? (
                      <span style={{
                        background: '#DCFCE7',
                        color: '#166534',
                        border: '1px solid #BBF7D0',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <Check size={12} strokeWidth={3} /> Verified
                      </span>
                    ) : sub.status === 'rejected' ? (
                      <span style={{
                        background: '#FEE2E2',
                        color: '#991B1B',
                        border: '1px solid #FECACA',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }} title={sub.rejectionReason}>
                        <X size={12} strokeWidth={3} /> Rejected
                      </span>
                    ) : (
                      <span style={{
                        background: '#FEF3C7',
                        color: '#B45309',
                        border: '1px solid #FCD34D',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <Clock size={12} /> Pending Review
                      </span>
                    )}
                  </td>

                  <td>
                    {sub.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn-success"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          onClick={() => handleApprove(sub)}
                          title="Approve Government ID and activate donor availability"
                        >
                          <Check size={13} strokeWidth={2.5} /> Approve
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            padding: '0.3rem 0.65rem',
                            fontSize: '0.74rem',
                            color: '#DC2626',
                            borderColor: '#FECACA',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          onClick={() => handleOpenRejectModal(sub)}
                          title="Reject identification document with audit explanation"
                        >
                          <X size={13} strokeWidth={2.5} /> Reject
                        </button>
                      </div>
                    ) : sub.status === 'verified' ? (
                      <span style={{ fontSize: '0.72rem', color: '#166534' }}>
                        Approved by {sub.reviewedBy || 'Staff'}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#B91C1C' }} title={sub.rejectionReason}>
                        Reason: {sub.rejectionReason?.slice(0, 24)}...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Preview & Review Modal */}
      {previewSubmission && (
        <div className="modal-overlay" onClick={() => setPreviewSubmission(null)} style={{ zIndex: 1200 }}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto' }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ background: 'var(--primary-navy)', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldCheck size={22} color="#60A5FA" />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    Government ID Review: {previewSubmission.donorName}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#BFDBFE' }}>
                    {formatIdTypeLabel(previewSubmission.idType)} • Restricted Access Document
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewSubmission(null)} 
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
              {/* Donor Summary Info */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Blood Group</span>
                  <strong style={{ color: 'var(--primary-crimson)', fontSize: '0.95rem' }}>{previewSubmission.bloodGroup}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Masked ID</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--primary-navy)' }}>{previewSubmission.idNumberMasked}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Date of Birth</span>
                  <strong>{previewSubmission.dateOfBirth || 'Registered'}</strong>
                </div>
              </div>

              {/* Document Viewing Box */}
              {(() => {
                const docUrl = previewSubmission.documentUrl || '';
                const isImage = docUrl.startsWith('data:image') || 
                  previewSubmission.documentFileType?.includes('image') || 
                  Boolean(previewSubmission.documentFileName?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i));
                
                const isPdf = docUrl.startsWith('data:application/pdf') || 
                  previewSubmission.documentFileType?.includes('pdf') || 
                  Boolean(previewSubmission.documentFileName?.match(/\.pdf$/i));

                const fileName = previewSubmission.documentFileName || (isPdf ? 'government_id.pdf' : 'government_id.jpg');

                const handleOpenDocument = () => {
                  if (!docUrl) return;
                  try {
                    const blobUrl = base64ToBlobUrl(docUrl);
                    if (blobUrl) {
                      const w = window.open(blobUrl, '_blank', 'noopener,noreferrer');
                      if (!w) {
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.click();
                      }
                    } else {
                      window.open(docUrl, '_blank');
                    }
                  } catch (e) {
                    console.error('Error opening document:', e);
                  }
                };

                const handleDownloadDocument = () => {
                  if (!docUrl) return;
                  try {
                    const blobUrl = base64ToBlobUrl(docUrl) || docUrl;
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } catch (e) {
                    console.error('Error downloading document:', e);
                  }
                };

                return (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{
                      background: '#0F172A',
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F8FAFC' }}>
                        <FileText size={16} color="#60A5FA" />
                        <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{fileName}</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                          ({((previewSubmission.documentFileSize || 0) / 1024).toFixed(0)} KB • {isPdf ? 'PDF Proof' : isImage ? 'Image Scan' : 'Document'})
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          id="btn-open-doc-full"
                          onClick={handleOpenDocument}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            background: '#2563EB',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <ExternalLink size={13} />
                          <span>Open Full Document</span>
                        </button>

                        <button
                          type="button"
                          id="btn-download-doc-file"
                          onClick={handleDownloadDocument}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            background: 'rgba(255, 255, 255, 0.12)',
                            color: '#F1F5F9',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>

                    <div style={{
                      background: '#0B1120',
                      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                      padding: '1rem',
                      textAlign: 'center',
                      minHeight: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {isImage ? (
                        <img
                          src={docUrl}
                          alt="Government ID Scan"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '400px',
                            borderRadius: 'var(--radius-sm)',
                            objectFit: 'contain',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)'
                          }}
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const fallback = document.getElementById('img-doc-fallback');
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                      ) : isPdf ? (
                        <div style={{ width: '100%', height: '420px', position: 'relative' }}>
                          <iframe
                            src={docUrl}
                            title="Government ID PDF Proof"
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              background: '#FFFFFF'
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ color: '#FFFFFF', padding: '2rem 1rem' }}>
                          <FileText size={48} color="#60A5FA" style={{ margin: '0 auto 0.75rem auto' }} />
                          <strong style={{ display: 'block', fontSize: '0.95rem' }}>{fileName}</strong>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                            Base64 document data ready for inspection
                          </span>
                          <button
                            type="button"
                            onClick={handleOpenDocument}
                            style={{
                              marginTop: '1rem',
                              padding: '0.45rem 1rem',
                              background: '#2563EB',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Open in New Tab
                          </button>
                        </div>
                      )}

                      <div id="img-doc-fallback" style={{ display: 'none', color: '#EF4444', padding: '1rem' }}>
                        <AlertCircle size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                        <span style={{ fontSize: '0.85rem' }}>Document scan could not be previewed inline.</span>
                        <div style={{ marginTop: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={handleDownloadDocument}
                            style={{
                              padding: '0.35rem 0.85rem',
                              background: '#EF4444',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Download Raw Document
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Privacy Notice */}
              <div style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.74rem',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <Lock size={14} style={{ flexShrink: 0 }} />
                <span>
                  Least Privilege View: Only authenticated staff can inspect documents. Per DPDP Act 2023, downloading raw ID scans is audited.
                </span>
              </div>

              {/* Decision Actions */}
              <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setPreviewSubmission(null)}
                  style={{ padding: '0.55rem 1.15rem', fontSize: '0.82rem' }}
                >
                  Close
                </button>

                {previewSubmission.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{
                        padding: '0.55rem 1.15rem',
                        fontSize: '0.82rem',
                        color: '#DC2626',
                        borderColor: '#FECACA'
                      }}
                      onClick={() => handleOpenRejectModal(previewSubmission)}
                    >
                      <X size={15} />
                      <span>Reject Document</span>
                    </button>

                    <button
                      type="button"
                      className="btn-success"
                      style={{ padding: '0.55rem 1.4rem', fontSize: '0.82rem' }}
                      onClick={() => handleApprove(previewSubmission)}
                    >
                      <Check size={15} strokeWidth={2.5} />
                      <span>Approve & Unlock Donor</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject with Reason Modal */}
      {rejectingSubmission && (
        <div className="modal-overlay" onClick={() => setRejectingSubmission(null)} style={{ zIndex: 1300 }}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '500px' }}
          >
            <div className="modal-header" style={{ background: '#DC2626', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldAlert size={22} color="#FFFFFF" />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    Reject Government ID Verification
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#FEE2E2' }}>
                    Donor: {rejectingSubmission.donorName} ({rejectingSubmission.idNumberMasked})
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setRejectingSubmission(null)} 
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                Select Rejection Reason *
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                {[
                  'Uploaded document is unreadable or blurry',
                  'Name on government ID does not match donor account',
                  'Document has expired or is invalid',
                  'ID number does not match uploaded document format',
                  'Underage / Date of birth does not match record'
                ].map(reason => (
                  <label
                    key={reason}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                      padding: '0.45rem 0.75rem',
                      background: rejectionReason === reason && !customReason ? 'rgba(220, 38, 38, 0.08)' : '#F8FAFC',
                      border: rejectionReason === reason && !customReason ? '1px solid #DC2626' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="rejection-reason"
                      checked={rejectionReason === reason && !customReason}
                      onChange={() => {
                        setRejectionReason(reason);
                        setCustomReason('');
                      }}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                Or Provide Custom Feedback to Donor
              </label>
              <textarea
                placeholder="Enter specific audit remarks (will be visible to donor in their portal)..."
                rows={3}
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  fontFamily: 'inherit'
                }}
              />

              <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setRejectingSubmission(null)}
                  style={{ padding: '0.55rem 1.15rem', fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleConfirmReject}
                  style={{
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.82rem',
                    background: '#DC2626',
                    borderColor: '#DC2626'
                  }}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Sign-In Modal */}
      {isStaffLoginOpen && (
        <div className="modal-overlay" onClick={() => setIsStaffLoginOpen(false)} style={{ zIndex: 1400 }}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '440px' }}
          >
            <div className="modal-header" style={{ background: 'var(--primary-navy)', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#60A5FA" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Staff Sign In (Admin / Hospital)
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsStaffLoginOpen(false)} 
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStaffLogin}>
              <div className="modal-body" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Sign in with an authorized clinical or administrative Supabase account to perform live KYC audit decisions.
                </p>

                {staffLoginError && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.78rem',
                    color: '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}>
                    <AlertCircle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                    <span>{staffLoginError}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                    Staff Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@lifelink.in"
                    value={staffEmail}
                    onChange={e => setStaffEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter account password"
                    value={staffPassword}
                    onChange={e => setStaffPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsStaffLoginOpen(false)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSigningIn}
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}
                  >
                    {isSigningIn ? 'Signing In...' : 'Sign In as Staff'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
