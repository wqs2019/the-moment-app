export type TargetAudience = '大学生' | '职场新人' | '资深打工人' | '年轻父母' | '通用';
export type TaskScene = '睡前' | '通勤' | '工作间隙' | '独处' | '排队等待' | '通用';
export type TaskCategory = '轻学习' | '创作表达' | '社交连接' | '治愈放松' | '整理收纳' | '感官体验';
export type TaskVibe = '安静' | '活跃' | '怀旧' | '新鲜感' | '治愈' | '成就感';

export interface Task {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number; // 1-5 minutes
  energyValue: number; // e.g., +15
  
  // Tags for recommendation engine
  targetAudience: TargetAudience[];
  scenes: TaskScene[];
  category: TaskCategory;
  vibes: TaskVibe[];
  
  // Optional media
  bgmUrl?: string; // Default white noise for this task
  coverImageUrl?: string;
}