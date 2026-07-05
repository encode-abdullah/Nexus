// Meeting controller - handles scheduling, conflict detection, and meeting management
import { Response } from 'express';
import { Meeting, IMeetingDocument } from '../models/Meeting';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const createMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, participants, startTime, endTime } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Conflict detection - check if any participant has overlapping meetings
    const allParticipantIds = [req.user._id.toString(), ...(participants || [])];
    const objectIds = allParticipantIds.map(id => new mongoose.Types.ObjectId(id));
    
    const conflict = await Meeting.findOne({
      participants: { $in: objectIds },
      status: { $nin: ['rejected', 'cancelled'] },
      $or: [
        { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }
      ]
    });

    if (conflict) {
      res.status(409).json({ error: 'Time conflict with an existing meeting' });
      return;
    }

    const meeting = await Meeting.create({
      title,
      description,
      participants: objectIds,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdBy: req.user._id,
      meetingLink: `https://meet.nexus.com/${Date.now()}`
    });

    res.status(201).json({ meeting });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
};

export const getMeetings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const meetings = await Meeting.find({
      participants: req.user._id
    }).populate('participants', 'name email avatarUrl role')
      .populate('createdBy', 'name email avatarUrl role')
      .sort({ startTime: 1 });

    res.json({ meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Failed to get meetings' });
  }
};

export const updateMeetingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    // Check if user is a participant
    if (!meeting.participants.some(p => p.toString() === req.user!._id.toString())) {
      res.status(403).json({ error: 'Not a participant of this meeting' });
      return;
    }

    meeting.status = status;
    await meeting.save();

    res.json({ meeting });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
};

export const deleteMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    // Only creator can delete
    if (meeting.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Only the creator can delete a meeting' });
      return;
    }

    await Meeting.findByIdAndDelete(id);
    res.json({ message: 'Meeting deleted' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
};

export const getAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, date } = req.query;

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const meetings = await Meeting.find({
      participants: userId as string,
      startTime: { $gte: startOfDay },
      endTime: { $lte: endOfDay },
      status: { $nin: ['rejected', 'cancelled'] }
    }).select('startTime endTime status');

    res.json({ meetings });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to get availability' });
  }
};
