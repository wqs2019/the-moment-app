import { Task, TargetAudience, TaskScene } from '../types/task';
import CloudService from './tcb';

export class RecommendationEngine {
  /**
   * 从云端获取推荐任务
   */
  static async getRecommendations(
    identity: TargetAudience = '通用',
    targetScene: TaskScene = '通用'
  ): Promise<Task[]> {
    try {
      const currentHour = new Date().getHours();
      let currentScene: TaskScene = '通用';

      // 简单的时间推断场景
      if (currentHour >= 22 || currentHour < 6) {
        currentScene = '睡前';
      } else if ((currentHour >= 8 && currentHour <= 9) || (currentHour >= 18 && currentHour <= 19)) {
        currentScene = '通勤';
      } else if (currentHour >= 10 && currentHour <= 17) {
        currentScene = '工作间隙';
      }

      // 优先使用用户设置的目标场景，如果没有则使用推断场景
      const sceneToUse = targetScene !== '通用' ? targetScene : currentScene;

      const res = await CloudService.callFunction('moment_task_recommend', {
        identity,
        targetScene: sceneToUse,
      });

      // CloudService.callFunction 返回的结构是 { code, message, data }
      // 其中 data 才是云函数实际 return 的内容
      const cloudResult = res.data as any;

      if (cloudResult && cloudResult.success) {
        return cloudResult.data as Task[];
      }
      
      throw new Error(cloudResult?.message || '获取推荐任务失败');
    } catch (error) {
      console.error('RecommendationEngine error:', error);
      return [];
    }
  }
}