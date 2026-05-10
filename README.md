# TravelLoop - Travel Planning Application

TravelLoop is a full-stack travel planning application that helps users organize trips, manage budgets, create checklists, and share travel plans with others.

## Project Structure

### 📁 Frontend
- **Next.js 14** + TypeScript + React
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Location**: `/Frontend`
- **Purpose**: User-facing web application with responsive design
- **Features**:
  - User authentication (login/signup)
  - Trip management dashboard
  - City exploration
  - Budget tracking with visualizations
  - Packing checklists
  - Travel notes and journals
  - Trip sharing functionality
  - Admin dashboard

### 📁 Backend
- **Express.js** + TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **Location**: `/Backend`
- **Purpose**: REST API server handling all business logic and data management
- **Features**:
  - User authentication (JWT + bcrypt)
  - Trip CRUD operations
  - Activity management
  - Budget tracking
  - Checklist management
  - City search and data
  - Travel notes storage
  - Admin controls
  - Data validation with Zod

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon, local, or other)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   cd TravelLoop
   ```

2. **Environment Configuration (.env)**
   
   Create a `.env` file in the `Backend/` directory with the following PostgreSQL configuration:
   ```
   # PostgreSQL Connection
   DATABASE_URL=postgresql://username:password@host:port/database_name
   
   # JWT Secret (for authentication)
   JWT_SECRET=your_secret_key_here
   
   # Environment
   NODE_ENV=development
   ```
   
   **Example for Neon PostgreSQL:**
   ```
   DATABASE_URL=postgresql://user:password@ep-cool-shape-123.us-east-1.neon.tech/travelloop?sslmode=require
   ```

3. **Backend Setup**
   ```bash
   cd Backend
   npm install
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```
   API runs on `http://localhost:5000`

4. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
   Application runs on `http://localhost:3000`

## Running the Application

### Start Development Servers
```bash
# From project root
./run.sh
```

This will start both Frontend and Backend in development mode.

## API Documentation

See [Backend/README.md](Backend/README.md) for detailed API routes and endpoints.

## Tech Stack Summary

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript, PostgreSQL |
| Authentication | JWT + bcryptjs |
| Validation | Zod |
| Database ORM | Direct SQL queries (migrations-based) |
| UI Components | shadcn/ui |

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)

### Frontend (.env.local)
- API endpoint configuration (if needed)

## Project Links
- Frontend: `/Frontend` - Next.js application
- Backend: `/Backend` - Express API server
- Setup Script: `./setup.sh` - Project initialization
- Run Script: `./run.sh` - Start development servers
