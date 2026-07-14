# Product Requirements Document

## Project Name
Nexus - Investor & Entrepreneur Collaboration Platform

## Problem Statement
Startups and early-stage entrepreneurs struggle to connect with the right investors. Existing platforms are either too generic, lack real-time collaboration tools, or do not provide a secure environment for sharing sensitive business documents and financial transactions. There is a need for a centralized platform that brings entrepreneurs and investors together with tools for scheduling, communication, document handling, and simulated payments.

## Targeted Users
- **Entrepreneurs:** Founders and startup owners looking for investment, mentorship, and business connections. They need to showcase their startup, pitch ideas, and manage collaboration requests from investors.
- **Investors:** Angel investors, venture capitalists, and investment firms looking for promising startups to invest in. They need to discover opportunities, schedule meetings, review documents, and track their portfolio.

## Core Features

### 1. Authentication & Role-Based Access
- User registration with role selection (Entrepreneur or Investor)
- JWT-based secure login and session management
- Role-based dashboard routing (entrepreneurs and investors see different home screens)
- Password hashing with bcrypt
- Change password functionality

### 2. User Profiles
- Extended profile fields: bio, startup name, pitch summary, funding needed, industry, team size (entrepreneur) or investment interests, portfolio companies, investment range (investor)
- Profile viewing by other users
- Online/offline status indicator

### 3. Discovery & Search
- Browse investors or entrepreneurs with search and filter capabilities
- Filter by industry, investment stage, funding range, and location
- View detailed profiles before initiating contact

### 4. Meeting Scheduling
- Create meetings with title, description, start/end time
- Calendar view (monthly grid) and list view toggle
- Accept, reject, or cancel meeting invitations
- Conflict detection to prevent double booking
- Available time slot checking

### 5. Video Calling
- WebRTC-based peer-to-peer video and audio calling
- Socket.IO signaling server for connection establishment
- Room-based call joining
- Toggle audio and video during calls
- End call functionality

### 6. Document Processing Chamber
- File upload with drag-and-drop and file picker (PDF, DOC, DOCX, JPG, PNG)
- In-browser document preview (PDF iframe, image display)
- Canvas-based e-signature with save and clear
- Document metadata tracking (owner, version, status, upload date)
- Document deletion (owner only)

### 7. Payment Simulation
- Mock deposit, withdraw, and transfer functionality
- Balance calculation from transaction history
- Transaction history with status tracking (pending, completed, failed)
- Transfer to other users by email lookup

### 8. Security
- Helmet.js for HTTP header security
- CORS configuration with origin whitelist
- Rate limiting (100 requests/15 minutes general, 20 requests/15 minutes for auth)
- Input validation and sanitization with express-validator
- Two-Factor Authentication with OTP simulation

### 9. Messaging
- Real-time inline chat interface (WhatsApp-style)
- Contact list fetched from backend
- Message history per conversation

## Out of Scope
- Real payment processing (Stripe/PayPal integration is mocked)
- Mobile native applications
- Email notification system (beyond 2FA OTP mock)
- Advanced analytics or reporting dashboards

## Success Metrics
- All core features functional and accessible through the deployed web app
- Backend APIs documented and testable via Swagger UI
- Deployment live on Vercel (frontend) and Render (backend)
- Zero critical security vulnerabilities in production
