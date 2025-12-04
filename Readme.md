# 🌾 Farmer Connect

A comprehensive web application connecting farmers directly with buyers, featuring real-time communication, farm management tools, and intelligent weather integration.

![Farmer Connect](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Deployed](https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Weather Integration](#weather-integration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Farmer Connect is a full-stack web application designed to bridge the gap between farmers and buyers in Kenya. The platform enables farmers to showcase their produce, manage their farms digitally, and communicate directly with potential buyers, while providing buyers with a marketplace for fresh agricultural products.

### Key Benefits
- **For Farmers**: Digital farm management, direct buyer connections, weather-aware farming guidance
- **For Buyers**: Direct sourcing from farmers, fresh produce listings, communication tools
- **For Both**: Real-time chat, secure transactions, location-based matching

## ✨ Features

### 🧑‍🌾 Farmer Features
- **Farm Management**: Add and manage multiple farms with location data
- **Livestock Tracking**: Register and monitor animals with health records
- **Crop Management**: Track planting, growth, and harvesting schedules
- **Market Listings**: Create product listings with pricing and availability
- **Weather Integration**: Real-time weather data and farming alerts
- **Revenue Tracking**: Monitor sales and buyer engagement

### 🛒 Buyer Features
- **Product Discovery**: Browse available products from local farmers
- **Direct Communication**: Real-time chat with farmers
- **Purchase Offers**: Submit offers for products
- **Location Filtering**: Find farmers in specific regions
- **Institution Support**: Special features for schools, hospitals, restaurants

### 🔐 Authentication & Security
- **Secure User Registration**: Email verification and secure password hashing
- **Role-Based Access**: Separate interfaces for farmers and buyers
- **Protected Routes**: Route-level authentication guards
- **JWT Tokens**: Secure API authentication

### 🌤️ Weather Integration
- **Real-Time Weather**: Current conditions and 7-day forecasts
- **Smart Farming Alerts**: Weather-based farming recommendations
- **Agricultural Intelligence**: Temperature, humidity, and rainfall insights
- **Risk Assessment**: Weather-related farming risk warnings

### 💬 Communication
- **Real-Time Chat**: Socket.IO-powered instant messaging
- **Conversation Management**: Organized chat history
- **Buyer-Seller Matching**: Direct communication channels

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1**: Modern React with hooks and concurrent features
- **Vite 7.1.7**: Fast build tool and development server
- **Tailwind CSS 4.1.17**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **React Router 7.9.5**: Client-side routing
- **Socket.IO Client**: Real-time communication
- **Lucide React**: Beautiful icons

### Backend
- **Node.js**: JavaScript runtime
- **Express 5.1.0**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Socket.IO 4.8.1**: Real-time bidirectional communication
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **express-validator**: Input validation

### External Services
- **Open-Meteo API**: Free weather data service
- **Vercel**: Frontend deployment platform
- **Render**: Backend deployment platform
- **MongoDB Atlas**: Cloud database hosting

## 📁 Project Structure

```
farmer-connect/
├── backend/                    # Node.js/Express backend
│   ├── config/                # Database and socket configuration
│   │   ├── database.js        # MongoDB connection
│   │   └── socket.js          # Socket.IO setup
│   ├── middleware/            # Express middleware
│   │   ├── asyncWrapper.js    # Async error handling
│   │   ├── auth.js            # Authentication middleware
│   │   ├── errorHandler.js    # Global error handling
│   │   └── validators/        # Input validation schemas
│   ├── models/                # MongoDB data models
│   │   ├── animals.js         # Livestock model
│   │   ├── buyerOffer.js      # Buyer offer model
│   │   ├── chat.js            # Chat/messaging model
│   │   ├── crops.js           # Crops model
│   │   ├── farms.js           # Farm model
│   │   ├── marketListing.js   # Product listings model
│   │   ├── transaction.js     # Transaction model
│   │   └── users.js           # User model
│   ├── routes/                # API route definitions
│   │   ├── animalRoutes.js    # Livestock API
│   │   ├── buyerOfferRoutes.js # Buyer offers API
│   │   ├── chatRoutes.js      # Chat/messaging API
│   │   ├── cropRoutes.js      # Crops API
│   │   ├── farmRoutes.js      # Farm management API
│   │   ├── marketListingRoute.js # Marketplace API
│   │   └── userRoutes.js      # User management API
│   ├── server.js              # Main server entry point
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
├── frontend/                   # React/Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── ui/            # Base UI components (shadcn/ui)
│   │   │   ├── ChatModal.jsx  # Chat interface
│   │   │   ├── Layout.jsx     # App layout wrapper
│   │   │   ├── Navbar.jsx     # Navigation component
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── contexts/          # React context providers
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   ├── SocketContext.jsx  # Socket.IO connection
│   │   │   └── ThemeContext.jsx   # Theme management
│   │   ├── lib/               # Utility libraries
│   │   │   ├── API.js         # API client functions
│   │   │   ├── auth.js        # Authentication utilities
│   │   │   ├── locationUtils.js # Location helpers
│   │   │   ├── utils.js       # General utilities
│   │   │   └── weatherAPI.js  # Weather service integration
│   │   ├── pages/             # Main application pages
│   │   │   ├── dashboard.jsx  # User dashboard
│   │   │   ├── Home.jsx       # Landing page
│   │   │   ├── Login.jsx      # User login
│   │   │   ├── Marketplace.jsx # Product marketplace
│   │   │   ├── Messages.jsx   # Chat interface
│   │   │   ├── Profile.jsx    # User profile
│   │   │   ├── signup.jsx     # User registration
│   │   │   └── onboarding.jsx # User setup wizard
│   │   ├── data/              # Static data
│   │   │   └── kenyaSubcounties.js # Kenya location data
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # App entry point
│   │   └── index.css          # Global styles
│   ├── public/                # Static assets
│   │   ├── _redirects         # Vercel routing config
│   │   ├── counties.geojson   # Kenya counties geo data
│   │   └── sub_county.geojson # Kenya sub-counties geo data
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── vercel.json            # Vercel deployment config
│   └── .env                   # Environment variables
├── WEATHER_INTEGRATION.md     # Weather API documentation
├── TROUBLESHOOTING.md         # Issue resolution guide
├── IMPLEMENTATION_COMPLETE.md # Feature implementation notes
└── README.md                  # This file
```

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farmer-connect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

4. **Database Setup**
   - Ensure MongoDB is running locally, OR
   - Set up MongoDB Atlas and update connection string in backend/.env

### Environment Configuration

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ALLOWED_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
```

#### Frontend (.env)
```env
VITE_API_URI=http://localhost:5000
```

## ⚙️ Configuration

### API Configuration
- **Backend API**: Express server with RESTful endpoints
- **Frontend API Client**: Centralized API calls in `src/lib/API.js`
- **Socket.IO**: Real-time communication setup
- **Weather API**: Open-Meteo integration (no API key required)

### Database Models
- **Users**: Farmer and buyer profiles with authentication
- **Farms**: Farm locations and details
- **Animals**: Livestock records and health data
- **Crops**: Planting schedules and harvest tracking
- **Market Listings**: Product offerings and pricing
- **Buyer Offers**: Purchase requests and negotiations
- **Chat**: Real-time messaging between users
- **Transactions**: Purchase history and status

### Authentication Flow
1. User registration with email verification
2. Login returns JWT token
3. Token stored in local storage
4. Protected routes check authentication status
5. API requests include Bearer token

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy automatically on git push

### Backend Deployment (Render)
1. Connect repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Configure MongoDB Atlas connection

### Environment Variables (Production)

#### Vercel (Frontend)
```
VITE_API_URI=https://your-backend-url.onrender.com
```

#### Render (Backend)
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
ALLOWED_ORIGIN=https://your-frontend-url.vercel.app
JWT_SECRET=your_production_jwt_secret
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Farm Management
- `GET /api/farm` - Get user's farms
- `POST /api/farm` - Create new farm
- `PUT /api/farm/:id` - Update farm
- `DELETE /api/farm/:id` - Delete farm

### Livestock Management
- `GET /api/animal` - Get user's animals
- `POST /api/animal` - Add new animal
- `PUT /api/animal/:id` - Update animal
- `DELETE /api/animal/:id` - Remove animal

### Crop Management
- `GET /api/crop` - Get user's crops
- `POST /api/crop` - Add new crop
- `PUT /api/crop/:id` - Update crop
- `DELETE /api/crop/:id` - Remove crop

### Marketplace
- `GET /api/market-listings` - Get all listings
- `POST /api/market-listings` - Create listing
- `PUT /api/market-listings/:id` - Update listing
- `DELETE /api/market-listings/:id` - Delete listing

### Buyer Offers
- `GET /api/buyerOffer` - Get offers
- `POST /api/buyerOffer` - Create offer
- `PUT /api/buyerOffer/:id` - Update offer

### Chat/Messaging
- `GET /api/chat` - Get conversations
- `POST /api/chat/send` - Send message
- `GET /api/chat/conversation/:id` - Get conversation

## 🌤️ Weather Integration

The application includes comprehensive weather integration using Open-Meteo API:

### Features
- **Real-time weather data** for current conditions
- **7-day weather forecasts** for planning
- **Smart farming alerts** based on weather conditions
- **Agricultural recommendations** tailored to weather patterns

### Weather Alerts
- **Rainfall alerts**: Heavy rain warnings with farming advice
- **Heat alerts**: High temperature warnings for livestock care
- **Drought alerts**: Low humidity warnings for irrigation planning
- **Wind alerts**: Strong wind warnings for safe spraying

### Implementation
- **Service**: `src/lib/weatherAPI.js`
- **Integration**: Dashboard weather card and alerts
- **Data source**: Open-Meteo API (free, no authentication)
- **Caching**: Client-side caching for performance

## 🛠️ Development

### Development Commands

#### Backend
```bash
cd backend
npm run dev    # Start development server with nodemon
npm start      # Start production server
npm test       # Run tests (when implemented)
```

#### Frontend
```bash
cd frontend
npm run dev    # Start Vite development server
npm run build  # Build for production
npm run preview # Preview production build
npm run lint   # Run ESLint
```

### Code Style
- **ESLint**: JavaScript/React linting
- **Prettier**: Code formatting (recommended)
- **React Hooks**: Modern React patterns
- **Functional Components**: All components use hooks

### Database Management
- **Mongoose**: MongoDB ODM with schema validation
- **Connection**: Centralized database configuration
- **Models**: Separate models for each data type
- **Indexes**: Optimized queries with proper indexing

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login flow
- [ ] Farm creation and management
- [ ] Animal and crop tracking
- [ ] Market listing creation
- [ ] Real-time chat functionality
- [ ] Weather data display
- [ ] Mobile responsiveness
- [ ] Error handling and edge cases

### Browser Testing
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🔧 Troubleshooting

### Common Issues
1. **Dashboard 404 Error**: Ensure `vercel.json` and `_redirects` files are deployed
2. **Weather API Issues**: Check Open-Meteo service status
3. **Database Connection**: Verify MongoDB connection string
4. **Socket.IO Issues**: Check CORS configuration

### Debug Tools
- **Browser DevTools**: Console, Network, Application tabs
- **React DevTools**: Component inspection
- **MongoDB Compass**: Database visualization
- **Socket.IO Logger**: Real-time connection monitoring

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Guidelines
- Follow existing code style and patterns
- Add comments for complex functionality
- Test your changes in both frontend and backend
- Update documentation if needed
- Ensure responsive design compatibility

### Development Workflow
1. Create feature branch from main
2. Implement changes with proper testing
3. Update documentation if needed
4. Submit pull request with description
5. Code review and merge

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

### Documentation
- [Weather Integration Guide](WEATHER_INTEGRATION.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Implementation Notes](IMPLEMENTATION_COMPLETE.md)

### Getting Help
- Check the troubleshooting guide for common issues
- Review error messages in browser console
- Verify environment variable configuration
- Test API endpoints directly

### Reporting Issues
- Include steps to reproduce the issue
- Provide browser and device information
- Include error messages and console logs
- Describe expected vs actual behavior

---

## 🎉 Acknowledgments

- **Open-Meteo** for free weather data API
- **Vercel** and **Render** for hosting platforms
- **MongoDB** for database hosting
- **React** and **Node.js** communities
- **shadcn/ui** for beautiful UI components


