const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  travelerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Traveler ID is required']
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property ID is required']
  },
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(value) {
        return value > this.checkInDate;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'Must have at least 1 guest']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING'
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters'],
    default: null
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
    default: null
  },
  cancelledBy: {
    type: String,
    enum: ['traveler', 'owner', null],
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bookingSchema.index({ travelerId: 1 });
bookingSchema.index({ propertyId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

// Virtual for traveler details
bookingSchema.virtual('traveler', {
  ref: 'User',
  localField: 'travelerId',
  foreignField: '_id',
  justOne: true
});

// Virtual for property details
bookingSchema.virtual('property', {
  ref: 'Property',
  localField: 'propertyId',
  foreignField: '_id',
  justOne: true
});

// Virtual for number of nights
bookingSchema.virtual('nights').get(function() {
  const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Static method to find by traveler
bookingSchema.statics.findByTraveler = function(travelerId, status = null) {
  const query = { travelerId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('property');
};

// Static method to find by property
bookingSchema.statics.findByProperty = function(propertyId, status = null) {
  const query = { propertyId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('traveler');
};

// Static method to find by owner (through property)
bookingSchema.statics.findByOwner = async function(ownerId, status = null) {
  const Property = mongoose.model('Property');
  const properties = await Property.find({ ownerId });
  const propertyIds = properties.map(p => p._id);
  
  const query = { propertyId: { $in: propertyIds } };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate(['traveler', 'property']);
};

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(propertyId, checkIn, checkOut) {
  const overlappingBookings = await this.find({
    propertyId,
    status: { $in: ['PENDING', 'ACCEPTED'] },
    $or: [
      {
        checkInDate: { $lte: checkIn },
        checkOutDate: { $gt: checkIn }
      },
      {
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gte: checkOut }
      },
      {
        checkInDate: { $gte: checkIn },
        checkOutDate: { $lte: checkOut }
      }
    ]
  });
  
  return overlappingBookings.length === 0;
};

// Instance method to cancel booking
bookingSchema.methods.cancel = function(cancelledBy, reason = null) {
  this.status = 'CANCELLED';
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Instance method to accept booking
bookingSchema.methods.accept = function() {
  this.status = 'ACCEPTED';
  return this.save();
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

