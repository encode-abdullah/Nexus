// User controller - handles profile updates and user retrieval
import { Request, Response } from 'express';
import { User, Entrepreneur, Investor, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Users can only update their own profile
    if (req.user?._id.toString() !== id) {
      res.status(403).json({ error: 'You can only update your own profile' });
      return;
    }

    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role;
    delete updates._id;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let updatedUser;
    if (user.role === 'entrepreneur') {
      updatedUser = await Entrepreneur.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    } else {
      updatedUser = await Investor.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    }

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: updatedUser.toJSON() });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.query;
    const filter: any = {};
    if (role && typeof role === 'string') {
      filter.role = role as UserRole;
    }
    const users = await User.find(filter);
    res.json({ users: users.map(u => u.toJSON()) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};
