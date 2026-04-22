import { ensureDB } from '../utils/db.js';

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
    
    // Step 2: Calculate simple stats
    const stats = {
      total: tokens.length,
      waiting: tokens.filter(t => t.status === 'waiting').length,
      'in-progress': tokens.filter(t => t.status === 'in-progress').length,
      completed: tokens.filter(t => t.status === 'completed').length
    };

    console.log('Tokens fetched:', stats.total);
    
    res.json({ tokens, stats });
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

    // Step 1: Get user's current tokens to calculate number
    const existingTokens = await globalThis.tokensCollection.find({ userId: new ObjectId(req.auth.id) }).toArray();
    const waitingTokens = existingTokens.filter(t => t.status === 'waiting').length;
    
    // Step 2: Create new token data
    const newToken = {
      _id: new ObjectId(),
      number: existingTokens.length + 1,
      patientName: patientName.trim(),
      department,
      status: 'waiting',
      position: waitingTokens,
      estimatedTime: `~${(waitingTokens + 1) * 15} minutes`,
      userId: new ObjectId(req.auth.id),
      createdAt: new Date()
    };

    // Step 3: Save token
    await globalThis.tokensCollection.insertOne(newToken);

    console.log('✅ Token generated:', newToken.number);

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
        _id: new ObjectId(req.params.id),
        userId: new ObjectId(req.auth.id)
      },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Token not found or not yours' });
    }

    console.log('✅ Token status updated:', status);
    res.json({ message: 'Token updated' });
  } catch (error) {
    console.error('Update token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { getTokens, generateToken, updateTokenStatus };


