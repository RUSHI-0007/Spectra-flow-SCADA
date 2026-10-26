// ============================================================================
// Exhibition Mode: Guided Demo & Auto-Pilot Scenario Engine
// Designed for college exhibition live demonstrations to examiners
// ============================================================================

export interface GuidedStep {
  stepIndex: number;
  title: string;
  instruction: string;
  evaluatorTalkingPoint: string;
  targetPage: string;
  expectedAction?: string;
  autoAdvanceDelaySec: number;
}

export const GUIDED_DEMO_STEPS: GuidedStep[] = [
  {
    stepIndex: 1,
    title: 'System Startup & Interlock Verification',
    instruction: 'Click the green START (I) button on the control console.',
    evaluatorTalkingPoint: 'SCADA interlock checks that no E-stop or safety faults exist before allowing VFD acceleration ramp (0 -> 1.0 m/s).',
    targetPage: 'simulation',
    expectedAction: 'START',
    autoAdvanceDelaySec: 5,
  },
  {
    stepIndex: 2,
    title: 'Infeed Cadence & Conveyor Movement',
    instruction: 'Observe bottles entering from the left and advancing along the belt.',
    evaluatorTalkingPoint: 'Bottles travel at simulated physical speed decoupled from UI framerate. VFD frequency controls belt velocity.',
    targetPage: 'simulation',
    autoAdvanceDelaySec: 6,
  },
  {
    stepIndex: 3,
    title: 'Photoelectric Sensor S-01 Detection',
    instruction: 'Watch the optical detection beam at x=350 illuminate green when a bottle crosses.',
    evaluatorTalkingPoint: 'Optical sensor registers beam break, triggers digital input %IX0.1, increments detection counter, and verifies cap integrity.',
    targetPage: 'simulation',
    autoAdvanceDelaySec: 6,
  },
  {
    stepIndex: 4,
    title: 'Pneumatic Diverter Sorting Logic',
    instruction: 'Notice Category B (amber) bottles pushed by the diverter arm into Bin B, while Category A passes straight.',
    evaluatorTalkingPoint: 'Closed-loop PLC sorting logic: 5/2 solenoid valve fires to actuate pneumatic piston, diverting Category B into packaging stream.',
    targetPage: 'simulation',
    autoAdvanceDelaySec: 7,
  },
  {
    stepIndex: 5,
    title: 'Production Counters & Telemetry Update',
    instruction: 'Observe the Category A, Category B, and Bottles/Min (BPM) readouts incrementing.',
    evaluatorTalkingPoint: 'Counters update only when bottles physically land in destination bins, maintaining accurate material accounting.',
    targetPage: 'simulation',
    autoAdvanceDelaySec: 5,
  },
  {
    stepIndex: 6,
    title: 'Fault Injection: Conveyor Jam',
    instruction: 'Click "Simulate Jam" or inject jam fault to simulate a mechanical line blockage.',
    evaluatorTalkingPoint: 'In testing safety systems, simulating unexpected jams proves the control system protects equipment and personnel.',
    targetPage: 'simulation',
    expectedAction: 'INJECT_JAM',
    autoAdvanceDelaySec: 4,
  },
  {
    stepIndex: 7,
    title: 'ISA-18.2 Alarm Annunciation & Automatic Stop',
    instruction: 'Notice the flashing red alarm banner, audible siren, and automatic motor drive shutdown.',
    evaluatorTalkingPoint: 'Optical sensor blocked >3.0s triggers Critical Alarm ALM-101. Interlock automatically cuts motor power to prevent belt damage.',
    targetPage: 'alarms',
    autoAdvanceDelaySec: 6,
  },
  {
    stepIndex: 8,
    title: 'Operator Acknowledgment (ACK)',
    instruction: 'Click "ACK" or "Acknowledge All Alarms" in the Alarm panel.',
    evaluatorTalkingPoint: 'Per ISA-18.2 standards, acknowledging silences the buzzer and stops the flashing, but DOES NOT clear the fault.',
    targetPage: 'alarms',
    expectedAction: 'ACK_ALARM',
    autoAdvanceDelaySec: 4,
  },
  {
    stepIndex: 9,
    title: 'Physical Clearance & Fault Reset',
    instruction: 'Click "Clear Jam" then press "Reset Fault" on the control console.',
    evaluatorTalkingPoint: 'SCADA rule: Fault reset clears the latching relay to IDLE, but NEVER silently restarts the belt. Operator must deliberately press START.',
    targetPage: 'simulation',
    expectedAction: 'RESET_FAULT',
    autoAdvanceDelaySec: 5,
  },
  {
    stepIndex: 10,
    title: 'Resume Normal Production',
    instruction: 'Click START to resume normal automated packaging operations.',
    evaluatorTalkingPoint: 'System smoothly accelerates back to setpoint speed; bottles resume travel without dropped counts.',
    targetPage: 'simulation',
    expectedAction: 'START',
    autoAdvanceDelaySec: 5,
  },
  {
    stepIndex: 11,
    title: 'Production Analytics & 21 CFR Audit Trail',
    instruction: 'Navigate to Analytics and Event Logs to review historical trends and compliance logs.',
    evaluatorTalkingPoint: 'Demonstrates enterprise SCADA capabilities: Overall Equipment Effectiveness (OEE), throughput Pareto charts, and exportable CSV logs.',
    targetPage: 'analytics',
    autoAdvanceDelaySec: 6,
  },
];

export interface PageTalkingPoints {
  title: string;
  points: string[];
  vivaQuestions: Array<{ q: string; a: string }>;
}

export const PRESENTER_TALKING_POINTS: Record<string, PageTalkingPoints> = {
  dashboard: {
    title: 'Overview Dashboard',
    points: [
      'High-level control room overview for plant managers and shift supervisors.',
      'Key performance indicators: Line rate (BPM), A/B sorting breakdown, utilization %.',
      'Real-time production sparkline and active alarm summary banner.',
      'Design adheres to dark-mode control room standards with IEC 60073 colors.',
    ],
    vivaQuestions: [
      {
        q: 'What is the purpose of the Overview Dashboard in a SCADA system?',
        a: 'It provides a centralized high-level glance of entire plant health, critical KPIs (throughput, scrap, OEE), and active alarms without cluttering the operator with low-level sensor details.',
      },
    ],
  },
  simulation: {
    title: 'Live Conveyor Simulation',
    points: [
      'Digital twin of the bottling line running a decoupled physics loop in plain TypeScript.',
      'Optical photoelectric sensor S-01 (Tag %IX0.1) performs non-contact bottle detection.',
      'Pneumatic pusher diverter (Tag %QX0.1) sorts bottles based on configured logic.',
      'PLC Status Strip shows hardware I/O states (MOTOR_RUN, SENSOR_1, DIVERTER, ESTOP, FAULT).',
    ],
    vivaQuestions: [
      {
        q: 'How does the sorting mechanism differentiate bottles?',
        a: 'The optical inspection station evaluates the bottle profile (or simulated barcoding/height). Category B triggers a high-speed pneumatic cylinder stroke to divert it to Bin B, while Category A continues straight to Bin A.',
      },
      {
        q: 'What happens when Emergency Stop is pressed during full speed?',
        a: 'The state machine immediately transitions to EMERGENCY_STOP, instantly setting drive speed to 0 m/s and latching safety relays. It requires explicit twist-to-release and a deliberate Start command.',
      },
    ],
  },
  equipment: {
    title: 'Equipment & Sensor Monitoring',
    points: [
      'Simulated thermodynamics: Motor temperature rises under heavy load/speed and cools when stopped.',
      'Thermal overload protection trips when stator temp exceeds 80°C or current exceeds 15.0A.',
      'Sensor health monitoring and diverter stroke lifecycle tracking for predictive maintenance.',
    ],
    vivaQuestions: [
      {
        q: 'How is motor overload simulated?',
        a: 'We model electrical load based on conveyor speed and bottle mass. If a mechanical jam occurs or high speed is sustained, simulated current surges above rated FLA (12.5A) and winding temperature rises towards 88°C, triggering an overload trip.',
      },
    ],
  },
  alarms: {
    title: 'Alarm Management (ISA-18.2)',
    points: [
      'Complies with ANSI/ISA-18.2 and IEC 62682 industrial alarm lifecycle standards.',
      'Four distinct states: Active Unacknowledged, Active Acknowledged, Cleared Unacknowledged, Cleared.',
      'Priorities: Critical (flashing red, auto-trip), Warning (amber), Info (neutral).',
      'Audible industrial horn synthesized using browser Web Audio API.',
    ],
    vivaQuestions: [
      {
        q: 'Why does acknowledging an alarm not turn off the fault?',
        a: 'Per ISA-18.2 safety standards, acknowledgment only informs the system that the human operator is aware of the condition. The hazardous condition must be physically cleared before the interlock can be reset.',
      },
    ],
  },
  analytics: {
    title: 'Production Analytics & OEE',
    points: [
      'Overall Equipment Effectiveness (OEE) = Availability × Performance × Quality.',
      'Time-filtered historical charts: 5 min, 15 min, session, all.',
      'Defect Pareto distribution identifying top scrap causes (underfill, missing cap, neck defect).',
      'One-click export of production telemetry to CSV spreadsheet.',
    ],
    vivaQuestions: [
      {
        q: 'What is OEE and why is it important in automated packaging?',
        a: 'Overall Equipment Effectiveness measures the percentage of planned production time that is truly productive. World-class manufacturing targets >85% OEE by minimizing downtime, speed losses, and defective bottles.',
      },
    ],
  },
  tags: {
    title: 'Tag Database & PLC I/O Table',
    points: [
      'Demonstrates understanding of industrial automation architectures (PLC, SCADA, I/O scanning).',
      'Tags mapped with IEC 61131-3 syntax: %IX (Inputs), %QX (Outputs), %MW (Internal Words), %MD (Double words).',
      'Live updating values showing how a SCADA driver polls register memory.',
    ],
    vivaQuestions: [
      {
        q: 'What is a SCADA Tag?',
        a: 'A Tag is a named variable in SCADA memory that maps to a physical or simulated PLC memory address (e.g. %IX0.1 for a digital sensor input or %MD102 for motor speed). It decouples the UI from PLC addressing.',
      },
    ],
  },
};
