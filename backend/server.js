const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Lost and Found API Running...');
});

// MongoDB Connection + Server Start
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB Connected');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

startServer();