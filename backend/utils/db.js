// UTILITY: Check if database collections are ready (called once per controller)
// Makes code simple - no repeated \"if (!collection)\" everywhere

export const ensureDB = () => {
  // List of all database tables we use
  const collections = [
    'usersCollection',
    'tokensCollection', 
    'appointmentsCollection',
    'dashboardCollection'
  ];
  
  // Step 1: Check each collection exists
  for (let collectionName of collections) {
    if (!globalThis[collectionName]) {
      throw new Error(`Database table ${collectionName} not ready. Start server first.`);
    }
  }
  
  // Step 2: All good!
  return true;
};

// For controllers: simple wrapper
export const withDB = async (fn) => {
  ensureDB();
  return await fn();
};

export default { ensureDB, withDB };

