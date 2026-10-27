# Software Design Specification (SDS)
## SCADA-Based Automated Conveyor Belt Monitoring and Bottle Sorting System

**Document ID:** SDS-SCADA-BTL-002  
**Revision:** 1.2  
**System:** Browser-Based Educational SCADA & Industrial Conveyor Simulator  
**Classification:** Software Architecture Specification  
**Status:** Released  

---

## 1. Architectural Overview

The SCADA Simulator software architecture is designed around a **deterministic, unidirectional data flow** model. An in-memory fixed-timestep discrete simulation engine simulates physical conveyor kinematics, motor electro-thermodynamics, photoelectric beam breaks, pneumatic solenoid dynamics, and quality classification at 20 Hz (50 ms tick).

The frontend presentation layer is structured as a decoupled, responsive control-room Human-Machine Interface (HMI) built with React 19, TypeScript, and Tailwind CSS.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SCADA Application Context                       │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               Fixed-Timestep Simulation Loop (50 ms)           │   │
│   │                                                                │   │
│   │   [ SimulationEngine (20 Hz) ]                                 │   │
│   │        │                                                       │   │
│   │        ├──> EquipmentModel (VFD, Motor, PT100, Diverter)       │   │
│   │        ├──> BottleManager (Spawn, Position Kinematics, Sort)   │   │
│   │        ├──> StateMachine (Transitions & Interlocks)            │   │
│   │        ├──> AlarmManager (ISA-18.2 State Evaluation)           │   │
│   │        └──> TagDatabase (IEC 61131-3 Register Sync)            │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               Central Reducer Store (ScadaState)               │   │
│   │               LocalStorage Persistence & Event Log             │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │ Reactive State Distribution        │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 HMI Supervisory Presentation Pages             │   │
│   │   • Dashboard        • Live Conveyor Canvas    • Equipment     │   │
│   │   • Alarm Console    • Analytics & SPC         • Event Log     │   │
│   │   • Tag Table        • Settings Configuration  • Exhibition    │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Modules & Responsibilities

### 2.1 Simulation Engine & Fixed-Timestep Loop (`ScadaContext.tsx`)
- Executes on an interval timer set to $\Delta t = 50\text{ ms}$ ($20\text{ Hz}$).
- Maintains simulation time scale multiplier ($1\times, 2\times, 5\times$).
- Applies discrete delta steps to conveyor position, bottle positions, motor thermal equations, and safety timeouts.
- Dispatches immutable action updates to the central reducer without re-allocating unnecessary memory buffers.

### 2.2 Machine State Engine (`src/simulation/stateMachine.ts`)
- Implements strict state machine transition rules for `IDLE`, `STARTING`, `RUNNING`, `STOPPING`, `FAULT`, and `EMERGENCY_STOP`.
- Evaluates transition preconditions via pure functions:
  ```ts
  canStart(currentState: MachineState, faults: ActiveFaults): { allowed: boolean; reason?: string }
  evaluateTransition(current: MachineState, requested: MachineState, faults: ActiveFaults): MachineState
  ```
- Guarantees safety precedence: `EMERGENCY_STOP` preempts all states; active faults force `FAULT`; starting is inhibited whenever a fault or E-stop is active.

### 2.3 Equipment & Drive Model (`src/simulation/equipmentModel.ts`)
- **VFD Linear Ramp:** Accelerates belt velocity from $0\text{ m/s}$ to target nominal speed at $0.4\text{ m/s}^2$ ramp-up rate; decelerates at $0.6\text{ m/s}^2$.
- **Motor Induction Model:** Computes rotor speed ($\text{RPM} = \frac{120 \times f}{p} \times (1 - s)$) and current based on mechanical friction and bottle load:
  $$I_{\text{rms}} = I_{\text{no-load}} + (I_{\text{FLA}} - I_{\text{no-load}}) \times \text{Load Ratio}$$
- **Thermal Dissipation Model:** Simulates stator winding heating governed by Joule losses and Newton's law of cooling:
  $$\frac{dT}{dt} = \frac{I^2 R}{C_{\text{thermal}}} - k_{\text{dissipation}} (T - T_{\text{ambient}})$$
  When $T \ge 80^\circ\text{C}$ or $I \ge 15.0\text{ A}$, the protective thermal trip trips the motor into `FAULT`.
- **Diverter Arm Kinematics:** Models pneumatic cylinder actuation stroke ($0\% \rightarrow 100\%$) and retraction damping over $180\text{ ms}$.

### 2.4 Bottle Kinematics & Sorting Module (`src/simulation/bottleManager.ts`)
- Spawns containers at the infeed according to the operator-configured cadence.
- Updates continuous 1D positions along the belt axis ($0 \le x \le 1000$):
  $$x_{\text{new}} = x_{\text{old}} + (v_{\text{belt}} \times \text{Scale Factor} \times \Delta t)$$
- **Accumulation Jam Handling:** If a jam fault is active, bottles between $x = 320$ and $x = 380$ halt; trailing containers queue up behind upstream stationary bottles.
- **Three-Way Destination Routing:**
  1. **Reject Ejector ($x \ge 500$):** Defective bottles (`UNDERFILLED`, `MISSING_CAP`, `DEFORMED`, `UNVERIFIED`) are sorted to `'REJECT'`.
  2. **Diverter Arm ($x \ge 640$):** Defect-free Category B containers are diverted to `'BIN_B'`.
  3. **Discharge ($x \ge 920$):** Defect-free Category A containers discharge to `'BIN_A'`.

### 2.5 Alarm Management Engine (`src/simulation/alarmManager.ts`)
- Conforms to ISA-18.2 alarm lifecycle states:
  - `ACTIVE_UNACK`: Condition present, operator has not acknowledged (flashing red/amber, audible siren active).
  - `ACTIVE_ACK`: Condition present, acknowledged by operator (steady state, horn silenced).
  - `CLEARED_UNACK`: Condition cleared physically, awaiting operator sign-off.
  - `CLEARED`: Return to normal quiescent state.
- Manages priority escalation: `CRITICAL` (interlock auto-trip), `WARNING` (operational advisory), `INFO` (event record).

### 2.6 Persistence & Event Logging
- **Event Buffer:** Maintains a high-speed rolling circular buffer of up to 1,000 historical events (`STATE_CHANGE`, `ALARM`, `OPERATOR_ACTION`, `SORTING`, `SYSTEM`).
- **Telemetry History:** Records time-series snapshots (BPM, speed, motor temperature, total counts) for SPC analytics.
- **LocalStorage Sync:** Debounced serialization preserves operator settings, tag setpoints, and production statistics across browser refreshes.

---

## 3. The 50 ms Simulation Tick Data Flow

Every 50 ms tick undergoes an exact 10-step sequence:

```
[ Tick Trigger (50 ms) ]
         │
         ▼
 1. State Transition Check ────> Auto-advance STARTING -> RUNNING or STOPPING -> IDLE
         │
         ▼
 2. Equipment Model Update ────> VFD ramp, motor RPM, torque, PT100 temperature
         │
         ▼
 3. Overload Protection ───────> If T >= 80°C or I >= 15A -> Trip FAULT
         │
         ▼
 4. Pneumatic Diverter Step ───> Advance stroke % for Chute B
         │
         ▼
 5. Bottle Kinematics Step ────> Advance bottle positions; detect jams
         │
         ▼
 6. Quality & Sort Detection ──> Route bottles to Reject (x=500), Bin B (x=640), Bin A (x=920)
         │
         ▼
 7. Batch Target Check ────────> If packed (A+B) >= Target -> Initiate normal stop & toast
         │
         ▼
 8. Sensor Edge Evaluation ────> Beam break edge detect; trigger chime sound
         │
         ▼
 9. Alarm Synchronization ─────> Evaluate active fault table; update ISA-18.2 alarm states
         │
         ▼
10. Counter & Event Commit ────> Conserve Total = A + B + Reject + Belt; commit ScadaState
```

---

## 4. References & Inspiration

This Software Design Specification incorporates engineering design patterns inspired by the following physical automation implementations:

1. **Automated-Conveyor-Sorting-System** by *Noah Antonio* (CODESYS + Factory I/O): Inspiration for modular function block organization and sensor timing coordination.
2. **Industrial-Bottle-Packaging-Line** by *Aditya Katariya* (Allen-Bradley MicroLogix 1100 + RSLogix 500 + AVEVA Edge): Inspiration for state-driven subroutine architecture, separation of alarm acknowledgement from fault reset, and SDS document structuring.
3. **Smart-Conveyor-System** by *Paresh Metaliya* (Siemens S7-1200 + TIA Portal + Factory I/O): Inspiration for step-based SCL sequencing, batch target automation, and user-defined data structures (UDT / DB).

*Notice: No ladder logic, proprietary code, graphics, or vendor libraries were copied. All simulator logic, algorithms, and documentation were independently designed and developed.*
