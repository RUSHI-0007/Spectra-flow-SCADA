// ============================================================================
// Central SCADA Store & Fixed-Timestep Simulation Loop
// Architecture: React Context + useReducer + LocalStorage persistence
// ============================================================================

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { 
  MachineState, 
  OperationMode, 
  Bottle, 
  MotorTelemetry, 
  SensorStatus, 
  DiverterStatus, 
  ProductionCounters, 
  Alarm, 
  ScadaEvent, 
  ProductionRecord, 
  SimSettings, 
  PageId, 
  ActiveFaults,
  DefectType,
  BottleCategory
} from '../types/scada';
import { evaluateTransition, canStart } from '../simulation/stateMachine';
import { AlarmManager } from '../simulation/alarmManager';
import { BottleManager } from '../simulation/bottleManager';
import { EquipmentModel } from '../simulation/equipmentModel';
import { GUIDED_DEMO_STEPS } from '../simulation/scenarioRunner';
import { industrialAudio } from '../utils/audio';

interface ScadaState {
  machineState: MachineState;
  operationMode: OperationMode;
  activeFaults: ActiveFaults;
  bottles: Bottle[];
  motor: MotorTelemetry;
  sensor: SensorStatus;
  diverter: DiverterStatus;
  counters: ProductionCounters;
  alarms: Alarm[];
  events: ScadaEvent[];
  productionHistory: ProductionRecord[];
  settings: SimSettings;
  currentPage: PageId;
  guidedTourActive: boolean;
  guidedTourStep: number;
  autoPilotActive: boolean;
  autoPilotStatusText: string;
  isKioskMode: boolean;
  activeToast: { message: string; type: 'info' | 'warn' | 'error'; id: number } | null;
}

export const DEFAULT_SETTINGS: SimSettings = {
  nominalSpeedMs: 1.0,
  bottleSpawnIntervalSec: 1.8,
  categoryARatioPercent: 50,
  defectProbabilityPercent: 6,
  motorOverloadThresholdC: 80.0,
  jamTimeoutSec: 3.0,
  stopMode: 'DRAIN',
  randomFaultsEnabled: false,
  randomFaultFrequencyMin: 5,
  audioMuted: false,
  simulationMultiplier: 1,
  operatorName: 'R. Kulkarni (Lead Eng)',
  shiftName: 'Shift A (Morning 06:00 - 14:00)',
};

function generateBaselineTelemetry(): ProductionRecord[] {
  const records: ProductionRecord[] = [];
  const now = Date.now();
  for (let i = 25; i >= 1; i--) {
    const t = now - i * 2000;
    records.push({
      timestamp: t,
      timeStr: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      bpm: 0,
      totalBottles: 0,
      catA: 0,
      catB: 0,
      speedMs: 0,
      motorTempC: 38.0 + (Math.sin(i / 3) * 0.5),
    });
  }
  return records;
}

const INITIAL_STATE: ScadaState = {
  machineState: 'IDLE',
  operationMode: 'AUTO',
  activeFaults: {
    jam: false,
    motorOverload: false,
    sensorMalfunction: false,
    productionBacklog: false,
    emergencyStop: false,
  },
  bottles: [],
  motor: {
    runCommand: false,
    actualSpeedMs: 0,
    targetSpeedMs: 1.0,
    frequencyHz: 0,
    rpm: 0,
    currentAmps: 0.5,
    temperatureC: 38.5,
    loadPercent: 5,
    coolingFanRunning: false,
  },
  sensor: {
    id: 'sens-01',
    tag: '%IX0.1_SENS',
    name: 'Photoelectric Inspection Sensor S-01',
    active: false,
    beamBroken: false,
    position: 350,
    detectionCount: 0,
    malfunctioning: false,
    lastTriggered: 0,
  },
  diverter: {
    tag: '%QX0.1_DIV',
    actuated: false,
    positionPercent: 0,
    strokeCount: 0,
    lastActuationTime: 0,
  },
  counters: {
    totalInfeed: 0,
    categoryA: 0,
    categoryB: 0,
    rejectedCount: 0,
    unverifiedCount: 0,
    currentBpm: 0,
    targetBpm: 35,
    uptimeSeconds: 0,
    downtimeSeconds: 0,
    utilizationPercent: 100,
  },
  alarms: [],
  events: [
    {
      id: 'init-evt',
      timestamp: Date.now(),
      timeStr: new Date().toLocaleTimeString(),
      type: 'SYSTEM',
      description: 'SCADA Host Controller Initialized. System standby in IDLE state.',
      source: 'SCADA_CORE',
      operator: 'SYSTEM',
    },
  ],
  productionHistory: generateBaselineTelemetry(),
  settings: DEFAULT_SETTINGS,
  currentPage: 'simulation',
  guidedTourActive: false,
  guidedTourStep: 1,
  autoPilotActive: false,
  autoPilotStatusText: '',
  isKioskMode: false,
  activeToast: null,
};

type Action =
  | { type: 'SET_PAGE'; page: PageId }
  | { type: 'SHOW_TOAST'; message: string; toastType: 'info' | 'warn' | 'error' }
  | { type: 'CLEAR_TOAST' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<SimSettings> }
  | { type: 'SET_OP_MODE'; mode: OperationMode }
  | { type: 'TOGGLE_KIOSK' }
  | { type: 'START_COMMAND' }
  | { type: 'STOP_COMMAND' }
  | { type: 'ESTOP_COMMAND' }
  | { type: 'RESET_ESTOP_COMMAND' }
  | { type: 'RESET_FAULT_COMMAND' }
  | { type: 'INJECT_FAULT'; fault: keyof ActiveFaults; value: boolean }
  | { type: 'CLEAR_ALL_FAULTS' }
  | { type: 'ACKNOWLEDGE_ALARM'; alarmId: string }
  | { type: 'ACKNOWLEDGE_ALL_ALARMS' }
  | { type: 'CLEAR_HISTORICAL_ALARMS' }
  | { type: 'SPAWN_MANUAL_BOTTLE'; category?: BottleCategory; defect?: DefectType }
  | { type: 'MANUAL_TRIGGER_DIVERTER' }
  | { type: 'RESET_COUNTERS' }
  | { type: 'CLEAR_EVENT_LOG' }
  | { type: 'RESET_DEMO' }
  | { type: 'SET_GUIDED_TOUR'; active: boolean; step?: number }
  | { type: 'SET_AUTOPILOT'; active: boolean; status?: string }
  | { type: 'RECORD_TELEMETRY'; record: ProductionRecord }
  | { type: 'SIMULATION_TICK'; deltaSec: number };

function loadSavedState(): Partial<ScadaState> {
  try {
    const raw = localStorage.getItem('scada_sim_store_v1');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
      counters: parsed.counters || INITIAL_STATE.counters,
      alarms: Array.isArray(parsed.alarms) ? parsed.alarms : [],
      events: Array.isArray(parsed.events) ? parsed.events.slice(0, 1000) : INITIAL_STATE.events,
      productionHistory: Array.isArray(parsed.productionHistory) ? parsed.productionHistory.slice(-300) : [],
    };
  } catch (err) {
    console.warn('Corrupted local storage ignored:', err);
    return {};
  }
}

function saveState(state: ScadaState) {
  try {
    const payload = {
      settings: state.settings,
      counters: state.counters,
      alarms: state.alarms,
      events: state.events.slice(0, 1000),
      productionHistory: state.productionHistory.slice(-300),
    };
    localStorage.setItem('scada_sim_store_v1', JSON.stringify(payload));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

function scadaReducer(state: ScadaState, action: Action): ScadaState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.page };

    case 'SHOW_TOAST':
      return {
        ...state,
        activeToast: {
          id: Date.now(),
          message: action.message,
          type: action.toastType,
        },
      };

    case 'CLEAR_TOAST':
      return { ...state, activeToast: null };

    case 'UPDATE_SETTINGS': {
      const nextSettings = { ...state.settings, ...action.settings };
      if (action.settings.audioMuted !== undefined) {
        industrialAudio.setMuted(action.settings.audioMuted);
      }
      return { ...state, settings: nextSettings };
    }

    case 'SET_OP_MODE':
      return {
        ...state,
        operationMode: action.mode,
        events: [
          {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'OPERATOR_ACTION',
            description: `Operation mode switched to ${action.mode} mode.`,
            source: 'HMI_PANEL',
            operator: state.settings.operatorName,
          },
          ...state.events.slice(0, 999),
        ],
      };

    case 'TOGGLE_KIOSK':
      return { ...state, isKioskMode: !state.isKioskMode };

    case 'START_COMMAND': {
      const result = evaluateTransition(state.machineState, { type: 'CMD_START' }, state.activeFaults);
      if (!result.allowed) {
        return {
          ...state,
          activeToast: {
            id: Date.now(),
            message: result.rejectionReason || 'Cannot start conveyor.',
            type: 'error',
          },
        };
      }
      industrialAudio.playClick();
      return {
        ...state,
        machineState: result.nextState,
        activeToast: {
          id: Date.now(),
          message: result.actionMessage || 'Starting conveyor drive...',
          type: 'info',
        },
        events: [
          {
            id: `evt-${Date.now()}-sc`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'STATE_CHANGE',
            description: `State Machine: Transitioned from ${state.machineState} to ${result.nextState} (Acceleration ramp initiated)`,
            source: 'STATE_ENGINE',
            operator: state.settings.operatorName,
          },
          {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'OPERATOR_ACTION',
            description: 'Conveyor Drive START commanded by operator.',
            source: 'HMI_START_PB',
            operator: state.settings.operatorName,
          },
          ...state.events.slice(0, 998),
        ],
      };
    }

    case 'STOP_COMMAND': {
      const result = evaluateTransition(state.machineState, { type: 'CMD_STOP' }, state.activeFaults);
      if (!result.allowed) {
        return {
          ...state,
          activeToast: {
            id: Date.now(),
            message: result.rejectionReason || 'Cannot stop conveyor.',
            type: 'warn',
          },
        };
      }
      industrialAudio.playClick();
      return {
        ...state,
        machineState: result.nextState,
        activeToast: {
          id: Date.now(),
          message: 'Normal Stop initiated. Executing deceleration ramp.',
          type: 'info',
        },
        events: [
          {
            id: `evt-${Date.now()}-sc`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'STATE_CHANGE',
            description: `State Machine: Transitioned from ${state.machineState} to ${result.nextState} (Deceleration ramp initiated)`,
            source: 'STATE_ENGINE',
            operator: state.settings.operatorName,
          },
          {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'OPERATOR_ACTION',
            description: 'Conveyor Drive STOP commanded by operator.',
            source: 'HMI_STOP_PB',
            operator: state.settings.operatorName,
          },
          ...state.events.slice(0, 998),
        ],
      };
    }

    case 'ESTOP_COMMAND': {
      industrialAudio.playEmergencyStop();
      const updatedFaults: ActiveFaults = { ...state.activeFaults, emergencyStop: true };
      const { alarms } = AlarmManager.syncAlarms(state.alarms, updatedFaults, state.bottles.length);
      return {
        ...state,
        machineState: 'EMERGENCY_STOP',
        activeFaults: updatedFaults,
        alarms,
        motor: { ...state.motor, actualSpeedMs: 0 },
        activeToast: {
          id: Date.now(),
          message: 'EMERGENCY STOP ENGAGED! Immediate hard trip executed.',
          type: 'error',
        },
        events: [
          {
            id: `evt-${Date.now()}-sc`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'STATE_CHANGE',
            description: `State Machine: Transitioned from ${state.machineState} to EMERGENCY_STOP (Immediate hard trip)`,
            source: 'STATE_ENGINE',
            operator: state.settings.operatorName,
          },
          {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'FAULT',
            description: 'EMERGENCY STOP ACTUATED: PB-ESTOP-01 depressed. Drives de-energized.',
            source: 'SAFETY_LOOP',
            operator: state.settings.operatorName,
          },
          ...state.events.slice(0, 998),
        ],
      };
    }

    case 'RESET_ESTOP_COMMAND': {
      // Twist to release button clears physical latch
      const updatedFaults: ActiveFaults = { ...state.activeFaults, emergencyStop: false };
      const result = evaluateTransition(state.machineState, { type: 'CMD_RESET_ESTOP' }, updatedFaults);
      if (!result.allowed) {
        return {
          ...state,
          activeToast: {
            id: Date.now(),
            message: result.rejectionReason || 'Cannot reset E-Stop.',
            type: 'error',
          },
        };
      }
      industrialAudio.playClick();
      const { alarms } = AlarmManager.syncAlarms(state.alarms, updatedFaults, state.bottles.length);
      return {
        ...state,
        machineState: result.nextState,
        activeFaults: updatedFaults,
        alarms,
        activeToast: {
          id: Date.now(),
          message: 'E-Stop circuit reset. System in IDLE standby. Press START to resume.',
          type: 'info',
        },
        events: [
          {
            id: `evt-${Date.now()}-sc`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'STATE_CHANGE',
            description: `State Machine: Transitioned from ${state.machineState} to ${result.nextState} (Safety relay reset)`,
            source: 'STATE_ENGINE',
            operator: state.settings.operatorName,
          },
          {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'OPERATOR_ACTION',
            description: 'E-Stop PB-01 unlatched and safety relay reset.',
            source: 'SAFETY_RELAY',
            operator: state.settings.operatorName,
          },
          ...state.events.slice(0, 998),
        ],
      };
    }

    case 'RESET_FAULT_COMMAND': {
      const result = evaluateTransition(state.machineState, { type: 'CMD_RESET_FAULT' }, state.activeFaults);
      if (!result.allowed) {
        return {
          ...state,
          activeToast: {
            id: Date.now(),
            message: result.rejectionReason || 'Cannot reset faults.',
            type: 'warn',
          },
        };
      }
      industrialAudio.playClick();
      industrialAudio.stopAlarmSound();
      return {
        ...state,
        machineState: result.nextState,
        activeToast: {
          id: Date.now(),
          message: 'Faults cleared. System in IDLE standby. Deliberate START required.',
          type: 'info',
        },
        events: [
          {
            id: `evt-${Date.now()}-sc`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'STATE_CHANGE',
            description: `State Machine: Transitioned from ${state.machineState} to ${result.nextState} (Interlocks cleared)`,
            source: 'STATE_ENGINE',
            operator: state.settings.operatorName,
          },
          {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'OPERATOR_ACTION',
            description: 'Operator Master Fault Reset executed. Protective interlocks cleared.',
            source: 'HMI_RESET_PB',
            operator: state.settings.operatorName,
          },
          ...state.events.slice(0, 998),
        ],
      };
    }

    case 'INJECT_FAULT': {
      const updatedFaults = { ...state.activeFaults, [action.fault]: action.value };
      let nextMachineState = state.machineState;
      let toastMessage = `Simulated fault ${action.fault} toggled: ${action.value ? 'ON' : 'OFF'}`;

      if (action.value) {
        // If critical fault tripped while running, trip state machine
        if (action.fault === 'jam' || action.fault === 'motorOverload') {
          if (state.machineState === 'RUNNING' || state.machineState === 'STARTING') {
            nextMachineState = 'FAULT';
            toastMessage = `Protective Interlock Tripped: ${action.fault.toUpperCase()} detected! Motor stopped.`;
          }
        }
      }

      const { alarms } = AlarmManager.syncAlarms(state.alarms, updatedFaults, state.bottles.length);
      return {
        ...state,
        machineState: nextMachineState,
        activeFaults: updatedFaults,
        alarms,
        activeToast: {
          id: Date.now(),
          message: toastMessage,
          type: action.value ? 'warn' : 'info',
        },
        events: [
          {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'FAULT',
            description: `Fault Injection [${action.fault.toUpperCase()}] state set to ${action.value ? 'TRIPPED' : 'CLEARED'}.`,
            source: 'DEMO_CONSOLE',
            operator: state.settings.operatorName,
          },
          ...state.events.slice(0, 999),
        ],
      };
    }

    case 'CLEAR_ALL_FAULTS': {
      const clearedFaults: ActiveFaults = {
        jam: false,
        motorOverload: false,
        sensorMalfunction: false,
        productionBacklog: false,
        emergencyStop: false,
      };
      const { alarms } = AlarmManager.syncAlarms(state.alarms, clearedFaults, state.bottles.length);
      return {
        ...state,
        activeFaults: clearedFaults,
        alarms,
        activeToast: {
          id: Date.now(),
          message: 'All simulated faults cleared. Press "Reset Fault" to return to IDLE.',
          type: 'info',
        },
      };
    }

    case 'ACKNOWLEDGE_ALARM': {
      industrialAudio.playClick();
      const updated = AlarmManager.acknowledgeAlarm(state.alarms, action.alarmId);
      if (!updated.some(a => a.state === 'ACTIVE_UNACK')) {
        industrialAudio.stopAlarmSound();
      }
      return {
        ...state,
        alarms: updated,
        events: [
          {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'ALARM',
            description: `Alarm ${action.alarmId} acknowledged by operator.`,
            source: 'ALARM_SYSTEM',
            operator: state.settings.operatorName,
          },
          ...state.events.slice(0, 999),
        ],
      };
    }

    case 'ACKNOWLEDGE_ALL_ALARMS': {
      industrialAudio.playClick();
      const updated = AlarmManager.acknowledgeAll(state.alarms);
      industrialAudio.stopAlarmSound();
      return {
        ...state,
        alarms: updated,
        events: [
          {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'ALARM',
            description: 'All active alarms acknowledged by operator.',
            source: 'ALARM_SYSTEM',
            operator: state.settings.operatorName,
          },
          ...state.events.slice(0, 999),
        ],
      };
    }

    case 'CLEAR_HISTORICAL_ALARMS': {
      industrialAudio.playClick();
      return {
        ...state,
        alarms: AlarmManager.clearHistorical(state.alarms),
      };
    }

    case 'SPAWN_MANUAL_BOTTLE': {
      industrialAudio.playClick();
      const newBottle = BottleManager.spawnBottle(state.settings, action.category, action.defect);
      return {
        ...state,
        bottles: [newBottle, ...state.bottles],
        counters: { ...state.counters, totalInfeed: state.counters.totalInfeed + 1 },
      };
    }

    case 'MANUAL_TRIGGER_DIVERTER': {
      industrialAudio.playPneumaticPusher();
      return {
        ...state,
        diverter: {
          ...state.diverter,
          actuated: true,
          strokeCount: state.diverter.strokeCount + 1,
          lastActuationTime: Date.now(),
        },
      };
    }

    case 'RESET_COUNTERS': {
      return {
        ...state,
        counters: {
          ...state.counters,
          totalInfeed: 0,
          categoryA: 0,
          categoryB: 0,
          rejectedCount: 0,
          unverifiedCount: 0,
          currentBpm: 0,
        },
        bottles: [],
        events: [
          {
            id: `evt-${Date.now()}`,
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString(),
            type: 'OPERATOR_ACTION',
            description: 'Production counters and queue cleared by operator.',
            source: 'SCADA_DB',
            operator: state.settings.operatorName,
          },
          ...state.events.slice(0, 999),
        ],
      };
    }

    case 'CLEAR_EVENT_LOG':
      return { ...state, events: [] };

    case 'RESET_DEMO': {
      industrialAudio.stopAlarmSound();
      return {
        ...INITIAL_STATE,
        settings: state.settings,
        currentPage: state.currentPage,
      };
    }

    case 'SET_GUIDED_TOUR':
      return {
        ...state,
        guidedTourActive: action.active,
        guidedTourStep: action.step || 1,
      };

    case 'SET_AUTOPILOT':
      return {
        ...state,
        autoPilotActive: action.active,
        autoPilotStatusText: action.status || (action.active ? 'Running Auto-Pilot Loop' : ''),
      };

    case 'SIMULATION_TICK': {
      const dt = action.deltaSec;
      const isRun = state.machineState === 'RUNNING';
      const isStarting = state.machineState === 'STARTING';
      const isStopping = state.machineState === 'STOPPING';

      // Auto transitions for STARTING and STOPPING
      let nextMachineState = state.machineState;
      if (isStarting && state.motor.actualSpeedMs >= state.settings.nominalSpeedMs * 0.95) {
        nextMachineState = 'RUNNING';
      }
      if (isStopping && state.motor.actualSpeedMs <= 0.02) {
        nextMachineState = 'IDLE';
      }

      // Update Motor thermodynamics
      const nextMotor = EquipmentModel.updateMotor(
        state.motor,
        nextMachineState,
        state.settings.nominalSpeedMs,
        dt,
        state.activeFaults,
        state.bottles.length
      );

      // Check thermal overload trip rule
      let activeFaults = { ...state.activeFaults };
      if (nextMotor.temperatureC >= state.settings.motorOverloadThresholdC || nextMotor.currentAmps >= 15.0) {
        if (!activeFaults.motorOverload) {
          activeFaults.motorOverload = true;
          if (nextMachineState === 'RUNNING' || nextMachineState === 'STARTING') {
            nextMachineState = 'FAULT';
          }
        }
      }

      // Sound update
      industrialAudio.updateMotorSound(
        nextMachineState === 'RUNNING',
        nextMotor.frequencyHz
      );

      // Update Diverter
      const nextDiverter = EquipmentModel.updateDiverter(state.diverter, dt, false);

      // Advance Bottles and detect sorting
      let catAIncrement = 0;
      let catBIncrement = 0;
      let rejectIncrement = 0;
      let unverifiedIncrement = 0;

      const { updatedBottles, sensorActive, sensorTriggeredBottle, diverterShouldActuate } = BottleManager.updateBottles(
        state.bottles,
        dt,
        nextMotor.actualSpeedMs,
        nextMachineState === 'RUNNING',
        activeFaults.jam,
        state.sensor,
        nextDiverter,
        state.operationMode,
        (bin, btl) => {
          industrialAudio.playBottleDrop();
          if (bin === 'BIN_A') catAIncrement++;
          else if (bin === 'BIN_B') catBIncrement++;
          else rejectIncrement++;
          if (btl.defect === 'UNVERIFIED') unverifiedIncrement++;
        }
      );

      // If diverter triggered by auto logic
      let finalDiverter = nextDiverter;
      if (diverterShouldActuate) {
        industrialAudio.playPneumaticPusher();
        finalDiverter = EquipmentModel.updateDiverter(nextDiverter, dt, true);
      }

      // Sensor optical sound
      if (sensorActive && !state.sensor.active) {
        industrialAudio.playSensorBeep();
      }

      // Sensor status
      const nextSensor: SensorStatus = {
        ...state.sensor,
        active: sensorActive,
        beamBroken: sensorActive,
        detectionCount: state.sensor.detectionCount + (sensorActive && !state.sensor.active ? 1 : 0),
        malfunctioning: activeFaults.sensorMalfunction,
        lastTriggered: sensorActive ? Date.now() : state.sensor.lastTriggered,
      };

      // Alarms synchronization
      const { alarms: nextAlarms, shouldTrip, tripReason } = AlarmManager.syncAlarms(
        state.alarms,
        activeFaults,
        updatedBottles.length
      );

      if (shouldTrip && (nextMachineState === 'RUNNING' || nextMachineState === 'STARTING')) {
        nextMachineState = 'FAULT';
      }

      // If alarm unacknowledged, sound siren
      if (nextAlarms.some(a => a.state === 'ACTIVE_UNACK')) {
        industrialAudio.startAlarmSound();
      } else {
        industrialAudio.stopAlarmSound();
      }

      // Update counters
      const nextCounters: ProductionCounters = {
        ...state.counters,
        categoryA: state.counters.categoryA + catAIncrement,
        categoryB: state.counters.categoryB + catBIncrement,
        rejectedCount: state.counters.rejectedCount + rejectIncrement,
        unverifiedCount: state.counters.unverifiedCount + unverifiedIncrement,
        uptimeSeconds: state.counters.uptimeSeconds + (nextMachineState === 'RUNNING' ? dt : 0),
        downtimeSeconds: state.counters.downtimeSeconds + (nextMachineState !== 'RUNNING' ? dt : 0),
      };

      // Events collection for automatic simulation occurrences
      const tickEvents: ScadaEvent[] = [];
      const nowTs = Date.now();
      const nowStr = new Date().toLocaleTimeString();

      // State transition event during automatic ramp or auto fault trip
      if (nextMachineState !== state.machineState) {
        tickEvents.push({
          id: `evt-${nowTs}-stchg`,
          timestamp: nowTs,
          timeStr: nowStr,
          type: 'STATE_CHANGE',
          description: `State Machine: Transitioned from ${state.machineState} to ${nextMachineState}`,
          source: 'STATE_ENGINE',
          operator: 'AUTO_PLC',
        });
      }

      // Sorting events
      if (catAIncrement > 0) {
        tickEvents.push({
          id: `evt-${nowTs}-sorta`,
          timestamp: nowTs,
          timeStr: nowStr,
          type: 'SORTING',
          description: `Bottle sorted into Bin A (Category A, 500ml Clear) - count: ${nextCounters.categoryA}`,
          source: 'BIN_A_LINE',
          operator: 'AUTO_PLC',
        });
      }
      if (catBIncrement > 0) {
        tickEvents.push({
          id: `evt-${nowTs}-sortb`,
          timestamp: nowTs,
          timeStr: nowStr,
          type: 'SORTING',
          description: `Bottle diverted into Bin B (Category B, 1000ml Amber) - count: ${nextCounters.categoryB}`,
          source: 'DIVERTER_SOL_01',
          operator: 'AUTO_PLC',
        });
      }

      // Detection event (throttled: only on new rising edge beam break)
      if (sensorActive && !state.sensor.active) {
        tickEvents.push({
          id: `evt-${nowTs}-det`,
          timestamp: nowTs,
          timeStr: nowStr,
          type: 'SYSTEM',
          description: `Photoelectric Sensor S-01: Detected bottle beam-break (Detection #${nextSensor.detectionCount})`,
          source: 'SENSOR_S01',
          operator: 'SIM_HOST',
        });
      }

      const nextEvents = tickEvents.length > 0 
        ? [...tickEvents, ...state.events].slice(0, 1000)
        : state.events;

      return {
        ...state,
        machineState: nextMachineState,
        activeFaults,
        motor: nextMotor,
        diverter: finalDiverter,
        sensor: nextSensor,
        bottles: updatedBottles,
        alarms: nextAlarms,
        counters: nextCounters,
        events: nextEvents,
      };
    }

    case 'RECORD_TELEMETRY':
      return {
        ...state,
        counters: {
          ...state.counters,
          currentBpm: action.record.bpm,
        },
        productionHistory: [...state.productionHistory, action.record].slice(-300),
      };

    default:
      return state;
  }
}

interface ScadaContextType {
  state: ScadaState;
  dispatch: React.Dispatch<Action>;
}

const ScadaContext = createContext<ScadaContextType | null>(null);

export const ScadaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(scadaReducer, INITIAL_STATE, (init) => {
    const saved = loadSavedState();
    return { ...init, ...saved };
  });

  const stateRef = useRef<ScadaState>(state);
  stateRef.current = state;

  // Auto-save periodically
  useEffect(() => {
    const saveTimer = setInterval(() => {
      saveState(stateRef.current);
    }, 5000);
    return () => clearInterval(saveTimer);
  }, []);

  // =========================================================================
  // FIXED-TIMESTEP SIMULATION LOOP (50ms = 20Hz tick, tab pause aware)
  // =========================================================================
  useEffect(() => {
    let lastTime = performance.now();
    let spawnAccumulator = 0;
    let telemetryAccumulator = 0;

    const interval = setInterval(() => {
      if (document.hidden) {
        lastTime = performance.now();
        return; // Pause simulation physics when tab is backgrounded
      }

      const now = performance.now();
      const rawDt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const multiplier = stateRef.current.settings.simulationMultiplier || 1;
      const dt = rawDt * multiplier;

      // Dispatch physics tick
      dispatch({ type: 'SIMULATION_TICK', deltaSec: dt });

      // Auto bottle generation in RUNNING + AUTO mode
      if (stateRef.current.machineState === 'RUNNING' && stateRef.current.operationMode === 'AUTO') {
        spawnAccumulator += dt;
        const targetInterval = stateRef.current.settings.bottleSpawnIntervalSec;
        if (spawnAccumulator >= targetInterval) {
          spawnAccumulator = 0;
          dispatch({ type: 'SPAWN_MANUAL_BOTTLE' });
        }
      } else {
        spawnAccumulator = 0;
      }

      // Telemetry recording (1Hz)
      telemetryAccumulator += dt;
      if (telemetryAccumulator >= 1.0) {
        telemetryAccumulator = 0;
        const currentSpeed = stateRef.current.motor.actualSpeedMs;
        const bpm = Math.round((currentSpeed / 1.0) * (60 / stateRef.current.settings.bottleSpawnIntervalSec));
        
        // Update BPM and history
        stateRef.current.counters.currentBpm = stateRef.current.machineState === 'RUNNING' ? bpm : 0;
        const totalUptime = stateRef.current.counters.uptimeSeconds;
        const totalDown = stateRef.current.counters.downtimeSeconds;
        const totalSec = Math.max(1, totalUptime + totalDown);
        stateRef.current.counters.utilizationPercent = +( (totalUptime / totalSec) * 100 ).toFixed(1);

        const record: ProductionRecord = {
          timestamp: Date.now(),
          timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          bpm: stateRef.current.counters.currentBpm,
          totalBottles: stateRef.current.counters.totalInfeed,
          catA: stateRef.current.counters.categoryA,
          catB: stateRef.current.counters.categoryB,
          speedMs: currentSpeed,
          motorTempC: stateRef.current.motor.temperatureC,
        };

        dispatch({ type: 'RECORD_TELEMETRY', record });
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss toasts after 4 seconds
  useEffect(() => {
    if (state.activeToast) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_TOAST' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.activeToast]);

  return (
    <ScadaContext.Provider value={{ state, dispatch }}>
      {children}
    </ScadaContext.Provider>
  );
};

export function useScada() {
  const context = useContext(ScadaContext);
  if (!context) {
    throw new Error('useScada must be used within a ScadaProvider');
  }
  return context;
}
