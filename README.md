# ECG Intelligence - Corporate Travel & Event Planning Platform

## Overview

ECG Intelligence is a modern, full-stack platform for creating interactive, personalized proposal pages for corporate travel and event planning. Similar to Qwilr, it generates beautiful, shareable proposals based on structured inputs and AI-powered content generation.

## Architecture

```
ECG Intelligence/
├── frontend/           # React + Vite frontend
├── backend/           # Node.js + Express API
├── shared/            # Shared TypeScript types
├── database/          # PostgreSQL schema and migrations
└── render.yaml        # Render deployment configuration
```

## Features

### Admin Dashboard
- Create and manage proposals
- Multi-step form wizard for proposal creation
- View proposal analytics and history

### Default Login
- Email: `admin@eventconnectionsgroup.com`
- Password: `admin123`

### Client Proposal Viewer
- Beautiful, responsive proposal pages
- Interactive components with smooth animations
- Shareable links for clients

### AI Content Generation (Simulated)
- Generates personalized descriptions
- Creates compelling narratives for destinations
- Tailors content to event type and audience

## Setup

### GitHub Repository Setup
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ecg-intelligence.git
git push -u origin main
```

### Render Deployment - Using Blueprint

1. Fork/Push this code to your GitHub repository
2. Go to Render Dashboard
3. Click "New" → "Blueprint"
4. Connect your GitHub repo and select it
5. Render will detect the `render.yaml` file
6. Click "Apply"
7. Render will create all services automatically

### Render Deployment - Manual Setup

If you prefer manual setup:

#### 1. Database
- Create new PostgreSQL database
- Name: `ecg-intelligence-db`
- Copy connection string for backend

#### 2. Backend Web Service
- Create new Web Service
- Connect GitHub repo
- Name: `ecg-intelligence-api`
- Root Directory: Leave blank (repo root)
- Build Command: `cd backend && npm install && npm run build`
- Start Command: `cd backend && npm start`
- Add environment variables:
  - `NODE_ENV`: production
  - `DATABASE_URL`: (from step 1)
  - `JWT_SECRET`: (generate secure random string)
  - `FRONTEND_URL`: https://your-frontend-url.onrender.com

#### 3. Frontend Static Site
- Create new Static Site
- Connect same GitHub repo
- Name: `ecg-intelligence-app`
- Root Directory: Leave blank (repo root)
- Build Command: `cd frontend && npm install && npm run build`
- Publish Directory: `frontend/dist`
- Add environment variables:
  - `VITE_API_URL`: https://your-backend-url.onrender.com

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (optional for local development)
- npm or yarn

### Installation
```bash
# Install all dependencies
npm run install:all
```

### Development
```bash
# Run both frontend and backend
npm run dev

# Or run separately:
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev
```

## Usage

### Admin Flow
1. Login with admin credentials
2. Click "Create New Proposal"
3. Fill out the 9-step form wizard:
   - Client Information
   - Event Details
   - Destination Selection
   - Resort Choice
   - Room Types
   - Event Spaces
   - Dining Options
   - Travel & Flights
   - Branding & Review
4. Generate and share proposal

### Client Flow
1. Receive shareable link
2. View interactive proposal
3. Browse destination, resort, and amenity details
4. Contact for booking

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Proposals
- `GET /api/proposals` - List all proposals
- `GET /api/proposals/:id` - Get single proposal
- `POST /api/proposals` - Create proposal
- `PUT /api/proposals/:id` - Update proposal
- `DELETE /api/proposals/:id` - Delete proposal
- `POST /api/proposals/:id/publish` - Publish proposal
- `GET /api/proposals/share/:shareId` - Get proposal by share link

### Destinations & Data
- `GET /api/destinations` - List destinations
- `GET /api/destinations/:id/resorts` - Get resorts for destination
- `GET /api/destinations/resorts/:id/rooms` - Get rooms for resort
- `GET /api/destinations/resorts/:id/spaces` - Get event spaces
- `GET /api/destinations/resorts/:id/dining` - Get dining options
- `GET /api/destinations/:id/flights` - Get flight routes

## Mock Data

The platform includes comprehensive mock data for:
- 3 Destinations (Los Cabos, Maui, Nassau)
- 2-3 Resorts per destination
- Multiple room types per resort
- Event spaces with various capacities
- Dining options with different cuisines
- Flight routes from major cities

## Technologies

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios
- CSS Modules
- Lucide Icons

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT Authentication
- Bcrypt

### Deployment
- Render (Web Services + Database)
- GitHub Actions (optional CI/CD)

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variable protection
- SQL injection prevention

## Future Enhancements

- [ ] Real AI integration (OpenAI/Anthropic)
- [ ] PDF export functionality
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Payment integration
- [ ] Calendar integration
- [ ] Mobile app

## License

MIT

## Support

For questions or support, contact: support@eventconnectionsgroup.com 