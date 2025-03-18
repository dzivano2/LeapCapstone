require('dotenv').config({ path: './.env' }); // Specify the path explicitly

const express = require('express');
const cors = require('cors');
const connectDB = require('./DB');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const barRoutes = require('./routes/barRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const userRoutes = require('./routes/userRoutes');
const { router: queueRoutes, initializeSocket } = require('./routes/queueRoutes');
const { auth, isAdmin } = require('./middleware/authMiddleware');
const chatRoutes = require('./routes/chat');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Initialize Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://leapbackend.onrender.com'
    ],
    credentials: true,
  })
);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Simple route
app.get('/', (req, res) => res.send('API is running'));

// Signup route
app.post(
  '/signup',
  [
    body('username').not().isEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('dateOfBirth').not().isEmpty().withMessage('Date of birth is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, dateOfBirth, userType } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        username,
        email,
        password: hashedPassword,
        dateOfBirth,
        userType: userType || 'user',
      });

      await user.save();

      const token = await user.generateAuthToken();

      res.status(201).json({ msg: 'User registered successfully', token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = await user.generateAuthToken();

    res.json({ user, token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get authenticated user
app.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Bar routes
app.use('/api/bars', barRoutes);

// Chat routes
app.use('/api', chatRoutes);

// Employee routes
app.use('/api/employees', employeeRoutes);

// User routes
app.use('/api', userRoutes);

// Queue routes
app.use('/api/queue', queueRoutes);

// Start the server (Use Render-assigned PORT)
const PORT = process.env.PORT;

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// Initialize Socket.IO
initializeSocket(server);
