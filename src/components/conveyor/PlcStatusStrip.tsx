import React from 'react';
import { StatusLamp } from '../common/StatusLamp';
import { useScada } from '../../context/ScadaContext';
import { HelpTooltip } from '../common/HelpTooltip';

export const PlcStatusStrip: React.FC = () => {
  const { state } = useScada();

  const isMotorRunning = state.machineState === 'RUNNING' || state.machineState === 'STARTING';
  const isSensorActive = state.sensor.active;
  const isDiverterActive = state.diverter.actuated || state.diverter.positionPercent > 10;
  const isEstopActive = state.machineState === 'EMERGENCY_STOP' || state.activeFaults.emergencyStop;
  const isFaultActive = state.machineState === 'FAULT' || Object.values(state.activeFaults).some(Boolean);

  return (
    <div className="bg-white border border-[#D5DBE1] rounded-lg p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-bold text-[#1F2933]">
        <span className="w-2 h-2 rounded-full bg-[#3B4651]"></span>
        <span>PLC Discrete I/O Bus Status</span>
        <HelpTooltip 
          term="PLC Bus Signals" 
          explanation="Real-time discrete I/O channels mapped to conveyor motor relays, photo sensors, and pneumatic solenoids." 
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusLamp
          label="Motor Drive"
          tag="%QX0.0"
          active={isMotorRunning}
          color="green"
        />
        <StatusLamp
          label="Optical Sensor"
          tag="%IX0.1"
          active={isSensorActive}
          color="amber"
        />
        <StatusLamp
          label="Diverter Arm"
          tag="%QX0.1"
          active={isDiverterActive}
          color="amber"
        />
        <StatusLamp
          label="Emergency Stop"
          tag="%IX0.0"
          active={isEstopActive}
          color="red"
          flashing={isEstopActive}
        />
        <StatusLamp
          label="Fault Interlock"
          tag="%MX1.0"
          active={isFaultActive}
          color="red"
          flashing={isFaultActive}
        />
      </div>
    </div>
  );
};
