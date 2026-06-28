import CloudService from './tcb';
import { UserRecord } from '../types/record';

export class RecordService {
  /**
   * 添加一条能量记录到云端
   */
  static async addRecord(userId: string, payload: any): Promise<UserRecord> {
    try {
      const res = await CloudService.callFunction('moment_record', {
        action: 'add',
        userId,
        payload,
      });
      
      const cloudResult = res.data as any;
      if (cloudResult && cloudResult.success) {
        return cloudResult.data as UserRecord;
      }
      throw new Error(cloudResult?.message || '添加记录失败');
    } catch (error) {
      console.error('RecordService.addRecord error:', error);
      throw error;
    }
  }

  /**
   * 获取用户的能量记录列表
   */
  static async getRecords(userId: string): Promise<UserRecord[]> {
    try {
      const res = await CloudService.callFunction('moment_record', {
        action: 'get',
        userId,
      });
      
      const cloudResult = res.data as any;
      if (cloudResult && cloudResult.success) {
        return cloudResult.data as UserRecord[];
      }
      throw new Error(cloudResult?.message || '获取记录失败');
    } catch (error) {
      console.error('RecordService.getRecords error:', error);
      throw error;
    }
  }
}