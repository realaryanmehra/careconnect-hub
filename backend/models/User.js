import { ObjectId } from 'mongodb';

// Database operations using global usersCollection (initialized in server.js)
export const findByEmail = async (email) => {
  if (!globalThis.usersCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  return await globalThis.usersCollection.findOne({ email });
};

export const findById = async (id) => {
  if (!globalThis.usersCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  return await globalThis.usersCollection.findOne({ _id: new ObjectId(id) });
};

export const createUser = async (name, email, passwordHash) => {
  const newUser = {
    _id: new ObjectId(),
    name: String(name).trim(),
    email,
    passwordHash,
    createdAt: new Date(),
  };
  if (!globalThis.usersCollection) {
    throw new Error('Database not initialized. Start server first.');
  }
  await globalThis.usersCollection.insertOne(newUser);
  return newUser;
};

export const initUserCollection = async () => {
  if (!globalThis.usersCollection) {
    throw new Error('usersCollection is not initialized. Check server.js connection.');
  }
  await globalThis.usersCollection.createIndex({ email: 1 }, { unique: true });
  console.log('✅ Users collection ready with email index!');
};

export default { findByEmail, findById, createUser, initUserCollection };

