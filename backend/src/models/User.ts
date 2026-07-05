// Base User model with role-based discriminators for Entrepreneur and Investor
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export type UserRole = 'entrepreneur' | 'investor';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  isOnline: boolean;
  createdAt: Date;
}

export interface IUserDocument extends IUser, Document {}

// Base User Schema
const userSchema = new Schema<IUserDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['entrepreneur', 'investor'], required: true },
  avatarUrl: { type: String, default: '' },
  bio: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Exclude password from JSON responses
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Entrepreneur Schema (extends User)
export interface IEntrepreneur extends IUserDocument {
  role: 'entrepreneur';
  startupName: string;
  pitchSummary: string;
  fundingNeeded: string;
  industry: string;
  location: string;
  foundedYear: number;
  teamSize: number;
}

const entrepreneurSchema = new Schema<IEntrepreneur>({
  startupName: { type: String, default: '' },
  pitchSummary: { type: String, default: '' },
  fundingNeeded: { type: String, default: '' },
  industry: { type: String, default: '' },
  location: { type: String, default: '' },
  foundedYear: { type: Number, default: new Date().getFullYear() },
  teamSize: { type: Number, default: 1 }
});

// Investor Schema (extends User)
export interface IInvestor extends IUserDocument {
  role: 'investor';
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
}

const investorSchema = new Schema<IInvestor>({
  investmentInterests: [{ type: String }],
  investmentStage: [{ type: String }],
  portfolioCompanies: [{ type: String }],
  totalInvestments: { type: Number, default: 0 },
  minimumInvestment: { type: String, default: '' },
  maximumInvestment: { type: String, default: '' }
});

// Create discriminators
export const User = mongoose.model<IUserDocument>('User', userSchema);
export const Entrepreneur = User.discriminator<IEntrepreneur>('Entrepreneur', entrepreneurSchema);
export const Investor = User.discriminator<IInvestor>('Investor', investorSchema);
