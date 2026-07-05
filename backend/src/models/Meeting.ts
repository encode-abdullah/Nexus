// Meeting model - stores meeting scheduling data with conflict detection support
import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting {
  title: string;
  description: string;
  participants: mongoose.Types.ObjectId[];
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  meetingLink?: string;
}

export interface IMeetingDocument extends IMeeting, Document {}

const meetingSchema = new Schema<IMeetingDocument>({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  meetingLink: { type: String }
}, { timestamps: true });

export const Meeting = mongoose.model<IMeetingDocument>('Meeting', meetingSchema);
