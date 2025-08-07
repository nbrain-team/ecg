# EventIntel - Corporate Travel & Event Planning Platform

## 🚀 Overview

EventIntel is a modern, full-stack platform for creating interactive, personalized proposal pages for corporate travel and event planning. Similar to Qwilr, it generates beautiful, shareable proposals based on structured inputs and data.

## 🏗 Architecture

```
EventIntel/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Express + TypeScript + PostgreSQL
├── shared/            # Shared TypeScript types
└── database/          # PostgreSQL schemas
```

## ✨ Features

- **Admin Dashboard**: Multi-step proposal builder
- **Client Viewer**: Interactive, shareable proposal pages
- **Mock Data**: Pre-populated destinations, resorts, dining
- **AI Generation**: Dynamic content creation
- **Responsive Design**: Mobile-friendly interface

## 🔑 Default Login

- Email: `admin@eventintel.com`
- Password: `admin123`

## 🚀 Deployment to Render

### Prerequisites
1. GitHub account
2. Render account
3. Push this code to your GitHub repository

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/eventintel.git
git push -u origin main
```

### Step 2: Deploy to Render

#### Option A: Using render.yaml (Recommended)
1. Update `render.yaml` with your GitHub repo URL
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repo
5. Render will auto-detect `render.yaml` and create all services

#### Option B: Manual Setup
1. **Create PostgreSQL Database**:
   - New → PostgreSQL
   - Name: `eventintel-db`
   - Choose region
   - Create Database

2. **Deploy Backend**:
   - New → Web Service
   - Connect GitHub repo
   - Name: `eventintel-api`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables:
     - `NODE_ENV` = `production`
     - `JWT_SECRET` = (generate a secure key)
     - `DATABASE_URL` = (copy from PostgreSQL)
     - `FRONTEND_URL` = `https://your-frontend.onrender.com`

3. **Deploy Frontend**:
   - New → Static Site
   - Connect GitHub repo
   - Name: `eventintel-app`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add environment variable:
     - `VITE_API_URL` = `https://your-backend.onrender.com`

### Step 3: Initialize Database

After backend is deployed, run the schema:

1. Go to your PostgreSQL dashboard on Render
2. Click "Connect" → "PSQL Command"
3. Copy the command and run locally:
```bash
psql [connection-string] < database/schema.sql
```

## 🛠 Local Development (Optional)

```bash
# Install dependencies
npm run install:all

# Set up .env files
cp env.example backend/.env
cp env.example frontend/.env

# Run development servers
npm run dev
```

## 📱 Using the Platform

### Creating a Proposal

1. **Login** with default credentials
2. Click **"Create New Proposal"**
3. Complete the multi-step form:
   - Client Information
   - Event Details
   - Select Destination
   - Choose Resort
   - Pick Room Types
   - Select Event Spaces
   - Choose Dining Options
   - Set Branding
4. Click **"Generate Proposal"**
5. Share the link with clients

### Viewing Proposals

- Clients receive a shareable link
- No login required for viewing
- Interactive, scrollable design
- Mobile-responsive layout

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`

### Destinations
- `GET /api/destinations`
- `GET /api/destinations/:id`
- `GET /api/destinations/:id/resorts`
- `GET /api/destinations/:id/flights`

### Proposals
- `GET /api/proposals`
- `POST /api/proposals`
- `GET /api/proposals/:id`
- `PUT /api/proposals/:id`
- `POST /api/proposals/:id/publish`
- `GET /api/proposals/share/:shareId`

## 📊 Mock Data

The platform includes realistic mock data for:
- **3 Destinations**: Los Cabos, Maui, Nassau
- **6 Resorts**: 2 per destination
- **Room Types**: Multiple options per resort
- **Event Spaces**: Ballrooms, meeting rooms
- **Dining Options**: Various cuisines
- **Flight Routes**: Major US cities

## 🎨 Customization

### Branding Themes
- Modern
- Classic
- Vibrant
- Minimal

### Color Schemes
- Customizable primary/secondary colors
- Logo upload support

## 🔒 Security

- JWT authentication
- Bcrypt password hashing
- Environment variable configuration
- CORS protection
- SQL injection prevention

## 📈 Future Enhancements

- [ ] Real-time collaboration
- [ ] PDF export
- [ ] Email integration
- [ ] Analytics dashboard
- [ ] Payment integration
- [ ] Multi-language support

## 🤝 Support

For issues or questions, please create a GitHub issue.

## 📄 License

ISC License

---

**Built with ❤️ for the event planning industry** 