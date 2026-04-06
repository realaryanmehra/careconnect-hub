import { findTokensByUser, createToken, updateTokenStatus as updateModelTokenStatus } from '../models/Token.js';

// GET /api/tokens - Get user's tokens
export const getTokens = async (req, res) => {
  try {
    const userId = req.auth.id;
    const tokens = await findTokensByUser(userId);
    
    console.log(`📊 Tokens fetched for user: ${userId}`);
    
    return res.json({
      success: true,
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
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// POST /api/tokens - Generate new token
export const generateToken = async (req, res) => {
  try {
    const userId = req.auth.id;
    const { patientName, department } = req.body;

    if (!patientName || !department) {
      return res.status(400).json({ message: 'Patient name and department required' });
    }

    // Get current waiting tokens for position calculation
    const waitingTokens = await findTokensByUser(userId);
    const waitingCount = waitingTokens.filter(t => t.status === 'waiting').length;
    
    const newTokenData = {
      number: waitingTokens.length + 1,
      patientName,
      department,
      status: 'waiting',
      position: waitingCount,
      estimatedTime: `~${(waitingCount + 1) * 15} min`
    };

    const token = await createToken(newTokenData, userId);
    
    console.log(`🎫 Token generated #${token.number} for user: ${userId}`);
    
    return res.status(201).json({
      success: true,
      message: 'Token generated successfully',
      token
    });
  } catch (error) {
    console.error('Generate token error:', error.message);
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// PATCH /api/tokens/:id/status - Update token status (admin/staff)
export const updateTokenStatus = async (req, res) => {
  try {
    const userId = req.auth.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!['waiting', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await updateModelTokenStatus(id, status, userId);
    
    console.log(`🔄 Token ${id} status updated to ${status} by user: ${userId}`);
    
    return res.json({
      success: true,
      message: 'Token status updated'
    });
  } catch (error) {
    console.error('Update token status error:', error.message);
    if (error.message === 'Token not found') {
      return res.status(404).json({ message: 'Token not found' });
    }
    return res.status(500).json({ message: 'Server error', details: error.message });
  }
};

export default { getTokens, generateToken, updateTokenStatus };

