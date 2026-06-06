import { ensureDB } from '../utils/db.js';
import mongoose from 'mongoose';

// TOKEN QUEUE SYSTEM - Patient gets queue number
// GET USER TOKENS (with simple stats)
export const getTokens = async (req, res) => {
  if (!req.auth || !req.auth.id) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (!globalThis.dbReady) {
    return res.json({ tokens: [], stats: { total: 0, waiting: 0, 'in-progress': 0, completed: 0 } });
  }

  try {
    ensureDB();
    
    // Step 1: Mongoose query
    const tokens = await globalThis.Token.find({ userId: req.auth.id }).sort({ createdAt: -1 });
    
    // Step 2: Dynamically calculate position for each waiting token
    const tokensWithPosition = await Promise.all(tokens.map(async (t) => {
      const tokenObj = t.toObject ? t.toObject() : t;
      if (tokenObj.status === 'waiting') {
        // Count how many people are waiting in the same department who joined BEFORE this token
        const aheadCount = await globalThis.Token.countDocuments({
          department: tokenObj.department,
          status: 'waiting',
          createdAt: { $lt: tokenObj.createdAt }
        });
        tokenObj.position = aheadCount + 1;
        tokenObj.estimatedTime = `~${(aheadCount + 1) * 15} minutes`;
      } else {
        tokenObj.position = 0;
        tokenObj.estimatedTime = 'N/A';
      }
      return tokenObj;
    }));

    // Step 3: Calculate simple stats
    const stats = {
      total: tokens.length,
      waiting: tokens.filter(t => t.status === 'waiting').length,
      'in-progress': tokens.filter(t => t.status === 'in-progress').length,
      completed: tokens.filter(t => t.status === 'completed').length
    };

    console.log('Tokens fetched:', stats.total);
    
    res.json({ tokens: tokensWithPosition, stats });
  } catch (error) {
    console.error('Get tokens error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// GENERATE NEW TOKEN (queue number)
export const generateToken = async (req, res) => {
  if (!globalThis.dbReady) {
    return res.status(201).json({ token: { number: 1, status: 'waiting', position: 1 } });
  }

  try {
    const { patientName, department } = req.body;
    if (!patientName || !department) {
      return res.status(400).json({ message: 'Patient name and department required' });
    }

    ensureDB();

    // Step 1: Get global token count to determine the next unique number
    const globalTokenCount = await globalThis.Token.countDocuments({});
    
    // Step 2: Get waiting tokens for THIS department to calculate position
    const waitingInDept = await globalThis.Token.countDocuments({ 
      department, 
      status: 'waiting' 
    });
    
    // Step 3: Create new token data
    const newToken = {
      _id: new mongoose.Types.ObjectId(),
      number: globalTokenCount + 1, // Global sequence
      patientName: patientName.trim(),
      department,
      status: 'waiting',
      paymentStatus: 'pending',
      position: waitingInDept + 1,
      estimatedTime: `~${(waitingInDept + 1) * 15} minutes`,
      userId: new mongoose.Types.ObjectId(req.auth.id),
      createdAt: new Date()
    };

    // Step 3: Save token
    await globalThis.tokensCollection.insertOne(newToken);

    console.log('✅ Token generated:', newToken.number);

    if (globalThis.io) {
      globalThis.io.emit('tokenGenerated', newToken);
    }

    res.status(201).json({ token: newToken });
  } catch (error) {
    console.error('Generate token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE TOKEN STATUS (waiting → in-progress → completed)
export const updateTokenStatus = async (req, res) => {
  if (!globalThis.dbReady) {
    return res.json({ message: 'Updated (demo)' });
  }

  try {
    const { status } = req.body;
    const validStatuses = ['waiting', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status must be: waiting, in-progress, or completed' });
    }

    ensureDB();

    // Step 1: Update token if it belongs to user
    const result = await globalThis.tokensCollection.updateOne(
      { 
        _id: new mongoose.Types.ObjectId(req.params.id),
        userId: new mongoose.Types.ObjectId(req.auth.id)
      },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Token not found or not yours' });
    }

    console.log('✅ Token status updated:', status);
    
    if (globalThis.io) {
      globalThis.io.emit('tokenUpdated', { id: req.params.id, status });
    }
    
    res.json({ message: 'Token updated' });
  } catch (error) {
    console.error('Update token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { getTokens, generateToken, updateTokenStatus };


