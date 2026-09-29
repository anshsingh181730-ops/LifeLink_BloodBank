import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, GovIdType, Location } from '../../types';
import { LocationCapture } from './LocationCapture';
import { 
  ShieldCheck, ShieldAlert, UploadCloud, FileText, CheckCircle2, 
  AlertCircle, Calendar, Droplets, Lock, User, Phone, 
  Mail, ArrowRight, ArrowLeft, X, Eye, Clock, Check, EyeOff
} from 'lucide-react';

interface DonorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonorRegistrationModal: React.FC<DonorRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { registerDonor, switchRole, googleOAuthPendingData, setGoogleOAuthPendingData } = useApp();

  React.useEffect(() => {
    if (googleOAuthPendingData) {
      if (googleOAuthPendingData.name) setFullName(googleOAuthPendingData.name);
      if (googleOAuthPendingData.email) setEmail(googleOAuthPendingData.email);
    }
  }, [googleOAuthPendingData]);

  const handleModalClose = () => {
    if (googleOAuthPendingData) {
      setGoogleOAuthPendingData(null);
    }
    onClose();
  };

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 1: Personal & Medical Details
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [location, setLocation] = useState<Location>({
    address: 'Connaught Place, Central Delhi',
    city: 'Delhi',
    lat: 28.6304,
    lng: 77.2177,
    source: 'default'
  });

  // Step 2: KYC & Government ID Details
  const [idType, setIdType] = useState<GovIdType>('aadhaar');
  const [idNumber, setIdNumber] = useState<string>('');
  const [documentFile, setDocumentFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [dpdpConsent, setDpdpConsent] = useState<boolean>(true);

  // Step 3: Result Summary State
  const [registeredSummary, setRegisteredSummary] = useState<{
    donorName: string;
    donorEmail: string;
    bloodGroup: BloodGroup;
    maskedId: string;
    submissionId: string;
  } | null>(null);

  if (!isOpen) return null;

  // Calculate Donor Age & Eligibility in Real Time
  const calculateAge = (dobString: string): { age: number | null; isEligible: boolean; message: string } => {
    if (!dobString) return { age: null, isEligible: false, message: 'Please enter your date of birth' };
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (isNaN(age)) return { age: null, isEligible: false, message: 'Invalid date of birth' };
    if (age < 18) {
      return { age, isEligible: false, message: `Age ${age}: Voluntary donors must be at least 18 years old.` };
    }
    if (age > 65) {
      return { age, isEligible: false, message: `Age ${age}: Maximum eligible age for voluntary blood donation is 65 years.` };
    }
    return { age, isEligible: true, message: `Age ${age}: Eligible voluntary blood donor (18–65 years).` };
  };

  const ageEligibility = calculateAge(dateOfBirth);

  // Helper to format/mask ID number in real-time
  const getMaskedPreview = (raw: string, type: GovIdType): string => {
    const clean = raw.replace(/[\s-]/g, '');
    if (!clean) return 'XXXX-XXXX-XXXX';
    const last4 = clean.slice(-4);
    if (type === 'aadhaar') {
      return `XXXX-XXXX-${last4}`;
    }
    return `XXXX-XXXX-${last4}`;
  };

  // Handle Document File Upload with client-side 5MB limit
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB limit (5 * 1024 * 1024 = 5,242,880 bytes)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`Selected document is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed file size is 5MB.`);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload a PDF or an image (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDocumentFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string
      });
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Step 1 Validation & Proceed to Step 2
  const handleProceedToKyc = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile contact number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!googleOAuthPendingData && (!password || password.length < 6)) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!dateOfBirth) {
      setErrorMessage('Date of birth is required for eligibility verification.');
      return;
    }
    if (!ageEligibility.isEligible) {
      setErrorMessage(ageEligibility.message);
      return;
    }

    setCurrentStep(2);
  };

  // Step 2 Submission: Register Donor & KYC Record
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!idNumber.trim()) {
      setErrorMessage('Government ID number is required.');
      return;
    }
    if (idType === 'aadhaar' && idNumber.replace(/\D/g, '').length !== 12) {
      setErrorMessage('Aadhaar number must contain exactly 12 digits.');
      return;
    }
    if (!documentFile) {
      setErrorMessage('Please upload a clear photo or PDF scan of your Government ID document (max 5MB).');
      return;
    }
    if (!dpdpConsent) {
      setErrorMessage('Consent to DPDP Act 2023 verification terms is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerDonor({
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password,
        bloodGroup,
        dateOfBirth,
        location,
        idType,
        idNumber: idNumber.trim(),
        documentFile
      });

      setRegisteredSummary({
        donorName: res.user.name,
        donorEmail: res.user.email,
        bloodGroup: res.profile.bloodGroup,
        maskedId: res.submission.idNumberMasked,
        submissionId: res.submission.id
      });

      setCurrentStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit registration. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishAndEnterPortal = () => {
    onClose();
    switchRole('patient');
  };

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div className="modal-overlay" onClick={handleModalClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ background: 'var(--primary-navy)', color: '#FFFFFF', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <ShieldCheck size={22} color="#60A5FA" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                {googleOAuthPendingData ? 'Complete Google Donor Profile' : 'Register as Voluntary Lifesaver Donor'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#BFDBFE', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                <span>Official Registry</span> • <span>Government e-KYC Verification</span>
              </span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleModalClose} 
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '0.25rem' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Multi-Step Visual Progress Bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: '#F8FAFC',
          padding: '0.75rem 1.5rem',
          gap: '1rem',
          alignItems: 'center',
          fontSize: '0.8rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontWeight: currentStep === 1 ? 700 : 500,
            color: currentStep >= 1 ? 'var(--primary-navy)' : 'var(--text-muted)'
          }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              background: currentStep > 1 ? '#10B981' : currentStep === 1 ? 'var(--secondary-blue)' : '#E2E8F0',
              color: '#FFFFFF'
            }}>
              {currentStep > 1 ? <Check size={13} strokeWidth={3} /> : '1'}
            </span>
            <span>Personal & Eligibility</span>
          </div>

          <div style={{ flex: 1, height: '2px', background: currentStep >= 2 ? 'var(--secondary-blue)' : '#E2E8F0' }} />

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontWeight: currentStep === 2 ? 700 : 500,
            color: currentStep >= 2 ? 'var(--primary-navy)' : 'var(--text-muted)'
          }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              background: currentStep > 2 ? '#10B981' : currentStep === 2 ? 'var(--secondary-blue)' : '#E2E8F0',
              color: currentStep >= 2 ? '#FFFFFF' : 'var(--text-muted)'
            }}>
              {currentStep > 2 ? <Check size={13} strokeWidth={3} /> : '2'}
            </span>
            <span>Government ID & KYC</span>
          </div>

          <div style={{ flex: 1, height: '2px', background: currentStep >= 3 ? '#10B981' : '#E2E8F0' }} />

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontWeight: currentStep === 3 ? 700 : 500,
            color: currentStep === 3 ? '#10B981' : 'var(--text-muted)'
          }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 800,
              background: currentStep === 3 ? '#10B981' : '#E2E8F0',
              color: currentStep === 3 ? '#FFFFFF' : 'var(--text-muted)'
            }}>
              3
            </span>
            <span>Status</span>
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div style={{
            margin: '1rem 1.5rem 0 1.5rem',
            padding: '0.75rem 1rem',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            color: '#B91C1C',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Personal & Medical Details */}
        {currentStep === 1 && (
          <form onSubmit={handleProceedToKyc} className="modal-body" style={{ padding: '1.5rem' }}>
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-md)',
              padding: '0.8rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <ShieldCheck size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.86rem', color: '#1E40AF', display: 'block' }}>
                  Anti-Fraud & Voluntary Donor Safety
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#1E3A8A', lineHeight: '1.45', display: 'block' }}>
                  Please provide your genuine details. Newly registered donors require staff KYC verification before receiving verified badges or priority matching.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                  Full Legal Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                  Mobile Phone Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {googleOAuthPendingData && (
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.9rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: '#166534'
              }}>
                <Check size={16} />
                <span>Signed in via Google OAuth (<strong>{googleOAuthPendingData.email}</strong>). Complete your statutory donor profile below.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: googleOAuthPendingData ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    readOnly={Boolean(googleOAuthPendingData)}
                    placeholder="donor@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      background: googleOAuthPendingData ? '#F8FAFC' : '#FFFFFF',
                      cursor: googleOAuthPendingData ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
              </div>

              {!googleOAuthPendingData && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                    Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 2.25rem 0.55rem 2.25rem',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.88rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.65rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Blood Group & Date of Birth */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                  Blood Group *
                </label>
                <div style={{ position: 'relative' }}>
                  <Droplets size={16} color="var(--primary-crimson)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      background: '#FFFFFF'
                    }}
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                  Date of Birth (18–65 Yrs) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                      border: `1px solid ${dateOfBirth && !ageEligibility.isEligible ? '#EF4444' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
                {dateOfBirth && (
                  <div style={{
                    fontSize: '0.74rem',
                    marginTop: '0.3rem',
                    color: ageEligibility.isEligible ? '#059669' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    {ageEligibility.isEligible ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                    <span>{ageEligibility.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Donor City & GPS Location Capture */}
            <div style={{ marginBottom: '1.25rem' }}>
              <LocationCapture
                value={location}
                onChange={setLocation}
                label="Home Address / Donation Radius Anchor"
                placeholder="Search your city, sector, or hospital pin..."
              />
            </div>

            <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!ageEligibility.isEligible}
                style={{
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: !ageEligibility.isEligible ? 0.6 : 1
                }}
              >
                <span>Proceed to Government ID Verification</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Government ID & Private Document Upload */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmitRegistration} className="modal-body" style={{ padding: '1.5rem' }}>
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 'var(--radius-md)',
              padding: '0.8rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <ShieldCheck size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.86rem', color: '#166534', display: 'block' }}>
                  Government e-KYC Verification & Private Storage
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#14532D', lineHeight: '1.45', display: 'block' }}>
                  Per National Blood Transfusion Council regulations, voluntary donors must verify identity. ID numbers are encrypted (AES-256) and never displayed raw.
                </span>
              </div>
            </div>

            {/* ID Type Selector */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                Select Government ID Type *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {[
                  { type: 'aadhaar' as GovIdType, label: 'Aadhaar Card' },
                  { type: 'voter_id' as GovIdType, label: 'Voter ID' },
                  { type: 'passport' as GovIdType, label: 'Passport' },
                  { type: 'driving_license' as GovIdType, label: 'Driving License' }
                ].map(item => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setIdType(item.type);
                      setIdNumber('');
                    }}
                    style={{
                      padding: '0.55rem 0.5rem',
                      border: idType === item.type ? '2px solid var(--secondary-blue)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      background: idType === item.type ? 'rgba(41, 121, 255, 0.08)' : '#FFFFFF',
                      color: idType === item.type ? 'var(--primary-navy)' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: idType === item.type ? 800 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ID Number with Live Masked Preview */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  {idType === 'aadhaar' ? '12-Digit Aadhaar Number *' : `${idType.replace('_', ' ').toUpperCase()} Number *`}
                </label>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Stored encrypted (AES-256)
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={idType === 'aadhaar' ? 14 : 20}
                placeholder={idType === 'aadhaar' ? 'Enter 12 digits (e.g. 5412 8921 4821)' : 'Enter document number'}
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  letterSpacing: '0.04em'
                }}
              />
              <div style={{
                marginTop: '0.45rem',
                fontSize: '0.76rem',
                background: '#F8FAFC',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-secondary)'
              }}>
                <span>Public Display Preview (Masked):</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--primary-navy)', fontSize: '0.82rem' }}>
                  {getMaskedPreview(idNumber, idType)}
                </strong>
              </div>
            </div>

            {/* Document Upload Dropzone with <=5MB Validation */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  Upload Document Photo / Scan (Max 5MB) *
                </label>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  PNG, JPG, PDF allowed
                </span>
              </div>

              {!documentFile ? (
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #93C5FD',
                  borderRadius: 'var(--radius-md)',
                  background: '#F0F7FF',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  textAlign: 'center'
                }}>
                  <UploadCloud size={32} color="#2563EB" style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF' }}>
                    Click to browse or drop document here
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#60A5FA', marginTop: '2px' }}>
                    Supports clear front copy of Government ID (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, application/pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <div style={{
                  border: '1px solid #BBF7D0',
                  background: '#F0FDF4',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {documentFile.type.includes('image') ? (
                      <img 
                        src={documentFile.dataUrl} 
                        alt="Preview" 
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid #86EFAC' }} 
                      />
                    ) : (
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-sm)',
                        background: '#DCFCE7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#166534'
                      }}>
                        <FileText size={22} />
                      </div>
                    )}
                    <div>
                      <strong style={{ fontSize: '0.84rem', color: '#14532D', display: 'block' }}>
                        {documentFile.name}
                      </strong>
                      <span style={{ fontSize: '0.74rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{(documentFile.size / 1024).toFixed(0)} KB</span>
                        • <span style={{ color: '#047857', fontWeight: 600 }}>Private Encrypted Storage Bucket</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDocumentFile(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '0.3rem 0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    Change File
                  </button>
                </div>
              )}
            </div>

            {/* DPDP Act 2023 Consent Checkbox */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 0.9rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem'
            }}>
              <input
                type="checkbox"
                id="dpdp-consent"
                checked={dpdpConsent}
                onChange={e => setDpdpConsent(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <label htmlFor="dpdp-consent" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.45', cursor: 'pointer' }}>
                I consent to LifeLink securely verifying my government identity with authorized healthcare coordinators under the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> strictly for voluntary emergency blood matching.
              </label>
            </div>

            {/* Buttons */}
            <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentStep(1)}
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !documentFile || !dpdpConsent}
                style={{
                  padding: '0.6rem 1.6rem',
                  fontSize: '0.85rem',
                  background: '#0D47A1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: (isSubmitting || !documentFile || !dpdpConsent) ? 0.6 : 1
                }}
              >
                {isSubmitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Submit & Create Donor Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Submission Confirmation & Pending Review Explanation */}
        {currentStep === 3 && registeredSummary && (
          <div className="modal-body" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEF3C7',
              border: '2px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              color: '#D97706'
            }}>
              <Clock size={32} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.85rem',
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: 'var(--radius-full)',
              color: '#B45309',
              fontSize: '0.78rem',
              fontWeight: 800,
              marginBottom: '0.75rem'
            }}>
              <ShieldAlert size={14} />
              <span>Status: Pending KYC Verification</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
              Registration Submitted Successfully!
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.55', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              Thank you, <strong>{registeredSummary.donorName}</strong>. Your donor profile has been created in the registry. To prevent unauthorized broadcasts, your account is queued for review by hospital staff.
            </p>

            {/* Summary Details Card */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Donor Blood Group</span>
                  <strong style={{ color: 'var(--primary-crimson)', fontSize: '0.95rem' }}>{registeredSummary.bloodGroup}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Submission Reference</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--primary-navy)' }}>{registeredSummary.submissionId}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Masked ID Identifier</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--primary-navy)' }}>{registeredSummary.maskedId}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Document Access</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>Private Bucket (Encrypted)</span>
                </div>
              </div>
            </div>

            {/* Safety Gating Notice */}
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
              fontSize: '0.78rem',
              color: '#1E40AF',
              lineHeight: '1.5'
            }}>
              <strong>Mandatory Verification Gating:</strong> In accordance with blood transfusion security protocols, your account is queued for review by clinical staff. Portal access and emergency matching remain locked until approval.
            </div>

            <button
              type="button"
              id="btn-modal-to-waiting-screen"
              className="btn-primary"
              onClick={handleFinishAndEnterPortal}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.92rem',
                background: 'var(--primary-navy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>View Verification Status & Waiting Screen</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
