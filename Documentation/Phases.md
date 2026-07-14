# Development Phases

## Phase 1: Environment Setup & Core Backend Foundations
**Duration:** Week 1 (Days 1-2)

### Tasks
- Fork and clone the Nexus repository
- Set up backend project structure with Node.js, Express, and TypeScript
- Connect to MongoDB Atlas cluster
- Configure environment variables (.env files)
- Set up CORS, Helmet, and rate limiting middleware
- Create the Express app entry point with health check endpoint
- Fix DNS SRV resolution for MongoDB on Windows
- Verify frontend-backend connection

### Deliverables
- Backend server running locally with MongoDB connection
- Frontend successfully communicating with backend API
- Environment documented

---

## Phase 2: User Authentication & Profiles
**Duration:** Week 1 (Days 3-5)

### Tasks
- Create User model with base schema and Entrepreneur/Investor discriminators
- Implement JWT-based authentication (register, login, get current user)
- Add bcrypt password hashing
- Build role-based access control middleware
- Create user profile CRUD APIs (get user, update user, list users)
- Create frontend AuthContext to manage authentication state
- Rewrite login and registration pages to use backend APIs
- Wire profile pages to fetch from backend
- Add change password functionality

### Deliverables
- Working registration and login flow
- Role-based dashboard routing
- Profiles stored in and retrieved from database
- JWT tokens properly managed in frontend

---

## Phase 3: Meeting Scheduling System
**Duration:** Week 2 (Days 1-2)

### Tasks
- Create Meeting model with status tracking
- Build meeting CRUD APIs (create, list, update status, delete)
- Implement conflict detection (prevent double booking)
- Add available time slot checking endpoint
- Create frontend calendar with monthly grid view
- Add list view toggle
- Wire meeting creation, acceptance, rejection, and deletion to backend
- Add pending invitations section

### Deliverables
- Full meeting scheduling workflow
- Calendar and list views functional
- Conflict detection preventing overlapping meetings

---

## Phase 4: Video Calling Integration
**Duration:** Week 2 (Day 3)

### Tasks
- Set up Socket.IO server on backend
- Implement signaling events (join-room, offer, answer, ice-candidate, end-call)
- Create video call page with 3-view flow (pre-call, in-call, post-call)
- Implement WebRTC peer connection with camera/microphone access
- Add room creation and joining via meeting link
- Add toggle audio/video controls
- Handle camera permission denial gracefully

### Deliverables
- Peer-to-peer video and audio calling
- Room-based call management
- Call controls functional

---

## Phase 5: Document Processing Chamber
**Duration:** Week 2 (Days 4-5)

### Tasks
- Set up Multer for file upload handling
- Create Document model with metadata tracking
- Build document CRUD APIs (upload, list, delete, sign)
- Implement canvas-based e-signature pad
- Create frontend upload modal with drag-and-drop and file picker
- Add PDF and image preview modal
- Add e-signature modal with save functionality
- Wire all document operations to backend

### Deliverables
- File upload with type validation
- In-browser document preview
- E-signature capture and storage
- Document metadata tracked in database

---

## Phase 6: Payment Simulation
**Duration:** Week 3 (Days 1-2)

### Tasks
- Create Transaction model with status tracking
- Build payment APIs (deposit, withdraw, transfer, balance, transactions)
- Implement balance calculation from transaction history
- Create frontend payment dashboard with balance display
- Add deposit, withdraw, and transfer tabs
- Wire all payment operations to backend
- Add transaction history display

### Deliverables
- Mock payment system with deposit, withdraw, and transfer
- Balance calculated and displayed correctly
- Transaction history visible in dashboard

---

## Phase 7: Security Enhancements
**Duration:** Week 3 (Day 3)

### Tasks
- Add express-validator for all input validation
- Implement Two-Factor Authentication model and APIs (setup, verify, disable, status)
- Add 2FA UI in settings page with OTP input
- Verify all protected routes require authentication
- Verify role-based authorization on sensitive operations
- Add form sanitization and XSS protection

### Deliverables
- Input validation on all API endpoints
- 2FA enable/disable flow functional
- All protected routes secured

---

## Phase 8: Final Integration, Polish & Deployment
**Duration:** Week 3 (Days 4-7)

### Tasks
- Full end-to-end testing of all features
- Dark mode audit across all pages
- Fix any remaining bugs
- Generate Swagger API documentation
- Deploy frontend to Vercel
- Deploy backend to Render
- Configure CORS for production URLs
- Seed database with test accounts
- Prepare demo presentation

### Deliverables
- Fully functional deployed application
- API documentation accessible at /api-docs
- Test accounts working on production
- Demo presentation ready
