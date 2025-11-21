const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  travelerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Traveler ID is required']
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property ID is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure unique traveler-property combinations
favoriteSchema.index({ travelerId: 1, propertyId: 1 }, { unique: true });

// Index for queries
favoriteSchema.index({ travelerId: 1 });
favoriteSchema.index({ propertyId: 1 });

// Virtual for property details
favoriteSchema.virtual('property', {
  ref: 'Property',
  localField: 'propertyId',
  foreignField: '_id',
  justOne: true
});

// Static method to find by traveler
favoriteSchema.statics.findByTraveler = function(travelerId) {
  return this.find({ travelerId }).populate('property');
};

// Static method to check if favorite exists
favoriteSchema.statics.exists = async function(travelerId, propertyId) {
  const favorite = await this.findOne({ travelerId, propertyId });
  return !!favorite;
};

// Static method to toggle favorite
favoriteSchema.statics.toggle = async function(travelerId, propertyId) {
  const favorite = await this.findOne({ travelerId, propertyId });
  
  if (favorite) {
    // Remove favorite
    await favorite.deleteOne();
    return { action: 'removed', favorite: null };
  } else {
    // Add favorite
    const newFavorite = await this.create({ travelerId, propertyId });
    return { action: 'added', favorite: newFavorite };
  }
};

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;

