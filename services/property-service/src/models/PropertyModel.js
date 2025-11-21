const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Property name is required'],
    trim: true,
    maxlength: [200, 'Property name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  // Structured location fields for precise search
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State/Province is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'USA'
  },
  zipcode: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: [0, 'Bathrooms cannot be negative']
  },
  maxGuests: {
    type: Number,
    required: [true, 'Maximum guests is required'],
    min: [1, 'Must accommodate at least 1 guest']
  },
  photos: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Photos must be an array of strings'
    }
  },
  amenities: {
    type: [String],
    default: []
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'villa', 'cabin', 'other'],
    default: 'apartment'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for search performance
propertySchema.index({ city: 1, state: 1 });
propertySchema.index({ zipcode: 1 });
propertySchema.index({ pricePerNight: 1 });
propertySchema.index({ ownerId: 1 });
propertySchema.index({ isAvailable: 1 });

// Virtual for owner details
propertySchema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true
});

// Static method to find by owner
propertySchema.statics.findByOwner = function(ownerId) {
  return this.find({ ownerId });
};

// Static method to search properties
propertySchema.statics.search = function(filters = {}) {
  const query = { isAvailable: true };
  
  // Search by city, state, or general location string
  if (filters.location) {
    const locationRegex = new RegExp(filters.location, 'i');
    query.$or = [
      { city: locationRegex },
      { state: locationRegex }
    ];
  }
  
  if (filters.city) {
    query.city = new RegExp(filters.city, 'i');
  }
  
  if (filters.state) {
    query.state = new RegExp(filters.state, 'i');
  }
  
  if (filters.zipcode) {
    query.zipcode = filters.zipcode;
  }
  
  if (filters.minPrice !== undefined) {
    query.pricePerNight = { ...query.pricePerNight, $gte: filters.minPrice };
  }
  
  if (filters.maxPrice !== undefined) {
    query.pricePerNight = { ...query.pricePerNight, $lte: filters.maxPrice };
  }
  
  if (filters.bedrooms) {
    query.bedrooms = { $gte: filters.bedrooms };
  }
  
  if (filters.maxGuests) {
    query.maxGuests = { $gte: filters.maxGuests };
  }
  
  return this.find(query);
};

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;

