import { findTokensByUser, createToken, updateTokenStatus as updateModelTokenStatus } from '../models/Token.js';

// Get user tokens
export const getTokens = async (req, res) => {
  try {
    const tokens = await findTokensByUser(req.auth.id);
    console.log('Tokens fetched for:', req.auth.id);
    
    return res.json({
      tokens,
      stats: {
        total: tokens.length,
        waiting: tokens.filter(t => t.status === 'waiting').length,
        'in-progress': tokens.filter(t => t.status === 'in-progress').length,
        completed: tokens.filter(t => t.status === 'completed').length
      }
    });
  } catch (error) {
    console.error('Get tokens error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Generate new token
export const generateToken = async (req, res) => {
  try {
    const { patientName, department } = req.body;
    if (!patientName || !department) return res.status(400).json({ message: 'Patient/dept required' });

    const tokens = await findTokensByUser(req.auth.id);
    const waitingCount = tokens.filter(t => t.status === 'waiting').length;
    
    const tokenData = {
      number: tokens.length + 1, patientName, department, status: 'waiting',
      position: waitingCount, estimatedTime: `~${(waitingCount + 1) * 15} min`
    };
    
    const token = await createToken(tokenData, req.auth.id);
    console.log('Token generated:', token.number);
    
    return res.status(201).json({ token });
  } catch (error) {
    console.error('Generate token error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update token status
export const updateTokenStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['waiting', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    await updateModelTokenStatus(req.params.id, status, req.auth.id);
    console.log('Token status updated:', status);
    
    return res.json({ message: 'Updated' });
  } catch (error) {
    console.error('Update token error:', error.message);
    if (error.message === 'Token not found') return res.status(404).json({ message: 'Not found' });
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { getTokens, generateToken, updateTokenStatus };

