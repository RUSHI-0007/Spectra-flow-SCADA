// ============================================================================
// Equipment Model (Motor, VFD, Diverter Actuator & Sensor Telemetry)
// Notice: All physical values are SIMULATED for browser demonstration.
// ============================================================================

import { MotorTelemetry, DiverterStatus, SensorStatus, MachineState, ActiveFaults } from '../types/scada';

export class EquipmentModel {
  public static updateMotor(
    prev: MotorTelemetry,
    machineState: MachineState,
    targetSpeedMs: number,
    deltaSeconds: number,
    activeFaults: ActiveFaults,
    bottlesCount: number
  ): MotorTelemetry {
    const isDriveActive = machineState === 'RUNNING' || machineState === 'STARTING';
    const isStopping = machineState === 'STOPPING';

    // 1. SPEED RAMPING (VFD ACCELERATION / DECELERATION)
    let target = 0;
    if (isDriveActive && !activeFaults.emergencyStop && !activeFaults.jam) {
      target = targetSpeedMs;
    } else if (isStopping) {
      target = 0;
    } else {
      target = 0; // Immediate halt on E-Stop or Fault
    }

    const accelRate = 1.0; // m/s per second
    const decelRate = machineState === 'EMERGENCY_STOP' ? 10.0 : 1.5;

    let currentSpeed = prev.actualSpeedMs;
    if (machineState === 'EMERGENCY_STOP') {
      currentSpeed = 0; // Instant freeze on E-Stop
    } else if (currentSpeed < target) {
      currentSpeed = Math.min(target, currentSpeed + accelRate * deltaSeconds);
    } else if (currentSpeed > target) {
      currentSpeed = Math.max(target, currentSpeed - decelRate * deltaSeconds);
    }

    // 2. VFD FREQUENCY & RPM
    const frequencyHz = +( (currentSpeed / 2.0) * 50 ).toFixed(1);
    const rpm = Math.round((frequencyHz / 50) * 1450);

    // 3. MOTOR LOAD (%)
    let load = 0;
    if (currentSpeed > 0.01) {
      const baseLoad = 25;
      const speedLoad = (currentSpeed / 2.0) * 35;
      const bottleLoad = Math.min(25, bottlesCount * 2.5);
      load = baseLoad + speedLoad + bottleLoad;
      if (activeFaults.jam || activeFaults.motorOverload) {
        load = 96.5 + (Math.sin(Date.now() / 200) * 2.5);
      }
    } else if (activeFaults.motorOverload) {
      load = 92.0;
    }
    load = +Math.min(100, Math.max(0, load)).toFixed(1);

    // 4. CURRENT AMPS
    const currentAmps = +( (load / 100) * 14.8 ).toFixed(2);

    // 5. MOTOR TEMPERATURE (°C) PHYSICS
    const ambientTemp = 26.0;
    let targetTemp = ambientTemp;

    if (activeFaults.motorOverload) {
      targetTemp = 88.0;
    } else if (currentSpeed > 0.01) {
      targetTemp = 40.0 + (load / 100) * 32.0;
    } else {
      targetTemp = ambientTemp + 4.0;
    }

    const heatRate = activeFaults.motorOverload ? 0.35 : 0.08;
    const tempDelta = (targetTemp - prev.temperatureC) * heatRate * deltaSeconds;
    const newTemp = +(prev.temperatureC + tempDelta).toFixed(1);

    const coolingFanRunning = newTemp > 50.0 || (currentSpeed > 0.5);

    return {
      runCommand: isDriveActive,
      actualSpeedMs: +currentSpeed.toFixed(2),
      targetSpeedMs,
      frequencyHz,
      rpm,
      temperatureC: newTemp,
      loadPercent: load,
      currentAmps,
      coolingFanRunning,
    };
  }

  public static updateDiverter(
    prev: DiverterStatus,
    deltaSeconds: number,
    shouldTrigger: boolean
  ): DiverterStatus {
    let actuated = prev.actuated;
    let pos = prev.positionPercent;
    let strokeCount = prev.strokeCount;
    let lastTime = prev.lastActuationTime;

    const strokeSpeed = 500; // percent per second (fast ~200ms stroke)

    if (shouldTrigger && !actuated) {
      actuated = true;
      strokeCount++;
      lastTime = Date.now();
    }

    if (actuated) {
      pos += strokeSpeed * deltaSeconds;
      if (pos >= 100) {
        pos = 100;
        actuated = false; // begin retraction
      }
    } else if (pos > 0) {
      pos -= strokeSpeed * deltaSeconds;
      if (pos < 0) pos = 0;
    }

    return {
      tag: '%QX0.1_DIV',
      actuated: pos > 20,
      positionPercent: Math.round(pos),
      strokeCount,
      lastActuationTime: lastTime,
    };
  }
}
