const Favorite = require('../models/Favorite');

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property ID is required' 
      });
    }

    await Favorite.add(userId, property_id);

    res.status(201).json({ 
      success: true, 
      message: 'Property added to favorites' 
    });
  } catch (error) {
    if (error.message === 'Property already in favorites') {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    console.error('Add favorite error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { propertyId } = req.params;

    await Favorite.remove(userId, propertyId);

    res.json({ 
      success: true, 
      message: 'Property removed from favorites' 
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const favorites = await Favorite.findByUserId(userId);

    res.json({ 
      success: true, 
      favorites 
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
