const User = require('../models/User');
const Owner = require('../models/Owner');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    delete user.password;
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
    const userId = req.session.user.id;
    const { name, phone, city, country, about_me } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (city) updateData.city = city;
    if (country) updateData.country = country;
    if (about_me) updateData.about_me = about_me;

    await User.update(userId, updateData);

    if (name) req.session.user.name = name;

    res.json({ 
      success: true, 
      message: 'Profile updated successfully' 
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

    const userId = req.session.user.id;
    const profilePicture = `/uploads/profiles/${req.file.filename}`;

    await User.update(userId, { profile_picture: profilePicture });

    // Update session with new profile picture
    req.session.user.profile_picture = profilePicture;

    res.json({ 
      success: true, 
      message: 'Profile picture uploaded successfully',
      profilePicture 
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
    const ownerId = req.session.user.id;
    const dashboard = await Owner.getDashboard(ownerId);

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
