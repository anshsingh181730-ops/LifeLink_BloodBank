import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, Heart, Award, Check, X, MapPin, Clock, 
  Sparkles, CheckCircle2, Sliders, Plus, Activity, 
  ArrowRight, RefreshCw, FileText, Navigation, AlertCircle, ShieldCheck, LogOut
} from 'lucide-react';
import { Location } from '../../types';
import { captureBrowserLocation } from '../../services/locationService';
import { LocationCapture } from '../common/LocationCapture';
import { LiveTracker } from '../common/LiveTracker';
import { StatusChip } from '../common/StatusChip';
import { AutoEscalationWorkflow } from '../common/AutoEscalationWorkflow';
import { DonorReliabilityProfile } from '../common/DonorReliabilityProfile';
import { SmartDonorRanking } from '../common/SmartDonorRanking';

export const PatientDonorDashboard: React.FC = () => {
  const { 
    currentUser, donorProfiles, toggleDonorAvailability, requests, 
    acceptMatch, declineMatch, impactNotifications, setIsEmergencyModalOpen,
    selectedRequestId, setSelectedRequestId, setActiveUser, kycSubmissions,
    setIsDonorRegistrationModalOpen, t, users, signOutDonor
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'donor'>('requests');
  const [responseTimer, setResponseTimer] = useState<number>(45);

  const profile = donorProfiles[currentUser.id] || (currentUser.id === 'usr-donor-1' ? donorProfiles['usr-donor-1'] : undefined) || {
    userId: currentUser.id,
    bloodGroup: 'O+',
    isAvailable: currentUser.kycStatus === 'verified',
    lastDonationDate: '',
    reliabilityScore: 50,
    totalDonations: 0,
    badges: currentUser.kycStatus === 'verified' ? ['Verified Lifesaver'] : ['Pending KYC Verification'],
    notificationRadiusKm: 15,
    urgencyThreshold: 'standard',
    simulatedAadhaarMasked: 'XXXX-XXXX-****'
  };

  const userKycSubmission = kycSubmissions.find(s => s.donorId === currentUser.id);
  const currentKycStatus = profile.kycStatus || currentUser.kycStatus || 'verified';
  const hasDonationHistory = profile.totalDonations > 0 && currentKycStatus === 'verified';

  const donorLocation: Location = profile.currentLocation || currentUser.location || {
    address: 'Hauz Khas, New Delhi',
    city: 'Delhi',
    lat: 28.5494,
    lng: 77.2001,
    source: 'default'
  };

  const handleToggleWithLocation = async () => {
    if (currentKycStatus !== 'verified') return;
    if (!profile.isAvailable) {
      // Turning ON: prompt/capture current location
      try {
        const res = await captureBrowserLocation();
        toggleDonorAvailability(currentUser.id, res.location);
      } catch (err) {
        console.warn('Browser location unavailable, keeping registered location:', err);
        toggleDonorAvailability(currentUser.id, donorLocation);
      }
    } else {
      // Turning OFF
      toggleDonorAvailability(currentUser.id);
    }
  };

  // Requests raised by or relevant to this user
  const userRequests = requests.filter(r => 
    r.requesterRole === 'patient' || 
    r.requesterId === currentUser.id ||
    (currentUser.id === 'usr-donor-1' && r.id === 'req-003') ||
    (currentUser.id === 'usr-patient-1' && r.id === 'req-001')
  );
  const activeRequest = requests.find(r => r.id === selectedRequestId) || userRequests[0] || requests[0];

  // Incoming emergency match for this donor
  const incomingMatch = requests.find(r => 
    r.status === 'notified' && 
    (r.matchedDonorId === currentUser.id || (!r.matchedDonorId && r.bloodGroup === profile.bloodGroup && r.requesterId !== currentUser.id))
  );

  // Response countdown timer for incoming match
  useEffect(() => {
    let interval: any;
    if (incomingMatch && responseTimer > 0) {
      interval = setInterval(() => {
        setResponseTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [incomingMatch, responseTimer]);

  // 90-day cooldown calculation
  const calculateEligibility = () => {
    if (!profile.lastDonationDate) return { isEligible: true, daysSince: 100, daysRemaining: 0 };
    const lastDate = new Date(profile.lastDonationDate).getTime();
    const now = new Date('2026-09-22').getTime();
    const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    const isEligible = daysSince >= 90;
    const daysRemaining = Math.max(0, 90 - daysSince);
    return { isEligible, daysSince, daysRemaining };
  };

  const eligibility = calculateEligibility();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Unified Portal Header */}
      <div className="card" style={{
        background: '#FFFFFF',
        borderLeft: '4px solid var(--primary-navy)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Top Row: User Identity & Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          {/* Identity & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
            <div style={{
              width: 58,
              height: 58,
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-navy)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(13, 71, 161, 0.25)',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1 }}>{profile.bloodGroup}</span>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.04em', opacity: 0.85, marginTop: '2px' }}>GROUP</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Patient & Donor Portal
                </h1>
                <span style={{
                  background: 'var(--secondary-blue-light)',
                  color: 'var(--primary-navy)',
                  border: '1px solid var(--secondary-blue-border)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  {profile.simulatedAadhaarMasked || 'XXXX-XXXX-4821 (Simulated e-KYC)'}
                </span>

                {currentKycStatus === 'pending' ? (
                  <span style={{
                    background: '#FEF3C7',
                    color: '#B45309',
                    border: '1px solid #FCD34D',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <Clock size={12} />
                    Pending KYC Verification
                  </span>
                ) : currentKycStatus === 'rejected' ? (
                  <span style={{
                    background: '#FEE2E2',
                    color: '#B91C1C',
                    border: '1px solid #FECACA',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <X size={12} />
                    KYC Verification Rejected
                  </span>
                ) : hasDonationHistory ? (
                  <span className="priority-verified-donor-badge" title="Has verified blood donation history on LifeLink">
                    <Award size={13} color="#D97706" />
                    Verified Donor ({profile.totalDonations} Donations • Priority Active)
                  </span>
                ) : (
                  <span style={{
                    background: '#F1F5F9',
                    color: '#64748B',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    Standard Requester (0 Donations Logged)
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                Account: <strong>{currentUser.name}</strong> • Phone: {currentUser.phone} • Region: {currentUser.location.address}
              </div>
            </div>
          </div>

          {/* Quick Actions & Donor Availability Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Quick Donor Availability Toggle */}
            <div style={{
              background: 'var(--bg-input)',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', lineHeight: 1.1 }}>
                  Donor Status
                </span>
                <strong style={{ 
                  fontSize: '0.8rem', 
                  color: currentKycStatus === 'pending' ? '#D97706' : currentKycStatus === 'rejected' ? '#DC2626' : profile.isAvailable ? '#10B981' : 'var(--text-secondary)' 
                }}>
                  {currentKycStatus === 'pending' 
                    ? 'Verification Pending' 
                    : currentKycStatus === 'rejected' 
                    ? 'KYC Rejected' 
                    : profile.isAvailable ? 'Available to Donate' : 'Unavailable'}
                </strong>
              </div>

              <button
                type="button"
                id="portal-toggle-donor-availability"
                disabled={currentKycStatus !== 'verified'}
                onClick={currentKycStatus === 'verified' ? handleToggleWithLocation : undefined}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 'var(--radius-full)',
                  background: currentKycStatus !== 'verified' ? '#E2E8F0' : profile.isAvailable ? '#10B981' : '#CBD5E1',
                  position: 'relative',
                  padding: 2,
                  border: 'none',
                  cursor: currentKycStatus !== 'verified' ? 'not-allowed' : 'pointer',
                  opacity: currentKycStatus !== 'verified' ? 0.6 : 1
                }}
                aria-label="Toggle donor availability"
                title={
                  currentKycStatus === 'pending' 
                    ? 'Donor availability is locked until government KYC verification is approved by clinical staff.'
                    : currentKycStatus === 'rejected'
                    ? 'KYC verification was rejected. Please resubmit your identification document.'
                    : profile.isAvailable ? 'Click to pause donor alerts' : 'Click to activate donor availability'
                }
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  transform: (profile.isAvailable && currentKycStatus === 'verified') ? 'translateX(20px)' : 'translateX(0)',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                }} />
              </button>
            </div>

            {/* Raise Blood Request Button */}
            <button
              type="button"
              id="btn-raise-request-portal"
              className="btn-primary"
              onClick={() => setIsEmergencyModalOpen(true)}
              style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}
            >
              <Plus size={16} />
              <span>{t.emergency.requestBloodNow}</span>
            </button>

            {/* Portal Sign Out Button */}
            <button
              type="button"
              id="btn-donor-portal-signout"
              onClick={signOutDonor}
              style={{
                fontSize: '0.86rem',
                padding: '0.65rem 1.15rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#FFFFFF',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-md)',
                color: '#DC2626',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Sign out of donor account and return to public landing page"
            >
              <LogOut size={16} color="#DC2626" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar: Demo Account Switcher to Compare Priority Boost vs Normal */}
        <div style={{
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={13} />
            <span>Interactive Demo Account Switcher:</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              id="btn-switch-account-vikram"
              onClick={() => setActiveUser('usr-donor-1')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: currentUser.id === 'usr-donor-1' ? '1px solid #D97706' : '1px solid var(--border-subtle)',
                background: currentUser.id === 'usr-donor-1' ? '#FFFBEB' : '#F8FAFC',
                color: currentUser.id === 'usr-donor-1' ? '#B45309' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Award size={13} color="#D97706" />
              <span>Vikram Malhotra (Verified Donor: 9 Donations • Priority Active)</span>
            </button>

            <button
              type="button"
              id="btn-switch-account-rahul"
              onClick={() => setActiveUser('usr-patient-1')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: currentUser.id === 'usr-patient-1' ? '1px solid #2563EB' : '1px solid var(--border-subtle)',
                background: currentUser.id === 'usr-patient-1' ? '#EFF6FF' : '#F8FAFC',
                color: currentUser.id === 'usr-patient-1' ? '#1D4ED8' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Users size={13} color="#2563EB" />
              <span>Rahul Varma (Standard User: 0 Donations • Normal Queue)</span>
            </button>

            {(() => {
              const registeredDonor = users.find(u => (u.role === 'patient' || u.role === 'donor') && u.id !== 'usr-donor-1' && u.id !== 'usr-patient-1');
              if (!registeredDonor) return null;
              const isSelected = currentUser.id === registeredDonor.id;
              const statusText = (donorProfiles[registeredDonor.id]?.kycStatus || registeredDonor.kycStatus || 'pending').toUpperCase();
              return (
                <button
                  type="button"
                  id="btn-switch-account-custom-donor"
                  onClick={() => setActiveUser(registeredDonor.id)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: isSelected ? '1px solid #0D47A1' : '1px solid var(--border-subtle)',
                    background: isSelected ? '#EFF6FF' : '#F8FAFC',
                    color: isSelected ? '#0D47A1' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ShieldCheck size={13} color="#0D47A1" />
                  <span>{registeredDonor.name} (Live Registered Donor • {statusText})</span>
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Amber Banner if Pending KYC Verification */}
      {currentKycStatus === 'pending' && (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FCD34D',
          borderLeft: '4px solid #F59E0B',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem'
        }}>
          <Clock size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ color: '#92400E', fontSize: '0.88rem' }}>
                Pending Government e-KYC Verification
              </strong>
              <span style={{
                background: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.1rem 0.5rem',
                borderRadius: 'var(--radius-full)'
              }}>
                Under Clinical Staff Audit
              </span>
            </div>
            <span style={{ color: '#B45309', fontSize: '0.82rem', lineHeight: '1.45', display: 'block', marginTop: '0.25rem' }}>
              Your registered government ID is currently queued for audit. To protect patient safety and prevent fake broadcasts, voluntary donor availability dispatch and verified donor priority matching are paused until verification is complete.
            </span>
            {userKycSubmission && (
              <div style={{ marginTop: '0.45rem', fontSize: '0.76rem', color: '#78350F', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span>Document: <strong>{userKycSubmission.documentFileName}</strong></span>
                <span>ID: <strong>{userKycSubmission.idNumberMasked}</strong> ({userKycSubmission.idType.toUpperCase()})</span>
                <span>Submitted: <strong>{new Date(userKycSubmission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(userKycSubmission.submittedAt).toLocaleDateString()}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Red Banner if KYC Rejected with Resubmit Action */}
      {currentKycStatus === 'rejected' && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderLeft: '4px solid #DC2626',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem'
        }}>
          <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ color: '#991B1B', fontSize: '0.88rem' }}>
                KYC Verification Rejected
              </strong>
              <span style={{
                background: '#FEE2E2',
                color: '#991B1B',
                border: '1px solid #FCA5A5',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.1rem 0.5rem',
                borderRadius: 'var(--radius-full)'
              }}>
                Action Required
              </span>
            </div>
            <span style={{ color: '#B91C1C', fontSize: '0.82rem', lineHeight: '1.45', display: 'block', marginTop: '0.25rem' }}>
              Rejection Reason: <strong>{userKycSubmission?.rejectionReason || 'Uploaded document was unreadable, mismatched, or expired.'}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsDonorRegistrationModalOpen(true)}
              style={{
                marginTop: '0.6rem',
                background: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.4rem 0.95rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Resubmit Government ID Document</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Two-Tab Navigation Bar */}
      <div className="portal-tab-bar" role="tablist">
        <button
          type="button"
          id="tab-my-requests"
          role="tab"
          aria-selected={activeTab === 'requests'}
          className={`portal-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FileText size={17} />
          <span>My Blood Requests</span>
          <span className="portal-tab-badge">
            {userRequests.length} Active
          </span>
        </button>

        <button
          type="button"
          id="tab-donor-status"
          role="tab"
          aria-selected={activeTab === 'donor'}
          className={`portal-tab-btn ${activeTab === 'donor' ? 'active' : ''}`}
          onClick={() => setActiveTab('donor')}
        >
          <Heart size={17} />
          <span>Donor Status & Reliability</span>
          <span className="portal-tab-badge" style={{ background: profile.isAvailable ? '#10B981' : '#64748B', color: '#FFFFFF' }}>
            {profile.isAvailable ? 'Available' : 'Paused'}
          </span>
        </button>
      </div>

      {/* TAB 1: My Blood Requests */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Priority Status Announcement */}
          {hasDonationHistory ? (
            <div style={{
              background: 'linear-gradient(90deg, #FFFBEB 0%, #FFFFFF 100%)',
              border: '1px solid #FDE68A',
              borderLeft: '4px solid #F59E0B',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D97706',
                  flexShrink: 0
                }}>
                  <Award size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.92rem', color: '#92400E', display: 'block' }}>
                    Verified Donor Contribution Priority Active
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: '#78350F', marginTop: '0.15rem' }}>
                    Because you personally donated blood {profile.totalDonations} time(s) with an optimal {profile.reliabilityScore}% reliability rating, any blood request you raise is automatically flagged with <strong>Priority Request — Verified Donor</strong> and elevated to top dispatch rank.
                  </div>
                </div>
              </div>

              <span className="priority-verified-donor-badge" style={{ fontSize: '0.78rem' }}>
                <Award size={14} color="#D97706" />
                Contribution Boost Active
              </span>
            </div>
          ) : (
            <div style={{
              background: '#F0F7FF',
              border: '1px solid #BFDBFE',
              borderLeft: '4px solid #2563EB',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={20} color="#2563EB" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--primary-navy)' }}>
                    Standard Request Flow Active
                  </strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    You currently have no logged blood donations. Once you donate blood through LifeLink and help save a life, your future requests will automatically unlock <strong>Verified Donor Priority Matching</strong>.
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderColor: '#2563EB', color: '#2563EB' }}
                onClick={() => setActiveTab('donor')}
              >
                <span>View Donor Opportunities</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Active Request Live Tracker */}
          {activeRequest && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} color="var(--primary-navy)" />
                  Active Coordination & Telemetry Tracker
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Live telemetry via matching engine
                </span>
              </div>

              <LiveTracker request={activeRequest} />
            </section>
          )}

          {/* Automatic Multi-Tier Escalation Workflow */}
          <AutoEscalationWorkflow />

          {/* Clinical Request Records Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">My Clinical Request Records</h2>
                <div className="card-desc">All past and ongoing requests raised for hospital or outpatient cases.</div>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Blood Needed</th>
                    <th>Urgency & Priority</th>
                    <th>Hospital / Destination</th>
                    <th>Matched Provider</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userRequests.map(req => (
                    <tr key={req.id} style={{ background: activeRequest?.id === req.id ? '#F0F7FF' : 'transparent' }}>
                      <td style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary-navy)' }}>{req.id}</td>
                      <td>
                        <strong style={{ color: req.bloodGroup === 'O-' ? '#E53935' : 'var(--primary-navy)', fontSize: '0.95rem' }}>
                          {req.bloodGroup}
                        </strong> ({req.units} Units {req.component})
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                          <span className={`urgency-badge ${req.urgency}`}>{req.urgency}</span>
                          {req.isPriority && (
                            <span className="priority-verified-donor-badge" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                              <Award size={11} color="#D97706" />
                              Priority Request — Verified Donor
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{req.hospitalName || 'Emergency Ward'}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.location.city}</span>
                      </td>
                      <td>
                        {req.matchedDonorName ? (
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>{req.matchedDonorName}</strong>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#10B981' }}>Nearby Donor</span>
                          </div>
                        ) : req.matchedBankName ? (
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>{req.matchedBankName}</strong>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--secondary-blue)' }}>Blood Bank Backup</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Matching in progress...</span>
                        )}
                      </td>
                      <td>
                        <StatusChip status={req.status} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => setSelectedRequestId(req.id)}
                        >
                          Track Live
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Donor Status & Availability */}
      {activeTab === 'donor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Eligibility & Availability Card */}
          <div className="card" style={{
            background: '#FFFFFF',
            borderLeft: '4px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: eligibility.isEligible ? '#DCFCE7' : '#FEF3C7',
                border: eligibility.isEligible ? '2px solid #86EFAC' : '2px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: eligibility.isEligible ? '#16A34A' : '#D97706',
                flexShrink: 0
              }}>
                {eligibility.isEligible ? <CheckCircle2 size={26} /> : <Clock size={26} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    90-Day Clinical Donation Eligibility
                  </h3>
                  <span style={{
                    background: eligibility.isEligible ? '#ECFDF5' : '#FFFBEB',
                    color: eligibility.isEligible ? '#059669' : '#D97706',
                    border: eligibility.isEligible ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {eligibility.isEligible ? 'Eligible to Donate' : `Cooldown (${eligibility.daysRemaining} days left)`}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Last Donated: <strong>{profile.lastDonationDate || 'Not yet recorded'}</strong> ({eligibility.daysSince} days ago). Full whole-blood recovery window observed.
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>I am available as a donor</span>
                <strong style={{ fontSize: '0.85rem', color: profile.isAvailable ? '#10B981' : '#64748B' }}>
                  {profile.isAvailable ? 'Active — Receiving Alerts' : 'Paused — Inactive'}
                </strong>
              </div>

              <button
                type="button"
                onClick={handleToggleWithLocation}
                style={{
                  width: 48,
                  height: 26,
                  borderRadius: 'var(--radius-full)',
                  background: profile.isAvailable ? '#10B981' : '#CBD5E1',
                  position: 'relative',
                  padding: 2,
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Toggle availability"
              >
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  transform: profile.isAvailable ? 'translateX(22px)' : 'translateX(0)',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                }} />
              </button>
            </div>
          </div>

          {/* Real Donor Standby Geolocation Card */}
          <div className="card" style={{ background: '#FFFFFF', borderLeft: '4px solid var(--secondary-blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Navigation size={18} color="var(--primary-navy)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Donor Standby Location & Live Telemetry
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Your real coordinates determine how quickly you are ranked and alerted for nearby emergency blood requests (within your {profile.notificationRadiusKm} km willing radius).
            </p>
            <LocationCapture
              value={donorLocation}
              onChange={(newLoc) => {
                toggleDonorAvailability(currentUser.id, newLoc);
              }}
              label="Current Standby Location Pin"
              placeholder="Search address or area for donor availability..."
            />
          </div>

          {/* Incoming Emergency Match Card */}
          {incomingMatch && profile.isAvailable && (
            <div className="card" style={{
              background: '#FFF5F5',
              border: '2px solid #E53935',
              boxShadow: '0 4px 12px rgba(229, 57, 53, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#E53935'
                  }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#C62828' }}>
                    Incoming Critical Match Notification
                  </h2>
                </div>

                <div style={{
                  background: '#FEF2F2',
                  color: '#E53935',
                  border: '1px solid #FECACA',
                  padding: '0.35rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <Clock size={15} />
                  Response SLA: {responseTimer}s
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required Component</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#E53935' }}>
                    {incomingMatch.bloodGroup} {incomingMatch.component}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{incomingMatch.units} Units Needed</span>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hospital Destination</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                    {incomingMatch.hospitalName || 'Apollo Emergency Hospital'}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MapPin size={12} /> Approx 3.8 km away
                  </span>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clinical Indication</span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {incomingMatch.notes || 'Emergency surgical requirement.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => declineMatch(incomingMatch.id, currentUser.id)}
                >
                  <X size={16} />
                  <span>{t.donor.declineMatch}</span>
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.8rem', background: '#E53935' }}
                  onClick={() => acceptMatch(incomingMatch.id, currentUser.id)}
                >
                  <Check size={18} />
                  <span>{t.donor.acceptMatch}</span>
                </button>
              </div>
            </div>
          )}

          {/* Reliability Score, Badges, and Stats */}
          <div className="grid-3">
            <div className="card" style={{ borderTop: '3px solid #0D47A1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0D47A1', marginBottom: '0.5rem' }}>
                <Award size={20} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t.donor.reliabilityScore}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0D47A1' }}>
                  {profile.reliabilityScore}%
                </span>
                <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 700 }}>
                  {profile.reliabilityScore >= 90 ? 'Optimal' : profile.reliabilityScore >= 75 ? 'Good' : 'Building'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Directly sets priority weight when you raise an emergency blood request.
              </p>
            </div>

            <div className="card" style={{ borderTop: '3px solid #2979FF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2979FF', marginBottom: '0.5rem' }}>
                <Heart size={20} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Transfusions</h3>
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0D47A1' }}>
                {profile.totalDonations} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>Units</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Up to <strong>{profile.totalDonations * 3} lives</strong> potentially saved or improved.
              </p>
            </div>

            <div className="card" style={{ borderTop: '3px solid #0D47A1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0D47A1', marginBottom: '0.5rem' }}>
                <Sparkles size={20} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {t.donor.badges}
                </h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {profile.badges && profile.badges.length > 0 ? (
                  profile.badges.map(b => (
                    <span
                      key={b}
                      style={{
                        background: 'rgba(13, 71, 161, 0.08)',
                        color: '#0D47A1',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.3rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(13, 71, 161, 0.2)'
                      }}
                    >
                      ★ {b}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Donate blood once to earn your first lifesaver badge!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sweden-Style Closed Impact Loop Feed */}
          <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <h2 className="card-title" style={{ color: '#0F172A' }}>{t.donor.impactFeedTitle}</h2>
                </div>
                <div className="card-desc">
                  Direct verification messages triggered when a hospital marks your unit as transfused.
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                {impactNotifications.length} Confirmed Transfusions
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {impactNotifications.map(imp => (
                <div
                  key={imp.id}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderLeft: '4px solid #10B981',
                    padding: '1.1rem 1.25rem',
                    borderRadius: '0 var(--radius-md) var(--radius-md) 0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Heart size={16} fill="#E53935" color="#E53935" />
                      <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
                        {imp.message}
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {imp.transfusionDate}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Transfused at <strong>{imp.hospitalName}</strong> • Unit Tracking Code: <code style={{ color: '#0D47A1', background: '#EDF2F7', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>{imp.unitCode}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={18} /> Notification & Dispatch Settings
                </h3>
                <div className="card-desc">Prevent alert fatigue by tailoring emergency response radius and channels.</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Alert Radius: {profile.notificationRadiusKm} km</label>
                <input type="range" min="5" max="50" step="5" defaultValue={profile.notificationRadiusKm} style={{ width: '100%' }} />
              </div>

              <div>
                <label className="form-label">Minimum Urgency Threshold</label>
                <select className="form-select" defaultValue={profile.urgencyThreshold}>
                  <option value="standard">Standard, Urgent & Critical</option>
                  <option value="urgent">Urgent & Critical Only</option>
                  <option value="critical">Critical Only (Life-Threatening)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Delivery Channels</label>
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                  <label><input type="checkbox" defaultChecked /> SMS</label>
                  <label><input type="checkbox" defaultChecked /> WhatsApp</label>
                  <label><input type="checkbox" defaultChecked /> Push</label>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Donor Contribution & Reliability Score Breakdown */}
          <DonorReliabilityProfile />

          {/* Feature 1: Smart Donor Match & Ranking System */}
          <SmartDonorRanking />
        </div>
      )}
    </div>
  );
};
