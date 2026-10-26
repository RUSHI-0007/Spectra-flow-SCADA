// ============================================================================
// Bottle Physics, Generation & Sorting Logic Module
// ============================================================================

import { 
  Bottle, 
  BottleCategory, 
  DefectType, 
  SensorStatus, 
  DiverterStatus, 
  ProductionCounters, 
  SimSettings,
  OperationMode
} from '../types/scada';

export class BottleManager {
  private static serialCounter = 1001;

  public static spawnBottle(
    settings: SimSettings,
    forceCategory?: BottleCategory,
    forceDefect?: DefectType
  ): Bottle {
    const isCatA = forceCategory 
      ? forceCategory === 'CATEGORY_A' 
      : Math.random() * 100 < settings.categoryARatioPercent;

    const category: BottleCategory = isCatA ? 'CATEGORY_A' : 'CATEGORY_B';

    let defect: DefectType = 'NONE';
    if (forceDefect) {
      defect = forceDefect;
    } else if (Math.random() * 100 < settings.defectProbabilityPercent) {
      const defects: DefectType[] = ['UNDERFILLED', 'MISSING_CAP', 'DEFORMED'];
      defect = defects[Math.floor(Math.random() * defects.length)];
    }

    const fillLevel = defect === 'UNDERFILLED' ? 50 + Math.random() * 15 : 88 + Math.random() * 8;
    const hasCap = defect !== 'MISSING_CAP';

    const bottle: Bottle = {
      id: `btl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      serialNumber: `SN-${BottleManager.serialCounter++}`,
      category,
      defect,
      position: 0,
      fillLevelPercent: Math.round(fillLevel),
      hasCap,
      sorted: false,
      diverted: false,
      createdAt: Date.now(),
    };

    return bottle;
  }

  public static updateBottles(
    bottles: Bottle[],
    deltaSeconds: number,
    conveyorSpeedMs: number,
    isRunning: boolean,
    isJammed: boolean,
    sensor: SensorStatus,
    diverter: DiverterStatus,
    opMode: OperationMode,
    onBottleSorted: (bin: 'BIN_A' | 'BIN_B' | 'REJECT', bottle: Bottle) => void
  ): {
    updatedBottles: Bottle[];
    sensorActive: boolean;
    sensorTriggeredBottle?: Bottle;
    diverterShouldActuate: boolean;
  } {
    if (!isRunning || conveyorSpeedMs <= 0.01) {
      // Bottles freeze instantly when not running
      return {
        updatedBottles: bottles,
        sensorActive: false,
        diverterShouldActuate: false,
      };
    }

    // Velocity scaling: 1 m/s = 200 units/second along track (length 0-1000)
    const speedUnitsPerSec = conveyorSpeedMs * 200;
    const distanceDelta = speedUnitsPerSec * deltaSeconds;

    const nextBottles: Bottle[] = [];
    let sensorActive = false;
    let sensorTriggeredBottle: Bottle | undefined;
    let diverterShouldActuate = false;

    // Sort by position descending so downstream bottles calculate blocking first
    const sortedByPos = [...bottles].sort((a, b) => b.position - a.position);

    for (const bottle of sortedByPos) {
      if (bottle.sorted) {
        continue;
      }

      let newPos = bottle.position;

      // Handle Jam physics
      let isBottleBlocked = false;
      if (isJammed && bottle.position >= 320 && bottle.position <= 380) {
        isBottleBlocked = true;
        bottle.isJammed = true;
      } else if (isJammed && nextBottles.some(b => b.isJammed && Math.abs(b.position - bottle.position) < 45)) {
        isBottleBlocked = true;
        bottle.isJammed = true;
      }

      if (!isBottleBlocked) {
        newPos += distanceDelta;
        bottle.isJammed = false;
      }

      // Check Sensor Detection Zone (x = 350, window 325 to 375)
      const inSensorBeam = newPos >= (sensor.position - 25) && newPos <= (sensor.position + 25);
      if (inSensorBeam) {
        sensorActive = true;
        sensorTriggeredBottle = bottle;

        if (!bottle.detected) {
          bottle.detected = true;
        }

        // If sensor is malfunctioning, bottle may be flagged as UNVERIFIED
        if (sensor.malfunctioning && bottle.defect === 'NONE') {
          bottle.defect = 'UNVERIFIED';
        }
      }

      // Check Diverter Sorting Zone (x >= 640)
      if (newPos >= 640 && !bottle.diverted && !bottle.sorted) {
        if (opMode === 'AUTO') {
          // Rule: Category B is diverted to Bin B; Category A proceeds straight to Bin A
          if (bottle.category === 'CATEGORY_B') {
            diverterShouldActuate = true;
            bottle.diverted = true;
            bottle.sorted = true;
            bottle.sortedTo = 'BIN_B';
            onBottleSorted('BIN_B', bottle);
            continue; // Sorted off belt
          }
        } else {
          // Manual mode: if diverter is actively actuated by operator, push bottle!
          if (diverter.actuated || diverter.positionPercent > 50) {
            bottle.diverted = true;
            bottle.sorted = true;
            bottle.sortedTo = 'BIN_B';
            onBottleSorted('BIN_B', bottle);
            continue; // Sorted off belt
          }
        }
      }

      // Check End-of-Line Bin A (Straight-through at x >= 920)
      if (newPos >= 920 && !bottle.sorted) {
        bottle.sorted = true;
        bottle.sortedTo = 'BIN_A';
        onBottleSorted('BIN_A', bottle);
        continue; // Sorted off belt
      }

      nextBottles.push({
        ...bottle,
        position: newPos,
      });
    }

    return {
      updatedBottles: nextBottles,
      sensorActive,
      sensorTriggeredBottle,
      diverterShouldActuate,
    };
  }
}
