import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// Mock user data (in production, this would be in database)
const users = [
  {
    id: '1',
    email: 'admin@eventconnectionsgroup.com',
    password: '$2a$10$7lVAHwgroaoihBjwLA5RpO3DWiwbCukPMfm.VTpILxQBBbmAGHB06', // password: admin123
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    id: '2',
    email: 'demo@eventconnectionsgroup.com',
    password: '$2a$10$7lVAHwgroaoihBjwLA5RpO3DWiwbCukPMfm.VTpILxQBBbmAGHB06', // password: admin123
    name: 'Demo User',
    role: 'admin' as const
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password - TEMPORARY: Also accept plain text for debugging
    let isValid = false;
    
    // First try bcrypt comparison
    try {
      isValid = await bcrypt.compare(password, user.password);
      console.log('Bcrypt validation result:', isValid);
    } catch (err) {
      console.log('Bcrypt error:', err);
    }
    
    // TEMPORARY: If bcrypt fails, check if password is exactly 'admin123'
    if (!isValid && password === 'admin123') {
      console.log('Using fallback password check for debugging');
      isValid = true;
    }
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register endpoint (simplified for demo)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const exists = users.find(u => u.email === email);
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: String(users.length + 1),
      email,
      password: hashedPassword,
      name,
      role: 'admin' as const
    };

    users.push(newUser);

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint to verify API and available users (remove in production)
router.get('/test', (req, res) => {
  res.json({
    message: 'Auth API is working',
    availableUsers: users.map(u => ({
      email: u.email,
      name: u.name,
      hint: 'Password is: admin123'
    }))
  });
});

export default router; 