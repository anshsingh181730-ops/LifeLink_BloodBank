import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, BloodComponent, UrgencyLevel } from '../../types';
import { AlertCircle, X, MapPin, Activity } from 'lucide-react';

export const EmergencyModal: React.FC = () => {
  const { isEmergencyModalOpen, setIsEmergencyModalOpen, createRequest, t } = useApp();

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<BloodComponent>('Packed Red Blood Cells');
  const [units, setUnits] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('critical');
  const [address, setAddress] = useState('Indraprastha Apollo Hospital, Sarita Vihar');
  const [city] = useState('Delhi');
  const [hospitalName, setHospitalName] = useState('Apollo Emergency ICU');
  const [patientCaseId, setPatientCaseId] = useState('EMG-ICU-882');
  const [notes, setNotes] = useState('Severe blood loss trauma incident.');

  if (!isEmergencyModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest({
      bloodGroup,
      component,
      units,
      urgency,
      address,
      city,
      lat: 28.5355,
      lng: 77.2910,
      patientCaseId,
      hospitalName,
      notes
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
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header" style={{ background: 'var(--primary-navy)', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={22} color="#FFFFFF" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>{t.emergency.requestBloodNow}</h3>
              <span style={{ fontSize: '0.75rem', color: '#E3F2FD' }}>
                Direct Clinical Broadcast to Ranked Compatible Donors & Nearby Banks
              </span>
            </div>
          </div>
          <button type="button" onClick={() => setIsEmergencyModalOpen(false)} style={{ color: '#FFFFFF' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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

            <div className="form-group">
              <label className="form-label">Delivery Destination Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Address or GPS Pin"
                  style={{ paddingLeft: '2.2rem' }}
                />
                <MapPin size={16} color="var(--secondary-blue)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

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
      </div>
    </div>
  );
};
