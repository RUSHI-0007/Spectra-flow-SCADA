# Spectra-Flow SCADA: Exhibition & Viva Defense Manual

> **Practical Guide for College Project Exhibitions, External Evaluators, and Viva Voce**

---

## ⏱️ The 5-Minute Evaluator Demonstration Script

When external examiners or visitors walk up to your booth, follow this structured, confident walkthrough:

### Minute 1: The Context & High-Level Architecture
- **Action:** Open the **Overview Dashboard** (Page 1).
- **Say:** *"Good morning/afternoon, Sir/Madam. Our project is **Spectra-Flow SCADA**, an industrial supervisory control and data acquisition system designed for high-speed bottle bottling, sorting, and packaging lines. In industry, control rooms don't hardcode logic directly into screens; they decouple hardware via a centralized PLC Tag Database and an ISA-18.2 compliant alarm management engine."*
- **Highlight:** Point out the dark navy control-room look, the 8 KPI cards updating in real time, the live velocity chart, and the operational utilization gauge.

### Minute 2: Live Conveyor Operation & Optical Sorting
- **Action:** Switch to **Live Conveyor Sim** (Page 2) and press the green **START (I)** button.
- **Say:** *"Now, we command the VFD (Variable Frequency Drive) to start. Notice the brief STARTING ramp state as the motor spins up to our 1.0 m/s nominal speed. As bottles enter the track, our non-contact optical sensor S-01 (PLC Tag %IX0.1) detects beam break. When a Category B amber bottle reaches the diversion station, our high-speed pneumatic cylinder (PLC Tag %QX0.1) actuates to divert it into Bin B, while Category A bottles proceed straight to packaging Bin A."*
- **Highlight:** Note how bottles only advance when the motor is running, the rotating motor fan speed matches frequency, and counters increment only when bottles land.

### Minute 3: Safety Interlocks & Fault Injection (The "Examiner Hook")
- **Action:** Click **"Inject Jam"** on the operator console.
- **Say:** *"In modern automation, equipment safety and personal protection are paramount. Watch what happens when we simulate a conveyor jam: the optical sensor stays blocked past our 3.0-second safety threshold. Immediately, Critical Alarm ALM-101 trips, our audible annunciator siren sounds, and the safety state machine cuts power to the motor to prevent belt tearing or motor burn-out."*
- **Highlight:** Point out the flashing red annunciator and the motor dropping to 0 RPM.

### Minute 4: ISA-18.2 Acknowledgment & Safe Recovery
- **Action:** Switch to **Alarm Annunciator** (Page 4), click **ACK All Alarms**, return to Page 2, click **Clear Jam**, and press **FAULT RESET**.
- **Say:** *"Notice a key SCADA concept: per ANSI/ISA-18.2 standards, acknowledging the alarm silences the horn and stops flashing, but DOES NOT clear the fault. Once the physical jam is cleared and the operator presses Fault Reset, the system returns strictly to IDLE. Per OSHA/ISO safety standards, it NEVER silently restarts. The operator must make a deliberate command to press START."*
- **Action:** Press **START (I)** to resume smooth production.

### Minute 5: Analytics, Audit Trail & PLC Tag Mapping
- **Action:** Quickly show **Production Analytics** (Page 5), **Event Historian** (Page 6), and **Tag Database** (Page 7).
- **Say:** *"Finally, we maintain a complete 21 CFR Part 11 electronic audit trail tracking every operator command, speed change, and fault trip with exportable CSVs. In the Tag Database, evaluators can inspect live industrial tags mapped with IEC 61131-3 syntax (%IX inputs, %QX outputs, %MD registers). Everything is running deterministically in pure TypeScript with zero external hardware required."*

---

## 🎓 Viva Voce Anticipated Questions & Model Answers

### Q1: What is the primary difference between a SCADA system, an HMI, and a PLC?
> **Answer:**  
> - **PLC (Programmable Logic Controller):** Industrial real-time microprocessor operating on a deterministic scan cycle (typically 5–20 ms) running ladder logic/structured text directly connected to field sensors and actuators.  
> - **HMI (Human-Machine Interface):** The local physical touch panel mounted on or near a machine allowing line operators to view temperatures, start/stop motors, and acknowledge alarms for a single machine.  
> - **SCADA (Supervisory Control and Data Acquisition):** The plant-wide supervisory layer connecting multiple PLCs, RTUs, and HMIs across entire factory facilities. It provides centralized historians, long-term SPC analytics, recipe management, and plant-level alarm annunciation.

### Q2: What standards govern your alarm management system?
> **Answer:**  
> We implemented the **ANSI/ISA-18.2** and **IEC 62682** standards (*Management of Alarm Systems for the Process Industries*). We categorize alarms into four prioritized lifecycle states:
> 1. *Active Unacknowledged (Flashing red, audible siren)*
> 2. *Active Acknowledged (Solid red, audible horn silenced)*
> 3. *Cleared Unacknowledged (Hazard resolved, awaiting operator signoff)*
> 4. *Cleared (Normal state)*  
> We also prioritize alarms by severity (*Critical, Major, Warning, Info*), where only Critical alarms (Jam, Motor Overload, E-Stop) trigger automatic drive interlocks.

### Q3: Why did you choose a decoupled simulation tick instead of running physics inside the React render cycle?
> **Answer:**  
> If physics updates were tied to `requestAnimationFrame` or React component re-renders, the simulation speed would fluctuate based on monitor refresh rates (60Hz vs 144Hz) and device rendering load. By using a **fixed-timestep simulation tick (50ms / 20Hz)**, bottle displacement, VFD ramp curves, and thermal accumulation remain mathematically deterministic, low-CPU, and completely reliable. Furthermore, we monitor `document.hidden` to pause calculations when the tab is backgrounded, preventing memory buildup.

### Q4: How is motor temperature and load calculated?
> **Answer:**  
> We model 3-phase induction motor thermodynamics. Stator temperature approaches an equilibrium target defined by ambient temperature ($26^\circ\text{C}$) plus dynamic electrical load ($I^2R$ heating based on current draw and speed). Under normal load ($<12.5\text{A}$ FLA), temperature stabilizes between $40^\circ\text{C}$ and $65^\circ\text{C}$. If a mechanical bind or jam occurs, load surges to $95\%$ and current spikes to $18.5\text{A}$, causing thermal accumulation towards $88^\circ\text{C}$. Once the $80^\circ\text{C}$ threshold is crossed, thermal overload relay (49/51) trips.

### Q5: What is Overall Equipment Effectiveness (OEE) and how does your dashboard compute it?
> **Answer:**  
> OEE is the gold-standard manufacturing metric computed as the product of three factors:  
> $$\text{OEE} = \text{Availability} \times \text{Performance} \times \text{Quality}$$  
> - **Availability:** Operating Run Time divided by Total Operating Time.  
> - **Performance:** Actual line velocity (BPM) divided by design nameplate capacity ($50\text{ BPM}$).  
> - **Quality:** Good bottles produced ($\text{Bin A} + \text{Bin B}$) divided by total infeed bottles.  
> World-class automated plants target an OEE greater than $85\%$.

---

## 📋 Exhibition-Day Operator Checklist

Before the exhibition hall doors open:
1. **Launch Dev Server:**  
   `npm run dev` and navigate to `http://localhost:5173/`.
2. **Display & Fullscreen:**  
   Press <kbd>F</kbd> or click the Fullscreen icon in the top right status bar. Press <kbd>Ctrl/Cmd</kbd> + <kbd>+</kbd>/<kbd>-</kbd> to calibrate zoom so KPI numbers are readable from 2–3 meters away.
3. **Sound Verification:**  
   Ensure your device volume is at ~30%. Click the speaker icon in the top status bar to verify Web Audio industrial clicks and horn sounds. Mute if your venue has noise restrictions.
4. **Pre-Demo Reset:**  
   Navigate to **Settings** (Page 8) or **Exhibition Mode** (Page 9) and click **"Reset Demo & Clear Local Storage"** to start fresh from 0 bottles.
5. **Booth Inactivity (Lunch / Coffee Breaks):**  
   Whenever you step away from the booth, navigate to **Exhibition Mode** (Page 9) and click **"Start Auto-Pilot Showcase"**. The screen will run an autonomous cycle of production, jam fault, alarm annunciation, and recovery so guests see an active, vibrant system.
