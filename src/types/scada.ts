// ============================================================================
// SCADA System Types & Interfaces
// Notice: Browser-based SCADA Simulator inspired by Wonderware, Ignition & Rapid SCADA.
// All values are SIMULATED and labeled as such in compliance with project honesty rules.
// ============================================================================

export type MachineState = 
  | 'IDLE' 
  | 'STARTING' 
  | 'RUNNING' 
  | 'STOPPING' 
  | 'FAULT' 
  | 'EMERGENCY_STOP';

export type OperationMode = 'AUTO' | 'MANUAL';

export type StopMode = 'DRAIN' | 'PAUSE';

export type BottleCategory = 'CATEGORY_A' | 'CATEGORY_B';

export type DefectType = 
  | 'NONE'
  | 'UNDERFILLED'
  | 'MISSING_CAP'
  | 'DEFORMED'
  | 'UNVERIFIED';

export interface Bottle {
  id: string;
  serialNumber: string;
  category: BottleCategory;
  defect: DefectType;
  position: number; // 0 (infeed) to 1000 (discharge/bin)
  fillLevelPercent: number; // 0 to 100
  hasCap: boolean;
  sorted: boolean;
  sortedTo?: 'BIN_A' | 'BIN_B' | 'REJECT';
  sortedAt?: number;
  detected?: boolean;
  diverted: boolean;
  isJammed?: boolean;
  createdAt: number;
}

export type AlarmSeverity = 'CRITICAL' | 'MAJOR' | 'WARNING' | 'INFO';

export type AlarmLifecycleState = 
  | 'ACTIVE_UNACK'  // Tripped, not yet acknowledged by operator (flashing red/amber)
  | 'ACTIVE_ACK'    // Tripped and acknowledged, condition still present (solid red/amber)
  | 'CLEARED_UNACK' // Cause cleared, but operator hasn't acknowledged yet
  | 'CLEARED';      // Inactive and acknowledged (historic)

export interface Alarm {
  id: string;
  code: string;
  tag: string;
  title: string;
  description: string;
  severity: AlarmSeverity;
  state: AlarmLifecycleState;
  timestamp: number;
  ackTimestamp?: number;
  clearedTimestamp?: number;
  requiresReset: boolean;
}

export type FaultId = 
  | 'JAM' 
  | 'MOTOR_OVERLOAD' 
  | 'SENSOR_MALFUNCTION' 
  | 'PRODUCTION_BACKLOG' 
  | 'EMERGENCY_STOP';

export interface ActiveFaults {
  jam: boolean;
  motorOverload: boolean;
  sensorMalfunction: boolean;
  productionBacklog: boolean;
  emergencyStop: boolean;
}

export interface MotorTelemetry {
  runCommand: boolean;
  actualSpeedMs: number;     // Linear conveyor speed in m/s (SIMULATED)
  targetSpeedMs: number;     // Setpoint (0.1 to 2.5 m/s)
  frequencyHz: number;       // VFD Frequency 0 - 60 Hz
  rpm: number;               // 0 - 1800 RPM
  temperatureC: number;      // °C (Normal 35-65°C, Overload > 80°C)
  loadPercent: number;       // 0 - 100% (Overload > 90%)
  currentAmps: number;       // 0 - 15A
  coolingFanRunning: boolean;
}

export interface SensorStatus {
  id: string;
  tag: string;
  name: string;
  active: boolean;          // High/Low beam break
  beamBroken: boolean;
  position: number;         // Position on track 0-1000 (e.g. 350)
  detectionCount: number;
  malfunctioning: boolean;
  lastTriggered: number;
}

export interface DiverterStatus {
  tag: string;
  actuated: boolean;        // Solenoid extended
  positionPercent: number;  // 0% retracted, 100% extended
  strokeCount: number;
  lastActuationTime: number;
}

export interface ProductionCounters {
  totalInfeed: number;
  categoryA: number;        // Straight-through bin (e.g. 500ml)
  categoryB: number;        // Diverted bin (e.g. 1000ml)
  rejectedCount: number;
  unverifiedCount: number;
  currentBpm: number;       // Instantaneous Bottles/Min
  targetBpm: number;
  uptimeSeconds: number;
  downtimeSeconds: number;
  utilizationPercent: number;
}

export interface ProductionRecord {
  timestamp: number;
  timeStr: string;
  bpm: number;
  totalBottles: number;
  catA: number;
  catB: number;
  speedMs: number;
  motorTempC: number;
}

export interface ScadaEvent {
  id: string;
  timestamp: number;
  timeStr: string;
  type: 'STATE_CHANGE' | 'ALARM' | 'OPERATOR_ACTION' | 'SORTING' | 'FAULT' | 'SYSTEM';
  description: string;
  source: string;
  operator: string;
}

export type TagType = 'BOOL' | 'REAL' | 'INT' | 'STRING';
export type TagDirection = 'INPUT' | 'OUTPUT' | 'INTERNAL';

export interface ScadaTag {
  name: string;
  address: string;          // e.g. %IX0.0, %MW100
  type: TagType;
  direction: TagDirection;
  value: boolean | number | string;
  unit?: string;
  description: string;
  lastUpdated: number;
}

export interface SimSettings {
  nominalSpeedMs: number;      // 0.2 to 2.0 m/s (default 1.0)
  bottleSpawnIntervalSec: number; // 0.8 to 4.0 s (default 1.8)
  categoryARatioPercent: number;  // 10 to 90 % (default 50)
  defectProbabilityPercent: number; // 0 to 30 % (default 5)
  motorOverloadThresholdC: number; // default 80°C
  jamTimeoutSec: number;       // default 3.0s
  stopMode: StopMode;          // 'DRAIN' | 'PAUSE'
  randomFaultsEnabled: boolean; // default false
  randomFaultFrequencyMin: number; // default 5 min
  audioMuted: boolean;         // default false
  simulationMultiplier: 1 | 2 | 5; // fast forward (1x, 2x, 5x)
  operatorName: string;
  shiftName: string;
}

export type PageId = 
  | 'dashboard'
  | 'simulation'
  | 'equipment'
  | 'alarms'
  | 'analytics'
  | 'events'
  | 'tags'
  | 'settings'
  | 'exhibition';
