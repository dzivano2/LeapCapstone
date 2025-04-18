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
const barRoutes = require('./routes/barRoutes'); // Import the bar routes
const employeeRoutes = require('./routes/employeeRoutes'); // Import the employee routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const { router: queueRoutes, initializeSocket } = require('./routes/queueRoutes'); // Import queue routes and socket initializer
const { auth, isAdmin } = require('./middleware/authMiddleware'); // Import auth and isAdmin middleware
const chatRoutes = require('./routes/chat');
// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Hardcoded JWT secret key


// Initialize Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());
const allowedOrigins = [
  'https://leap-react-backup-r7qslsh8c-devens-projects-d02199ae.vercel.app', 
  /^https:\/\/leap-react-backup-.*-devens-projects-d02199ae\.vercel\.app$/,
  'http://localhost:3002'
];


app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  // Handle preflight OPTIONS requests globally
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

const corsOptions = {
  origin: ['https://leap-react-backup-r7qslsh8c-devens-projects-d02199ae.vercel.app', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Authorization'] // Add this to expose headers
};


app.use(cors(corsOptions)); // Apply CORS middleware


// Enable preflight OPTIONS requests
app.options('*', cors());

// ✅ Serve static files with open CORS for /uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // ✅ Open for static files
  next();
}, express.static(path.join(__dirname, 'uploads')));
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

    const { username, email, password, dateOfBirth, userType } = req.body; // Include userType from request payload
    console.log('Received userType:', userType); // Debugging: Check the value of userType

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new user with the specified userType
      user = new User({
        username,
        email,
        password: hashedPassword,
        dateOfBirth,
        userType: userType || 'user', // Default to 'user' if userType is not provided
      });

      await user.save();

      // Generate JWT token
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
    // Check if user exists
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
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

//ChatGPT routes
app.use('/api', chatRoutes);

// Employee routes
app.use('/api/employees', employeeRoutes);

// User routes
app.use('/api', userRoutes);

// Queue routes
app.use('/api/queue', queueRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Initialize Socket.IO
initializeSocket(server);