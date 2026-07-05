// Document controller - handles file uploads, metadata, and e-signatures
import { Response } from 'express';
import { DocumentModel } from '../models/Document';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const document = await DocumentModel.create({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      ownerId: req.user._id,
      uploadedBy: req.user._id,
      version: 1,
      status: 'draft',
      shared: false,
      signatures: []
    });

    res.status(201).json({ document });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const documents = await DocumentModel.find({
      $or: [
        { ownerId: req.user._id },
        { shared: true }
      ]
    }).populate('ownerId', 'name email avatarUrl')
      .populate('uploadedBy', 'name email avatarUrl')
      .populate('signatures.userId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
};

export const getDocumentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const document = await DocumentModel.findById(id)
      .populate('ownerId', 'name email avatarUrl')
      .populate('uploadedBy', 'name email avatarUrl')
      .populate('signatures.userId', 'name email avatarUrl');

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
};

export const signDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { signatureImage } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!signatureImage) {
      res.status(400).json({ error: 'Signature image is required' });
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check if already signed by this user
    const alreadySigned = document.signatures.some(
      sig => sig.userId.toString() === req.user!._id.toString()
    );

    if (alreadySigned) {
      res.status(400).json({ error: 'Document already signed by you' });
      return;
    }

    document.signatures.push({
      userId: req.user._id,
      signedAt: new Date(),
      signatureImage
    });

    if (document.signatures.length > 0) {
      document.status = 'signed';
    }

    await document.save();

    res.json({ document });
  } catch (error) {
    console.error('Sign document error:', error);
    res.status(500).json({ error: 'Failed to sign document' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Only owner can delete
    if (document.ownerId.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Only the owner can delete a document' });
      return;
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), document.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await DocumentModel.findByIdAndDelete(id);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};
