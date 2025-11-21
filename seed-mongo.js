const mongoose = require('mongoose');
const User = require('./services/booking-service/src/models/UserModel');
const Property = require('./services/booking-service/src/models/PropertyModel');
const Booking = require('./services/booking-service/src/models/BookingModel');
const Favorite = require('./services/booking-service/src/models/FavoriteModel');
require('dotenv').config();

const seedUsers = [
  // Travelers
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.traveler@example.com',
    password: 'password123',
    role: 'traveler',
    phone: '+1-555-0101',
    bio: 'Love exploring new places and cultures!'
  },
  {
    firstName: 'Emma',
    lastName: 'Johnson',
    email: 'emma.traveler@example.com',
    password: 'password123',
    role: 'traveler',
    phone: '+1-555-0102',
    bio: 'Digital nomad and adventure seeker'
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.traveler@example.com',
    password: 'password123',
    role: 'traveler',
    phone: '+1-555-0103',
    bio: 'Business traveler who appreciates comfort'
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.traveler@example.com',
    password: 'password123',
    role: 'traveler',
    phone: '+1-555-0104',
    bio: 'Family vacation planner'
  },
  // Owners
  {
    firstName: 'Robert',
    lastName: 'Martinez',
    email: 'robert.owner@example.com',
    password: 'password123',
    role: 'owner',
    phone: '+1-555-0201',
    bio: 'Professional property host with 5+ years experience',
    businessName: 'Martinez Vacation Rentals'
  },
  {
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.owner@example.com',
    password: 'password123',
    role: 'owner',
    phone: '+1-555-0202',
    bio: 'Boutique property owner, hospitality enthusiast',
    businessName: 'Anderson Luxury Stays'
  },
  {
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.owner@example.com',
    password: 'password123',
    role: 'owner',
    phone: '+1-555-0203',
    bio: 'Real estate investor and vacation rental specialist',
    businessName: 'Thompson Properties'
  },
  {
    firstName: 'Jennifer',
    lastName: 'Lee',
    email: 'jennifer.owner@example.com',
    password: 'password123',
    role: 'owner',
    phone: '+1-555-0204',
    bio: 'Luxury property manager',
    businessName: 'Lee Elite Rentals'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/gotour_db?authSource=admin');
    console.log('✅ Connected to MongoDB');

    // Clear existing data and drop collections to remove old indexes
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    for (const collectionName of ['users', 'properties', 'bookings', 'favorites']) {
      if (collectionNames.includes(collectionName)) {
        await mongoose.connection.db.dropCollection(collectionName);
      }
    }
    console.log('🗑️  Cleared existing data and indexes');

    // Insert test users
    const users = await User.create(seedUsers);
    console.log(`✨ Created ${users.length} test users`);

    // Get user IDs for reference
    const travelers = users.filter(u => u.role === 'traveler');
    const owners = users.filter(u => u.role === 'owner');

    // Insert sample properties with structured location fields
    const properties = await Property.create([
      {
        ownerId: owners[0]._id, // Robert Martinez
        name: 'Beachfront Paradise Villa',
        propertyType: 'villa',
        description: 'Stunning oceanfront property with private beach access. Perfect for families and groups seeking a luxurious beach getaway.',
        city: 'Miami Beach',
        state: 'FL',
        country: 'USA',
        zipcode: '33139',
        address: '1234 Ocean Drive',
        pricePerNight: 350.00,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Air Conditioning', 'Kitchen', 'Parking', 'Hot Tub']
      },
      {
        ownerId: owners[0]._id, // Robert Martinez
        name: 'Downtown Miami Apartment',
        propertyType: 'apartment',
        description: 'Modern apartment in the heart of downtown Miami. Walking distance to restaurants and nightlife.',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        zipcode: '33131',
        address: '100 Biscayne Blvd',
        pricePerNight: 150.00,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Gym Access', 'Elevator']
      },
      {
        ownerId: owners[1]._id, // Lisa Anderson
        name: 'Golden Gate View Loft',
        propertyType: 'apartment',
        description: 'Spacious loft with breathtaking views of the Golden Gate Bridge. Industrial chic meets modern comfort.',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipcode: '94102',
        address: '456 Market Street',
        pricePerNight: 280.00,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        amenities: ['WiFi', 'City Views', 'Modern Kitchen', 'Workspace', 'Washer/Dryer']
      },
      {
        ownerId: owners[1]._id, // Lisa Anderson
        name: 'Cozy Napa Valley Cottage',
        propertyType: 'cabin',
        description: 'Charming cottage nestled in wine country. Perfect romantic getaway for couples.',
        city: 'Napa',
        state: 'CA',
        country: 'USA',
        zipcode: '94558',
        address: '789 Vineyard Lane',
        pricePerNight: 200.00,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ['WiFi', 'Fireplace', 'Wine Cellar Access', 'Garden', 'Hot Tub']
      },
      {
        ownerId: owners[2]._id, // David Thompson
        name: 'Austin Music District Condo',
        propertyType: 'condo',
        description: 'Hip condo in the heart of Austin\'s live music scene. Walk to famous venues and BBQ joints.',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        zipcode: '78701',
        address: '321 6th Street',
        pricePerNight: 120.00,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Balcony', 'Music District']
      },
      {
        ownerId: owners[2]._id, // David Thompson
        name: 'Lake Travis Retreat',
        propertyType: 'house',
        description: 'Waterfront house on Lake Travis. Includes private dock and kayaks. Great for water sports enthusiasts.',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        zipcode: '78732',
        address: '555 Lakeshore Drive',
        pricePerNight: 300.00,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        amenities: ['WiFi', 'Lake Access', 'Dock', 'Kayaks', 'BBQ Grill', 'Fire Pit']
      },
      {
        ownerId: owners[3]._id, // Jennifer Lee
        name: 'Vancouver Mountain View Chalet',
        propertyType: 'cabin',
        description: 'Luxurious mountain chalet with panoramic views. Close to ski resorts and hiking trails.',
        city: 'Whistler',
        state: 'BC',
        country: 'Canada',
        zipcode: 'V0N 1B4',
        address: '777 Mountain Road',
        pricePerNight: 450.00,
        bedrooms: 5,
        bathrooms: 4,
        maxGuests: 10,
        amenities: ['WiFi', 'Mountain Views', 'Fireplace', 'Hot Tub', 'Ski Storage', 'Game Room']
      },
      {
        ownerId: owners[3]._id, // Jennifer Lee
        name: 'Downtown Vancouver Studio',
        propertyType: 'apartment',
        description: 'Modern studio in the heart of downtown. Perfect for solo travelers or couples.',
        city: 'Vancouver',
        state: 'BC',
        country: 'Canada',
        zipcode: 'V6B 1A1',
        address: '222 Robson Street',
        pricePerNight: 100.00,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ['WiFi', 'Air Conditioning', 'Kitchenette', 'Gym Access']
      }
    ]);
    console.log(`🏠 Created ${properties.length} properties`);

    // Insert sample bookings
    const bookings = await Booking.create([
      // Accepted bookings (past)
      {
        propertyId: properties[0]._id,
        travelerId: travelers[0]._id, // John Smith
        checkInDate: new Date('2024-09-01'),
        checkOutDate: new Date('2024-09-05'),
        guests: 6,
        status: 'ACCEPTED',
        totalPrice: 1400.00
      },
      {
        propertyId: properties[2]._id,
        travelerId: travelers[1]._id, // Emma Johnson
        checkInDate: new Date('2024-08-15'),
        checkOutDate: new Date('2024-08-20'),
        guests: 4,
        status: 'ACCEPTED',
        totalPrice: 1400.00
      },
      {
        propertyId: properties[4]._id,
        travelerId: travelers[2]._id, // Michael Chen
        checkInDate: new Date('2024-09-10'),
        checkOutDate: new Date('2024-09-12'),
        guests: 2,
        status: 'ACCEPTED',
        totalPrice: 240.00
      },
      // Accepted bookings (upcoming)
      {
        propertyId: properties[1]._id,
        travelerId: travelers[0]._id, // John Smith
        checkInDate: new Date('2025-12-01'),
        checkOutDate: new Date('2025-12-05'),
        guests: 3,
        status: 'ACCEPTED',
        totalPrice: 600.00
      },
      {
        propertyId: properties[3]._id,
        travelerId: travelers[1]._id, // Emma Johnson
        checkInDate: new Date('2025-12-15'),
        checkOutDate: new Date('2025-12-17'),
        guests: 2,
        status: 'ACCEPTED',
        totalPrice: 400.00
      },
      {
        propertyId: properties[5]._id,
        travelerId: travelers[3]._id, // Sarah Williams
        checkInDate: new Date('2025-12-20'),
        checkOutDate: new Date('2025-12-27'),
        guests: 5,
        status: 'ACCEPTED',
        totalPrice: 2100.00
      },
      // Pending bookings
      {
        propertyId: properties[6]._id,
        travelerId: travelers[0]._id, // John Smith
        checkInDate: new Date('2025-12-10'),
        checkOutDate: new Date('2025-12-15'),
        guests: 8,
        status: 'PENDING',
        totalPrice: 2250.00
      },
      {
        propertyId: properties[7]._id,
        travelerId: travelers[2]._id, // Michael Chen
        checkInDate: new Date('2025-12-05'),
        checkOutDate: new Date('2025-12-07'),
        guests: 2,
        status: 'PENDING',
        totalPrice: 200.00
      },
      {
        propertyId: properties[0]._id,
        travelerId: travelers[3]._id, // Sarah Williams
        checkInDate: new Date('2025-12-28'),
        checkOutDate: new Date('2026-01-02'),
        guests: 6,
        status: 'PENDING',
        totalPrice: 1750.00
      },
      // Cancelled bookings
      {
        propertyId: properties[2]._id,
        travelerId: travelers[0]._id, // John Smith
        checkInDate: new Date('2024-10-01'),
        checkOutDate: new Date('2024-10-05'),
        guests: 4,
        status: 'CANCELLED',
        totalPrice: 1120.00,
        cancelledBy: 'traveler',
        cancelledAt: new Date('2024-09-25')
      },
      {
        propertyId: properties[4]._id,
        travelerId: travelers[1]._id, // Emma Johnson
        checkInDate: new Date('2024-10-15'),
        checkOutDate: new Date('2024-10-17'),
        guests: 2,
        status: 'CANCELLED',
        totalPrice: 240.00,
        cancelledBy: 'owner',
        cancelledAt: new Date('2024-10-10')
      }
    ]);
    console.log(`📅 Created ${bookings.length} bookings`);

    // Insert sample favorites
    const favorites = await Favorite.create([
      { travelerId: travelers[0]._id, propertyId: properties[0]._id },
      { travelerId: travelers[0]._id, propertyId: properties[2]._id },
      { travelerId: travelers[0]._id, propertyId: properties[6]._id },
      { travelerId: travelers[1]._id, propertyId: properties[3]._id },
      { travelerId: travelers[1]._id, propertyId: properties[5]._id },
      { travelerId: travelers[1]._id, propertyId: properties[7]._id },
      { travelerId: travelers[2]._id, propertyId: properties[1]._id },
      { travelerId: travelers[2]._id, propertyId: properties[4]._id },
      { travelerId: travelers[2]._id, propertyId: properties[7]._id },
      { travelerId: travelers[3]._id, propertyId: properties[0]._id },
      { travelerId: travelers[3]._id, propertyId: properties[5]._id },
      { travelerId: travelers[3]._id, propertyId: properties[6]._id }
    ]);
    console.log(`⭐ Created ${favorites.length} favorites`);

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATABASE SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Users:      ${users.length} (${travelers.length} travelers, ${owners.length} owners)`);
    console.log(`✅ Properties: ${properties.length}`);
    console.log(`✅ Bookings:   ${bookings.length}`);
    console.log(`✅ Favorites:  ${favorites.length}`);

    console.log('\n📋 TEST CREDENTIALS:');
    console.log('='.repeat(60));
    console.log('\n🧳 TRAVELERS:');
    travelers.forEach(user => {
      console.log(`   ${user.firstName} ${user.lastName}`);
      console.log(`   📧 ${user.email}`);
      console.log(`   🔑 password123\n`);
    });

    console.log('🏠 OWNERS:');
    owners.forEach(user => {
      console.log(`   ${user.firstName} ${user.lastName}`);
      console.log(`   📧 ${user.email}`);
      console.log(`   🔑 password123\n`);
    });

    console.log('='.repeat(60));
    console.log('✨ Database seeding completed successfully!');
    console.log('🚀 You can now login with any of the credentials above.');
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

