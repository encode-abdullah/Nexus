# Development Rules & Conventions

## Language & Framework
- **Frontend:** React 18 with TypeScript (strict mode enabled)
- **Backend:** Node.js with Express and TypeScript (strict mode enabled)
- **Build tools:** Vite (frontend), tsc (backend)
- **Styling:** Tailwind CSS with utility-first approach
- **Database:** MongoDB with Mongoose ODM

## Code Style

### General
- Use functional components with hooks (no class components)
- Use named exports for components and routes
- Use default exports only for page-level components and route handlers
- Follow the existing file and folder naming conventions (PascalCase for components, camelCase for utilities)

### TypeScript
- Always type props, state, and function parameters
- Use interfaces for component props and API responses
- Avoid `any` type unless absolutely necessary (prefer `unknown` or specific types)
- Use the `AuthRequest` interface for protected route handlers

### Frontend Conventions
- All page components go in `src/pages/<feature>/`
- Reusable UI components go in `src/components/ui/`
- Layout components go in `src/components/layout/`
- Feature-specific cards go in `src/components/<feature>/`
- Context providers go in `src/context/`
- Use the existing `api` instance from `src/lib/api.ts` for all HTTP requests
- Handle errors with `react-hot-toast` notifications
- Use `dark:` Tailwind prefixes for dark mode support on all visible elements

### Backend Conventions
- Controllers go in `src/controllers/` (one file per feature)
- Routes go in `src/routes/` (one file per feature)
- Models go in `src/models/` (one file per entity)
- Middleware goes in `src/middleware/`
- Utilities go in `src/utils/`
- All route handlers must use the `auth` middleware for protected endpoints
- Use `express-validator` for input validation
- Return consistent JSON error responses: `{ error: "message" }`

## Libraries to Use
| Purpose | Library |
|---|---|
| HTTP requests | Axios (via `src/lib/api.ts`) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| File uploads | React Dropzone (frontend), Multer (backend) |
| Date handling | date-fns |
| Authentication | JWT (jsonwebtoken) |
| Password hashing | bcrypt |
| Input validation | express-validator |
| API docs | swagger-jsdoc + swagger-ui-express |
| Security headers | Helmet |
| Rate limiting | express-rate-limit |
| Real-time | Socket.IO |

## Libraries to Avoid
- Do not add Redux or other global state libraries (React Context is sufficient for this project)
- Do not add UI component libraries like Material UI, Chakra, or Ant Design (use the existing custom components in `src/components/ui/`)
- Do not add CSS-in-JS libraries (use Tailwind classes)
- Do not add Axios alternatives (e.g., fetch wrappers, ky, got)
- Do not add additional authentication libraries (the JWT setup is already in place)

## Error Handling

### Frontend
- API call errors are caught in try/catch blocks
- Display user-friendly messages with `toast.error()`
- The response interceptor in `src/lib/api.ts` handles 401 errors globally (redirects to login)

### Backend
- All controller functions wrap logic in try/catch blocks
- Return appropriate HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad request / validation error
  - 401: Not authenticated
  - 403: Insufficient permissions
  - 404: Resource not found
  - 500: Internal server error
- Log errors to console for debugging
- Use the `errorHandler` middleware for unhandled errors

## Dark Mode
- Tailwind dark mode is set to `class` strategy
- Global dark mode overrides are defined in `src/index.css`
- Every visible element must include `dark:` variant classes
- Test both light and dark mode before committing changes

## Environment Variables

### Frontend (.env)
| Variable | Description |
|---|---|
| VITE_API_URL | Backend API base URL (e.g., http://localhost:5000/api) |

### Backend (.env)
| Variable | Description |
|---|---|
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for JWT signing |
| JWT_EXPIRES_IN | Token expiry duration |
| CLIENT_URL | Frontend URL for CORS |
| PORT | Server port |
| UPLOAD_DIR | Directory for uploaded files |
| MAX_FILE_SIZE | Maximum upload size in bytes |

## Git & Deployment
- Commit messages should be concise and descriptive
- Never commit `.env` files or `node_modules`
- Frontend deploys automatically to Vercel on push to `main`
- Backend deploys automatically to Render on push to `main`
- Test locally before pushing: `npm run dev` (frontend), `npm run dev` (backend)

## AI Boundaries
- AI tools should not generate entire features from scratch without human review
- AI should not modify environment variables or deployment configuration
- AI should not install new dependencies without explicit approval
- AI should follow the existing code patterns and conventions in the project
- AI-generated code must be reviewed for security vulnerabilities before merging
