import { ObjectId } from 'mongodb';

// Token operations for queue management
export const findTokensByUser = async (userId) => {
  if (!globalThis.tokensCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  return await globalThis.tokensCollection.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
};

export const findTokenById = async (id, userId) => {
  if (!globalThis.tokensCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  return await globalThis.tokensCollection.findOne({ 
    _id: new ObjectId(id), 
    userId: new ObjectId(userId) 
  });
};

export const createToken = async (tokenData, userId) => {
  const newToken = {
    _id: new ObjectId(),
    number: tokenData.number,
    patientName: String(tokenData.patientName).trim(),
    department: tokenData.department,
    status: tokenData.status || 'waiting',
    estimatedTime: tokenData.estimatedTime,
    createdAt: new Date(),
    userId: new ObjectId(userId),
    position: tokenData.position || 0,
  };
  
  if (!globalThis.tokensCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  
  await globalThis.tokensCollection.insertOne(newToken);
  return newToken;
};

export const updateTokenStatus = async (id, status, userId) => {
  if (!globalThis.tokensCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  const result = await globalThis.tokensCollection.updateOne(
    { _id: new ObjectId(id), userId: new ObjectId(userId) },
    { $set: { status, updatedAt: new Date() } }
  );
  if (result.matchedCount === 0) {
    throw new Error('Token not found');
  }
  return result;
};

export const initTokenCollection = async () => {
  if (!globalThis.tokensCollection) {
    throw new Error('tokensCollection is not initialized. Check server.js connection.');
  }
  await globalThis.tokensCollection.createIndex({ userId: 1 });
  await globalThis.tokensCollection.createIndex({ status: 1 });
  await globalThis.tokensCollection.createIndex({ createdAt: -1 });
  console.log('✅ Tokens collection ready with indexes!');
};

export default { findTokensByUser, findTokenById, createToken, updateTokenStatus, initTokenCollection };

