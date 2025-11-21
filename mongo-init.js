// MongoDB Initialization Script
// This script runs when the container first starts

db = db.getSiblingDB('gotour_db');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'firstName', 'lastName', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email'
        },
        role: {
          enum: ['traveler', 'owner'],
          description: 'must be either traveler or owner'
        }
      }
    }
  }
});

db.createCollection('properties');
db.createCollection('bookings');
db.createCollection('favorites');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.properties.createIndex({ owner_id: 1 });
db.properties.createIndex({ location: 1 });
db.properties.createIndex({ price_per_night: 1 });

db.bookings.createIndex({ traveler_id: 1 });
db.bookings.createIndex({ property_id: 1 });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ check_in_date: 1, check_out_date: 1 });

db.favorites.createIndex({ traveler_id: 1, property_id: 1 }, { unique: true });

print('✅ Database initialized successfully!');
print('📊 Collections created: users, properties, bookings, favorites');
print('🔍 Indexes created for optimized queries');

