// ============================================================================
// CSV Export Utility for SCADA Records & Audit Logs
// ============================================================================

import { ProductionRecord, Alarm, ScadaEvent } from '../types/scada';

export function exportProductionRecordsCsv(records: ProductionRecord[]) {
  if (records.length === 0) return;

  const headers = ['Timestamp', 'Time', 'Line Rate (BPM)', 'Total Bottles', 'Category A', 'Category B', 'Speed (m/s)', 'Motor Temp (°C)'];
  const rows = records.map(r => [
    r.timestamp,
    r.timeStr,
    r.bpm,
    r.totalBottles,
    r.catA,
    r.catB,
    r.speedMs,
    r.motorTempC,
  ]);

  downloadCsv([headers, ...rows], `production_telemetry_${Date.now()}.csv`);
}

export function exportAlarmHistoryCsv(alarms: Alarm[]) {
  if (alarms.length === 0) return;

  const headers = ['Alarm ID', 'Code', 'PLC Tag', 'Title', 'Severity', 'State', 'Trip Time', 'Ack Time', 'Cleared Time'];
  const rows = alarms.map(a => [
    a.id,
    a.code,
    a.tag,
    `"${a.title.replace(/"/g, '""')}"`,
    a.severity,
    a.state,
    new Date(a.timestamp).toISOString(),
    a.ackTimestamp ? new Date(a.ackTimestamp).toISOString() : 'N/A',
    a.clearedTimestamp ? new Date(a.clearedTimestamp).toISOString() : 'N/A',
  ]);

  downloadCsv([headers, ...rows], `alarm_history_${Date.now()}.csv`);
}

export function exportEventLogsCsv(events: ScadaEvent[]) {
  if (events.length === 0) return;

  const headers = ['Event ID', 'Timestamp', 'Time', 'Type', 'Source', 'Description', 'Operator'];
  const rows = events.map(e => [
    e.id,
    e.timestamp,
    e.timeStr,
    e.type,
    `"${e.source}"`,
    `"${e.description.replace(/"/g, '""')}"`,
    `"${e.operator}"`,
  ]);

  downloadCsv([headers, ...rows], `scada_events_audit_${Date.now()}.csv`);
}

function downloadCsv(data: Array<Array<string | number>>, filename: string) {
  const csvContent = 'data:text/csv;charset=utf-8,' + data.map(row => row.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
