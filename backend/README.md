# Nexus Platform Backend

Backend API for the Investor & Entrepreneur Collaboration Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

3. Required environment variables:
- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration (e.g., 7d)
- `PORT` - Server port (default: 5000)
- `CLIENT_URL` - Frontend URL (e.g., http://localhost:5173)

4. Start the development server:
```bash
npm run dev
```

5. Seed the database with demo users:
```bash
npm run seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

### Meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings` - Get user's meetings
- `GET /api/meetings/availability` - Check availability
- `PUT /api/meetings/:id/status` - Update meeting status
- `DELETE /api/meetings/:id` - Delete meeting

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user's documents
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents/:id/sign` - Sign document
- `DELETE /api/documents/:id` - Delete document

### Payments
- `POST /api/payments/deposit` - Deposit funds
- `POST /api/payments/withdraw` - Withdraw funds
- `POST /api/payments/transfer` - Transfer funds
- `GET /api/payments/transactions` - Get transaction history
- `GET /api/payments/balance` - Get balance

### Documentation
- `GET /api-docs` - Swagger API documentation

## Demo Accounts

After running the seeder:
- **Entrepreneur:** sarah@techwave.io / password123
- **Investor:** michael@vcinnovate.com / password123
