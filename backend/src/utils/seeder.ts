// Database seeder - populates DB with mock users from frontend data files
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Entrepreneur, Investor, UserRole } from '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedData = {
  entrepreneurs: [
    {
      name: 'Sarah Johnson',
      email: 'sarah@techwave.io',
      password: 'password123',
      role: 'entrepreneur' as UserRole,
      bio: 'Serial entrepreneur with 10+ years of experience in SaaS and fintech.',
      startupName: 'TechWave AI',
      pitchSummary: 'AI-powered financial analytics platform helping SMBs make data-driven decisions.',
      fundingNeeded: '$1.5M',
      industry: 'FinTech',
      location: 'San Francisco, CA',
      foundedYear: 2021,
      teamSize: 12,
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    {
      name: 'David Chen',
      email: 'david@greenlife.co',
      password: 'password123',
      role: 'entrepreneur' as UserRole,
      bio: 'Environmental scientist turned entrepreneur. Passionate about sustainable solutions.',
      startupName: 'GreenLife Solutions',
      pitchSummary: 'Biodegradable packaging alternatives for consumer goods and food industry.',
      fundingNeeded: '$2M',
      industry: 'CleanTech',
      location: 'Portland, OR',
      foundedYear: 2020,
      teamSize: 8,
      avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
    },
    {
      name: 'Maya Patel',
      email: 'maya@healthpulse.com',
      password: 'password123',
      role: 'entrepreneur' as UserRole,
      bio: 'Former healthcare professional with an MBA. Building tech to improve patient care.',
      startupName: 'HealthPulse',
      pitchSummary: 'Mobile platform connecting patients with mental health professionals in real-time.',
      fundingNeeded: '$800K',
      industry: 'HealthTech',
      location: 'Boston, MA',
      foundedYear: 2022,
      teamSize: 5,
      avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
    },
    {
      name: 'James Wilson',
      email: 'james@urbanfarm.io',
      password: 'password123',
      role: 'entrepreneur' as UserRole,
      bio: 'Agricultural engineer focused on urban farming solutions and food security.',
      startupName: 'UrbanFarm',
      pitchSummary: 'IoT-enabled vertical farming systems for urban environments and food deserts.',
      fundingNeeded: '$3M',
      industry: 'AgTech',
      location: 'Chicago, IL',
      foundedYear: 2019,
      teamSize: 14,
      avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    }
  ],
  investors: [
    {
      name: 'Michael Rodriguez',
      email: 'michael@vcinnovate.com',
      password: 'password123',
      role: 'investor' as UserRole,
      bio: 'Early-stage investor with focus on B2B SaaS and fintech. Previously founded and exited two startups.',
      investmentInterests: ['FinTech', 'SaaS', 'AI/ML'],
      investmentStage: ['Seed', 'Series A'],
      portfolioCompanies: ['PayStream', 'DataSense', 'CloudSecure'],
      totalInvestments: 12,
      minimumInvestment: '$250K',
      maximumInvestment: '$1.5M',
      avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    {
      name: 'Jennifer Lee',
      email: 'jennifer@impactvc.org',
      password: 'password123',
      role: 'investor' as UserRole,
      bio: 'Impact investor focused on climate tech, sustainable agriculture, and clean energy.',
      investmentInterests: ['CleanTech', 'AgTech', 'Sustainability'],
      investmentStage: ['Seed', 'Series A', 'Series B'],
      portfolioCompanies: ['SolarFlow', 'EcoPackage', 'CleanWater Solutions'],
      totalInvestments: 18,
      minimumInvestment: '$500K',
      maximumInvestment: '$3M',
      avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    {
      name: 'Robert Torres',
      email: 'robert@healthventures.com',
      password: 'password123',
      role: 'investor' as UserRole,
      bio: 'Healthcare-focused investor with medical background. Looking for innovations in patient care and biotech.',
      investmentInterests: ['HealthTech', 'BioTech', 'Medical Devices'],
      investmentStage: ['Series A', 'Series B'],
      portfolioCompanies: ['MediTrack', 'BioGenics', 'Patient+'],
      totalInvestments: 9,
      minimumInvestment: '$1M',
      maximumInvestment: '$5M',
      avatarUrl: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg'
    }
  ]
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Entrepreneur.deleteMany({});
    await Investor.deleteMany({});
    console.log('Cleared existing data');

    // Seed entrepreneurs
    for (const data of seedData.entrepreneurs) {
      await Entrepreneur.create(data as any);
    }
    console.log(`Seeded ${seedData.entrepreneurs.length} entrepreneurs`);

    // Seed investors
    for (const data of seedData.investors) {
      await Investor.create(data as any);
    }
    console.log(`Seeded ${seedData.investors.length} investors`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
