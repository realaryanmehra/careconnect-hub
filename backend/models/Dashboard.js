import { ObjectId } from 'mongodb';

// Dashboard data operations - aggregates patient profile, vitals, records, prescriptions
export const getDashboardByUserId = async (userId) => {
  if (!globalThis.dashboardCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  
  // Get dashboard profile
  let dashboard = await globalThis.dashboardCollection.findOne({ userId: new ObjectId(userId) });
  
  if (!dashboard) {
    // Create default if none exists
    dashboard = await createDefaultDashboard(userId);
  }
  
  return dashboard;
};

export const upsertDashboardData = async (userId, dataType, data) => {
  if (!globalThis.dashboardCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  
  const updateObj = { [`${dataType}s`]: data };
  const result = await globalThis.dashboardCollection.updateOne(
    { userId: new ObjectId(userId) },
    { 
      $set: { 
        ...updateObj,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
  return result;
};

const createDefaultDashboard = async (userId) => {
  const defaultDashboard = {
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    patientInfo: {
      name: '',
      id: `PT-${Date.now()}`,
      age: 0,
      blood: '',
      phone: '',
      email: ''
    },
    vitals: [],
    medicalRecords: [],
    prescriptions: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  if (!globalThis.dashboardCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  
  await globalThis.dashboardCollection.insertOne(defaultDashboard);
  return defaultDashboard;
};

export const initDashboardCollection = async () => {
  if (!globalThis.dashboardCollection) {
    throw new Error('dashboardCollection is not initialized. Check server.js connection.');
  }
  await globalThis.dashboardCollection.createIndex({ userId: 1 }, { unique: true });
  console.log('✅ Dashboard collection ready with userId index!');
};

export default { getDashboardByUserId, upsertDashboardData, initDashboardCollection };

