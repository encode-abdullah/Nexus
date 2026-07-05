// Auth controller - handles registration, login, and current user retrieval
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, Entrepreneur, Investor, IUserDocument } from '../models/User';
import { AuthRequest, generateToken } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    let user: IUserDocument;

    if (role === 'entrepreneur') {
      const { startupName, pitchSummary, fundingNeeded, industry, location, foundedYear, teamSize } = req.body;
      user = await Entrepreneur.create({
        name,
        email,
        password,
        role,
        startupName: startupName || '',
        pitchSummary: pitchSummary || '',
        fundingNeeded: fundingNeeded || '',
        industry: industry || '',
        location: location || '',
        foundedYear: foundedYear || new Date().getFullYear(),
        teamSize: teamSize || 1,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      });
    } else {
      const { investmentInterests, investmentStage, portfolioCompanies, totalInvestments, minimumInvestment, maximumInvestment } = req.body;
      user = await Investor.create({
        name,
        email,
        password,
        role,
        investmentInterests: investmentInterests || [],
        investmentStage: investmentStage || [],
        portfolioCompanies: portfolioCompanies || [],
        totalInvestments: totalInvestments || 0,
        minimumInvestment: minimumInvestment || '',
        maximumInvestment: maximumInvestment || '',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      });
    }

    const token = generateToken(user._id.toString());
    const userObj = user.toJSON();

    res.status(201).json({ token, user: userObj });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    // Find user and explicitly include password field
    const user = await User.findOne({ email, role }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());
    const userObj = user.toJSON();

    res.json({ token, user: userObj });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({ user: req.user.toJSON() });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
