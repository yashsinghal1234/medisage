const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// MongoDB connection (graceful fallback)
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medisage';
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('🌿 MongoDB connected successfully to MediSage database'))
  .catch((err) => {
    console.warn('⚠️ MongoDB connection warning (Running in memory/local fallback mode):', err.message);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/ai', require('./routes/ai'));

// Health check root route
app.get('/', (req, res) => {
  res.json({
    name: 'MediSage Clinical API',
    status: 'online',
    version: '2.0.0',
    theme: 'Ease Health — Botanical greenhouse on cream paper',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌿 MediSage Server listening on http://localhost:${PORT}`);
});

module.exports = app;
