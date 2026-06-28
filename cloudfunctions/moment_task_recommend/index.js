const cloudbase = require('@cloudbase/node-sdk');

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { identity = '通用', targetScene = '通用' } = event;

  try {
    // 1. 尝试精确匹配（身份 + 场景）
    let res = await db.collection('moment_tasks')
      .where({
        targetAudience: _.in([identity, '通用']),
        scenes: _.in([targetScene, '通用'])
      })
      .limit(100) // 获取一批数据用于随机
      .get();

    let tasks = res.data;

    // 2. 如果不够 3 个，放宽到只匹配身份
    if (tasks.length < 3) {
      res = await db.collection('moment_tasks')
        .where({
          targetAudience: _.in([identity, '通用'])
        })
        .limit(100)
        .get();
      tasks = res.data;
    }

    // 3. 如果还不够，直接拉取通用任务
    if (tasks.length < 3) {
      res = await db.collection('moment_tasks').limit(100).get();
      tasks = res.data;
    }

    // 4. 随机打乱并取前 10 个（为前端卡片切换提供缓冲）
    const shuffled = tasks.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    // 格式化返回数据，将 _id 映射为 id
    const formattedTasks = selected.map(task => ({
      ...task,
      id: task._id,
      _id: undefined
    }));

    return {
      success: true,
      data: formattedTasks
    };
  } catch (error) {
    console.error('获取推荐任务失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
};