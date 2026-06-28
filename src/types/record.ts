export type RecordType = 'completed_task' | 'scrolled_screen';

export interface BaseRecord {
  id: string;
  userId: string;
  type: RecordType;
  createdAt: number; // Timestamp
}

export interface TaskRecord extends BaseRecord {
  type: 'completed_task';
  taskId: string;
  taskTitle: string;
  durationMinutes: number;
  energyEarned: number;
}

export interface ScrollRecord extends BaseRecord {
  type: 'scrolled_screen';
  durationMinutes: number;
  contentType?: string; // e.g., '短视频', '社交媒体'
  energyLost: number;
}

export type UserRecord = TaskRecord | ScrollRecord;

export interface EnergyLedger {
  totalEnergy: number;
  level: number;
  records: UserRecord[];
}