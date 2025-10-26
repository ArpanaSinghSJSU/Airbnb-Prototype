const User = require('../models/User');
const Traveler = require('../models/Traveler');

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
    const { name, email, phone, about_me, city, country, languages, gender } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (about_me) updateData.about_me = about_me;
    if (city) updateData.city = city;
    if (country) updateData.country = country;
    if (languages) updateData.languages = languages;
    if (gender) updateData.gender = gender;

    await User.update(userId, updateData);

    if (name) req.session.user.name = name;
    if (email) req.session.user.email = email;

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

exports.getHistory = async (req, res) => {
  try {
    const travelerId = req.session.user.id;
    const history = await Traveler.getHistory(travelerId);

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
