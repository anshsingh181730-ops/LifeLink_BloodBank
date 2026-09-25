import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AUDIT_DEMO_DISCLAIMER } from '../../services/auditSim';
import { ShieldAlert, Search, FileText } from 'lucide-react';

export const AuditLogDemo: React.FC = () => {
  const { auditLogs } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = auditLogs.filter(log => {
    const matchesFilter = filterType === 'all' || log.entityType === filterType;
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} color="var(--primary-navy)" />
            <h3 className="card-title">Audit Log Inspector (Demo Mode)</h3>
          </div>
          <div className="card-desc">
            Chronological audit log of clinical platform state mutations and coordination actions.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">All Entities</option>
            <option value="Request">Requests</option>
            <option value="BloodUnit">Blood Units</option>
            <option value="Verification">Verifications</option>
            <option value="Escalation">Escalations</option>
            <option value="User">User / Role</option>
          </select>
        </div>
      </div>

      {/* Prominent Mandatory Compliance Disclaimer */}
      <div style={{
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: 'var(--radius-md)',
        padding: '0.9rem 1.1rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        fontSize: '0.82rem',
        color: '#92400E'
      }}>
        <ShieldAlert size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#78350F' }}>COMPLIANCE DISCLAIMER (UI Demonstration Only):</strong>
          <p style={{ marginTop: '0.2rem', lineHeight: '1.4' }}>
            {AUDIT_DEMO_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by action, actor, or details..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.4rem' }}
        />
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Table */}
      <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor & Role</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td>
                  <strong style={{ color: 'var(--primary-navy)' }}>{log.actorName}</strong>
                  <span style={{ 
                    display: 'block', 
                    fontSize: '0.72rem', 
                    color: log.actorRole === 'admin' ? '#0D47A1' : 'var(--text-secondary)' 
                  }}>
                    [{log.actorRole.toUpperCase()}]
                  </span>
                </td>
                <td>
                  <code style={{ 
                    background: '#EDF2F7', 
                    padding: '0.2rem 0.4rem', 
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--primary-navy)',
                    fontWeight: 700
                  }}>
                    {log.action}
                  </code>
                </td>
                <td>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: 'var(--radius-sm)',
                    background: '#F1F5F9',
                    color: 'var(--text-secondary)'
                  }}>
                    {log.entityType}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  {log.details}
                  {log.beforeState && log.afterState && (
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      State: {log.beforeState} &rarr; {log.afterState}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
