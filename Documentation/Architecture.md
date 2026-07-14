# Architecture & System Design

## Application Flow

```
User Browser (React SPA)
    |
    | HTTPS requests with JWT token
    v
Frontend (Vercel) -----> Backend API (Render) -----> MongoDB Atlas
                              |
                              | Socket.IO
                              v
                        Video Call Signaling (WebRTC peer-to-peer)
```

### Request Flow
1. User interacts with the React frontend in the browser
2. Frontend sends HTTP requests (via Axios) to the backend REST API
3. Backend validates the JWT token, processes the request, queries MongoDB
4. Backend returns JSON responses
5. Frontend updates the UI state accordingly

### Real-Time Flow (Video Calling)
1. User joins a room via the frontend
2. Frontend connects to the Socket.IO server on the backend
3. Signaling messages (offer, answer, ICE candidates) are relayed through the server
4. Once the peer connection is established, video/audio streams directly between browsers (WebRTC)

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |
| React Dropzone | File drag-and-drop |
| date-fns | Date formatting and manipulation |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express | Web framework |
| TypeScript | Type safety |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt | Password hashing |
| Multer | File upload handling |
| Socket.IO | Real-time communication |
| Helmet | HTTP security headers |
| CORS | Cross-origin resource sharing |
| express-rate-limit | API rate limiting |
| express-validator | Input validation |
| Swagger (swagger-jsdoc + swagger-ui-express) | API documentation |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting and CDN |
| Render | Backend hosting |
| MongoDB Atlas (M0 free tier) | Database hosting |
| GitHub | Source code repository |

## Folder Structure

```
Nexus/
├── Documentation/              # Project documentation
│   ├── PRD.md
│   ├── Architecture.md
│   ├── Rules.md
│   ├── Phases.md
│   ├── Design.md
│   └── Memory.md
├── Logo/                       # Brand assets
│   ├── Nexusfavicon.svg
│   ├── Nexus Banner.png
│   └── Nexus Logo.png
├── backend/                    # Backend source code
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts           # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── documentController.ts
│   │   │   ├── meetingController.ts
│   │   │   ├── paymentController.ts
│   │   │   ├── twoFactorController.ts
│   │   │   └── userController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT authentication
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   ├── Document.ts
│   │   │   ├── Meeting.ts
│   │   │   ├── Transaction.ts
│   │   │   ├── TwoFactor.ts
│   │   │   └── User.ts        # Base + discriminators
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── documents.ts
│   │   │   ├── meetings.ts
│   │   │   ├── payments.ts
│   │   │   ├── twoFactor.ts
│   │   │   └── users.ts
│   │   ├── utils/
│   │   │   ├── seeder.ts       # Database seed script
│   │   │   └── validate.ts     # Validation helper
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Entry point (HTTP + Socket.IO)
│   ├── uploads/                # Uploaded documents
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── tsconfig.json
├── public/                     # Static assets served by Vite
│   ├── Nexusfavicon.svg
│   └── logo.svg
├── src/                        # Frontend source code
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── collaboration/
│   │   │   └── CollaborationRequestCard.tsx
│   │   ├── entrepreneur/
│   │   │   └── EntrepreneurCard.tsx
│   │   └── investor/
│   │       └── InvestorCard.tsx
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ThemeContext.tsx     # Dark/light mode
│   ├── data/                    # Mock data for dashboard
│   │   ├── collaborationRequests.ts
│   │   └── users.ts
│   ├── lib/
│   │   └── api.ts              # Axios instance with interceptors
│   ├── pages/
│   │   ├── auth/               # Login, Register, ForgotPassword, ResetPassword
│   │   ├── chat/               # ChatPage
│   │   ├── dashboard/          # EntrepreneurDashboard, InvestorDashboard
│   │   ├── deals/              # DealsPage
│   │   ├── documents/          # DocumentsPage
│   │   ├── entrepreneurs/      # EntrepreneursPage
│   │   ├── help/               # HelpPage
│   │   ├── investors/          # InvestorsPage
│   │   ├── meetings/           # MeetingsPage
│   │   ├── messages/           # MessagesPage
│   │   ├── notifications/      # NotificationsPage
│   │   ├── payments/           # PaymentsPage
│   │   ├── profile/            # EntrepreneurProfile, InvestorProfile
│   │   ├── settings/           # SettingsPage
│   │   └── video/              # VideoCallPage
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── App.tsx                 # Root component with routes
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles and dark mode overrides
├── index.html                  # HTML entry point
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript config (project references)
├── vite.config.ts              # Vite configuration
├── package.json                # Frontend dependencies
└── README.md
```

## Database Schema

### User (Base Schema)
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Required, unique, lowercase |
| password | String | Required, hashed, excluded from JSON output |
| role | String | "entrepreneur" or "investor" |
| avatarUrl | String | Profile image URL |
| bio | String | Short biography |
| isOnline | Boolean | Online status |
| createdAt | Date | Auto-generated |

### User - Entrepreneur (Discriminator)
| Field | Type |
|---|---|
| startupName | String |
| pitchSummary | String |
| fundingNeeded | String |
| industry | String |
| location | String |
| foundedYear | Number |
| teamSize | Number |

### User - Investor (Discriminator)
| Field | Type |
|---|---|
| investmentInterests | [String] |
| investmentStage | [String] |
| portfolioCompanies | [String] |
| totalInvestments | Number |
| minimumInvestment | String |
| maximumInvestment | String |

### Meeting
| Field | Type | Notes |
|---|---|---|
| title | String | Required |
| description | String | |
| participants | [ObjectId ref User] | Required |
| startTime | Date | Required |
| endTime | Date | Required |
| status | String | pending / accepted / rejected / cancelled |
| meetingLink | String | Auto-generated room ID |
| creator | ObjectId ref User | |

### Document
| Field | Type | Notes |
|---|---|---|
| name | String | Original filename |
| type | String | MIME type |
| size | Number | File size in bytes |
| url | String | File path |
| ownerId | ObjectId ref User | |
| uploadedBy | ObjectId ref User | |
| version | Number | Incremented on re-upload |
| status | String | draft / pending_signature / signed / archived |
| shared | Boolean | |
| signatures | Array | userId, signedAt, signatureImage |

### Transaction
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId ref User | Sender |
| type | String | deposit / withdraw / transfer |
| amount | Number | |
| currency | String | Default: USD |
| status | String | pending / completed / failed |
| recipientId | ObjectId ref User | For transfers |
| stripePaymentId | String | Mock payment ID |
| description | String | |

### TwoFactor
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId ref User | |
| secret | String | |
| otp | String | 6-digit code |
| expiresAt | Date | OTP expiry |
| enabled | Boolean | |
