const Favorite = require('../models/FavoriteModel');

exports.addFavorite = async (req, res) => {
  try {
    const travelerId = req.user.userId;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property ID is required' 
      });
    }

    // Check if already exists
    const exists = await Favorite.exists(travelerId, propertyId);
    if (exists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property already in favorites' 
      });
    }

    const favorite = await Favorite.create({ travelerId, propertyId });

    res.status(201).json({ 
      success: true, 
      message: 'Property added to favorites',
      favorite 
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const travelerId = req.user.userId;
    const { propertyId } = req.params;

    await Favorite.deleteOne({ travelerId, propertyId });

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
    const travelerId = req.user.userId;
    const favorites = await Favorite.findByTraveler(travelerId);

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
