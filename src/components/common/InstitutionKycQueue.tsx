import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InstitutionVerificationSubmission, InstitutionType } from '../../types';
import { 
  Check, X, Clock, FileText, Eye, 
  Search, ShieldAlert, AlertCircle, Building2, Landmark, 
  Users, ExternalLink, Download, CheckCircle2, XCircle
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

interface InstitutionKycQueueProps {
  reviewerName?: string;
}

export const InstitutionKycQueue: React.FC<InstitutionKycQueueProps> = ({ 
  reviewerName = 'Platform Directorate (Dr. Sharma)'
}) => {
  const { 
    institutionSubmissions, 
    approveInstitutionVerification, 
    rejectInstitutionVerification,
    isStaffAuthenticated
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | InstitutionType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewSubmission, setPreviewSubmission] = useState<InstitutionVerificationSubmission | null>(null);
  const [rejectingSubmission, setRejectingSubmission] = useState<InstitutionVerificationSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Uploaded operating certificate is expired or past validity date');
  const [customReason, setCustomReason] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  const pendingCount = institutionSubmissions.filter(s => s.verificationStatus === 'pending').length;
  const verifiedCount = institutionSubmissions.filter(s => s.verificationStatus === 'verified').length;
  const rejectedCount = institutionSubmissions.filter(s => s.verificationStatus === 'rejected').length;

  const filteredSubmissions = institutionSubmissions.filter(s => {
    const matchesStatus = statusFilter === 'all' || s.verificationStatus === statusFilter;
    const matchesType = typeFilter === 'all' || s.institutionType === typeFilter;
    const matchesSearch = !searchQuery.trim() || 
      s.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nodalOfficerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.licenseType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleApprove = async (submission: InstitutionVerificationSubmission) => {
    setActionError(null);
    setIsSubmittingAction(true);
    try {
      await approveInstitutionVerification(submission.id, reviewerName);
      if (previewSubmission?.id === submission.id) {
        setPreviewSubmission(null);
      }
    } catch (err: any) {
      console.error('Failed to approve institution verification:', err);
      setActionError(err?.message || 'Failed to approve operating license. Ensure you have authorized administrative permissions.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOpenRejectModal = (submission: InstitutionVerificationSubmission) => {
    setRejectingSubmission(submission);
    setRejectionReason('Uploaded operating certificate is expired or past validity date');
    setCustomReason('');
    setActionError(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectingSubmission) return;
    const finalReason = rejectionReason === 'Other' 
      ? (customReason.trim() || 'Operating documentation did not meet National Directorate compliance guidelines.')
      : rejectionReason;

    setActionError(null);
    setIsSubmittingAction(true);
    try {
      await rejectInstitutionVerification(rejectingSubmission.id, finalReason, reviewerName);
      if (previewSubmission?.id === rejectingSubmission.id) {
        setPreviewSubmission(null);
      }
      setRejectingSubmission(null);
    } catch (err: any) {
      console.error('Failed to reject institution verification:', err);
      setActionError(err?.message || 'Failed to record rejection. Ensure you have authorized administrative permissions.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const getRoleIcon = (type: InstitutionType) => {
    switch (type) {
      case 'hospital': return <Building2 size={16} color="#0D47A1" />;
      case 'bloodbank': return <Landmark size={16} color="#DC2626" />;
      case 'ngo': return <Users size={16} color="#059669" />;
      default: return <Building2 size={16} />;
    }
  };

  const getLicenseTypeLabel = (lt: string): string => {
    switch (lt) {
      case 'nabh': return 'NABH Hospital Accreditation';
      case 'cdsco': return 'CDSCO Blood Centre Form 28-C';
      case 'clinical_establishment': return 'Clinical Establishments Act';
      case 'state_transfusion_council': return 'State Blood Transfusion Council';
      case 'darpan_ngo': return 'NITI Aayog NGO Darpan';
      default: return lt.toUpperCase().replace('_', ' ');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner / Permission State Notice */}
      {!isStaffAuthenticated && (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.82rem',
          color: '#92400E'
        }}>
          <ShieldAlert size={20} color="#D97706" style={{ flexShrink: 0 }} />
          <div>
            <strong>Platform Directorate Audit Mode:</strong> You are evaluating institutional operating licenses. Approval writes directly to Supabase with automated role verification and DPDP audit trail logging.
          </div>
        </div>
      )}

      {actionError && (
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.82rem',
          color: '#B91C1C'
        }}>
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'pending', label: 'Pending Review', count: pendingCount, color: '#D97706', bg: '#FEF3C7' },
            { id: 'verified', label: 'Verified', count: verifiedCount, color: '#059669', bg: '#D1FAE5' },
            { id: 'rejected', label: 'Rejected', count: rejectedCount, color: '#DC2626', bg: '#FEE2E2' },
            { id: 'all', label: 'All Submissions', count: institutionSubmissions.length, color: 'var(--text-secondary)', bg: '#F1F5F9' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              id={`inst-filter-${f.id}`}
              onClick={() => setStatusFilter(f.id as any)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: statusFilter === f.id ? '2px solid var(--primary-navy)' : '1px solid var(--border-subtle)',
                background: statusFilter === f.id ? 'var(--primary-navy)' : '#FFFFFF',
                color: statusFilter === f.id ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{f.label}</span>
              <span style={{
                background: statusFilter === f.id ? 'rgba(255, 255, 255, 0.25)' : f.bg,
                color: statusFilter === f.id ? '#FFFFFF' : f.color,
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-full)'
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              background: '#FFFFFF',
              color: 'var(--text-secondary)',
              fontWeight: 600
            }}
          >
            <option value="all">All Facility Types</option>
            <option value="hospital">Hospitals</option>
            <option value="bloodbank">Blood Banks</option>
            <option value="ngo">Voluntary NGOs</option>
          </select>

          <div style={{ position: 'relative', width: '220px' }}>
            <input
              type="text"
              placeholder="Search facility / license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.65rem 0.45rem 1.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem'
              }}
            />
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="table-container" style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
        <table>
          <thead>
            <tr>
              <th>Institution / Facility</th>
              <th>Role Type</th>
              <th>Nodal Officer</th>
              <th>Operating License</th>
              <th>Certificate Document</th>
              <th>Status</th>
              <th>Audit Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No institutional submissions found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map(submission => {
                const isPending = submission.verificationStatus === 'pending';
                const isVerified = submission.verificationStatus === 'verified';
                const isRejected = submission.verificationStatus === 'rejected';

                return (
                  <tr key={submission.id} style={{ background: isPending ? '#FFFDF5' : undefined }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 'var(--radius-sm)',
                          background: submission.institutionType === 'hospital' ? '#EFF6FF' : submission.institutionType === 'bloodbank' ? '#FEF2F2' : '#ECFDF5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getRoleIcon(submission.institutionType)}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--primary-navy)', fontSize: '0.85rem', display: 'block' }}>
                            {submission.institutionName}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ID: {submission.institutionId.slice(0, 12)}... • {new Date(submission.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{
                        textTransform: 'uppercase',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        background: submission.institutionType === 'hospital' ? '#DBEAFE' : submission.institutionType === 'bloodbank' ? '#FEE2E2' : '#D1FAE5',
                        color: submission.institutionType === 'hospital' ? '#1E40AF' : submission.institutionType === 'bloodbank' ? '#991B1B' : '#065F46'
                      }}>
                        {submission.institutionType}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--primary-navy)', display: 'block' }}>
                        {submission.nodalOfficerName}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        {submission.nodalOfficerDesignation}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#0D47A1' }}>
                        {submission.nodalOfficerPhone}
                      </span>
                    </td>

                    <td>
                      <code style={{
                        color: '#0D47A1',
                        background: '#EFF6FF',
                        padding: '0.2rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'inline-block',
                        marginBottom: '0.2rem'
                      }}>
                        {submission.licenseNumber}
                      </code>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {getLicenseTypeLabel(submission.licenseType)}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        id={`btn-preview-doc-${submission.id}`}
                        onClick={() => setPreviewSubmission(submission)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#F8FAFC',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.75rem',
                          color: '#0D47A1',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={13} />
                        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {submission.documentFileName}
                        </span>
                        <Eye size={12} color="var(--text-muted)" />
                      </button>
                    </td>

                    <td>
                      {isPending && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: '#FEF3C7',
                          color: '#92400E',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          <Clock size={12} /> Pending Audit
                        </span>
                      )}
                      {isVerified && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: '#D1FAE5',
                          color: '#065F46',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      )}
                      {isRejected && (
                        <div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: '#FEE2E2',
                            color: '#991B1B',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            <XCircle size={12} /> Rejected
                          </span>
                          {submission.rejectionReason && (
                            <span style={{ display: 'block', fontSize: '0.68rem', color: '#B91C1C', marginTop: '0.2rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={submission.rejectionReason}>
                              {submission.rejectionReason}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          id={`btn-approve-inst-${submission.id}`}
                          onClick={() => handleApprove(submission)}
                          disabled={isVerified || isSubmittingAction}
                          style={{
                            padding: '0.32rem 0.65rem',
                            fontSize: '0.75rem',
                            background: isVerified ? '#E2E8F0' : '#10B981',
                            color: isVerified ? 'var(--text-muted)' : '#FFFFFF',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            cursor: isVerified ? 'default' : 'pointer',
                            opacity: isVerified ? 0.6 : 1
                          }}
                          title="Approve operating license and unlock network privileges"
                        >
                          <Check size={13} />
                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          id={`btn-reject-inst-${submission.id}`}
                          onClick={() => handleOpenRejectModal(submission)}
                          disabled={isRejected || isSubmittingAction}
                          style={{
                            padding: '0.32rem 0.65rem',
                            fontSize: '0.75rem',
                            background: '#FFFFFF',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            cursor: isRejected ? 'default' : 'pointer',
                            opacity: isRejected ? 0.6 : 1
                          }}
                          title="Reject license with Directorate remarks"
                        >
                          <X size={13} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Document Preview Modal */}
      {previewSubmission && (
        <div className="modal-backdrop" style={{ zIndex: 1300 }}>
          <div className="modal-card" style={{ maxWidth: '820px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
              color: '#FFFFFF',
              padding: '1.15rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.85 }}>
                  Statutory Operating License Audit
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: '#FFFFFF' }}>
                  {previewSubmission.institutionName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPreviewSubmission(null)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '0.3rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* License Metadata Bar */}
            <div style={{
              background: '#F8FAFC',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '0.85rem 1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              fontSize: '0.8rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>LICENSE TYPE</span>
                <strong style={{ color: 'var(--primary-navy)' }}>{getLicenseTypeLabel(previewSubmission.licenseType)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>REGISTRATION NUMBER</span>
                <code style={{ background: '#E2E8F0', padding: '0.15rem 0.35rem', borderRadius: '3px' }}>{previewSubmission.licenseNumber}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>NODAL OFFICER</span>
                <span>{previewSubmission.nodalOfficerName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>CURRENT STATUS</span>
                <span style={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  color: previewSubmission.verificationStatus === 'verified' ? '#059669' : previewSubmission.verificationStatus === 'rejected' ? '#DC2626' : '#D97706'
                }}>
                  {previewSubmission.verificationStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Document Viewer Container */}
            <div style={{ padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto', background: '#F1F5F9', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {previewSubmission.documentUrl.startsWith('data:image/') || previewSubmission.documentFileType?.includes('image') ? (
                <div style={{ maxWidth: '100%', maxHeight: '60vh', overflow: 'auto', textAlign: 'center' }}>
                  <img
                    src={previewSubmission.documentUrl}
                    alt={`${previewSubmission.institutionName} License Certificate`}
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </div>
              ) : (
                <div style={{ width: '100%', height: '55vh', display: 'flex', flexDirection: 'column' }}>
                  {(() => {
                    const blobUrl = base64ToBlobUrl(previewSubmission.documentUrl);
                    return blobUrl ? (
                      <iframe
                        src={blobUrl}
                        title="License PDF Viewer"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius-md)', background: '#FFFFFF' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', margin: 'auto' }}>
                        <FileText size={48} color="#0D47A1" style={{ margin: '0 auto 0.75rem auto' }} />
                        <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                          {previewSubmission.documentFileName}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', margin: '0.4rem 0 1rem 0' }}>
                          Standard PDF Certificate Scan ({((previewSubmission.documentFileSize || 0) / 1024).toFixed(1)} KB)
                        </span>
                        <a
                          href={previewSubmission.documentUrl}
                          download={previewSubmission.documentFileName}
                          className="btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                        >
                          <Download size={15} />
                          <span>Download Certificate</span>
                        </a>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              background: '#FFFFFF',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                {(() => {
                  const blobUrl = base64ToBlobUrl(previewSubmission.documentUrl);
                  return blobUrl ? (
                    <a
                      href={blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.8rem', color: '#0D47A1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                    >
                      <ExternalLink size={14} />
                      <span>Open document in new window</span>
                    </a>
                  ) : null;
                })()}
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setPreviewSubmission(null)}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
                >
                  Close Preview
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenRejectModal(previewSubmission)}
                  disabled={previewSubmission.verificationStatus === 'rejected' || isSubmittingAction}
                  style={{
                    padding: '0.55rem 1.15rem',
                    fontSize: '0.82rem',
                    background: '#FFFFFF',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <X size={15} />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(previewSubmission)}
                  disabled={previewSubmission.verificationStatus === 'verified' || isSubmittingAction}
                  className="btn-success"
                  style={{
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Check size={15} />
                  <span>Approve Operating License</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingSubmission && (
        <div className="modal-backdrop" style={{ zIndex: 1350 }}>
          <div className="modal-card" style={{ maxWidth: '520px', width: '90%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={20} color="#DC2626" />
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: '#991B1B' }}>Reject Operating License</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {rejectingSubmission.institutionName} ({rejectingSubmission.licenseNumber})
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setRejectingSubmission(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                  Select Directorate Audit Reason *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', background: '#FFFFFF' }}
                >
                  <option value="Uploaded operating certificate is expired or past validity date">
                    Uploaded operating certificate is expired or past validity date
                  </option>
                  <option value="Regulatory authority stamp / council registration number is illegible">
                    Regulatory authority stamp / council registration number is illegible
                  </option>
                  <option value="Institution legal name does not match clinical establishment certificate">
                    Institution legal name does not match clinical establishment certificate
                  </option>
                  <option value="Facility operates outside designated jurisdictional mandate">
                    Facility operates outside designated jurisdictional mandate
                  </option>
                  <option value="Other">
                    Other (Provide custom audit remarks)
                  </option>
                </select>
              </div>

              {rejectionReason === 'Other' && (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                    Specific Directorate Audit Remarks *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter explicit reasons for rejection so the institution can provide corrected documentation..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectingSubmission(null)}
                  className="btn-secondary"
                  disabled={isSubmittingAction}
                  style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isSubmittingAction}
                  style={{
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.82rem',
                    background: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmittingAction ? 'Recording Rejection...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
