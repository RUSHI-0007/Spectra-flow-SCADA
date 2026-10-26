# Smart-Conveyor-System
Smart Conveyor System with weighing, sorting, rejection, and pick-and-place robot. Built with Siemens TIA Portal using SCL step logic, reusable FBs, jam detection, batch control, and HMI with live statistics. Works with Factory IO and PLCSIM.
# Smart Conveyor System with Pick & Place Robot

## Overview
A complete industrial automation demo project for learning PLC programming. This system simulates a smart material handling line with weighing, sorting, rejection, and robotic pick-and-place operations.

**System capabilities:**
- Product weighing with ID tracking
- Weight-based sorting (small box / large box)
- Automated rejection of out-of-spec products
- Box counting with weight totals (accept/reject stations)
- Pick-and-place robot arm at exit
- Jam detection and alarm handling
- Batch processing with target control

---

## Requirements

| Software | Version |
|----------|---------|
| TIA Portal | V16 or higher |
| PLCSIM | V16 or higher |
| Factory IO | V2.6.0 or higher |
| HMI | WinCC Basic/Comfort (integrated) |

---

## Hardware Configuration

| Component | Type | Quantity |
|-----------|------|----------|
| Entry Conveyor | Motor + Sensor | 1 |
| Weigh Conveyor | Load cell + Sensor | 1 |
| Decision Conveyor | Pneumatic pusher | 1 |
| Exit Conveyor | Motor + Sensor | 1 |
| Reject Conveyor | Motor + Sensor | 1 |
| Pick & Place Robot | Gripper + Arm | 1 |

---

## Project Structure

### Data Types (UDT)
- `UDT_Alarm` - Alarm parameters (status, Active, Cleared, Timestamp)
- `UDT_BoxData` - Box tracking (ID, weight, accept/reject status)

### Function Blocks (FB)

| FB | Purpose | Instances |
|----|---------|-----------|
| `FB_Conveyor` | Reusable conveyor logic with jam detection | 4 |
| `FB_RejectStation` | Reject conveyor control | 1 |
| `FB_Robot` | Pick & place robot logic | 1 |

### Data Blocks (DB)

| DB | Purpose |
|----|---------|
| `DB_IO` | Physical I/O mapping |
| `DB_Batch` | Batch parameters & targets |
| `DB_HMI` | HMI interface data |
| `DB_Stats` | Counters & weight totals |
| `DB_Alarms` | Alarm management |

### Organization Blocks (OB)
- `OB100` - Startup initialization
- `OB80` - Time error handling

---

## Program Logic

### State Machine (Step-based SCL)
Each conveyor operates on a step-based sequence:

| Step | Action |
|------|--------|
| 10 | Idle / Wait for box |
| 20 | Box detected / Start conveyor |
| 30 | Box entering / Position tracking |
| 40 | Box on conveyor / Process |
| 50 | Box exiting / Clear data |


### Product Flow

### Weighing Process
- Box ID assigned
- Weight measured
- Accept/Reject decision based on HMI limits
- Status saved in FB instance DB

### Sorting Logic
- **Small box:** Within low limit
- **Large box:** Within high limit
- **Reject:** Outside both limits

### Jam Detection
- Sensor active > time threshold → Alarm
- Reset clears alarm, preserves box data until empty

### Batch Control
- Target count set via HMI
- Real-time progress display
- Auto-stop on target completion

---

## HMI Features

| Screen | Features |
|--------|----------|
| **Main** | Live conveyor status, box position tracking |
| **Statistics** | Accept count, Reject count, Total weight (both stations) |
| **Batch** | Target entry, progress bar, completion alert |
| **Recipe** | Small box limits, Large box limits |
| **Alarms** | Jam alerts, E-stop, MPCB trip, time error |

---

## Factory IO Integration

**Scene setup:**
- 5 conveyors in sequence
- Load cell at weigh station
- Pneumatic pusher at decision point
- Pick & place robot at exit

**Tags mapping:** Refer to `DB_IO` for complete addressing

---

## Getting Started

### 1. Open the Project

### 2. Configure PLCSIM
- Load the program to PLCSIM
- Set PLCSIM to run mode

### 3. Start Factory IO
- Open the matching scene file (included in repository)
- Connect to PLCSIM via Ethernet

### 4. Run from HMI
- Set batch target
- Select small/large box limits
- Start the system
- Monitor live statistics

### 5. Reset Procedure
- Press system reset
- Jam alarm resets when conveyor empty
- Box data preserved until box exits

---

## Alarm List

| Alarm | Trigger | Reset |
|-------|---------|-------|
| Conveyor Jam | Sensor active > time | Manual / Auto when cleared |
| E-Stop Active | Emergency stop pressed | Release E-stop |
| MPCB Trip | Motor overload | Manual reset |
| Time Error | OB80 execution | Program restart |

---

## Learning Outcomes

After studying this project, you will understand:

- ✅ Step-based state machine programming in SCL
- ✅ Reusable function blocks with instance DBs
- ✅ UDT creation and usage
- ✅ Data persistence across conveyor stages
- ✅ Batch processing with HMI targets
- ✅ Alarm handling and reset strategies
- ✅ Factory IO + PLCSIM co-simulation
- ✅ Interlocking and safe startup (OB100)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Project won't open | Check TIA Portal version (V16 minimum) |
| Factory IO not connecting | Verify PLCSIM is running and tags match |
| Box data lost on transfer | Check step sequence timing |
| Jam false alarms | Adjust jam timer in FB_Conveyor |

---

## Author

**Your Name**
- Project: Smart Conveyor System Demo
- Purpose: Learning PLC programming with TIA Portal

---

## License

This project is for educational purposes only.

---


