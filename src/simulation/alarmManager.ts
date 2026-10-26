// ============================================================================
// ISA-18.2 Alarm Management Module
// Standards: ANSI/ISA-18.2 & IEC 62682 Management of Alarm Systems
// ============================================================================

import { Alarm, AlarmLifecycleState, AlarmSeverity, ActiveFaults } from '../types/scada';

export interface AlarmDefinition {
  code: string;
  tag: string;
  title: string;
  description: string;
  severity: AlarmSeverity;
  requiresReset: boolean;
  causesTrip: boolean;
}

export const ALARM_DEFINITIONS: Record<string, AlarmDefinition> = {
  ESTOP: {
    code: 'ALM-100',
    tag: '%IX0.0_ESTOP',
    title: 'EMERGENCY STOP ACTUATED',
    description: 'Mushroom E-Stop push button PB-01 depressed. Dual-channel safety relay de-energized.',
    severity: 'CRITICAL',
    requiresReset: true,
    causesTrip: true,
  },
  JAM: {
    code: 'ALM-101',
    tag: '%IX0.6_JAM',
    title: 'CONVEYOR JAM DETECTED',
    description: 'Optical detection beam blocked continuously > 3.0 seconds. Bottle accumulation detected.',
    severity: 'CRITICAL',
    requiresReset: true,
    causesTrip: true,
  },
  MOTOR_OVERLOAD: {
    code: 'ALM-102',
    tag: '%IW68_OLR',
    title: 'MOTOR THERMAL OVERLOAD (49/51)',
    description: 'Motor stator temperature exceeded 80°C or current exceeded 15.0A FLA threshold.',
    severity: 'CRITICAL',
    requiresReset: true,
    causesTrip: true,
  },
  SENSOR_MALFUNCTION: {
    code: 'ALM-201',
    tag: '%IX0.1_SENS_ERR',
    title: 'SENSOR S-01 INTERMITTENT FAULT',
    description: 'Photoelectric sensor beam erratic / dirty optics. Passing bottles flagged UNVERIFIED.',
    severity: 'WARNING',
    requiresReset: false,
    causesTrip: false,
  },
  PRODUCTION_BACKLOG: {
    code: 'ALM-202',
    tag: '%VAR_BACKLOG',
    title: 'HIGH PRODUCTION BUFFER BACKLOG',
    description: 'Conveyor bottle count exceeds 15 units. Downstream packaging bottleneck detected.',
    severity: 'WARNING',
    requiresReset: false,
    causesTrip: false,
  },
};

export class AlarmManager {
  public static syncAlarms(
    currentAlarms: Alarm[],
    activeFaults: ActiveFaults,
    bottlesOnBeltCount: number
  ): { alarms: Alarm[]; shouldTrip: boolean; tripReason?: string } {
    const updated = [...currentAlarms];
    let shouldTrip = false;
    let tripReason: string | undefined;

    // Helper to evaluate fault condition
    const evaluate = (key: keyof typeof ALARM_DEFINITIONS, condition: boolean) => {
      const def = ALARM_DEFINITIONS[key];
      const existingIdx = updated.findIndex(a => a.code === def.code && a.state !== 'CLEARED');

      if (condition) {
        if (existingIdx === -1) {
          // New alarm tripped!
          const newAlarm: Alarm = {
            id: `alm-${Date.now()}-${def.code}`,
            code: def.code,
            tag: def.tag,
            title: def.title,
            description: def.description,
            severity: def.severity,
            state: 'ACTIVE_UNACK',
            timestamp: Date.now(),
            requiresReset: def.requiresReset,
          };
          updated.unshift(newAlarm);
        }
        if (def.causesTrip) {
          shouldTrip = true;
          tripReason = def.title;
        }
      } else {
        // Condition no longer active
        if (existingIdx !== -1) {
          const alarm = updated[existingIdx];
          if (alarm.state === 'ACTIVE_ACK') {
            // Already acknowledged, so when cleared it's fully CLEARED
            updated[existingIdx] = {
              ...alarm,
              state: 'CLEARED',
              clearedTimestamp: Date.now(),
            };
          } else if (alarm.state === 'ACTIVE_UNACK') {
            // Cleared while still unacknowledged: becomes CLEARED_UNACK
            updated[existingIdx] = {
              ...alarm,
              state: 'CLEARED_UNACK',
              clearedTimestamp: Date.now(),
            };
          }
        }
      }
    };

    evaluate('ESTOP', activeFaults.emergencyStop);
    evaluate('JAM', activeFaults.jam);
    evaluate('MOTOR_OVERLOAD', activeFaults.motorOverload);
    evaluate('SENSOR_MALFUNCTION', activeFaults.sensorMalfunction);
    evaluate('PRODUCTION_BACKLOG', bottlesOnBeltCount >= 14 || activeFaults.productionBacklog);

    return {
      alarms: updated,
      shouldTrip,
      tripReason,
    };
  }

  public static acknowledgeAlarm(alarms: Alarm[], alarmId: string): Alarm[] {
    return alarms.map(a => {
      if (a.id === alarmId) {
        if (a.state === 'ACTIVE_UNACK') {
          return { ...a, state: 'ACTIVE_ACK', ackTimestamp: Date.now() };
        }
        if (a.state === 'CLEARED_UNACK') {
          return { ...a, state: 'CLEARED', ackTimestamp: Date.now() };
        }
      }
      return a;
    });
  }

  public static acknowledgeAll(alarms: Alarm[]): Alarm[] {
    const now = Date.now();
    return alarms.map(a => {
      if (a.state === 'ACTIVE_UNACK') {
        return { ...a, state: 'ACTIVE_ACK', ackTimestamp: now };
      }
      if (a.state === 'CLEARED_UNACK') {
        return { ...a, state: 'CLEARED', ackTimestamp: now };
      }
      return a;
    });
  }

  public static clearHistorical(alarms: Alarm[]): Alarm[] {
    // Keep active alarms, remove cleared ones from panel
    return alarms.filter(a => a.state !== 'CLEARED');
  }
}
