import { ObjectId } from 'mongodb';

// Database operations using global usersCollection (initialized in server.js)
export const findByEmail = async (email) => {
  return await usersCollection.findOne({ email });
};

export const findById = async (id) => {
  return await usersCollection.findOne({ _id: new ObjectId(id) });
};

export const createUser = async (name, email, passwordHash) => {
  const newUser = {
    _id: new ObjectId(),
    name: String(name).trim(),
    email,
    passwordHash,
    createdAt: new Date(),
  };
  await usersCollection.insertOne(newUser);
  return newUser;
};

export const initUserCollection = async () => {
  await usersCollection.createIndex({ email: 1 }, { unique: true });
  console.log('✅ Users collection ready with email index!');
};

export default { findByEmail, findById, createUser, initUserCollection };

