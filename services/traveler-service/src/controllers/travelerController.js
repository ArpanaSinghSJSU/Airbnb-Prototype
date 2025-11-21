const User = require('../models/UserModel');
const Booking = require('../models/BookingModel');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, email, phone, bio, dateOfBirth, favoriteDestinations } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (favoriteDestinations) updateData.favoriteDestinations = favoriteDestinations;

    const user = await User.findByIdAndUpdate(userId, updateData, { 
      new: true, 
      runValidators: true 
    }).select('-password');

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const userId = req.user.userId;
    const profilePicture = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId, 
      { profilePicture }, 
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Profile picture uploaded successfully',
      profilePicture,
      user 
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const travelerId = req.user.userId;
    const history = await Booking.findByTraveler(travelerId, 'COMPLETED');

    res.json({ 
      success: true, 
      history 
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get traveler bookings (moved from booking controller)
exports.getBookings = async (req, res) => {
  try {
    const travelerId = req.user.userId;
    const bookings = await Booking.findByTraveler(travelerId);

    res.json({ 
      success: true, 
      bookings 
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

