// Meeting routes - scheduling, accepting, rejecting, and availability endpoints
import { Router } from 'express';
import { body } from 'express-validator';
import { createMeeting, getMeetings, updateMeetingStatus, deleteMeeting, getAvailability } from '../controllers/meetingController';
import { auth } from '../middleware/auth';
import { validate } from '../utils/validate';

const router = Router();

router.post('/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').isISO8601().withMessage('Valid end time is required'),
    body('participants').isArray({ min: 1 }).withMessage('At least one participant is required')
  ],
  validate,
  createMeeting
);

router.get('/', auth, getMeetings);

router.get('/availability', auth, getAvailability);

router.put('/:id/status',
  auth,
  [
    body('status').isIn(['accepted', 'rejected', 'cancelled']).withMessage('Invalid status')
  ],
  validate,
  updateMeetingStatus
);

router.delete('/:id', auth, deleteMeeting);

export default router;
