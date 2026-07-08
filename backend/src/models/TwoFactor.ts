// 2FA mock model - stores OTP codes for two-factor authentication simulation
import mongoose, { Schema, Document } from 'mongoose';

export interface ITwoFactor {
  userId: mongoose.Types.ObjectId;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITwoFactorDocument extends ITwoFactor, Document {}

const twoFactorSchema = new Schema<ITwoFactorDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-delete expired OTPs
twoFactorSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TwoFactor = mongoose.model<ITwoFactorDocument>('TwoFactor', twoFactorSchema);
