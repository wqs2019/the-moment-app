const cloudbase = require('@cloudbase/node-sdk');
const tasks = require('./tasks.json');

// ==========================================
// 请在这里填入你的腾讯云 API 密钥
// 获取地址：https://console.cloud.tencent.com/cam/capi
// ==========================================
const SECRET_ID = 'YOUR_SECRET_ID';
const SECRET_KEY = 'YOUR_SECRET_KEY';
const ENV_ID = 'maoqiu-diary-app-2fpzvwp2e01dbaf'; // 你的云开发环境 ID

async function seedDatabase() {
  if (SECRET_ID === 'YOUR_SECRET_ID' || SECRET_KEY === 'YOUR_SECRET_KEY') {
    console.error('❌ 错误：请先在 scripts/seedTasks.js 中填入你的 SECRET_ID 和 SECRET_KEY');
    process.exit(1);
  }

  console.log('🚀 开始初始化云开发环境...');
  const app = cloudbase.init({
    env: ENV_ID,
    secretId: SECRET_ID,
    secretKey: SECRET_KEY,
  });

  const db = app.database();
  const collectionName = 'moment_tasks';
  const collection = db.collection(collectionName);

  console.log(`\n📦 准备向集合 [${collectionName}] 写入 ${tasks.length} 条数据...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    try {
      // 添加创建时间和更新时间
      const taskData = {
        ...task,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      };

      await collection.add(taskData);
      successCount++;
      console.log(`✅ [${i + 1}/${tasks.length}] 成功写入: ${task.title}`);
    } catch (error) {
      failCount++;
      console.error(`❌ [${i + 1}/${tasks.length}] 写入失败: ${task.title}`, error.message);
    }
  }

  console.log('\n🎉 数据同步完成！');
  console.log(`📊 成功: ${successCount} 条, 失败: ${failCount} 条`);
  
  if (failCount > 0) {
    console.log('💡 提示：如果提示集合不存在，请先在腾讯云开发控制台创建名为 moment_tasks 的数据库集合。');
  }
}

seedDatabase();