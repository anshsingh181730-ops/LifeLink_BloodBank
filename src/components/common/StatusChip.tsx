import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, XCircle, Navigation, ShieldCheck } from 'lucide-react';

interface StatusChipProps {
  status: string;
  customLabel?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, customLabel }) => {
  const getChipConfig = () => {
    switch (status) {
      case 'matching':
      case 'pending':
        return { className: 'matching', icon: <Clock size={12} />, label: customLabel || 'Pending' };
      case 'notified':
        return { className: 'notified', icon: <AlertTriangle size={12} />, label: customLabel || 'Notified' };
      case 'accepted':
      case 'in_progress':
      case 'ongoing':
        return { className: 'accepted', icon: <CheckCircle2 size={12} />, label: customLabel || 'Accepted' };
      case 'en_route':
        return { className: 'en_route', icon: <Navigation size={12} />, label: customLabel || 'En Route' };
      case 'fulfilled':
      case 'verified':
      case 'active':
      case 'completed':
        return { className: 'fulfilled', icon: <ShieldCheck size={12} />, label: customLabel || 'Fulfilled' };
      case 'critical':
      case 'cancelled':
      case 'rejected':
      case 'disposed':
        return { className: 'critical', icon: <XCircle size={12} />, label: customLabel || 'Critical / Cancelled' };
      default:
        return { className: 'matching', icon: <Clock size={12} />, label: customLabel || status };
    }
  };

  const config = getChipConfig();

  return (
    <span className={`status-chip ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
