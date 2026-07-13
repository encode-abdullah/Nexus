// Meeting routes - scheduling, accepting, rejecting, and availability endpoints
import { Router } from 'express';
import { body } from 'express-validator';
import { createMeeting, getMeetings, updateMeetingStatus, deleteMeeting, getAvailability } from '../controllers/meetingController';
import { auth } from '../middleware/auth';
import { validate } from '../utils/validate';

const router = Router();

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     tags: [Meetings]
 *     summary: Create a new meeting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, startTime, endTime]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Meeting created
 *       409:
 *         description: Time conflict detected
 */
router.post('/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').isISO8601().withMessage('Valid end time is required'),
    body('participants').optional().isArray().withMessage('Participants must be an array')
  ],
  validate,
  createMeeting
);

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     tags: [Meetings]
 *     summary: Get all meetings for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of meetings
 */
router.get('/', auth, getMeetings);

/**
 * @swagger
 * /api/meetings/availability:
 *   get:
 *     tags: [Meetings]
 *     summary: Check available time slots
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Available meetings for the date
 */
router.get('/availability', auth, getAvailability);

/**
 * @swagger
 * /api/meetings/{id}/status:
 *   put:
 *     tags: [Meetings]
 *     summary: Update meeting status (accept/reject/cancel)
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected, cancelled]
 *     responses:
 *       200:
 *         description: Meeting updated
 */
router.put('/:id/status',
  auth,
  [body('status').isIn(['accepted', 'rejected', 'cancelled']).withMessage('Invalid status')],
  validate,
  updateMeetingStatus
);

/**
 * @swagger
 * /api/meetings/{id}:
 *   delete:
 *     tags: [Meetings]
 *     summary: Delete a meeting (creator only)
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
 *         description: Meeting deleted
 *       403:
 *         description: Not the creator
 */
router.delete('/:id', auth, deleteMeeting);

export default router;
