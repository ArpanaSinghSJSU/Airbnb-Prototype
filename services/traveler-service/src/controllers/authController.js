const User = require('../models/UserModel');
const { generateToken } = require('../middleware/jwtAuth');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Parse firstName and lastName from name
    const nameParts = name?.trim().split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (!firstName || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (!['traveler', 'owner'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be traveler or owner' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create new user (password will be automatically hashed by pre-save hook)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Will be hashed by UserModel pre-save hook
      role
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return user data without password
    const userData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profile_picture: user.profilePicture
    };

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is inactive. Please contact support.' 
      });
    }

    // Compare password using UserModel method
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return user data without password
    const userData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profile_picture: user.profilePicture
    };

    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

exports.logout = (req, res) => {
  // With JWT, logout is primarily handled client-side by removing the token
  // This endpoint can be used for logging or cleanup if needed
  res.json({ 
    success: true, 
    message: 'Logged out successfully. Please remove the token from client storage.' 
  });
};

exports.checkAuth = async (req, res) => {
  try {
    // req.user is populated by authenticateJWT middleware
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    // Fetch fresh user data from database
    const User = require('../models/UserModel');
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profile_picture: user.profilePicture
    };

    res.json({ 
      success: true, 
      user: userData
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking authentication' 
    });
  }
};

