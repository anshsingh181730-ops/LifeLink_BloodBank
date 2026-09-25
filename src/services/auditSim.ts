import { AuditLogEntry, Role } from '../types';

export const AUDIT_DEMO_DISCLAIMER = 
  "DEMONSTRATION LOG: This viewer presents client-simulated events. In production, per Document 03 (Security & Access), audit logging must be enforced server-side with cryptographic immutability and tamper-evident append-only storage. Tickets XC-01 and XC-02 require dedicated backend infrastructure.";

export class AuditLogSimulator {
  private static logs: AuditLogEntry[] = [
    {
      id: 'aud-001',
      actorId: 'usr-admin-1',
      actorName: 'System Admin (Dr. Sharma)',
      actorRole: 'admin',
      action: 'SYSTEM_BOOTSTRAP',
      entityType: 'User',
      entityId: 'sys-core',
      details: 'LifeLink platform simulation layer initialized with seed parameters',
      timestamp: '2026-09-22T08:00:00Z',
    },
    {
      id: 'aud-002',
      actorId: 'usr-bb-1',
      actorName: 'Red Cross Central Blood Bank',
      actorRole: 'bloodbank',
      action: 'INVENTORY_STOCK_SYNC',
      entityType: 'BloodUnit',
      entityId: 'bb-delhi-01',
      details: 'Stock levels synchronized for O+ and A- units',
      timestamp: '2026-09-22T09:15:00Z',
    },
    {
      id: 'aud-003',
      actorId: 'usr-admin-1',
      actorName: 'System Admin (Dr. Sharma)',
      actorRole: 'admin',
      action: 'INSTITUTION_VERIFIED',
      entityType: 'Verification',
      entityId: 'usr-hosp-01',
      details: 'Apollo Hospital emergency ward verified with regulatory license #DL-MED-9942',
      timestamp: '2026-09-22T10:30:00Z',
    }
  ];

  static getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  static record(
    actorId: string,
    actorName: string,
    actorRole: Role,
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    details: string,
    beforeState?: string,
    afterState?: string
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
      beforeState,
      afterState
    };
    this.logs.unshift(entry);
    return entry;
  }
}
