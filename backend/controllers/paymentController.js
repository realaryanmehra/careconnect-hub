import { ensureDB } from '../utils/db.js';
import mongoose from 'mongoose';

export const processDemoPayment = async (req, res) => {
  if (!globalThis.dbReady) return res.status(503).json({ message: 'DB not ready' });

  try {
    const { tokenId } = req.body;
    if (!tokenId) {
      return res.status(400).json({ message: 'Token ID required' });
    }

    ensureDB();

    // Find and update the token
    const token = await globalThis.Token.findByIdAndUpdate(
      tokenId,
      { paymentStatus: 'paid', updatedAt: new Date() },
      { new: true }
    );

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    console.log(`💰 Demo Payment Success for Token #${token.number}`);

    // Emit socket event to update patient dashboard instantly
    if (globalThis.io) {
      globalThis.io.emit('tokenUpdated', {
        id: token._id.toString(),
        status: token.status,
        paymentStatus: 'paid',
        number: token.number
      });
    }

    res.json({ 
      success: true, 
      message: 'Payment processed successfully (Demo Mode)',
      token 
    });
  } catch (error) {
    console.error('Demo payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default { processDemoPayment };
