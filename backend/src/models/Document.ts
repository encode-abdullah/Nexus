// Document model - stores uploaded document metadata and e-signatures
import mongoose, { Schema, Document } from 'mongoose';

export interface ISignature {
  userId: mongoose.Types.ObjectId;
  signedAt: Date;
  signatureImage: string;
}

export interface IDocument {
  name: string;
  type: string;
  size: number;
  url: string;
  ownerId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  version: number;
  status: 'draft' | 'pending_signature' | 'signed' | 'archived';
  shared: boolean;
  signatures: ISignature[];
}

export interface IDocumentDocument extends IDocument, Document {}

const documentSchema = new Schema<IDocumentDocument>({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  version: { type: Number, default: 1 },
  status: { type: String, enum: ['draft', 'pending_signature', 'signed', 'archived'], default: 'draft' },
  shared: { type: Boolean, default: false },
  signatures: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    signedAt: { type: Date, default: Date.now },
    signatureImage: { type: String }
  }]
}, { timestamps: true });

export const DocumentModel = mongoose.model<IDocumentDocument>('Document', documentSchema);
