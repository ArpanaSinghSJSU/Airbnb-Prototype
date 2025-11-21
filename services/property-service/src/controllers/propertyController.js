const Property = require('../models/PropertyModel');
const Booking = require('../models/BookingModel');
const User = require('../models/UserModel');

exports.createProperty = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { name, propertyType, description, location, pricePerNight, bedrooms, bathrooms, maxGuests, amenities } = req.body;

    if (!name || !location || !pricePerNight || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, location, description, and price are required' 
      });
    }

    // Process uploaded photos
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      photoUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
    }

    // Handle amenities - ensure it's an array
    let amenitiesData = [];
    if (amenities) {
      if (typeof amenities === 'string') {
        try {
          amenitiesData = JSON.parse(amenities);
        } catch (e) {
          amenitiesData = [amenities];
        }
      } else if (Array.isArray(amenities)) {
        amenitiesData = amenities;
      }
    }

    const property = await Property.create({
      ownerId,
      name,
      propertyType: propertyType || 'apartment',
      description,
      location,
      pricePerNight: parseFloat(pricePerNight),
      bedrooms: parseInt(bedrooms) || 1,
      bathrooms: parseInt(bathrooms) || 1,
      maxGuests: parseInt(maxGuests) || 1,
      amenities: amenitiesData,
      photos: photoUrls
    });

    res.status(201).json({ 
      success: true, 
      message: 'Property created successfully',
      property 
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error while creating property' 
    });
  }
};

exports.getOwnerProperties = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const properties = await Property.findByOwner(ownerId);

    res.json({ 
      success: true, 
      properties,
      count: properties.length
    });
  } catch (error) {
    console.error('Get owner properties error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching properties' 
    });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).populate('ownerId', 'firstName lastName email profilePicture');

    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    res.json({ 
      success: true, 
      property 
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching property' 
    });
  }
};

exports.searchProperties = async (req, res) => {
  try {
    const { location, start_date, end_date, guests } = req.query;

    const filters = {};
    if (location) filters.location = location;
    if (guests) filters.maxGuests = parseInt(guests);

    let properties = await Property.search(filters);

    if (start_date && end_date) {
      const availableProperties = [];
      
      for (const property of properties) {
        const isAvailable = await Booking.checkAvailability(
          property._id,
          new Date(start_date),
          new Date(end_date)
        );
        
        if (isAvailable) {
          availableProperties.push(property);
        }
      }
      
      properties = availableProperties;
    }

    res.json({ 
      success: true, 
      properties,
      count: properties.length,
      filters: {
        location: location || 'all',
        start_date: start_date || null,
        end_date: end_date || null,
        guests: guests || 'any'
      }
    });
  } catch (error) {
    console.error('Search properties error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while searching properties' 
    });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.userId;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    if (property.ownerId.toString() !== ownerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized. You can only update your own properties' 
      });
    }

    const { name, propertyType, description, location, pricePerNight, bedrooms, bathrooms, maxGuests, amenities } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (propertyType !== undefined) updateData.propertyType = propertyType;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (pricePerNight !== undefined) updateData.pricePerNight = parseFloat(pricePerNight);
    if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms);
    if (bathrooms !== undefined) updateData.bathrooms = parseInt(bathrooms);
    if (maxGuests !== undefined) updateData.maxGuests = parseInt(maxGuests);
    if (amenities !== undefined) {
      if (typeof amenities === 'string') {
        try {
          updateData.amenities = JSON.parse(amenities);
        } catch (e) {
          updateData.amenities = [amenities];
        }
      } else if (Array.isArray(amenities)) {
        updateData.amenities = amenities;
      }
    }

    // Handle new photo uploads (append to existing photos)
    if (req.files && req.files.length > 0) {
      const newPhotoUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
      const existingPhotos = property.photos || [];
      updateData.photos = [...existingPhotos, ...newPhotoUrls];
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.json({ 
      success: true, 
      message: 'Property updated successfully',
      property: updatedProperty 
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating property' 
    });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.userId;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    if (property.ownerId.toString() !== ownerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized. You can only delete your own properties' 
      });
    }

    await Property.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'Property deleted successfully' 
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting property' 
    });
  }
};

exports.uploadPropertyPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.userId;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    if (property.ownerId.toString() !== ownerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized. You can only upload photos to your own properties' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    const photoUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
    const existingPhotos = property.photos || [];
    const updatedPhotos = [...existingPhotos, ...photoUrls];

    const updatedProperty = await Property.findByIdAndUpdate(
      id, 
      { photos: updatedPhotos },
      { new: true }
    );

    res.json({ 
      success: true, 
      message: 'Photos uploaded successfully',
      photos: updatedPhotos,
      newPhotos: photoUrls,
      property: updatedProperty
    });
  } catch (error) {
    console.error('Upload property photos error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while uploading photos' 
    });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.search({});

    res.json({ 
      success: true, 
      properties,
      count: properties.length
    });
  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching properties' 
    });
  }
};