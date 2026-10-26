// ============================================================================
// SCADA Central State Machine Engine
// ============================================================================
// State Transition Table:
// ----------------------------------------------------------------------------
// Current State     | Event/Input         | Guard/Condition             | Next State      | Action Notes
// ----------------------------------------------------------------------------
// IDLE              | CMD_START           | No Faults, No E-Stop        | STARTING        | Begin motor ramp-up
// IDLE              | CMD_START           | Active Fault or E-Stop      | IDLE (REJECT)   | Toast warning to operator
// IDLE              | CMD_ESTOP           | None                        | EMERGENCY_STOP  | Hard safety trip
// IDLE              | CMD_FAULT_TRIP      | Any blocking fault          | FAULT           | Interlock engaged
// STARTING          | TICK_RAMP_DONE      | Ramp timer >= 1.2s          | RUNNING         | Nominal speed attained
// STARTING          | CMD_STOP            | None                        | STOPPING        | Abort start, ramp down
// STARTING          | CMD_ESTOP           | None                        | EMERGENCY_STOP  | Immediate shutdown
// STARTING          | CMD_FAULT_TRIP      | Any blocking fault          | FAULT           | Protective trip
// RUNNING           | CMD_STOP            | Normal Stop requested       | STOPPING        | Begin controlled ramp down
// RUNNING           | CMD_ESTOP           | E-Stop button depressed     | EMERGENCY_STOP  | Immediate freeze, de-energize
// RUNNING           | CMD_FAULT_TRIP      | Jam / Overload detected     | FAULT           | Auto stop protective trip
// STOPPING          | TICK_RAMP_DONE      | Speed <= 0.01 m/s           | IDLE            | System at rest
// STOPPING          | CMD_ESTOP           | E-Stop button depressed     | EMERGENCY_STOP  | Immediate freeze
// STOPPING          | CMD_FAULT_TRIP      | Fault condition             | FAULT           | Trip during decel
// FAULT             | CMD_RESET_FAULT     | Causes cleared by operator  | IDLE            | Relays clear, stays stopped
// FAULT             | CMD_RESET_FAULT     | Fault causes still active   | FAULT (REJECT)  | Cannot reset active trip
// FAULT             | CMD_START           | Always                      | FAULT (REJECT)  | Start blocked by interlock
// FAULT             | CMD_ESTOP           | E-Stop pressed              | EMERGENCY_STOP  | Higher safety tier
// EMERGENCY_STOP    | CMD_RESET_ESTOP     | E-Stop released & acked     | IDLE            | Interlock clears, requires Start
// EMERGENCY_STOP    | CMD_RESET_ESTOP     | E-Stop still pressed        | E_STOP (REJECT) | Safety circuit remains open
// EMERGENCY_STOP    | CMD_START           | Always                      | E_STOP (REJECT) | Absolute interlock
// EMERGENCY_STOP    | CMD_RESET_FAULT     | Always                      | E_STOP (REJECT) | Must reset E-Stop first
// ----------------------------------------------------------------------------

import { MachineState, ActiveFaults } from '../types/scada';

export type StateMachineEvent =
  | { type: 'CMD_START' }
  | { type: 'CMD_STARTING_COMPLETE' }
  | { type: 'CMD_STOP' }
  | { type: 'CMD_STOPPING_COMPLETE' }
  | { type: 'CMD_ESTOP' }
  | { type: 'CMD_RESET_ESTOP' }
  | { type: 'CMD_FAULT_TRIP'; reason: string }
  | { type: 'CMD_RESET_FAULT' };

export interface TransitionResult {
  allowed: boolean;
  nextState: MachineState;
  rejectionReason?: string;
  actionMessage?: string;
}

export function canStart(currentState: MachineState, activeFaults: ActiveFaults): { allowed: boolean; reason?: string } {
  if (currentState === 'EMERGENCY_STOP' || activeFaults.emergencyStop) {
    return {
      allowed: false,
      reason: 'Safety Interlock Engaged: Emergency Stop PB-01 is latched down. Twist to release and reset E-Stop before starting.',
    };
  }
  if (currentState === 'FAULT') {
    return {
      allowed: false,
      reason: 'Protective Interlock Active: System is in FAULT state. Resolve faults in Alarm panel and press "Reset Fault".',
    };
  }
  if (activeFaults.jam) {
    return {
      allowed: false,
      reason: 'Mechanical Interlock: Conveyor Jam is active. Clear obstruction before starting conveyor drive.',
    };
  }
  if (activeFaults.motorOverload) {
    return {
      allowed: false,
      reason: 'Thermal Protection Trip: Motor overload active (>15A / >80°C). Wait for motor cool-down and reset thermal relay.',
    };
  }
  if (currentState === 'STARTING' || currentState === 'RUNNING') {
    return {
      allowed: false,
      reason: 'Conveyor drive is already active.',
    };
  }
  if (currentState === 'STOPPING') {
    return {
      allowed: false,
      reason: 'Conveyor is currently executing a controlled deceleration ramp. Wait for IDLE.',
    };
  }
  return { allowed: true };
}

export function evaluateTransition(
  currentState: MachineState,
  event: StateMachineEvent,
  activeFaults: ActiveFaults
): TransitionResult {
  switch (event.type) {
    case 'CMD_START': {
      const check = canStart(currentState, activeFaults);
      if (!check.allowed) {
        return {
          allowed: false,
          nextState: currentState,
          rejectionReason: check.reason,
        };
      }
      return {
        allowed: true,
        nextState: 'STARTING',
        actionMessage: 'VFD Command Run issued. Initiating motor acceleration ramp (0 -> 1.0 m/s).',
      };
    }

    case 'CMD_STARTING_COMPLETE': {
      if (currentState === 'STARTING') {
        return {
          allowed: true,
          nextState: 'RUNNING',
          actionMessage: 'Nominal velocity attained. Automatic sorting interlocks armed.',
        };
      }
      return { allowed: false, nextState: currentState };
    }

    case 'CMD_STOP': {
      if (currentState === 'RUNNING' || currentState === 'STARTING') {
        return {
          allowed: true,
          nextState: 'STOPPING',
          actionMessage: 'Normal Stop commanded. VFD deceleration ramp initiated.',
        };
      }
      return {
        allowed: false,
        nextState: currentState,
        rejectionReason: `Cannot stop conveyor from ${currentState} state.`,
      };
    }

    case 'CMD_STOPPING_COMPLETE': {
      if (currentState === 'STOPPING') {
        return {
          allowed: true,
          nextState: 'IDLE',
          actionMessage: 'Conveyor brought to complete rest. System returned to IDLE.',
        };
      }
      return { allowed: false, nextState: currentState };
    }

    case 'CMD_ESTOP': {
      return {
        allowed: true,
        nextState: 'EMERGENCY_STOP',
        actionMessage: 'EMERGENCY STOP EXECUTED: All 3-phase drives de-energized. Brakes applied.',
      };
    }

    case 'CMD_RESET_ESTOP': {
      if (currentState !== 'EMERGENCY_STOP') {
        return {
          allowed: false,
          nextState: currentState,
          rejectionReason: 'Emergency Stop is not currently latched.',
        };
      }
      if (activeFaults.emergencyStop) {
        return {
          allowed: false,
          nextState: 'EMERGENCY_STOP',
          rejectionReason: 'Physical E-Stop palm button is still depressed. Twist to release button first.',
        };
      }
      // Check if any other fault remains
      const hasBlockingFault = activeFaults.jam || activeFaults.motorOverload;
      const nextState: MachineState = hasBlockingFault ? 'FAULT' : 'IDLE';
      return {
        allowed: true,
        nextState,
        actionMessage: hasBlockingFault
          ? 'E-Stop safety circuit reset, but secondary protective faults remain active. Transferred to FAULT state.'
          : 'E-Stop safety circuit reset. System in IDLE. Press START to resume operation.',
      };
    }

    case 'CMD_FAULT_TRIP': {
      if (currentState === 'EMERGENCY_STOP') {
        // E-Stop has highest precedence; stay in E-Stop
        return { allowed: false, nextState: 'EMERGENCY_STOP' };
      }
      return {
        allowed: true,
        nextState: 'FAULT',
        actionMessage: `Protective Trip: ${event.reason}. Conveyor drive de-energized.`,
      };
    }

    case 'CMD_RESET_FAULT': {
      if (currentState !== 'FAULT') {
        return {
          allowed: false,
          nextState: currentState,
          rejectionReason: 'System is not in FAULT state.',
        };
      }
      // Check if faults actually resolved
      if (activeFaults.jam) {
        return {
          allowed: false,
          nextState: 'FAULT',
          rejectionReason: 'Cannot reset fault: Conveyor Jam is still physically present on the belt.',
        };
      }
      if (activeFaults.motorOverload) {
        return {
          allowed: false,
          nextState: 'FAULT',
          rejectionReason: 'Cannot reset fault: Motor thermal overload condition is still active (>80°C / >15A).',
        };
      }
      // Note: Reset Fault NEVER silently restarts conveyor - transitions strictly to IDLE!
      return {
        allowed: true,
        nextState: 'IDLE',
        actionMessage: 'Protective relays reset. System in IDLE standby. Deliberate START command required to run.',
      };
    }

    default:
      return { allowed: false, nextState: currentState };
  }
}
