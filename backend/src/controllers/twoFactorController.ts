// 2FA controller - mock OTP generation and verification
import { Response } from 'express';
import { TwoFactor } from '../models/TwoFactor';
import { AuthRequest } from '../middleware/auth';

export const setup2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this user
    await TwoFactor.deleteMany({ userId: req.user._id });

    // Save new OTP with 5-minute expiry
    await TwoFactor.create({
      userId: req.user._id,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      verified: false
    });

    // In production, this would send via Nodemailer/SMS
    // For demo, we return it in the response
    console.log(`[2FA] OTP for ${req.user.email}: ${otp}`);

    res.json({
      message: 'OTP sent to your email',
      // Mock: return OTP in response so demo users can test without email
      mockOtp: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
};

export const verify2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { otp } = req.body;

    if (!otp || otp.length !== 6) {
      res.status(400).json({ error: 'Invalid OTP format' });
      return;
    }

    const record = await TwoFactor.findOne({
      userId: req.user._id,
      verified: false
    }).sort({ createdAt: -1 });

    if (!record) {
      res.status(400).json({ error: 'No pending OTP found. Please request a new one.' });
      return;
    }

    if (record.expiresAt < new Date()) {
      await TwoFactor.deleteMany({ userId: req.user._id });
      res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      return;
    }

    if (record.otp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    // Mark as verified
    record.verified = true;
    await record.save();

    res.json({ message: '2FA verified successfully' });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
};

export const get2FAStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const lastVerified = await TwoFactor.findOne({
      userId: req.user._id,
      verified: true
    }).sort({ createdAt: -1 });

    res.json({
      enabled: !!lastVerified,
      lastVerified: lastVerified?.createdAt || null
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
};

export const disable2FA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    await TwoFactor.deleteMany({ userId: req.user._id });

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
};
