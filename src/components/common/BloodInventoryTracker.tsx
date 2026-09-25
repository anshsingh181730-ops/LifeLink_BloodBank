import React, { useState } from 'react';
import { BloodGroup, BloodComponent } from '../../types';
import { 
  AlertTriangle, CheckCircle2, Clock, 
  Thermometer, Filter 
} from 'lucide-react';

interface InventoryBatchUnit {
  id: string;
  batchCode: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsAvailable: number;
  collectionDate: string;
  expiryDate: string;
  storageTempCelsius: number;
  hoursRemaining: number;
}

export const BloodInventoryTracker: React.FC = () => {
  const [selectedComponentFilter, setSelectedComponentFilter] = useState<string>('All');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('All');
  const [flaggedUnitIds, setFlaggedUnitIds] = useState<Record<string, boolean>>({});

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  // Current stock counts per blood group across all units
  const aggregateStockCounts: Record<BloodGroup, number> = {
    'O-': 12,
    'O+': 80,
    'A-': 15,
    'A+': 79,
    'B-': 8,
    'B+': 103,
    'AB-': 6,
    'AB+': 46
  };

  // Detailed mock batches with realistic expiry schedules
  const inventoryUnits: InventoryBatchUnit[] = [
    {
      id: 'unit-inv-01',
      batchCode: 'LL-DL-26-8812-O-',
      bloodGroup: 'O-',
      component: 'Platelets',
      unitsAvailable: 2,
      collectionDate: '2026-09-20',
      expiryDate: '2026-09-24 18:00',
      storageTempCelsius: 22.0,
      hoursRemaining: 26 // <48 hrs -> RED
    },
    {
      id: 'unit-inv-02',
      batchCode: 'LL-DL-26-4421-AB-',
      bloodGroup: 'AB-',
      component: 'Packed Red Blood Cells',
      unitsAvailable: 3,
      collectionDate: '2026-08-16',
      expiryDate: '2026-09-25 12:00',
      storageTempCelsius: 4.1,
      hoursRemaining: 44 // <48 hrs -> RED
    },
    {
      id: 'unit-inv-03',
      batchCode: 'LL-DL-26-7091-B-',
      bloodGroup: 'B-',
      component: 'Whole Blood',
      unitsAvailable: 4,
      collectionDate: '2026-08-25',
      expiryDate: '2026-09-29 09:00',
      storageTempCelsius: 3.8,
      hoursRemaining: 91 // ~4 days (<7 days) -> AMBER
    },
    {
      id: 'unit-inv-04',
      batchCode: 'LL-DL-26-5510-A-',
      bloodGroup: 'A-',
      component: 'Platelets',
      unitsAvailable: 3,
      collectionDate: '2026-09-21',
      expiryDate: '2026-09-26 14:00',
      storageTempCelsius: 21.8,
      hoursRemaining: 70 // ~3 days (<7 days) -> AMBER
    },
    {
      id: 'unit-inv-05',
      batchCode: 'LL-DL-26-1022-O+',
      bloodGroup: 'O+',
      component: 'Packed Red Blood Cells',
      unitsAvailable: 28,
      collectionDate: '2026-09-10',
      expiryDate: '2026-10-22 18:00',
      storageTempCelsius: 4.0,
      hoursRemaining: 672 // >7 days -> GREEN
    },
    {
      id: 'unit-inv-06',
      batchCode: 'LL-DL-26-3398-A+',
      bloodGroup: 'A+',
      component: 'Whole Blood',
      unitsAvailable: 22,
      collectionDate: '2026-09-12',
      expiryDate: '2026-10-17 10:00',
      storageTempCelsius: 4.2,
      hoursRemaining: 552 // >7 days -> GREEN
    },
    {
      id: 'unit-inv-07',
      batchCode: 'LL-DL-26-9921-B+',
      bloodGroup: 'B+',
      component: 'Fresh Frozen Plasma',
      unitsAvailable: 35,
      collectionDate: '2026-07-01',
      expiryDate: '2027-07-01 00:00',
      storageTempCelsius: -21.4,
      hoursRemaining: 6700 // >7 days -> GREEN
    },
    {
      id: 'unit-inv-08',
      batchCode: 'LL-DL-26-1288-AB+',
      bloodGroup: 'AB+',
      component: 'Fresh Frozen Plasma',
      unitsAvailable: 18,
      collectionDate: '2026-06-15',
      expiryDate: '2027-06-15 00:00',
      storageTempCelsius: -20.8,
      hoursRemaining: 6300 // >7 days -> GREEN
    }
  ];

  // Helper to determine expiry status badge
  const getExpiryBadge = (hoursRemaining: number) => {
    if (hoursRemaining <= 48) {
      return {
        level: 'red' as const,
        label: 'CRITICAL EXPIRY (< 48 hrs)',
        desc: 'Flagged for urgent clinical use or certified disposal',
        badgeBg: '#FEF2F2',
        badgeText: '#DC2626',
        badgeBorder: '#FECACA'
      };
    }
    if (hoursRemaining <= 168) { // 7 days = 168 hours
      const days = Math.round(hoursRemaining / 24);
      return {
        level: 'amber' as const,
        label: `EXPIRING SOON (${days}d remaining)`,
        desc: 'Prioritized for standard outpatient allocations',
        badgeBg: '#FFFBEB',
        badgeText: '#D97706',
        badgeBorder: '#FDE68A'
      };
    }
    const days = Math.round(hoursRemaining / 24);
    return {
      level: 'green' as const,
      label: `FRESH (${days}d remaining)`,
      desc: 'Optimal cold-chain reserve shelf life',
      badgeBg: '#ECFDF5',
      badgeText: '#059669',
      badgeBorder: '#A7F3D0'
    };
  };

  const handleToggleUrgentFlag = (id: string) => {
    setFlaggedUnitIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered inventory batches
  const filteredBatches = inventoryUnits.filter(u => {
    const matchComp = selectedComponentFilter === 'All' || u.component === selectedComponentFilter;
    const matchGroup = selectedGroupFilter === 'All' || u.bloodGroup === selectedGroupFilter;
    return matchComp && matchGroup;
  });

  return (
    <div className="card" style={{ borderLeft: '4px solid #EA580C' }}>
      {/* Header */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Thermometer size={22} color="#EA580C" />
            <h2 className="card-title">Live Blood Inventory & Expiry Telemetry</h2>
          </div>
          <div className="card-desc">
            Component-level cold-storage monitoring with automated shelf-life countdown and color-coded disposal warning badges.
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Filter size={14} /> Filter:
          </div>

          <select
            className="form-select"
            value={selectedComponentFilter}
            onChange={(e) => setSelectedComponentFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="All">All Components</option>
            <option value="Whole Blood">Whole Blood (35d)</option>
            <option value="Packed Red Blood Cells">Packed RBCs (42d)</option>
            <option value="Platelets">Platelets (5d High Risk)</option>
            <option value="Fresh Frozen Plasma">Plasma (1-year)</option>
          </select>

          <select
            className="form-select"
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="All">All Blood Groups</option>
            {bloodGroups.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Bar: Total Units per Blood Type */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Aggregate Stock Summary Across Cold Storage
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
          gap: '0.65rem'
        }}>
          {bloodGroups.map(bg => {
            const count = aggregateStockCounts[bg] || 0;
            const isShortage = count < 8;
            return (
              <div
                key={bg}
                style={{
                  background: isShortage ? '#FEF2F2' : '#FFFFFF',
                  border: isShortage ? '1px solid #FECACA' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.45rem 0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: isShortage ? '#DC2626' : 'var(--primary-navy)'
                }}>
                  {bg}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: isShortage ? '#DC2626' : '#1E293B'
                }}>
                  {count} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>u</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Batches Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Unit / Batch Code</th>
              <th>Blood Type</th>
              <th>Component</th>
              <th>Units</th>
              <th>Storage Temp</th>
              <th>Expiry Countdown</th>
              <th>Status Badge</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBatches.map(batch => {
              const badge = getExpiryBadge(batch.hoursRemaining);
              const isFlagged = flaggedUnitIds[batch.id];

              return (
                <tr key={batch.id} style={{ background: isFlagged ? '#FFFBEB' : 'transparent' }}>
                  {/* Code */}
                  <td>
                    <code style={{
                      fontWeight: 700,
                      color: 'var(--primary-navy)',
                      background: '#F1F5F9',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem'
                    }}>
                      {batch.batchCode}
                    </code>
                  </td>

                  {/* Group */}
                  <td>
                    <strong style={{
                      color: batch.bloodGroup === 'O-' ? '#DC2626' : 'var(--primary-navy)',
                      fontSize: '1rem'
                    }}>
                      {batch.bloodGroup}
                    </strong>
                  </td>

                  {/* Component */}
                  <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {batch.component}
                  </td>

                  {/* Units */}
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                      {batch.unitsAvailable}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> units</span>
                  </td>

                  {/* Temp */}
                  <td>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: batch.storageTempCelsius < 0 ? '#0284C7' : '#059669'
                    }}>
                      {batch.storageTempCelsius > 0 ? `+${batch.storageTempCelsius}` : batch.storageTempCelsius}°C
                    </span>
                  </td>

                  {/* Countdown */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Clock size={14} color={badge.badgeText} />
                      <span style={{ color: badge.badgeText }}>
                        {batch.hoursRemaining <= 48
                          ? `${batch.hoursRemaining}h remaining`
                          : `${Math.round(batch.hoursRemaining / 24)} days left`}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Expires: {batch.expiryDate}
                    </span>
                  </td>

                  {/* Badge */}
                  <td>
                    <span style={{
                      display: 'inline-block',
                      background: badge.badgeBg,
                      color: badge.badgeText,
                      border: `1px solid ${badge.badgeBorder}`,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap'
                    }}>
                      {badge.label}
                    </span>
                  </td>

                  {/* Action */}
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleToggleUrgentFlag(batch.id)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.7rem',
                        background: isFlagged ? '#FEF3C7' : '#FFFFFF',
                        borderColor: isFlagged ? '#F59E0B' : 'var(--border-subtle)',
                        color: isFlagged ? '#B45309' : 'var(--primary-navy)'
                      }}
                    >
                      {isFlagged ? (
                        <>
                          <CheckCircle2 size={13} color="#B45309" />
                          <span>Flagged</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={13} color="#EA580C" />
                          <span>Flag Urgent</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
