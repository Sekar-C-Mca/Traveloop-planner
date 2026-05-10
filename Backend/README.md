# Traveloop Backend API

Express.js + TypeScript REST API powering the Traveloop travel planning application.

## Tech Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **Auth**: JWT + bcryptjs
- **Validation**: Zod
- **CORS**: Configured for Next.js frontend on `http://localhost:3000`

## Environment Setup (.env)

**⚠️ REQUIRED: Create a `.env` file before running the backend**

### PostgreSQL Connection Configuration

Create a `.env` file in the `Backend/` directory with the following:

```env
# PostgreSQL Database Connection (REQUIRED)
DATABASE_URL=postgresql://username:password@localhost:5432/travelloop

# JWT Secret for Authentication (REQUIRED)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Environment
NODE_ENV=development
```

### Examples for Different PostgreSQL Providers

#### Local PostgreSQL
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/traveloop
```

#### Neon (Serverless PostgreSQL)
```env
DATABASE_URL=postgresql://user:password@ep-cool-shape-123.us-east-1.neon.tech/travelloop?sslmode=require
```

#### Railway or Similar
```env
DATABASE_URL=postgresql://user:password@railway.app:5432/railway
```

#### Supabase
```env
DATABASE_URL=postgresql://postgres.user:password@db.supabase.co:5432/postgres
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with DATABASE_URL and JWT_SECRET (see above)

# 3. Run migrations (creates tables in your PostgreSQL database)
npm run db:migrate

# 4. Seed database with cities, categories, activities
npm run db:seed

# 5. Start development server (hot reload)
npm run dev
```

API runs on **http://localhost:5000**

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | - | Register new user |
| POST | `/api/auth/login` | - | Login + get JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/users/me` | JWT | Get profile |
| PUT | `/api/users/me` | JWT | Update profile |
| GET | `/api/users/me/saved-destinations` | JWT | Saved cities |
| POST | `/api/users/me/saved-destinations` | JWT | Save a city |
| DELETE | `/api/users/me/saved-destinations/:cityId` | JWT | Remove saved city |
| GET | `/api/trips` | JWT | List trips |
| POST | `/api/trips` | JWT | Create trip |
| GET | `/api/trips/:id` | JWT | Get full trip (nested) |
| PUT | `/api/trips/:id` | JWT | Update trip |
| DELETE | `/api/trips/:id` | JWT | Delete trip |
| GET | `/api/trips/:tripId/stops` | JWT | List stops |
| POST | `/api/trips/:tripId/stops` | JWT | Add stop |
| PUT | `/api/trips/:tripId/stops/:stopId` | JWT | Update stop |
| DELETE | `/api/trips/:tripId/stops/:stopId` | JWT | Remove stop |
| POST | `/api/trips/:tripId/stops/reorder` | JWT | Reorder stops |
| GET | `/api/trips/stops/:stopId/activities` | JWT | Stop activities |
| POST | `/api/trips/stops/:stopId/activities` | JWT | Add activity to stop |
| DELETE | `/api/trips/stops/:stopId/activities/:id` | JWT | Remove activity |
| GET | `/api/trips/:tripId/budget` | JWT | Get budget + summary |
| PUT | `/api/trips/:tripId/budget` | JWT | Update budget |
| GET | `/api/trips/:tripId/checklist` | JWT | Get packing list |
| POST | `/api/trips/:tripId/checklist` | JWT | Add item |
| PATCH | `/api/trips/:tripId/checklist/:itemId` | JWT | Toggle packed |
| DELETE | `/api/trips/:tripId/checklist/:itemId` | JWT | Remove item |
| POST | `/api/trips/:tripId/checklist/reset` | JWT | Unpack all |
| GET | `/api/trips/:tripId/notes` | JWT | Get notes |
| POST | `/api/trips/:tripId/notes` | JWT | Create note |
| PUT | `/api/trips/:tripId/notes/:noteId` | JWT | Update note |
| DELETE | `/api/trips/:tripId/notes/:noteId` | JWT | Delete note |
| GET | `/api/cities` | Public | Browse cities |
| GET | `/api/cities/:id` | Public | City details |
| GET | `/api/cities/:id/activities` | Public | City activities |
| GET | `/api/activities` | Public | All activities |
| GET | `/api/activities/categories` | Public | Activity categories |
| GET | `/api/share/:token` | Public | View shared trip |
| POST | `/api/share/:token/copy` | JWT | Copy trip |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/trips` | Admin | All trips |

## Health Check

```
GET http://localhost:5000/health
```

## Frontend Connection

The Next.js frontend at `TravelLoop/Frontend` connects to this API via `NEXT_PUBLIC_API_URL=http://localhost:5000` (set in `.env.local`).

The `lib/api.ts` axios instance automatically attaches the JWT token from `localStorage` (`traveloop_token`) on every authenticated request.
