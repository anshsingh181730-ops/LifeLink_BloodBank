import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BloodGroup, BloodComponent } from '../../types';
import { StatusChip } from '../common/StatusChip';
import { QRModal } from '../common/QRModal';
import { 
  Landmark, AlertTriangle, Plus, QrCode, 
  Thermometer, TrendingUp 
} from 'lucide-react';
import { BloodInventoryTracker } from '../common/BloodInventoryTracker';
import { SmartDonorRanking } from '../common/SmartDonorRanking';

export const BloodBankDashboard: React.FC = () => {
  const { 
    bloodUnits, bloodBanks, addBloodUnit, 
    activeQrUnit, setActiveQrUnit, t 
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState<BloodGroup>('O-');
  const [newComponent, setNewComponent] = useState<BloodComponent>('Packed Red Blood Cells');
  const [newExpiry, setNewExpiry] = useState('2026-10-25');
  const [newTemp, setNewTemp] = useState<number>(4.0);

  const bank = bloodBanks.find(b => b.name.includes('Red Cross')) || bloodBanks[0];
  const bankUnits = bloodUnits.filter(u => u.bloodBankId === bank.id);

  // Check near expiry (< 3 days from 2026-09-22) — Flagged with Supportive Medical Red (#E53935)
  const nearExpiryUnits = bankUnits.filter(u => {
    const days = (new Date(u.expiryDate).getTime() - new Date('2026-09-22').getTime()) / (1000 * 60 * 60 * 24);
    return days <= 3 && u.status === 'stored';
  });

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUnit = addBloodUnit({
      unitCode: `LL-DL-26-${Date.now().toString().slice(-4)}-${newGroup}`,
      bloodBankId: bank.id,
      bloodBankName: bank.name,
      bloodGroup: newGroup,
      component: newComponent,
      collectionDate: '2026-09-22',
      expiryDate: newExpiry,
      temperatureCelsius: newTemp
    });
    setIsAddModalOpen(false);
    setActiveQrUnit(newUnit);
  };

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Blood Bank Identity Header */}
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
            <Landmark size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                {bank.name}
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
                CDSCO Licensed ({bank.license})
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Central Cold Storage Facility • {bank.operatingHours} • Telemetry Contact: {bank.contactPhone}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          <span>Intake & Issue Unit QR</span>
        </button>
      </div>

      {/* Near Expiry Banner — Supportive Medical Red (#E53935) */}
      {nearExpiryUnits.length > 0 && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={22} color="#E53935" />
            <div>
              <strong style={{ color: '#E53935', fontSize: '0.9rem' }}>
                CRITICAL EXPIRY ALERT: {nearExpiryUnits.length} Unit(s) Expiring within 48-72 Hours
              </strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Clinical wastage mitigation: Prioritize immediate dispatch for pending hospital surgical requests.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {nearExpiryUnits.map(u => (
              <button
                key={u.id}
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderColor: '#E53935', color: '#E53935' }}
                onClick={() => setActiveQrUnit(u)}
              >
                Inspect {u.unitCode} ({u.bloodGroup} {u.component})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Real-Time Stock Summary Grid — Primary Navy Blue for In Stock, Supportive Medical Red for Critical Shortage */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">{t.bloodbank.inventoryMatrix}</h2>
            <div className="card-desc">Live component reserve levels synchronized with the smart matching engine.</div>
          </div>
        </div>

        <div className="grid-4">
          {bloodGroups.map(bg => {
            const count = bank.inventorySummary[bg] || 0;
            const isCritical = count < 5;
            return (
              <div
                key={bg}
                style={{
                  background: isCritical ? '#FEF2F2' : '#F8FAFC',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: isCritical ? '1px solid #FECACA' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: isCritical ? '#E53935' : '#0D47A1' }}>
                    {bg}
                  </span>
                  <span style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    color: isCritical ? '#E53935' : '#0D47A1',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {isCritical ? 'CRITICAL SHORTAGE' : 'IN STOCK'}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: isCritical ? '#E53935' : '#0D47A1' }}>{count}</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>units</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unit-Level Traceability (Clinical Data Table) */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={20} color="#0D47A1" />
              <h2 className="card-title">{t.bloodbank.unitTracker}</h2>
            </div>
            <div className="card-desc">
              Track individual blood units from collection to testing, storage, and hospital issue.
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Unit QR Code</th>
                <th>Blood Group</th>
                <th>Component</th>
                <th>Storage Temp</th>
                <th>Expiry Date</th>
                <th>Lifecycle Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bankUnits.map(unit => {
                const isNearExpiry = (new Date(unit.expiryDate).getTime() - new Date('2026-09-22').getTime()) / (1000 * 60 * 60 * 24) <= 3;
                return (
                  <tr key={unit.id}>
                    <td>
                      <code style={{ color: '#0D47A1', fontWeight: 700, background: '#EDF2F7', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                        {unit.unitCode}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: '#0D47A1', fontSize: '0.95rem' }}>{unit.bloodGroup}</strong>
                    </td>
                    <td>{unit.component}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        <Thermometer size={13} color="#2979FF" /> {unit.temperatureCelsius}°C
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: isNearExpiry ? '#E53935' : 'var(--text-primary)',
                        fontWeight: isNearExpiry ? 800 : 600
                      }}>
                        {unit.expiryDate} {isNearExpiry && '(Near Expiry)'}
                      </span>
                    </td>
                    <td>
                      <StatusChip status={unit.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => setActiveQrUnit(unit)}
                      >
                        <QrCode size={13} />
                        <span>View Passport</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7-Day Demand Forecasting Widget (Clinical Navy Blue & Electric Blue) */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#0D47A1" />
              <h2 className="card-title">{t.bloodbank.demandForecast}</h2>
            </div>
            <div className="card-desc">
              Statistical demand prediction based on historical trauma intake, festive seasonality, and hospital census.
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(13, 71, 161, 0.08)', color: '#0D47A1', border: '1px solid rgba(13, 71, 161, 0.2)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
            ARIMA / LSTM Model
          </span>
        </div>

        <div className="grid-3">
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: '#B91C1C', fontWeight: 700 }}>PROJECTED DEFICIT</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#E53935', marginTop: '0.25rem' }}>
              O- & Platelets
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Expected 35% surge in trauma demand over the coming weekend. Recommend scheduling an NGO camp.
            </p>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: '#0D47A1', fontWeight: 700 }}>OUTDATING RISK TARGET</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0D47A1', marginTop: '0.25rem' }}>
              2.4% Estimated
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Down from 9.8% baseline due to FIFO rotation and early alert dispatch to regional trauma hubs.
            </p>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: '#2979FF', fontWeight: 700 }}>INTER-BANK BALANCING</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2979FF', marginTop: '0.25rem' }}>
              Surplus A+ & B+
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Surplus units can be transferred to Apollo Hospital or Safdarjung Trauma Centre on request.
            </p>
          </div>
        </div>
      </div>

      {/* Feature 3: Live Blood Inventory & Dynamic Expiry Tracking */}
      <BloodInventoryTracker />

      {/* Feature 1: Smart Donor Ranking System */}
      <SmartDonorRanking />

      {/* Add Blood Unit Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ background: 'var(--primary-navy)', color: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>Intake Blood Unit & Issue QR</h3>
            </div>
            <form onSubmit={handleAddUnit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select" value={newGroup} onChange={e => setNewGroup(e.target.value as BloodGroup)}>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Component</label>
                  <select className="form-select" value={newComponent} onChange={e => setNewComponent(e.target.value as BloodComponent)}>
                    <option value="Packed Red Blood Cells">Packed Red Blood Cells</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Platelets">Platelets</option>
                    <option value="Fresh Frozen Plasma">Fresh Frozen Plasma</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input type="date" className="form-input" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Cold Storage Temperature (°C)</label>
                  <input type="number" step="0.1" className="form-input" value={newTemp} onChange={e => setNewTemp(parseFloat(e.target.value))} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Register & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Inspector Modal */}
      <QRModal unit={activeQrUnit} onClose={() => setActiveQrUnit(null)} />
    </div>
  );
};
