const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const tutorialRoutes = require('./routes/tutorials');
const progressRoutes = require('./routes/progress');
const exerciseRoutes = require('./routes/exercises');
const adminRoutes = require('./routes/admin');
const quizRoutes = require('./routes/quizzes');
const chatRoutes = require('./routes/chat.routes');
const dashboardRoutes = require('./routes/dashboard');
const badgeRoutes = require('./routes/badges');
const BadgeService = require('./services/badgeService');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || 'https://your-client-url.vercel.app'  // Production origin
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'], // Development origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Initialize database connection
connectDB().catch(console.error);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/badges', badgeRoutes);

// Keep /api/modules for backward compatibility
app.use('/api/modules', exerciseRoutes);

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running successfully!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize badges
const initializeBadges = async () => {
  try {
    const Badge = require('./models/Badge').Badge;
    const badgeCount = await Badge.countDocuments();
    
    if (badgeCount < 18) {
      console.log('Initializing badge system...');
      await BadgeService.initializeDefaultBadges();
      const finalCount = await Badge.countDocuments();
      console.log(`✅ Badge system ready with ${finalCount} badges`);
    } else {
      console.log(`✅ Badge system ready with ${badgeCount} badges`);
    }
  } catch (error) {
    console.error('⚠️ Badge initialization failed:', error.message);
  }
};

// Initialize badges if we're connected to the database
if (mongoose.connection.readyState === 1) {
  initializeBadges();
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; 