import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, BloodComponent, UrgencyLevel, Location } from '../../types';
import { LocationCapture } from './LocationCapture';
import { 
  AlertCircle, X, Activity, Award, ShieldCheck, 
  UserCheck, ArrowRight, Phone, User, CheckCircle2, KeyRound
} from 'lucide-react';

export const EmergencyModal: React.FC = () => {
  const { 
    isEmergencyModalOpen, setIsEmergencyModalOpen, createRequest, 
    currentUser, donorProfiles, currentRole, switchRole, setActiveUser, registerUser, t 
  } = useApp();

  const [step, setStep] = useState<'signin' | 'form'>('form');
  const [authTab, setAuthTab] = useState<'quick' | 'phone' | 'register'>('quick');

  // Phone / Instant Sign In Form state
  const [phoneNameInput, setPhoneNameInput] = useState<string>('Rahul Varma');
  const [phoneInput, setPhoneInput] = useState<string>('+91 98765 43210');
  const [otpInput, setOtpInput] = useState<string>('4829');

  // Register state
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regBloodGroup, setRegBloodGroup] = useState<BloodGroup>('O+');
  const [regCity, setRegCity] = useState<string>('Delhi NCR');
  const [regAsDonor, setRegAsDonor] = useState<boolean>(true);

  // Blood Request Form state with Real Geolocation support
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<BloodComponent>('Packed Red Blood Cells');
  const [units, setUnits] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('critical');
  const [requestLocation, setRequestLocation] = useState<Location>({
    address: 'Indraprastha Apollo Hospital, Sarita Vihar',
    city: 'Delhi',
    lat: 28.5355,
    lng: 77.2910,
    source: 'default'
  });
  const [address, setAddress] = useState('Indraprastha Apollo Hospital, Sarita Vihar');
  const [city, setCity] = useState('Delhi');
  const [hospitalName, setHospitalName] = useState('Apollo Emergency ICU');
  const [patientCaseId, setPatientCaseId] = useState('EMG-ICU-882');
  const [notes, setNotes] = useState('Severe blood loss trauma incident.');

  // Synchronize step whenever modal opens
  useEffect(() => {
    if (isEmergencyModalOpen) {
      if (currentRole === 'public') {
        setStep('signin');
      } else {
        setStep('form');
      }
    }
  }, [isEmergencyModalOpen, currentRole]);

  if (!isEmergencyModalOpen) return null;

  const userDonorProfile = donorProfiles[currentUser.id];
  const hasDonationHistory = !!(userDonorProfile && userDonorProfile.totalDonations > 0);

  // Handlers for authentication
  const handleQuickSignIn = (userId: string) => {
    setActiveUser(userId);
    switchRole('patient');
    setStep('form');
  };

  const handlePhoneSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || !phoneNameInput) return;
    // Register or activate simulated verified phone user
    registerUser({
      role: 'patient',
      name: phoneNameInput,
      email: `${phoneNameInput.toLowerCase().replace(/\s+/g, '.')}@lifelink.org`,
      phone: phoneInput,
      bloodGroup,
      city,
      isAvailableAsDonor: false
    });
    switchRole('patient');
    setStep('form');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone) return;
    registerUser({
      role: 'patient',
      name: regName,
      email: `${regName.toLowerCase().replace(/\s+/g, '.')}@lifelink.org`,
      phone: regPhone,
      bloodGroup: regBloodGroup,
      city: regCity,
      isAvailableAsDonor: regAsDonor
    });
    setBloodGroup(regBloodGroup);
    switchRole('patient');
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest({
      bloodGroup,
      component,
      units,
      urgency,
      address: requestLocation.address || address,
      city: requestLocation.city || city,
      lat: requestLocation.lat,
      lng: requestLocation.lng,
      patientCaseId,
      hospitalName,
      notes,
      locationSource: requestLocation.source
    });
    setIsEmergencyModalOpen(false);
  };

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const components: BloodComponent[] = [
    'Packed Red Blood Cells', 
    'Whole Blood', 
    'Platelets', 
    'Fresh Frozen Plasma'
  ];

  return (
    <div className="modal-overlay" onClick={() => setIsEmergencyModalOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ background: 'var(--primary-navy)', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {step === 'signin' ? (
              <ShieldCheck size={24} color="#60A5FA" />
            ) : (
              <AlertCircle size={22} color="#FFFFFF" />
            )}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                {step === 'signin' ? 'Sign In to Request Blood Urgently' : t.emergency.requestBloodNow}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#E3F2FD' }}>
                {step === 'signin' 
                  ? 'Identity Verification & Anti-Fraud Authentication Required'
                  : 'Direct Clinical Broadcast to Ranked Compatible Donors & Nearby Banks'}
              </span>
            </div>
          </div>
          <button type="button" onClick={() => setIsEmergencyModalOpen(false)} style={{ color: '#FFFFFF' }}>
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: Anti-Fraud & Sign-In Screen */}
        {step === 'signin' ? (
          <div className="modal-body" style={{ padding: '1.5rem' }}>
            {/* Anti-Fraud Security Warning Callout */}
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <ShieldCheck size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#1E40AF', fontSize: '0.88rem', marginBottom: '2px' }}>
                  Anti-Fraud & Patient Safety Authentication
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#1E3A8A', lineHeight: '1.5', display: 'block' }}>
                  Urgent blood requests trigger live emergency broadcasts to hospitals, blood banks, and verified voluntary donors across the city within seconds. To prevent fraudulent, prank, or harmful requests and ensure patient accountability, sign-in is required before broadcasting.
                </span>
              </div>
            </div>

            {/* Auth Navigation Tabs */}
            <div style={{
              display: 'flex',
              background: '#F1F5F9',
              padding: '0.3rem',
              borderRadius: 'var(--radius-md)',
              gap: '0.35rem',
              marginBottom: '1.2rem'
            }}>
              <button
                type="button"
                onClick={() => setAuthTab('quick')}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: authTab === 'quick' ? '#FFFFFF' : 'transparent',
                  color: authTab === 'quick' ? '#0D47A1' : '#64748B',
                  boxShadow: authTab === 'quick' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                1-Click Verified Demo
              </button>

              <button
                type="button"
                onClick={() => setAuthTab('phone')}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: authTab === 'phone' ? '#FFFFFF' : 'transparent',
                  color: authTab === 'phone' ? '#0D47A1' : '#64748B',
                  boxShadow: authTab === 'phone' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Mobile Number & OTP
              </button>

              <button
                type="button"
                onClick={() => setAuthTab('register')}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: authTab === 'register' ? '#FFFFFF' : 'transparent',
                  color: authTab === 'register' ? '#0D47A1' : '#64748B',
                  boxShadow: authTab === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                New Registration
              </button>
            </div>

            {/* TAB 1: Quick Sign In Demo Accounts */}
            {authTab === 'quick' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{
                  border: '1px solid #BBF7D0',
                  background: '#F0FDF4',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#166534', fontSize: '0.92rem' }}>
                      <Award size={16} color="#16A34A" />
                      <span>Vikram Malhotra</span>
                      <span style={{ 
                        background: '#DCFCE7', 
                        color: '#15803D', 
                        fontSize: '0.7rem', 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: 'var(--radius-full)', 
                        fontWeight: 700 
                      }}>
                        Verified Lifesaver Donor
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#166534', display: 'block', marginTop: '2px' }}>
                      9 completed blood donations (98% reliability). Unlocks <strong>Priority Matching Boost</strong> for requests.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ background: '#16A34A', fontSize: '0.8rem', padding: '0.55rem 0.9rem', whiteSpace: 'nowrap' }}
                    onClick={() => handleQuickSignIn('usr-donor-1')}
                  >
                    <span>Sign In & Continue</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#1E293B', fontSize: '0.92rem' }}>
                      <UserCheck size={16} color="#2563EB" />
                      <span>Rahul Varma</span>
                      <span style={{ 
                        background: '#E2E8F0', 
                        color: '#475569', 
                        fontSize: '0.7rem', 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: 'var(--radius-full)', 
                        fontWeight: 700 
                      }}>
                        Standard Requester
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginTop: '2px' }}>
                      Verified patient requester (Delhi NCR). Standard priority broadcast.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.55rem 0.9rem', whiteSpace: 'nowrap' }}
                    onClick={() => handleQuickSignIn('usr-patient-1')}
                  >
                    <span>Sign In & Continue</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Mobile Number & OTP Sign In */}
            {authTab === 'phone' && (
              <form onSubmit={handlePhoneSignIn}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name of Requester / Patient Attendant</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={phoneNameInput}
                        onChange={e => setPhoneNameInput(e.target.value)}
                        placeholder="e.g. Dr. Amit Sharma / Priya Varma"
                        style={{ paddingLeft: '2.2rem' }}
                      />
                      <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Verified Mobile Phone (+91)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        placeholder="+91 98765 43210"
                        style={{ paddingLeft: '2.2rem' }}
                      />
                      <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label">One-Time Password (OTP)</label>
                      <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>Simulated OTP: 4829</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        className="form-input"
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value)}
                        placeholder="Enter 4-digit OTP"
                        style={{ paddingLeft: '2.2rem', letterSpacing: '0.2em', fontWeight: 700 }}
                      />
                      <KeyRound size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ marginTop: '0.5rem', padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <ShieldCheck size={18} />
                    <span>Verify Identity & Proceed to Request Blood</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: New Requester Registration */}
            {authTab === 'register' && (
              <form onSubmit={handleRegisterSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Blood Group</label>
                      <select
                        className="form-select"
                        value={regBloodGroup}
                        onChange={e => setRegBloodGroup(e.target.value as BloodGroup)}
                      >
                        {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">City / Region</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={regCity}
                        onChange={e => setRegCity(e.target.value)}
                        placeholder="Delhi NCR"
                      />
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem'
                  }}>
                    <input
                      type="checkbox"
                      id="emg-reg-donor"
                      checked={regAsDonor}
                      onChange={e => setRegAsDonor(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#16A34A', cursor: 'pointer' }}
                    />
                    <label htmlFor="emg-reg-donor" style={{ fontSize: '0.8rem', color: '#166534', cursor: 'pointer', fontWeight: 600 }}>
                      I am also available to donate blood (earn priority boost for future requests)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ marginTop: '0.5rem', padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Register & Proceed to Emergency Request</span>
                  </button>
                </div>
              </form>
            )}

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEmergencyModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Emergency Request Broadcast Form */
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Authenticated Requester Status Bar */}
              <div style={{
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.9rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#0284C7" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ color: '#0369A1', fontWeight: 600 }}>Authenticated Requester: </span>
                    <strong style={{ color: '#0C4A6E' }}>{currentUser.name}</strong>
                    <span style={{ color: '#0284C7', marginLeft: '0.35rem' }}>({currentUser.phone || '+91 98765 43210'})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('signin')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284C7',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                  title="Switch to another verified user or donor account"
                >
                  Switch User
                </button>
              </div>

              {/* Verified Donor Priority Notice */}
              {hasDonationHistory && (
                <div style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.8rem',
                  color: '#92400E'
                }}>
                  <Award size={18} color="#D97706" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block' }}>Verified Donor Priority Boost Active:</strong>
                    Because you personally donated blood {userDonorProfile.totalDonations} time(s) (Reliability Score: {userDonorProfile.reliabilityScore}%), this request will automatically carry the <strong>Priority Request — Verified Donor</strong> badge and elevated matching priority.
                  </div>
                </div>
              )}

              {/* Urgency Selector */}
              <div className="form-group">
                <label className="form-label">Clinical Urgency Classification</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {(['standard', 'urgent', 'critical'] as UrgencyLevel[]).map(lvl => {
                    const isSelected = urgency === lvl;
                    let bg = '#FFFFFF';
                    let border = '#E2E8F0';
                    let color = '#475569';

                    if (lvl === 'critical') {
                      if (isSelected) { bg = '#E53935'; border = '#E53935'; color = '#FFFFFF'; }
                      else { bg = '#FEF2F2'; border = '#FECACA'; color = '#E53935'; }
                    } else if (lvl === 'urgent') {
                      if (isSelected) { bg = '#EA580C'; border = '#EA580C'; color = '#FFFFFF'; }
                      else { bg = '#FFF7ED'; border = '#FFEDD5'; color = '#EA580C'; }
                    } else {
                      if (isSelected) { bg = '#2979FF'; border = '#2979FF'; color = '#FFFFFF'; }
                      else { bg = '#EFF6FF'; border = '#DBEAFE'; color = '#0D47A1'; }
                    }

                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setUrgency(lvl)}
                        style={{
                          padding: '0.6rem 0.4rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: bg,
                          border: `1px solid ${border}`,
                          color: color,
                          boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Blood Group Selector Grid */}
              <div className="form-group">
                <label className="form-label">Patient Blood Group Needed</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {bloodGroups.map(bg => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      style={{
                        padding: '0.55rem',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        background: bloodGroup === bg ? 'var(--secondary-blue)' : '#FFFFFF',
                        color: bloodGroup === bg ? '#FFFFFF' : 'var(--primary-navy)',
                        border: bloodGroup === bg ? '1px solid var(--secondary-blue)' : '1px solid var(--border-subtle)',
                        boxShadow: bloodGroup === bg ? '0 2px 6px rgba(41, 121, 255, 0.25)' : 'none'
                      }}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Component & Units */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Blood Component</label>
                  <select 
                    className="form-select"
                    value={component}
                    onChange={e => setComponent(e.target.value as BloodComponent)}
                  >
                    {components.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Required Units</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '0.65rem 0.9rem' }}
                      onClick={() => setUnits(Math.max(1, units - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      readOnly
                      value={units}
                      className="form-input"
                      style={{ textAlign: 'center', margin: '0 0.4rem', fontWeight: 800 }}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '0.65rem 0.9rem' }}
                      onClick={() => setUnits(Math.min(10, units + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Hospital and Location Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Hospital / Clinic</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    placeholder="e.g. AIIMS Delhi / Apollo"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Patient Case / Bed ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={patientCaseId}
                    onChange={e => setPatientCaseId(e.target.value)}
                    placeholder="e.g. ICU-302"
                  />
                </div>
              </div>

              {/* Real Location Capture Control */}
              <LocationCapture
                value={requestLocation}
                onChange={(loc) => {
                  setRequestLocation(loc);
                  setAddress(loc.address);
                  setCity(loc.city);
                }}
                label="Delivery Destination / Patient GPS Coordinates"
                placeholder="Search hospital or area (e.g. Apollo Hospital, AIIMS, Saket)..."
              />

              <div className="form-group">
                <label className="form-label">Clinical Notes / Surgery Indication</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Reason for urgency, surgery schedule..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setIsEmergencyModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.8rem' }}>
                <Activity size={18} />
                <span>Dispatch Smart Matching</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
