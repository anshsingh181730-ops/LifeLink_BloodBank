import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { REGIONAL_HEATMAP_DATA } from '../../data/mockData';
import { Users, Calendar, MapPin, Plus, TrendingUp } from 'lucide-react';

export const NgoDashboard: React.FC = () => {
  const { currentUser, camps, scheduleCamp, bloodBanks, t } = useApp();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const city = 'Delhi NCR';
  const [targetUnits, setTargetUnits] = useState(150);
  const [volunteers, setVolunteers] = useState(25);
  const [date, setDate] = useState('2026-10-05');
  const [partnerBank, setPartnerBank] = useState(bloodBanks[0].name);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !venue) return;
    scheduleCamp({
      ngoId: currentUser.id,
      ngoName: currentUser.institutionName || 'Rotary Life Foundation',
      title,
      venue,
      city,
      targetUnits,
      registeredVolunteers: volunteers,
      date,
      status: 'upcoming',
      partnerBank
    });
    setIsScheduleOpen(false);
    setTitle('');
    setVenue('');
  };

  const getDeficitColor = (level: string) => {
    switch (level) {
      case 'critical': return { bg: '#FEF2F2', text: '#E53935', border: '#FECACA' };
      case 'high': return { bg: '#EFF6FF', text: '#2979FF', border: '#BFDBFE' };
      default: return { bg: '#F0FDF4', text: '#10B981', border: '#BBF7D0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderLeft: '4px solid var(--primary-navy)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            background: 'var(--secondary-blue-light)',
            border: '1px solid var(--secondary-blue-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-navy)'
          }}>
            <Users size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                {currentUser.institutionName || 'Rotary Life Foundation India'}
              </h1>
              <span style={{
                background: 'rgba(13, 71, 161, 0.08)',
                color: 'var(--primary-navy)',
                border: '1px solid rgba(13, 71, 161, 0.2)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                NGO Darpan Verified ({currentUser.licenseNumber})
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Camp Organiser: <strong>{currentUser.name}</strong> • Clinical Coordination Directorate Partner
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsScheduleOpen(true)}
        >
          <Plus size={18} />
          <span>{t.ngo.campScheduler}</span>
        </button>
      </div>

      {/* Demand & Shortage Heatmap */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--primary-navy)" />
              <h2 className="card-title">{t.ngo.heatmapTitle}</h2>
            </div>
            <div className="card-desc">
              Data-driven camp placement: Visualizing regional blood deficits so drives target areas of clinical shortage.
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'var(--secondary-blue-light)', color: 'var(--primary-navy)', border: '1px solid var(--secondary-blue-border)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
            Hospital Telemetry Sync
          </span>
        </div>

        <div className="grid-3">
          {REGIONAL_HEATMAP_DATA.map((item, idx) => {
            const colors = getDeficitColor(item.deficitLevel);
            return (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${colors.border}`,
                  padding: '1.1rem',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy)' }}>{item.region}</h3>
                  <span style={{
                    background: colors.bg,
                    color: colors.text,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase'
                  }}>
                    {item.deficitLevel} Deficit
                  </span>
                </div>

                <div style={{ margin: '0.75rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Deficit Index</span>
                    <strong style={{ color: colors.text }}>{item.deficitPercent}% Shortage</strong>
                  </div>
                  <div style={{ height: '6px', background: '#E2E8F0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${item.deficitPercent}%`, height: '100%', background: colors.text }} />
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <div>Primary Need: <strong style={{ color: 'var(--primary-navy)' }}>{item.primaryNeed}</strong></div>
                  <div>Linked Facilities: <strong>{item.hospitalCount} Hospitals</strong></div>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: '0.85rem', padding: '0.4rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    setVenue(`${item.region} Community Centre`);
                    setIsScheduleOpen(true);
                  }}
                >
                  Schedule Drive in this Zone
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Drives Roster */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Scheduled Donation Drives</h2>
            <div className="card-desc">Active campaigns coordinated with registered volunteer teams and partner banks.</div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Drive Name</th>
                <th>Target Date</th>
                <th>Venue / Location</th>
                <th>Target Collection</th>
                <th>Volunteers</th>
                <th>Partner Blood Centre</th>
              </tr>
            </thead>
            <tbody>
              {camps.map(camp => (
                <tr key={camp.id}>
                  <td>
                    <strong style={{ color: 'var(--primary-navy)' }}>{camp.title}</strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{camp.ngoName}</span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                      <Calendar size={13} color="var(--primary-navy)" /> {camp.date}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                      <MapPin size={13} color="var(--secondary-blue)" /> {camp.venue}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--primary-navy)' }}>{camp.targetUnits} Units</strong>
                  </td>
                  <td>
                    <span style={{ color: 'var(--secondary-blue)', fontWeight: 600 }}>{camp.registeredVolunteers} Volunteers</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{camp.partnerBank}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Camp Modal */}
      {isScheduleOpen && (
        <div className="modal-overlay" onClick={() => setIsScheduleOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header" style={{ background: 'var(--primary-navy)', color: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>Schedule Blood Donation Drive</h3>
            </div>
            <form onSubmit={handleScheduleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Camp Title</label>
                  <input type="text" className="form-input" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Rohini Sector 14 Mega Lifesaver Camp" />
                </div>

                <div className="form-group">
                  <label className="form-label">Venue / Address</label>
                  <input type="text" className="form-input" required value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Community Hall, Rohini Sector 14" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Target Units</label>
                    <input type="number" className="form-input" value={targetUnits} onChange={e => setTargetUnits(parseInt(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Volunteers Registered</label>
                    <input type="number" className="form-input" value={volunteers} onChange={e => setVolunteers(parseInt(e.target.value))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Camp Date</label>
                    <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Partner Blood Bank</label>
                    <select className="form-select" value={partnerBank} onChange={e => setPartnerBank(e.target.value)}>
                      {bloodBanks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsScheduleOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm & Publish Camp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
