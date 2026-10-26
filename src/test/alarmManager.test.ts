// ============================================================================
// Automated Unit Tests for ISA-18.2 Alarm Manager
// Tests alarm activation, auto-trips, acknowledgment, and cleared states
// ============================================================================

import { describe, it, expect } from 'vitest';
import { AlarmManager } from '../simulation/alarmManager';
import { ActiveFaults, Alarm } from '../types/scada';

const CLEAN_FAULTS: ActiveFaults = {
  jam: false,
  motorOverload: false,
  sensorMalfunction: false,
  productionBacklog: false,
  emergencyStop: false,
};

describe('ISA-18.2 Alarm Manager', () => {
  it('creates an ACTIVE_UNACK alarm when a fault occurs and flags auto-trip for critical faults', () => {
    const faultsWithJam: ActiveFaults = { ...CLEAN_FAULTS, jam: true };
    const { alarms, shouldTrip, tripReason } = AlarmManager.syncAlarms([], faultsWithJam, 4);

    expect(alarms.length).toBe(1);
    expect(alarms[0].code).toBe('ALM-101');
    expect(alarms[0].state).toBe('ACTIVE_UNACK');
    expect(alarms[0].severity).toBe('CRITICAL');
    expect(shouldTrip).toBe(true);
    expect(tripReason).toContain('CONVEYOR JAM');
  });

  it('moves alarm to ACTIVE_ACK when acknowledged by operator', () => {
    const faultsWithJam: ActiveFaults = { ...CLEAN_FAULTS, jam: true };
    const { alarms } = AlarmManager.syncAlarms([], faultsWithJam, 4);
    const alarmId = alarms[0].id;

    const acknowledged = AlarmManager.acknowledgeAlarm(alarms, alarmId);
    expect(acknowledged[0].state).toBe('ACTIVE_ACK');
    expect(acknowledged[0].ackTimestamp).toBeDefined();
  });

  it('transitions alarm to CLEARED when condition is resolved after acknowledgment', () => {
    const faultsWithJam: ActiveFaults = { ...CLEAN_FAULTS, jam: true };
    const { alarms } = AlarmManager.syncAlarms([], faultsWithJam, 4);
    const alarmId = alarms[0].id;

    // Acknowledge first
    const acked = AlarmManager.acknowledgeAlarm(alarms, alarmId);

    // Clear fault condition
    const { alarms: clearedAlarms } = AlarmManager.syncAlarms(acked, CLEAN_FAULTS, 4);
    expect(clearedAlarms[0].state).toBe('CLEARED');
    expect(clearedAlarms[0].clearedTimestamp).toBeDefined();
  });

  it('transitions alarm to CLEARED_UNACK if condition resolves before operator acknowledgment', () => {
    const faultsWithJam: ActiveFaults = { ...CLEAN_FAULTS, jam: true };
    const { alarms } = AlarmManager.syncAlarms([], faultsWithJam, 4);

    // Condition resolves without prior acknowledgment
    const { alarms: unackedCleared } = AlarmManager.syncAlarms(alarms, CLEAN_FAULTS, 4);
    expect(unackedCleared[0].state).toBe('CLEARED_UNACK');

    // Acknowledging now moves it to CLEARED
    const final = AlarmManager.acknowledgeAlarm(unackedCleared, unackedCleared[0].id);
    expect(final[0].state).toBe('CLEARED');
  });

  it('handles sensor malfunction as warning without auto-tripping conveyor', () => {
    const faultsWithSensor: ActiveFaults = { ...CLEAN_FAULTS, sensorMalfunction: true };
    const { alarms, shouldTrip } = AlarmManager.syncAlarms([], faultsWithSensor, 4);

    expect(alarms.length).toBe(1);
    expect(alarms[0].code).toBe('ALM-201');
    expect(alarms[0].severity).toBe('WARNING');
    expect(shouldTrip).toBe(false); // Warnings do NOT auto-stop the belt
  });
});
