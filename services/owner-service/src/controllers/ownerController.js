const User = require('../models/UserModel');
const Property = require('../models/PropertyModel');
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
    const { firstName, lastName, phone, bio, businessName, businessLicense } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (businessName) updateData.businessName = businessName;
    if (businessLicense) updateData.businessLicense = businessLicense;

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

exports.getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    
    // Get owner's properties
    const properties = await Property.findByOwner(ownerId);
    
    // Get bookings for owner's properties
    const bookings = await Booking.findByOwner(ownerId);
    
    // Calculate statistics
    const totalProperties = properties.length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    const acceptedBookings = bookings.filter(b => b.status === 'ACCEPTED').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'ACCEPTED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const dashboard = {
      totalProperties,
      totalBookings,
      pendingBookings,
      acceptedBookings,
      totalRevenue,
      recentBookings: bookings.slice(0, 5)
    };

    res.json({ 
      success: true, 
      dashboard 
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
