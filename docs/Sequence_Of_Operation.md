# Sequence of Operation (SOP)
## SCADA-Based Automated Conveyor Belt Monitoring and Bottle Sorting System

**Document ID:** SOP-SCADA-BTL-003  
**Revision:** 1.2  
**System:** Browser-Based Educational SCADA & Industrial Conveyor Simulator  
**Classification:** Standard Operating Procedure & Sequence Guide  
**Status:** Released  

---

## 1. Scope & Operating Principles

This document defines the step-by-step sequential operations of the Automated Conveyor Belt Monitoring and Bottle Sorting System. It covers normal startup, continuous classification and sorting, normal shutdown, batch target completion, fault detection and recovery, and emergency stop interlock procedures.

### Core Industrial Operating Rules
1. **Silence / Acknowledge:** Stops the audible alarm siren, but does **not** clear the underlying hardware fault.
2. **Fault Reset:** Only succeeds after the physical root cause of the fault has been removed.
3. **Reset Never Restarts:** Clearing and resetting a fault returns the machine to `IDLE` standby. The conveyor will **never** spontaneously restart upon reset; the operator must deliberately press the `START` button.
4. **Emergency Stop Precedence:** An activated Emergency Stop latch must be physically released (twisted) and then electrically reset before any start sequence is permitted.

---

## 2. Step-by-Step Sequences

### 2.1 System Startup Sequence (Normal Start)
```
[ IDLE Standby ] ──> Operator presses START ──> Interlock Validation ──> VFD Ramp (STARTING) ──> RUNNING
```

| Step | Action / Condition | System Response | Indicator / State |
|---|---|---|---|
| 1.0 | Standby Verification | Verify machine is in `IDLE` state. Verify zero active faults and E-stop released. | `IDLE` lamp steady. Top bar neutral. |
| 1.1 | Operator Press Start | Operator clicks `START` pushbutton (`%IX0.2`). | System validates preconditions via `canStart()`. |
| 1.2 | State Transition | System transitions machine state to `STARTING`. Main contactor closes (`%QX0.0 = TRUE`). | Amber status lamp illuminated. |
| 1.3 | VFD Velocity Ramp | VFD ramps motor electrical frequency ($0 \rightarrow 50\text{ Hz}$) and linear speed ($0 \rightarrow 1.0\text{ m/s}$). | Sound engine generates rising motor pitch. |
| 1.4 | Target Speed Achieved | Feedback speed reaches $\ge 95\%$ of nominal setpoint ($0.95\text{ m/s}$). | State auto-transitions to `RUNNING`. |
| 1.5 | Infeed & Sorting Active | Containers spawn at infeed; optical sensor and sorting actuators are active. | Green pilot lamp illuminated. |

---

### 2.2 Normal Stop Sequence
```
[ RUNNING ] ──> Operator presses STOP (or Batch Target reached) ──> VFD Deceleration (STOPPING) ──> IDLE
```

| Step | Action / Condition | System Response | Indicator / State |
|---|---|---|---|
| 2.0 | Stop Command | Operator clicks `STOP` button (`%IX0.3`), OR batch target is reached. | State transitions to `STOPPING`. |
| 2.1 | VFD Deceleration Ramp | Motor contactor command drops; VFD decelerates belt speed at $0.6\text{ m/s}^2$. | Amber warning indicator active. |
| 2.2 | Stop Mode Behavior | If stop mode is `DRAIN`, existing bottles clear into bins; if `PAUSE`, motion halts immediately. | Telemetry deceleration tracked in real-time. |
| 2.3 | Standby Reached | Conveyor feedback speed drops $\le 0.02\text{ m/s}$. | State transitions to `IDLE`. Top bar neutral. |

---

### 2.3 Batch Target Completion Sequence
```
[ RUNNING ] ──> Total Packed (Bin A + Bin B) reaches BATCH_TARGET ──> Auto Normal Stop ──> Batch Toast
```

| Step | Action / Condition | System Response | Indicator / State |
|---|---|---|---|
| 3.0 | Target Setpoint | Operator configures `BATCH_TARGET` (e.g. 50 bottles) in Settings or Control Panel. | Tag `%MW150` updated; progress bar active on Live page. |
| 3.1 | Real-time Counting | As bottles sort into Bin A and Bin B, `BATCH_PROGRESS` updates continuously. | Live progress bar fills towards $100\%$. |
| 3.2 | Batch Fulfilled | $\text{Category A} + \text{Category B} \ge \text{BATCH_TARGET}$. | Automation initiates controlled `STOPPING` ramp. |
| 3.3 | Batch Annunciation | System logs `"Batch complete"` event and displays an on-screen toast notification. | Toast banner displayed. Conveyor safely halts in `IDLE`. |

---

### 2.4 Conveyor Jam Fault Sequence & Recovery
```
[ RUNNING ] ──> Optical Sensor blocked >= 3.0 s ──> FAULT Trip ──> Clear Jam ──> Reset ──> Start
```

| Step | Action / Condition | System Response | Indicator / State |
|---|---|---|---|
| 4.0 | Jam Inception | Bottles bridge or back up across inspection zone ($x = 350$). | Sensor beam break remains continuously high (`%IX0.1 = TRUE`). |
| 4.1 | Timeout Trip | Blocked duration exceeds jam threshold ($t \ge 3.0\text{ s}$). | Tag `%IX0.6 = TRUE`. State trips from `RUNNING` to `FAULT`. |
| 4.2 | Safety Shutdown | Main motor contactor de-energized (`%QX0.0 = FALSE`). Audible siren sounds. | Red status bar and alarm row flashing (`ACTIVE_UNACK`). |
| 4.3 | Alarm Acknowledge | Operator clicks `Acknowledge All` or `Silence`. | Siren stops. Alarm transitions to `ACTIVE_ACK`. Conveyor remains halted. |
| 4.4 | Clear Physical Jam | Operator clears the jammed container from the conveyor bed. | Jam fault flag is removed. |
| 4.5 | Fault Reset | Operator clicks `Fault Reset` button (`%IX0.4`). | State transitions from `FAULT` to `IDLE`. Machine enters standby. |
| 4.6 | Operator Restart | Operator presses `START` (`%IX0.2`). | System validates interlocks and ramps back to `RUNNING`. |

---

### 2.5 Motor Thermal Overload Fault & Recovery
```
[ RUNNING ] ──> PT100 Temp >= 80°C or Current >= 15A ──> FAULT Trip ──> Cool Down ──> Reset ──> Start
```

| Step | Action / Condition | System Response | Indicator / State |
|---|---|---|---|
| 5.0 | Thermal Exceedance | Stator temperature exceeds threshold ($T \ge 80^\circ\text{C}$) or RMS current $\ge 15.0\text{ A}$. | Thermal overload interlock trips. State transitions to `FAULT`. |
| 5.1 | Equipment Protection | Motor power removed immediately. Simulated cooling fan runs. | Alarm `ALM-102` annunciated. Top bar turns red. |
| 5.2 | Incomplete Reset Rejection | Operator attempts to press `Fault Reset` while $T \ge 80^\circ\text{C}$. | Reset rejected: *"Thermal condition still present."* Machine remains in `FAULT`. |
| 5.3 | Natural Cooling | Stator cools below safe threshold ($T < 70^\circ\text{C}$). | Interlock condition cleared. |
| 5.4 | Fault Reset | Operator clicks `Fault Reset`. | State transitions from `FAULT` to `IDLE`. |
| 5.5 | Line Restart | Operator clicks `START`. | Conveyor resumes normal production. |

---

### 2.6 Emergency Stop & Restart Sequence
```
[ ANY STATE ] ──> E-STOP pressed ──> EMERGENCY_STOP ──> Twist Release ──> Reset ──> Start
```

| Step | Action / Condition | System Response | Indicator / State |
|---|---|---|---|
| 6.0 | Emergency Stop Event | Operator or safety guard trips Emergency Stop button (`%IX0.0`). | Hard safety relay opens. System transitions instantly to `EMERGENCY_STOP`. |
| 6.1 | Absolute Inhabitation | All outputs de-energized (`%QX0.0`, `%QX0.1`, `%QX0.2 = FALSE`). Motor stops immediately without ramp. | Screen shows prominent red E-Stop overlay. Siren sounds. |
| 6.2 | Twist Release | Operator inspects line, verifies safety, and rotates mushroom button to release latch. | Safety contact closes (`%IX0.0 = FALSE`). Machine transitions to `FAULT`. |
| 6.3 | Interlock Reset | Operator clicks `Twist & Reset E-Stop` or `Fault Reset`. | State transitions from `FAULT` to `IDLE`. System is now ready for start. |
| 6.4 | Deliberate Restart | Operator clicks `START`. | System initiates normal `STARTING` ramp to `RUNNING`. |

---

## 3. References & Inspiration

This Sequence of Operation incorporates industrial operating standards inspired by the following physical automation implementations:

1. **Automated-Conveyor-Sorting-System** by *Noah Antonio* (CODESYS + Factory I/O): Inspiration for multi-lane product divert sequencing, sensor-actuator timing handshakes, and start/stop latching ladder rungs.
2. **Industrial-Bottle-Packaging-Line** by *Aditya Katariya* (Allen-Bradley MicroLogix 1100 + RSLogix 500 + AVEVA Edge): Inspiration for the formal Sequence of Operation document structure, multi-stage bottle flow, and strict separation between buzzer silence and fault reset.
3. **Smart-Conveyor-System** by *Paresh Metaliya* (Siemens S7-1200 + TIA Portal + Factory I/O): Inspiration for batch target sequence completion, auto-stop on target count, and jam detection timeout state progression.

*Notice: No ladder logic, proprietary code, graphics, or vendor libraries were copied. All simulator logic, algorithms, and documentation were independently designed and developed.*
