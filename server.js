const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gettix', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/manager', require('./routes/manager'));
app.use('/api/upload', require('./routes/upload'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Seed default manager user if not exists
  const User = require('./models/User');
  (async () => {
    try {
      const existing = await User.findOne({ username: 'neal' });
      if (!existing) {
        const user = new User({
          username: 'neal',
          email: 'neal@example.com',
          password: '24552455',
          role: 'manager'
        });
        await user.save();
        console.log('Seeded default manager user: neal / 24552455');
      } else {
        let changed = false;
        if (existing.role !== 'manager') {
          existing.role = 'manager';
          changed = true;
        }
        if (existing.email !== 'neal@example.com') {
          existing.email = 'neal@example.com';
          changed = true;
        }
        // Always ensure known password for debug/login convenience
        existing.password = '24552455';
        changed = true;
        if (changed) {
          await existing.save();
          console.log('Updated existing user neal (role/email/password)');
        }
      }
    } catch (e) {
      console.error('Error seeding default manager user:', e.message);
    }
  })();
});
