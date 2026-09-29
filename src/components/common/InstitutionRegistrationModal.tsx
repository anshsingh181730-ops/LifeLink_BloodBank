import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InstitutionType, InstitutionLicenseType, InstitutionRegistrationInput } from '../../types';
import { 
  Building2, Landmark, Users, ShieldCheck, UploadCloud, FileText, CheckCircle2, 
  AlertCircle, User, Mail, ArrowRight, ArrowLeft, X, Eye, EyeOff
} from 'lucide-react';

interface InstitutionRegistrationModalProps {
  isOpen: boolean;
  initialRole?: InstitutionType;
  onClose: () => void;
}

export const InstitutionRegistrationModal: React.FC<InstitutionRegistrationModalProps> = ({ 
  isOpen, 
  initialRole = 'hospital', 
  onClose 
}) => {
  const { registerInstitution } = useApp();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 1: Institutional & Officer Details
  const [role, setRole] = useState<InstitutionType>(initialRole);
  const [institutionName, setInstitutionName] = useState<string>('');
  const [city, setCity] = useState<string>('Delhi NCR');
  const [address, setAddress] = useState<string>('');
  const [nodalOfficerName, setNodalOfficerName] = useState<string>('');
  const [nodalOfficerDesignation, setNodalOfficerDesignation] = useState<string>('Chief Medical Officer');
  const [nodalOfficerPhone, setNodalOfficerPhone] = useState<string>('');
  const [officerDateOfBirth, setOfficerDateOfBirth] = useState<string>('1985-05-15');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Step 2: Regulatory Licensing & Document Upload
  const [licenseType, setLicenseType] = useState<InstitutionLicenseType>(
    initialRole === 'hospital' 
      ? 'nabh' 
      : initialRole === 'bloodbank' 
      ? 'cdsco' 
      : 'darpan_ngo'
  );
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [documentFile, setDocumentFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dpdpConsent, setDpdpConsent] = useState<boolean>(true);

  if (!isOpen) return null;

  // File Upload Handlers
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!institutionName.trim()) {
      setErrorMessage('Institution legal name is required.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Facility address is required.');
      return;
    }
    if (!nodalOfficerName.trim() || !nodalOfficerPhone.trim()) {
      setErrorMessage('Authorized Nodal Officer name and phone are required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('A valid official email address is required.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters with medical governance security.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter both password fields.');
      return;
    }

    // Auto-update license type suggestions if role changed
    if (role === 'hospital' && licenseType !== 'nabh' && licenseType !== 'clinical_establishment') {
      setLicenseType('nabh');
    } else if (role === 'bloodbank' && licenseType !== 'cdsco' && licenseType !== 'state_transfusion_council') {
      setLicenseType('cdsco');
    } else if (role === 'ngo' && licenseType !== 'darpan_ngo') {
      setLicenseType('darpan_ngo');
    }

    setCurrentStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!licenseNumber.trim()) {
      setErrorMessage('Official license / registration number is required.');
      return;
    }
    if (!documentFile) {
      setErrorMessage('Please upload a valid statutory license certificate (PDF or Image) to proceed.');
      return;
    }
    if (!dpdpConsent) {
      setErrorMessage('Institutional consent under DPDP Act 2023 is required for clinical network verification.');
      return;
    }

    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const input: InstitutionRegistrationInput = {
        role,
        institutionName: institutionName.trim(),
        city: city.trim(),
        address: address.trim(),
        nodalOfficerName: nodalOfficerName.trim(),
        nodalOfficerPhone: nodalOfficerPhone.trim(),
        nodalOfficerDesignation: nodalOfficerDesignation.trim(),
        officerDateOfBirth,
        email: email.trim().toLowerCase(),
        password,
        licenseType,
        licenseNumber: licenseNumber.trim(),
        documentFile: documentFile!
      };

      await registerInstitution(input);
      onClose();
    } catch (err: any) {
      console.error('[Institution Registration] Submit error:', err);
      setErrorMessage(err.message || 'Institutional registration failed. Please review the inputs and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLicenseTypeLabel = (lt: InstitutionLicenseType): string => {
    switch (lt) {
      case 'nabh': return 'NABH Hospital Accreditation Certificate';
      case 'cdsco': return 'CDSCO Form 28-C Blood Centre License';
      case 'state_transfusion_council': return 'State Blood Transfusion Council (SBTC) Permit';
      case 'darpan_ngo': return 'NITI Aayog NGO Darpan Unique Registration ID';
      case 'clinical_establishment': return 'State Clinical Establishments Act Registration';
      default: return 'Statutory Health Operating License';
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1200 }}>
      <div 
        className="modal-card" 
        style={{ 
          maxWidth: '720px', 
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
          color: '#FFFFFF',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {role === 'hospital' ? <Building2 size={24} /> : role === 'bloodbank' ? <Landmark size={24} /> : <Users size={24} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Institutional Network Registration
              </h2>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                National Blood Transfusion Council & CDSCO Operating Enrolment
              </span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '0.4rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div style={{
          background: '#F8FAFC',
          padding: '0.75rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentStep >= 1 ? '#0D47A1' : 'var(--text-muted)', fontWeight: currentStep === 1 ? 800 : 600 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: currentStep >= 1 ? '#0D47A1' : '#E2E8F0', color: currentStep >= 1 ? '#FFFFFF' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>1</span>
            <span>Facility & Officer</span>
          </div>
          <div style={{ width: 30, height: 1, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentStep >= 2 ? '#0D47A1' : 'var(--text-muted)', fontWeight: currentStep === 2 ? 800 : 600 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: currentStep >= 2 ? '#0D47A1' : '#E2E8F0', color: currentStep >= 2 ? '#FFFFFF' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>2</span>
            <span>Statutory License</span>
          </div>
          <div style={{ width: 30, height: 1, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentStep === 3 ? '#0D47A1' : 'var(--text-muted)', fontWeight: currentStep === 3 ? 800 : 600 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: currentStep === 3 ? '#0D47A1' : '#E2E8F0', color: currentStep === 3 ? '#FFFFFF' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>3</span>
            <span>Audit Undertaking</span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
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

          {/* STEP 1: Facility & Nodal Officer Details */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Next} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.4rem' }}>
                  Institution Type *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { id: 'hospital', label: 'Hospital', icon: <Building2 size={16} /> },
                    { id: 'bloodbank', label: 'Blood Bank', icon: <Landmark size={16} /> },
                    { id: 'ngo', label: 'Voluntary NGO', icon: <Users size={16} /> }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as InstitutionType)}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: role === item.id ? '2px solid #0D47A1' : '1px solid var(--border-subtle)',
                        background: role === item.id ? 'rgba(13, 71, 161, 0.06)' : '#FFFFFF',
                        color: role === item.id ? '#0D47A1' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                  Institution Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'hospital' ? 'e.g. Indraprastha Apollo Hospital' : role === 'bloodbank' ? 'e.g. Red Cross Central Blood Centre' : 'e.g. Rotary Blood Foundation'}
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                    City / Jurisdiction *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi NCR"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                    Facility Physical Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarita Vihar, Mathura Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0D47A1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={15} /> Authorized Nodal Officer
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Officer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ananya Roy"
                      value={nodalOfficerName}
                      onChange={(e) => setNodalOfficerName(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Medical Officer"
                      value={nodalOfficerDesignation}
                      onChange={(e) => setNodalOfficerDesignation(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={nodalOfficerPhone}
                      onChange={(e) => setNodalOfficerPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Officer Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={officerDateOfBirth}
                      onChange={(e) => setOfficerDateOfBirth(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                  Official Email Address (Sign-In Identifier) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="e.g. transfusion@apollo-delhi.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                    Account Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 2.2rem 0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                >
                  <span>Continue to Licensing</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Statutory License & Document Upload */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Next} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                  Regulatory Authority / License Type *
                </label>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value as InstitutionLicenseType)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem', background: '#FFFFFF' }}
                >
                  <option value="nabh">NABH Hospital Accreditation Certificate</option>
                  <option value="cdsco">CDSCO Form 28-C Blood Centre License</option>
                  <option value="clinical_establishment">State Clinical Establishments Act Registration</option>
                  <option value="state_transfusion_council">State Blood Transfusion Council (SBTC) Recognition</option>
                  <option value="darpan_ngo">NITI Aayog NGO Darpan Unique Registration ID</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                  Official License / Registration Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder={licenseType === 'nabh' ? 'e.g. NABH-DL-2024-88' : licenseType === 'cdsco' ? 'e.g. CDSCO-LIC-DL-001' : 'e.g. DARPAN-DL-98214'}
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem', letterSpacing: '0.04em', fontWeight: 700 }}
                />
              </div>

              {/* Drag and Drop Document Upload */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                  Upload Certified License Certificate * (PDF, PNG, JPG ≤ 10MB)
                </label>
                
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  style={{
                    border: isDragging ? '2px dashed #0D47A1' : '2px dashed var(--border-subtle)',
                    background: isDragging ? 'rgba(13, 71, 161, 0.05)' : '#FAFCFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.75rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => document.getElementById('inst-license-upload-input')?.click()}
                >
                  <input
                    id="inst-license-upload-input"
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem' }}>
                      <FileText size={32} color="#0D47A1" />
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--primary-navy)', display: 'block' }}>
                          {documentFile.name}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {(documentFile.size / (1024 * 1024)).toFixed(2)} MB • {documentFile.type}
                        </span>
                      </div>
                      <span style={{ marginLeft: '1rem', background: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 700 }}>
                        Ready for Upload
                      </span>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud size={38} color="#0D47A1" style={{ margin: '0 auto 0.5rem auto' }} />
                      <strong style={{ fontSize: '0.9rem', color: 'var(--primary-navy)', display: 'block', marginBottom: '0.25rem' }}>
                        Drag & Drop License Document, or Browse
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Ensure registration number, issuing council stamp, and validity dates are clearly visible
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* DPDP Consent */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <input
                  type="checkbox"
                  id="inst-dpdp-consent"
                  checked={dpdpConsent}
                  onChange={(e) => setDpdpConsent(e.target.checked)}
                  style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                />
                <label htmlFor="inst-dpdp-consent" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, cursor: 'pointer' }}>
                  <strong>Digital Personal Data Protection (DPDP) Act 2023 Undertaking:</strong> I certify that this institution is legally registered and authorized to handle blood transfusion or coordination services. Submitted licensing documents will be stored securely for verification audits by the National Directorate.
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.25rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                >
                  <span>Review & Confirm</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Audit Undertaking & Submission */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card" style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.85rem' }}>
                  Registration Summary for Directorate Audit
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>INSTITUTION NAME</span>
                    <strong style={{ color: 'var(--primary-navy)' }}>{institutionName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>ROLE TYPE</span>
                    <strong style={{ textTransform: 'uppercase', color: '#0D47A1' }}>{role}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>NODAL OFFICER</span>
                    <span>{nodalOfficerName} ({nodalOfficerDesignation})</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>OFFICIAL EMAIL</span>
                    <span>{email}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>LICENSE TYPE</span>
                    <span>{getLicenseTypeLabel(licenseType)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>LICENSE NUMBER</span>
                    <code style={{ background: '#E2E8F0', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>{licenseNumber}</code>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>UPLOADED CERTIFICATE</span>
                    <span style={{ color: '#0D47A1', fontWeight: 600 }}>{documentFile?.name}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>INITIAL STATUS</span>
                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.72rem' }}>
                      PENDING AUDIT
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1.15rem',
                fontSize: '0.8rem',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <ShieldCheck size={24} color="#2563EB" style={{ flexShrink: 0 }} />
                <span>
                  Upon submission, an account is registered in Supabase. Clinical dashboard broadcasts will unlock once an authorized Platform Administrator reviews and approves your operating license.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary"
                  disabled={isSubmitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.25rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem' }}
                >
                  {isSubmitting ? (
                    <span>Registering with Supabase...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Submit for Directorate Audit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
