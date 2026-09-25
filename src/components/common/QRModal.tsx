import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { BloodUnit } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusChip } from './StatusChip';
import { X, QrCode, Check, Thermometer, Calendar } from 'lucide-react';

interface QRModalProps {
  unit: BloodUnit | null;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ unit, onClose }) => {
  const { advanceUnitStatus } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (unit) {
      const payload = JSON.stringify({
        code: unit.unitCode,
        group: unit.bloodGroup,
        component: unit.component,
        bank: unit.bloodBankName,
        expiry: unit.expiryDate,
        standard: "ISBT-128 / LifeLink-Clinical"
      });

      QRCode.toDataURL(payload, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0D47A1',
          light: '#FFFFFF'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [unit]);

  if (!unit) return null;

  const getNextStatus = (): { next: any; label: string } | null => {
    switch (unit.status) {
      case 'collected': return { next: 'tested', label: 'Advance to Lab Tested' };
      case 'tested': return { next: 'stored', label: 'Advance to Cold Storage' };
      case 'stored': return { next: 'issued', label: 'Issue Unit for Transfusion' };
      default: return null;
    }
  };

  const nextStep = getNextStatus();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ background: 'var(--primary-navy)', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={20} color="#90CAF9" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>Clinical Unit Passport</h3>
          </div>
          <button type="button" onClick={onClose} style={{ color: '#E3F2FD' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{
            background: '#FFFFFF',
            padding: '1rem',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'inline-block',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`QR for ${unit.unitCode}`} style={{ display: 'block', width: 180, height: 180 }} />
            ) : (
              <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                Generating QR...
              </div>
            )}
          </div>

          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
            {unit.unitCode}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>{unit.bloodGroup}</span>
            <span>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>{unit.component}</span>
            <span>•</span>
            <StatusChip status={unit.status} />
          </div>

          {/* Metadata Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            textAlign: 'left',
            background: '#F8FAFC',
            border: '1px solid var(--border-subtle)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Origin Center</span>
              <strong style={{ color: 'var(--primary-navy)' }}>{unit.bloodBankName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Cold Chain Temp</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-primary)' }}>
                <Thermometer size={14} color="#2979FF" /> {unit.temperatureCelsius}°C
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Collection Date</span>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Calendar size={13} color="var(--primary-navy)" /> {unit.collectionDate}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Expiry Date</span>
              <strong style={{ color: '#E53935', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Calendar size={13} /> {unit.expiryDate}
              </strong>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {nextStep && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => advanceUnitStatus(unit.id, nextStep.next)}
            >
              <Check size={16} />
              <span>{nextStep.label}</span>
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
