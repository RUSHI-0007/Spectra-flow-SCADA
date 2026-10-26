// ============================================================================
// Automated Unit Tests for SCADA State Machine
// Validates transitions, interlocks, guards, and safety recovery rules
// ============================================================================

import { describe, it, expect } from 'vitest';
import { evaluateTransition, canStart } from '../simulation/stateMachine';
import { ActiveFaults } from '../types/scada';

const CLEAN_FAULTS: ActiveFaults = {
  jam: false,
  motorOverload: false,
  sensorMalfunction: false,
  productionBacklog: false,
  emergencyStop: false,
};

describe('SCADA State Machine Transition Engine', () => {
  it('allows normal startup from IDLE when no interlocks are tripped', () => {
    const check = canStart('IDLE', CLEAN_FAULTS);
    expect(check.allowed).toBe(true);

    const result = evaluateTransition('IDLE', { type: 'CMD_START' }, CLEAN_FAULTS);
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('STARTING');
  });

  it('completes acceleration ramp from STARTING to RUNNING', () => {
    const result = evaluateTransition('STARTING', { type: 'CMD_STARTING_COMPLETE' }, CLEAN_FAULTS);
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('RUNNING');
  });

  it('executes normal controlled deceleration stop from RUNNING to STOPPING and then IDLE', () => {
    const stopResult = evaluateTransition('RUNNING', { type: 'CMD_STOP' }, CLEAN_FAULTS);
    expect(stopResult.allowed).toBe(true);
    expect(stopResult.nextState).toBe('STOPPING');

    const doneResult = evaluateTransition('STOPPING', { type: 'CMD_STOPPING_COMPLETE' }, CLEAN_FAULTS);
    expect(doneResult.allowed).toBe(true);
    expect(doneResult.nextState).toBe('IDLE');
  });

  it('strictly blocks start when Emergency Stop PB-01 is latched', () => {
    const faultsWithEstop: ActiveFaults = { ...CLEAN_FAULTS, emergencyStop: true };
    const check = canStart('IDLE', faultsWithEstop);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Emergency Stop PB-01 is latched');

    const result = evaluateTransition('IDLE', { type: 'CMD_START' }, faultsWithEstop);
    expect(result.allowed).toBe(false);
    expect(result.nextState).toBe('IDLE');
  });

  it('strictly blocks start when a Conveyor Jam fault is active', () => {
    const faultsWithJam: ActiveFaults = { ...CLEAN_FAULTS, jam: true };
    const check = canStart('IDLE', faultsWithJam);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Conveyor Jam is active');
  });

  it('strictly blocks start when Motor Overload is active (>80°C / >15A)', () => {
    const faultsWithOverload: ActiveFaults = { ...CLEAN_FAULTS, motorOverload: true };
    const check = canStart('IDLE', faultsWithOverload);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Motor overload active');
  });

  it('triggers immediate hard trip to EMERGENCY_STOP from RUNNING', () => {
    const result = evaluateTransition('RUNNING', { type: 'CMD_ESTOP' }, CLEAN_FAULTS);
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('EMERGENCY_STOP');
  });

  it('requires explicit E-stop reset and NEVER silently restarts the conveyor', () => {
    // Attempt start while in EMERGENCY_STOP
    const startResult = evaluateTransition('EMERGENCY_STOP', { type: 'CMD_START' }, CLEAN_FAULTS);
    expect(startResult.allowed).toBe(false);

    // Reset E-stop when button is released
    const resetResult = evaluateTransition('EMERGENCY_STOP', { type: 'CMD_RESET_ESTOP' }, CLEAN_FAULTS);
    expect(resetResult.allowed).toBe(true);
    expect(resetResult.nextState).toBe('IDLE'); // Must be IDLE, NOT running!
  });

  it('resets FAULT to IDLE only when fault causes are cleared, and never auto-restarts', () => {
    // If jam is still active, reset fault must fail
    const faultsWithJam: ActiveFaults = { ...CLEAN_FAULTS, jam: true };
    const failReset = evaluateTransition('FAULT', { type: 'CMD_RESET_FAULT' }, faultsWithJam);
    expect(failReset.allowed).toBe(false);
    expect(failReset.nextState).toBe('FAULT');

    // When jam is physically cleared, reset fault succeeds and moves strictly to IDLE
    const okReset = evaluateTransition('FAULT', { type: 'CMD_RESET_FAULT' }, CLEAN_FAULTS);
    expect(okReset.allowed).toBe(true);
    expect(okReset.nextState).toBe('IDLE');
  });
});
