# Spectra-Flow SCADA: Automated Conveyor Monitoring & Bottle Sorting System

> **College Robotics Project & Industrial Automation Exhibition Prototype**  
> An exhibition-grade, browser-based SCADA / HMI simulator inspired by industrial supervisory systems such as Wonderware InTouch, Inductive Automation Ignition, and Rapid SCADA.  
> **Notice:** *All sensor signals, PLC I/O tags, and motor thermodynamics are SIMULATED in pure TypeScript. No physical hardware connection is required.*

---

## 🏭 Project Objective
This project demonstrates modern industrial automation, supervisory control, and data acquisition (SCADA) principles applied to high-speed bottle manufacturing, inspection, and packaging. The software functions as a complete digital twin of a packaging conveyor cell, running entirely in the browser with decoupled physics, deterministic state transitions, and zero external dependencies.

---

## 🛠️ Technology Stack
- **Framework & Language:** React 19, TypeScript 5.8, Vite 8
- **Styling:** Vanilla Tailwind CSS with custom industrial control-room tokens, LED glow filters, and P&ID mimic styling
- **Icons & Graphics:** Lucide React icons, animated SVG / CSS kinetic conveyor belt
- **Charts & Telemetry:** Recharts (Responsive Area, Bar, and Pareto charts)
- **State & Architecture:** Central store (Context + `useReducer`), LocalStorage persistence with corruption fallback
- **Audio Synthesizer:** Browser Web Audio API (industrial alarm horns, beeps, pneumatic hiss, and clicks with zero external audio assets)
- **Unit Testing:** Vitest (14 automated unit tests for state machine transitions and ISA-18.2 alarm lifecycle)

---

## 🧭 System Pages (9 Supervisory Screens)
1. **Overview Dashboard:** Top-level control room glance. 8 KPI cards (Line Status, Total Bottles, Category A & B counts, BPM Throughput, Belt Speed, Active Alarms, Machine Utilization %). Live production area chart, recent alarm matrix, and equipment operational summary.
2. **Live Conveyor Simulation (Hero Screen):** Animated SVG conveyor track (motor drum, moving textured belt, optical photocell S-01, pneumatic diverter cylinder, Bin A & Bin B collectors). Features a live PLC hardware I/O status strip (`MOTOR_RUN`, `SENSOR_1`, `DIVERTER`, `ESTOP`, `FAULT`) and an industrial push-button operator console.
3. **Equipment & Sensor Monitoring:** Detailed drive motor diagnostics (VFD frequency, RPM, phase current Amps, stator winding temperature PT100 RTD curve, shaft torque %, cooling fan state). Sensor optical health and pneumatic diverter stroke counter.
4. **Alarm Management (ISA-18.2):** ANSI/ISA-18.2 & IEC 62682 compliant alarm annunciator. Flashing *Active Unacknowledged*, *Active Acknowledged*, *Cleared Unacknowledged*, and *Cleared* states. Fault simulator console (Jam, Motor Overload, Sensor Fault, Backlog, E-Stop) and CSV export.
5. **Production Analytics:** SPC charts with time-range filtering (5 min, 15 min, session, all). Category A vs B bar chart, Defect Pareto distribution, velocity trend over time, and one-click telemetry CSV export.
6. **Event Logs (Historian):** 21 CFR Part 11 electronic records audit trail. Non-volatile LocalStorage persistence (capped at 1,000 events) recording starts, stops, E-stops, alarms, faults, and operator actions with keyword search and CSV export.
7. **Tag Database / I/O Table:** Demonstrates industrial memory mapping (IEC 61131-3 syntax: `%IX` digital inputs, `%QX` digital outputs, `%MD` double words, `%MW` memory words) updating in real time.
8. **Settings:** Physical parameter sliders (conveyor velocity 0.2–2.5 m/s, infeed cadence 0.8–4.0s, A/B ratio 10–90%, motor overload temperature limit, jam timeout), stop mode (*Drain* vs *Pause*), and full demo state reset.
9. **Exhibition Mode:** 
   - **Guided Examiner Demo:** 11-step interactive narrative with floating instructions and evaluator talking points.
   - **Auto-Pilot Showcase:** Autonomous self-running demonstration loop that powers on, produces bottles, sorts, injects faults, recovers, and repeats.
   - **Presenter Drawer:** Collapsible right-hand panel with talking points and one-click scenario triggers.
   - **Big-Screen Kiosk Mode:** Enters fullscreen with enlarged metrics for viewing from 2–3 meters away.

---

## 🔄 State Machine Transition Table

The conveyor drive operates under a deterministic state machine with strict safety interlocks:

```
+----------------+---------------------+-------------------------------+----------------+-------------------------------------------------------------+
| Current State  | Event / Command     | Guard / Condition             | Next State     | Safety Action Notes                                         |
+----------------+---------------------+-------------------------------+----------------+-------------------------------------------------------------+
| IDLE           | CMD_START           | No Faults, No E-Stop          | STARTING       | VFD begins acceleration ramp (0 -> nominal m/s)             |
| IDLE           | CMD_START           | Active Fault or Latched E-Stop| IDLE (REJECT)  | Toast notification: interlock explains reason blocked       |
| IDLE           | CMD_ESTOP           | E-Stop button depressed       | EMERGENCY_STOP | Dual-channel safety loop de-energized                       |
| STARTING       | TICK_RAMP_DONE      | Velocity >= nominal speed     | RUNNING        | Nominal speed attained; automated sorting armed             |
| STARTING       | CMD_STOP            | Stop button pressed           | STOPPING       | Aborts startup; initiates deceleration ramp                 |
| RUNNING        | CMD_STOP            | Normal Stop requested         | STOPPING       | Controlled deceleration ramp to rest                        |
| RUNNING        | CMD_ESTOP           | E-Stop button depressed       | EMERGENCY_STOP | Instant 0 m/s freeze; all drives de-energized               |
| RUNNING        | CMD_FAULT_TRIP      | Jam (>3s) or Overload (>80°C) | FAULT          | Protective relay trip; motor stops automatically            |
| STOPPING       | TICK_RAMP_DONE      | Velocity <= 0.02 m/s          | IDLE           | Conveyor brought to complete rest                           |
| FAULT          | CMD_RESET_FAULT     | Fault cause physically cleared| IDLE           | Safety relays reset. NEVER silently restarts conveyor!      |
| FAULT          | CMD_RESET_FAULT     | Fault condition still active  | FAULT (REJECT) | Cannot reset active physical trip                           |
| EMERGENCY_STOP | CMD_RESET_ESTOP     | Twist knob released           | IDLE           | Safety loop armed in IDLE. Deliberate START required.       |
| EMERGENCY_STOP | CMD_START           | Always                        | E_STOP (REJECT)| Start strictly forbidden while safety circuit is open       |
+----------------+---------------------+-------------------------------+----------------+-------------------------------------------------------------+
```

---

## 🚨 ISA-18.2 Alarm Lifecycle

Alarms follow the ANSI/ISA-18.2 industrial lifecycle:
1. **Normal:** Field parameters within operating envelopes.
2. **Active Unacknowledged (`ACTIVE_UNACK`):** Fault occurs. Annunciator flashes red/amber, Web Audio siren sounds, and motor auto-trips if Critical.
3. **Active Acknowledged (`ACTIVE_ACK`):** Operator presses `ACK`. Siren is silenced and annunciator turns solid. **Acknowledging does NOT clear the fault!**
4. **Cleared Unacknowledged (`CLEARED_UNACK`):** Physical cause resolved before operator acknowledgment.
5. **Cleared (`CLEARED`):** Condition resolved and acknowledged.

---

## ⌨️ Keyboard Shortcuts
- <kbd>Space</kbd> : Toggle Start / Stop conveyor drive
- <kbd>E</kbd> : Actuate Emergency Stop (instant safety hard trip)
- <kbd>A</kbd> : Acknowledge all active alarms
- <kbd>F</kbd> : Toggle browser Fullscreen mode

---

## 🚀 Quick Start & Run Commands

```bash
# 1. Install dependencies
npm install

# 2. Run automated unit tests (Vitest)
npm test

# 3. Start local development server
npm run dev

# 4. Create production build
npm run build

# 5. Preview production bundle locally
npm run preview
```

Open your browser to `http://localhost:5173/` (or the port displayed by Vite).
