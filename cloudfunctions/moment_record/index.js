const cloudbase = require('@cloudbase/node-sdk');

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV,
});
const db = app.database();

exports.main = async (event, context) => {
  const { action, userId, payload } = event;

  if (!userId) {
    return { success: false, message: 'Missing userId' };
  }

  try {
    if (action === 'add') {
      const record = {
        ...payload,
        userId,
        createdAt: Date.now(),
      };
      const res = await db.collection('moment_records').add(record);
      return { 
        success: true, 
        data: { ...record, id: res.id } 
      };
    } else if (action === 'get') {
      const res = await db.collection('moment_records')
        .where({ userId })
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();
        
      const formattedRecords = res.data.map(item => ({
        ...item,
        id: item._id,
        _id: undefined
      }));
      
      return { success: true, data: formattedRecords };
    }
    
    return { success: false, message: 'Invalid action' };
  } catch (error) {
    console.error('Record operation failed:', error);
    return { success: false, message: error.message };
  }
};