# TravelLoop Frontend

Modern, responsive web application built with Next.js for managing and planning travel trips.

## Overview

The Frontend is a Next.js 14 application that provides a user-friendly interface for the TravelLoop travel planning platform. Users can create trips, manage budgets, organize checklists, explore cities, and share travel plans with others.

## Tech Stack
- **Framework**: Next.js 14 + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Package Manager**: npm
- **Deployment**: Netlify (configured in netlify.toml)

## Project Structure

```
app/
├── (auth)/          - Authentication pages (login, signup)
├── (app)/           - Protected app pages (require authentication)
│   ├── dashboard/   - Main dashboard
│   ├── explore/     - City exploration
│   ├── journal/     - Travel notes/journal
│   ├── packing/     - Packing checklists
│   ├── settings/    - User settings
│   └── trips/       - Trip management
├── (admin)/         - Admin panel (admin-only)
├── share/           - Public trip sharing page
└── globals.css      - Global styles

components/
├── admin/           - Admin-specific components
├── charts/          - Data visualization components
├── layout/          - Layout components (sidebar, auth guard)
├── trip/            - Trip-related components (cards, displays)
└── ui/              - Reusable UI components (button, card, modal, etc.)

hooks/
├── use-auth.ts      - Authentication hook
├── use-cities.ts    - Cities data hook
├── use-toast.ts     - Toast notifications
└── use-trip.ts      - Trip management hook

lib/
├── api.ts           - API client setup
├── api-hooks.ts     - Custom hooks for API calls
└── utils.ts         - Utility functions

store/
├── auth.ts          - Authentication state
├── trip.ts          - Trip state management
└── ui.ts            - UI state management

types/
└── index.ts         - TypeScript type definitions
```

## Quick Start

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Application runs on `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

### Key Features

- **User Authentication**: Secure login/signup with JWT
- **Trip Management**: Create, edit, delete trips with dates and details
- **Budget Tracking**: Track expenses and visualize spending with charts
- **Checklists**: Organize packing lists and task checklists
- **City Explorer**: Search and discover cities worldwide
- **Travel Notes**: Keep travel journal and notes
- **Trip Sharing**: Generate shareable links for trip plans
- **Admin Dashboard**: Admin users can manage users and trips (analytics pending)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Configuration

### Environment Variables (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### TypeScript
- `tsconfig.json` - TypeScript configuration
- `next-env.d.ts` - Next.js type definitions

### UI Framework
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

## Connecting to Backend

The Frontend communicates with the Backend API running on `http://localhost:5000`. 

API hooks are managed in:
- `lib/api.ts` - Base API client
- `lib/api-hooks.ts` - Custom React hooks for API calls

## Building & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Netlify
```bash
# Configuration is already in netlify.toml
npm run build
# Deploy the .next directory
```

## Related
- Backend API: `../Backend/` - Express.js API server
- Main Project: `../README.md` - Project documentation
