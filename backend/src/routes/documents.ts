// Document routes - file upload, management, and e-signature endpoints
import { Router } from 'express';
import { auth } from '../middleware/auth';
import { uploadDocument, getDocuments, deleteDocument, signDocument } from '../controllers/documentController';
import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf', 'image/jpeg', 'image/png', 'image/gif',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Accepted: PDF, Images, Word, Excel'));
    }
  }
});

const router = Router();

/**
 * @swagger
 * /api/documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload a document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document uploaded
 *       400:
 *         description: Invalid file type
 */
router.post('/', auth, upload.single('file'), uploadDocument);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     tags: [Documents]
 *     summary: Get all documents for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/', auth, getDocuments);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete a document (owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 *       403:
 *         description: Not the owner
 */
router.delete('/:id', auth, deleteDocument);

/**
 * @swagger
 * /api/documents/{id}/sign:
 *   post:
 *     tags: [Documents]
 *     summary: Add a signature to a document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [signatureData]
 *             properties:
 *               signatureData:
 *                 type: string
 *                 description: Base64 signature image data
 *               signerName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document signed
 */
router.post('/:id/sign',
  auth,
  [
    require('express-validator').body('signatureData').notEmpty().withMessage('Signature data is required')
  ],
  require('../utils/validate').validate,
  signDocument
);

export default router;
