import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRecord, TaskRecord, ScrollRecord } from '../types/record';
import { RecordService } from '../services/recordService';
import { useAppStore } from './appStore';

interface RecordState {
  records: UserRecord[];
  totalEnergy: number;
  level: number;
  isLoading: boolean;
  addCompletedTask: (task: Omit<TaskRecord, 'id' | 'userId' | 'type' | 'createdAt'>) => Promise<void>;
  addScrolledScreen: (record: Omit<ScrollRecord, 'id' | 'userId' | 'type' | 'createdAt'>) => Promise<void>;
  fetchRecords: () => Promise<void>;
  clearRecords: () => void;
}

// 简单的等级计算逻辑：每 100 能量升 1 级
const calculateLevel = (energy: number) => {
  return Math.floor(energy / 100) + 1;
};

export const useRecordStore = create<RecordState>()(
  persist(
    (set, get) => ({
      records: [],
      totalEnergy: 0,
      level: 1,
      isLoading: false,

      fetchRecords: async () => {
        const userId = useAppStore.getState().user?._id;
        if (!userId) return;

        set({ isLoading: true });
        try {
          const records = await RecordService.getRecords(userId);
          
          // 重新计算总能量
          let totalEnergy = 0;
          records.forEach(record => {
            if (record.type === 'completed_task') {
              totalEnergy += (record as TaskRecord).energyEarned;
            } else if (record.type === 'scrolled_screen') {
              totalEnergy = Math.max(0, totalEnergy - (record as ScrollRecord).energyLost);
            }
          });

          set({
            records,
            totalEnergy,
            level: calculateLevel(totalEnergy),
          });
        } catch (error) {
          console.error('Failed to fetch records:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addCompletedTask: async (taskData) => {
        const userId = useAppStore.getState().user?._id || 'local_user';
        
        const newRecord: TaskRecord = {
          ...taskData,
          id: Math.random().toString(36).substring(2, 15),
          userId,
          type: 'completed_task',
          createdAt: Date.now(),
        };
        
        // 乐观更新 UI
        set((state) => {
          const newTotalEnergy = state.totalEnergy + taskData.energyEarned;
          return {
            records: [newRecord, ...state.records],
            totalEnergy: newTotalEnergy,
            level: calculateLevel(newTotalEnergy),
          };
        });

        // 同步到云端
        if (userId !== 'local_user') {
          try {
            await RecordService.addRecord(userId, { ...taskData, type: 'completed_task' });
          } catch (error) {
            console.error('Failed to sync task record to cloud:', error);
          }
        }
      },

      addScrolledScreen: async (recordData) => {
        const userId = useAppStore.getState().user?._id || 'local_user';
        
        const newRecord: ScrollRecord = {
          ...recordData,
          id: Math.random().toString(36).substring(2, 15),
          userId,
          type: 'scrolled_screen',
          createdAt: Date.now(),
        };

        // 乐观更新 UI
        set((state) => {
          // 刷手机扣除能量，但最低不低于 0
          const newTotalEnergy = Math.max(0, state.totalEnergy - recordData.energyLost);
          return {
            records: [newRecord, ...state.records],
            totalEnergy: newTotalEnergy,
            level: calculateLevel(newTotalEnergy),
          };
        });

        // 同步到云端
        if (userId !== 'local_user') {
          try {
            await RecordService.addRecord(userId, { ...recordData, type: 'scrolled_screen' });
          } catch (error) {
            console.error('Failed to sync scroll record to cloud:', error);
          }
        }
      },

      clearRecords: () => set({ records: [], totalEnergy: 0, level: 1 }),
    }),
    {
      name: 'the_moment_records',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);