import React from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { Users, Building2, Landmark, ShieldCheck, Globe } from 'lucide-react';

export const RoleSimulator: React.FC = () => {
  const { currentRole, switchRole, t } = useApp();

  const roleConfigs: { role: Role; label: string; icon: React.ReactNode }[] = [
    { role: 'public', label: t.roles.public, icon: <Globe size={14} /> },
    { role: 'patient', label: 'Patient & Donor', icon: <Users size={14} /> },
    { role: 'hospital', label: t.roles.hospital, icon: <Building2 size={14} /> },
    { role: 'bloodbank', label: t.roles.bloodbank, icon: <Landmark size={14} /> },
    { role: 'ngo', label: t.roles.ngo, icon: <Users size={14} /> },
    { role: 'admin', label: t.roles.admin, icon: <ShieldCheck size={14} /> },
  ];

  return (
    <div className="role-simulator-bar" title="Simulated Role Switcher (Prototype Demo Mode - Not Server-Enforced RBAC)">
      {roleConfigs.map(({ role, label, icon }) => {
        const isActive = currentRole === role || (role === 'patient' && currentRole === 'donor');
        return (
          <button
            key={role}
            type="button"
            onClick={() => switchRole(role)}
            className={`role-btn ${isActive ? 'active' : ''}`}
            aria-label={`Switch viewpoint to ${label}`}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              {icon}
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
