const Property = require('../models/Property');
const Booking = require('../models/Booking');

exports.createProperty = async (req, res) => {
  try {
    const ownerId = req.session.user.id;
    const { name, type, description, location, price_per_night, bedrooms, bathrooms, max_guests, amenities } = req.body;

    if (!name || !location || !price_per_night) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, location, and price are required' 
      });
    }

    // Process uploaded photos
    let photoUrls = null;
    if (req.files && req.files.length > 0) {
      photoUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
      photoUrls = JSON.stringify(photoUrls);
    }

    // Handle amenities - if it's already a JSON string, use it as-is; otherwise stringify it
    let amenitiesData = null;
    if (amenities) {
      try {
        // Try to parse it - if it parses, it's already a JSON string, so use as-is
        JSON.parse(amenities);
        amenitiesData = amenities;
      } catch (e) {
        // If parsing fails, it's an array or object, so stringify it
        amenitiesData = JSON.stringify(amenities);
      }
    }

    const propertyId = await Property.create({
      owner_id: ownerId,
      name,
      type: type || null,
      description: description || null,
      location,
      price_per_night,
      bedrooms: bedrooms || null,
      bathrooms: bathrooms || null,
      max_guests: max_guests || null,
      amenities: amenitiesData,
      photos: photoUrls
    });

    res.status(201).json({ 
      success: true, 
      message: 'Property created successfully',
      propertyId 
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating property' 
    });
  }
};

exports.getOwnerProperties = async (req, res) => {
  try {
    const ownerId = req.session.user.id;
    const properties = await Property.findByOwnerId(ownerId);

    const parsedProperties = properties.map(property => ({
      ...property,
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      photos: property.photos ? JSON.parse(property.photos) : []
    }));

    res.json({ 
      success: true, 
      properties: parsedProperties,
      count: parsedProperties.length
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
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    const parsedProperty = {
      ...property,
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      photos: property.photos ? JSON.parse(property.photos) : []
    };

    res.json({ 
      success: true, 
      property: parsedProperty 
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
    if (guests) filters.guests = parseInt(guests);

    let properties = await Property.search(filters);

    if (start_date && end_date) {
      const availableProperties = [];
      
      for (const property of properties) {
        const isAvailable = await Booking.checkAvailability(
          property.id,
          start_date,
          end_date
        );
        
        if (isAvailable) {
          availableProperties.push(property);
        }
      }
      
      properties = availableProperties;
    }

    const parsedProperties = properties.map(property => ({
      ...property,
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      photos: property.photos ? JSON.parse(property.photos) : []
    }));

    res.json({ 
      success: true, 
      properties: parsedProperties,
      count: parsedProperties.length,
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
    const ownerId = req.session.user.id;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    if (property.owner_id !== ownerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized. You can only update your own properties' 
      });
    }

    const { name, type, description, location, price_per_night, bedrooms, bathrooms, max_guests, amenities } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (price_per_night !== undefined) updateData.price_per_night = price_per_night;
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
    if (bathrooms !== undefined) updateData.bathrooms = bathrooms;
    if (max_guests !== undefined) updateData.max_guests = max_guests;
    if (amenities !== undefined) {
      try {
        // Try to parse it - if it parses, it's already a JSON string
        JSON.parse(amenities);
        updateData.amenities = amenities;
      } catch (e) {
        // If parsing fails, stringify it
        updateData.amenities = JSON.stringify(amenities);
      }
    }

    // Handle new photo uploads (append to existing photos)
    if (req.files && req.files.length > 0) {
      const newPhotoUrls = req.files.map(file => `/uploads/properties/${file.filename}`);
      const existingPhotos = property.photos ? JSON.parse(property.photos) : [];
      const updatedPhotos = [...existingPhotos, ...newPhotoUrls];
      updateData.photos = JSON.stringify(updatedPhotos);
    }

    await Property.update(id, updateData);

    res.json({ 
      success: true, 
      message: 'Property updated successfully' 
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
    const ownerId = req.session.user.id;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    if (property.owner_id !== ownerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized. You can only delete your own properties' 
      });
    }

    await Property.delete(id);

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
    const ownerId = req.session.user.id;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    if (property.owner_id !== ownerId) {
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
    const existingPhotos = property.photos ? JSON.parse(property.photos) : [];
    const updatedPhotos = [...existingPhotos, ...photoUrls];

    await Property.update(id, { photos: JSON.stringify(updatedPhotos) });

    res.json({ 
      success: true, 
      message: 'Photos uploaded successfully',
      photos: updatedPhotos,
      newPhotos: photoUrls
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

    const parsedProperties = properties.map(property => ({
      ...property,
      amenities: property.amenities ? JSON.parse(property.amenities) : [],
      photos: property.photos ? JSON.parse(property.photos) : []
    }));

    res.json({ 
      success: true, 
      properties: parsedProperties,
      count: parsedProperties.length
    });
  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching properties' 
    });
  }
};