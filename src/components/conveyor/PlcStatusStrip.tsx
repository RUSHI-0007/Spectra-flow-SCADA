// ============================================================================
// PLC-Style Status Strip
// Hardware indicator lamps: MOTOR_RUN, SENSOR_1, DIVERTER, ESTOP, FAULT
// ============================================================================

import React from 'react';
import { StatusLamp } from '../common/StatusLamp';
import { useScada } from '../../context/ScadaContext';

export const PlcStatusStrip: React.FC = () => {
  const { state } = useScada();

  const isMotorRunning = state.machineState === 'RUNNING' || state.machineState === 'STARTING';
  const isSensorActive = state.sensor.active;
  const isDiverterActive = state.diverter.actuated || state.diverter.positionPercent > 10;
  const isEstopActive = state.machineState === 'EMERGENCY_STOP' || state.activeFaults.emergencyStop;
  const isFaultActive = state.machineState === 'FAULT' || Object.values(state.activeFaults).some(Boolean);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
        <span>PLC I/O Bus Status:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusLamp
          label="MOTOR_RUN"
          tag="%QX0.0"
          active={isMotorRunning}
          color="green"
        />
        <StatusLamp
          label="SENSOR_1"
          tag="%IX0.1"
          active={isSensorActive}
          color="blue"
        />
        <StatusLamp
          label="DIVERTER"
          tag="%QX0.1"
          active={isDiverterActive}
          color="amber"
        />
        <StatusLamp
          label="ESTOP"
          tag="%IX0.0"
          active={isEstopActive}
          color="red"
          flashing={isEstopActive}
        />
        <StatusLamp
          label="FAULT"
          tag="%MX1.0"
          active={isFaultActive}
          color="red"
          flashing={isFaultActive}
        />
      </div>
    </div>
  );
};
