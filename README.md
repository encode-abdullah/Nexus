<div align="center">

# Nexus

### Investor & Entrepreneur Collaboration Platform

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat&logo=socket.io&logoColor=white)

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A full-stack platform connecting investors with entrepreneurs for seamless collaboration, meetings, document management, and real-time communication.

[Live Demo](https://nexus-iota-five.vercel.app) | [API Documentation](#api-documentation) | [Report Bug](https://github.com/encode-abdullah/Nexus/issues)

</div>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Entrepreneur / Investor)
- Two-Factor Authentication (2FA) with OTP simulation
- Password hashing with bcrypt (10 rounds)

### Profiles
- Extended profile management (bio, startup info, investment history)
- Role-specific dashboards
- Profile photo upload

### Meeting Scheduling
- Interactive calendar grid view (month view)
- List view toggle
- Conflict detection (prevents double booking)
- Accept / Reject / Cancel meeting flows
- Availability checking

### Video Calling
- WebRTC peer-to-peer video/audio
- Socket.IO signaling server
- Room creation and joining
- Audio/Video toggle controls
- End call functionality

### Document Chamber
- File upload with drag & drop (Multer)
- PDF, Image, Word, Excel support
- In-browser document preview (PDF iframe, image viewer)
- Canvas-based e-signature with signature pad
- Document metadata tracking

### Payment Simulation
- Mock transaction system (Deposit / Withdraw / Transfer)
- Balance tracking
- Transaction history with status filtering
- Ready for Stripe/PayPal integration

### Security
- Helmet.js HTTP security headers
- CORS configuration
- Rate limiting (100 req/15min general, 20 req/15min auth)
- Input validation with express-validator
- XSS protection via sanitization

### API Documentation
- Swagger/OpenAPI annotations on all routes
- Interactive Swagger UI at `/api-docs`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6 |
| **Backend** | Node.js, Express 4, TypeScript |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Real-time** | Socket.IO (signaling), WebRTC (video) |
| **Auth** | JWT, bcrypt |
| **File Upload** | Multer |
| **UI Components** | Lucide React icons, custom component library |
| **Utilities** | date-fns, axios, react-hot-toast, react-dropzone |

---

## Architecture

```
nexus/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes with Swagger
│   │   ├── middleware/       # Auth, error handling
│   │   ├── utils/           # Validation, seeder
│   │   ├── lib/             # Database connection
│   │   └── server.ts        # Entry point + Socket.IO
│   └── uploads/             # File upload storage
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   │   ├── auth/            # Login, Register
│   │   ├── dashboard/       # Entrepreneur & Investor dashboards
│   │   ├── meetings/        # Calendar & scheduling
│   │   ├── video/           # Video call room
│   │   ├── documents/       # Document chamber
│   │   ├── payments/        # Payment dashboard
│   │   ├── profile/         # User profiles
│   │   └── settings/        # Account settings
│   ├── context/             # React Context (Auth)
│   ├── lib/                 # API client (Axios)
│   ├── types/               # TypeScript interfaces
│   └── data/                # Mock data (legacy)
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/encode-abdullah/Nexus.git
   cd Nexus
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values
   ```

5. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```

6. **Start development servers**

   Terminal 1 -- Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 -- Frontend:
   ```bash
   npm run dev
   ```

7. **Open** [http://localhost:5173](http://localhost:5173)

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| PUT | `/users/:id` | Update profile |

### Meetings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/meetings` | Create meeting |
| GET | `/meetings` | Get user's meetings |
| GET | `/meetings/availability` | Check availability |
| PUT | `/meetings/:id/status` | Update status |
| DELETE | `/meetings/:id` | Delete meeting |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents` | Upload document |
| GET | `/documents` | Get user's documents |
| POST | `/documents/:id/sign` | Sign document |
| DELETE | `/documents/:id` | Delete document |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments/balance` | Get balance |
| GET | `/payments/transactions` | Transaction history |
| POST | `/payments/deposit` | Deposit funds |
| POST | `/payments/withdraw` | Withdraw funds |
| POST | `/payments/transfer` | Transfer funds |

### 2FA
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/2fa/setup` | Request OTP |
| POST | `/2fa/verify` | Verify & enable 2FA |
| POST | `/2fa/disable` | Disable 2FA |
| GET | `/2fa/status` | Check 2FA status |

> Interactive Swagger UI available at `http://localhost:5000/api-docs`

---

## Environment Variables

### Backend (`backend/.env`)
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nexus
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Entrepreneur | sarah@techwave.io | password123 |
| Entrepreneur | david@greenlife.co | password123 |
| Entrepreneur | maya@healthpulse.com | password123 |
| Entrepreneur | james@urbanfarm.io | password123 |
| Investor | michael@vcinnovate.com | password123 |
| Investor | jennifer@impactvc.org | password123 |
| Investor | robert@healthventures.com | password123 |

---

## Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy the /dist folder to Vercel
```

### Backend (Render)
```bash
cd backend
npm run build
# Deploy to Render with start command: node dist/server.js
```

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License -- see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built for the Full Stack Development Internship**

[Back to Top](#nexus)

</div>
