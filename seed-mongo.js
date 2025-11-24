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

// Popular cities with their characteristics
const cities = [
  // Americas
  { name: 'New York', state: 'NY', country: 'USA', zipcode: '10001', priceMultiplier: 1.8, currency: 'USD' },
  { name: 'Los Angeles', state: 'CA', country: 'USA', zipcode: '90001', priceMultiplier: 1.6, currency: 'USD' },
  { name: 'Miami', state: 'FL', country: 'USA', zipcode: '33139', priceMultiplier: 1.4, currency: 'USD' },
  { name: 'San Francisco', state: 'CA', country: 'USA', zipcode: '94102', priceMultiplier: 1.9, currency: 'USD' },
  { name: 'Las Vegas', state: 'NV', country: 'USA', zipcode: '89109', priceMultiplier: 1.2, currency: 'USD' },
  { name: 'Chicago', state: 'IL', country: 'USA', zipcode: '60601', priceMultiplier: 1.3, currency: 'USD' },
  { name: 'Vancouver', state: 'BC', country: 'Canada', zipcode: 'V6B 1A1', priceMultiplier: 1.4, currency: 'CAD' },
  { name: 'Toronto', state: 'ON', country: 'Canada', zipcode: 'M5H 2N2', priceMultiplier: 1.3, currency: 'CAD' },
  { name: 'Mexico City', state: 'CDMX', country: 'Mexico', zipcode: '06000', priceMultiplier: 0.6, currency: 'USD' },
  
  // Europe
  { name: 'London', state: 'England', country: 'UK', zipcode: 'SW1A 1AA', priceMultiplier: 2.0, currency: 'USD' },
  { name: 'Paris', state: 'Île-de-France', country: 'France', zipcode: '75001', priceMultiplier: 1.9, currency: 'USD' },
  { name: 'Rome', state: 'Lazio', country: 'Italy', zipcode: '00100', priceMultiplier: 1.5, currency: 'USD' },
  { name: 'Barcelona', state: 'Catalonia', country: 'Spain', zipcode: '08001', priceMultiplier: 1.4, currency: 'USD' },
  { name: 'Amsterdam', state: 'North Holland', country: 'Netherlands', zipcode: '1012', priceMultiplier: 1.7, currency: 'USD' },
  { name: 'Berlin', state: 'Berlin', country: 'Germany', zipcode: '10115', priceMultiplier: 1.2, currency: 'USD' },
  { name: 'Prague', state: 'Prague', country: 'Czech Republic', zipcode: '110 00', priceMultiplier: 0.9, currency: 'USD' },
  { name: 'Istanbul', state: 'Istanbul', country: 'Turkey', zipcode: '34122', priceMultiplier: 0.7, currency: 'USD' },
  
  // Asia
  { name: 'Tokyo', state: 'Tokyo', country: 'Japan', zipcode: '100-0001', priceMultiplier: 1.6, currency: 'USD' },
  { name: 'Singapore', state: 'Singapore', country: 'Singapore', zipcode: '018956', priceMultiplier: 1.8, currency: 'USD' },
  { name: 'Dubai', state: 'Dubai', country: 'UAE', zipcode: '00000', priceMultiplier: 1.7, currency: 'USD' },
  { name: 'Bangkok', state: 'Bangkok', country: 'Thailand', zipcode: '10200', priceMultiplier: 0.5, currency: 'USD' },
  { name: 'Hong Kong', state: 'Hong Kong', country: 'China', zipcode: '999077', priceMultiplier: 1.8, currency: 'USD' },
  { name: 'Seoul', state: 'Seoul', country: 'South Korea', zipcode: '04524', priceMultiplier: 1.1, currency: 'USD' },
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', zipcode: '400001', priceMultiplier: 0.4, currency: 'USD' },
  { name: 'Bali', state: 'Bali', country: 'Indonesia', zipcode: '80361', priceMultiplier: 0.5, currency: 'USD' },
  
  // Oceania
  { name: 'Sydney', state: 'NSW', country: 'Australia', zipcode: '2000', priceMultiplier: 1.5, currency: 'USD' },
  { name: 'Melbourne', state: 'VIC', country: 'Australia', zipcode: '3000', priceMultiplier: 1.4, currency: 'USD' },
  { name: 'Auckland', state: 'Auckland', country: 'New Zealand', zipcode: '1010', priceMultiplier: 1.3, currency: 'USD' },
  
  // Africa & Middle East
  { name: 'Cape Town', state: 'Western Cape', country: 'South Africa', zipcode: '8001', priceMultiplier: 0.6, currency: 'USD' },
  { name: 'Tel Aviv', state: 'Tel Aviv', country: 'Israel', zipcode: '6107001', priceMultiplier: 1.4, currency: 'USD' }
];

// Property templates with descriptions
const propertyTemplates = [
  {
    namePattern: 'Modern Downtown Studio',
    type: 'apartment',
    description: 'Stylish studio in the heart of the city. Perfect for solo travelers and couples seeking urban convenience.',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Workspace', 'Elevator'],
    basePrice: 80
  },
  {
    namePattern: 'Luxury City View Apartment',
    type: 'apartment',
    description: 'Elegant apartment with stunning city views. Features modern amenities and premium finishes.',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'City Views', 'Gym Access', 'Parking'],
    basePrice: 150
  },
  {
    namePattern: 'Spacious Family Apartment',
    type: 'apartment',
    description: 'Comfortable 3-bedroom apartment ideal for families. Close to attractions and public transport.',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Washer/Dryer', 'Parking', 'TV'],
    basePrice: 200
  },
  {
    namePattern: 'Cozy Historic Home',
    type: 'house',
    description: 'Charming house with traditional architecture and modern comforts. Perfect for experiencing local culture.',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    amenities: ['WiFi', 'Kitchen', 'Garden', 'Fireplace', 'Parking', 'BBQ Grill'],
    basePrice: 180
  },
  {
    namePattern: 'Luxury Villa with Pool',
    type: 'villa',
    description: 'Stunning villa featuring private pool and garden. Ideal for groups seeking luxury and privacy.',
    bedrooms: 5,
    bathrooms: 4,
    maxGuests: 10,
    amenities: ['WiFi', 'Pool', 'Air Conditioning', 'Kitchen', 'Parking', 'Garden', 'BBQ Grill', 'Hot Tub'],
    basePrice: 400
  },
  {
    namePattern: 'Beachfront Paradise',
    type: 'villa',
    description: 'Exclusive beachfront property with direct beach access. Wake up to ocean views every morning.',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    amenities: ['WiFi', 'Beach Access', 'Air Conditioning', 'Kitchen', 'Parking', 'Ocean Views', 'BBQ Area'],
    basePrice: 350
  },
  {
    namePattern: 'Boutique Loft Space',
    type: 'apartment',
    description: 'Industrial-chic loft with high ceilings and artistic vibe. Perfect for creatives and design lovers.',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    amenities: ['WiFi', 'Workspace', 'Kitchen', 'High Ceilings', 'Art Gallery Nearby'],
    basePrice: 120
  },
  {
    namePattern: 'Penthouse Suite',
    type: 'apartment',
    description: 'Top-floor penthouse with panoramic city views. Ultimate luxury in the sky.',
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    amenities: ['WiFi', 'City Views', 'Air Conditioning', 'Kitchen', 'Balcony', 'Gym Access', 'Concierge'],
    basePrice: 300
  },
  {
    namePattern: 'Quiet Garden Cottage',
    type: 'house',
    description: 'Peaceful cottage surrounded by gardens. A tranquil escape while staying close to city attractions.',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    amenities: ['WiFi', 'Garden', 'Kitchen', 'Fireplace', 'Parking', 'Pet Friendly'],
    basePrice: 110
  },
  {
    namePattern: 'Modern Condo',
    type: 'condo',
    description: 'Contemporary condo with sleek design and smart home features. Perfect for tech-savvy travelers.',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    amenities: ['WiFi', 'Smart Home', 'Air Conditioning', 'Kitchen', 'Gym Access', 'Parking'],
    basePrice: 140
  }
];

// Generate properties across all cities
function generateProperties(owners) {
  const properties = [];
  let propertyCount = 0;
  
  // Generate approximately 100 properties (3-4 per city)
  cities.forEach((city, cityIndex) => {
    // Number of properties per city (3-4 properties)
    const propertiesInCity = 3 + (cityIndex % 2);
    
    for (let i = 0; i < propertiesInCity && propertyCount < 100; i++) {
      const template = propertyTemplates[propertyCount % propertyTemplates.length];
      const owner = owners[propertyCount % owners.length];
      
      // Calculate price based on city multiplier
      const pricePerNight = Math.round(template.basePrice * city.priceMultiplier);
      
      // Generate address
      const streetNumbers = ['123', '456', '789', '101', '234', '567', '890'];
      const streetNames = ['Main St', 'Oak Ave', 'Park Blvd', 'Harbor Dr', 'Market St', 'Bay St', 'Center Rd'];
      const address = `${streetNumbers[i % streetNumbers.length]} ${streetNames[i % streetNames.length]}`;
      
      properties.push({
        ownerId: owner._id,
        name: `${template.namePattern} in ${city.name}`,
        propertyType: template.type,
        description: `${template.description} Located in the vibrant ${city.name}.`,
        city: city.name,
        state: city.state,
        country: city.country,
        zipcode: city.zipcode,
        address: address,
        pricePerNight: pricePerNight,
        bedrooms: template.bedrooms,
        bathrooms: template.bathrooms,
        maxGuests: template.maxGuests,
        amenities: template.amenities
      });
      
      propertyCount++;
    }
  });
  
  return properties;
}

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

    // Generate and insert 100 properties
    console.log('🏗️  Generating properties from popular cities worldwide...');
    const propertiesToCreate = generateProperties(owners);
    const properties = await Property.create(propertiesToCreate);
    console.log(`🏠 Created ${properties.length} properties across ${cities.length} cities`);

    // Create some sample bookings (fewer since we have 100 properties now)
    const sampleBookings = [
      // Past bookings
      {
        propertyId: properties[0]._id,
        travelerId: travelers[0]._id,
        checkInDate: new Date('2024-09-01'),
        checkOutDate: new Date('2024-09-05'),
        guests: 2,
        status: 'ACCEPTED',
        totalPrice: properties[0].pricePerNight * 4
      },
      {
        propertyId: properties[5]._id,
        travelerId: travelers[1]._id,
        checkInDate: new Date('2024-08-15'),
        checkOutDate: new Date('2024-08-20'),
        guests: 4,
        status: 'ACCEPTED',
        totalPrice: properties[5].pricePerNight * 5
      },
      // Upcoming bookings
      {
        propertyId: properties[10]._id,
        travelerId: travelers[0]._id,
        checkInDate: new Date('2025-12-15'),
        checkOutDate: new Date('2025-12-20'),
        guests: 2,
        status: 'ACCEPTED',
        totalPrice: properties[10].pricePerNight * 5
      },
      {
        propertyId: properties[20]._id,
        travelerId: travelers[1]._id,
        checkInDate: new Date('2025-12-20'),
        checkOutDate: new Date('2025-12-27'),
        guests: 4,
        status: 'ACCEPTED',
        totalPrice: properties[20].pricePerNight * 7
      },
      // Pending bookings
      {
        propertyId: properties[15]._id,
        travelerId: travelers[2]._id,
        checkInDate: new Date('2025-12-10'),
        checkOutDate: new Date('2025-12-15'),
        guests: 6,
        status: 'PENDING',
        totalPrice: properties[15].pricePerNight * 5
      },
      {
        propertyId: properties[25]._id,
        travelerId: travelers[3]._id,
        checkInDate: new Date('2026-01-05'),
        checkOutDate: new Date('2026-01-10'),
        guests: 4,
        status: 'PENDING',
        totalPrice: properties[25].pricePerNight * 5
      }
    ];

    const bookings = await Booking.create(sampleBookings);
    console.log(`📅 Created ${bookings.length} sample bookings`);

    // Create some sample favorites
    const sampleFavorites = [
      { travelerId: travelers[0]._id, propertyId: properties[0]._id },
      { travelerId: travelers[0]._id, propertyId: properties[10]._id },
      { travelerId: travelers[0]._id, propertyId: properties[20]._id },
      { travelerId: travelers[1]._id, propertyId: properties[5]._id },
      { travelerId: travelers[1]._id, propertyId: properties[15]._id },
      { travelerId: travelers[1]._id, propertyId: properties[25]._id },
      { travelerId: travelers[2]._id, propertyId: properties[30]._id },
      { travelerId: travelers[2]._id, propertyId: properties[35]._id },
      { travelerId: travelers[3]._id, propertyId: properties[40]._id },
      { travelerId: travelers[3]._id, propertyId: properties[45]._id },
    ];

    const favorites = await Favorite.create(sampleFavorites);
    console.log(`⭐ Created ${favorites.length} favorites`);

    // Display summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 DATABASE SEEDING SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Users:      ${users.length} (${travelers.length} travelers, ${owners.length} owners)`);
    console.log(`✅ Properties: ${properties.length} (across ${cities.length} cities worldwide)`);
    console.log(`✅ Bookings:   ${bookings.length}`);
    console.log(`✅ Favorites:  ${favorites.length}`);

    console.log('\n🌍 CITIES COVERED:');
    console.log('='.repeat(70));
    const citiesByRegion = {
      'Americas': cities.filter(c => ['USA', 'Canada', 'Mexico'].includes(c.country)),
      'Europe': cities.filter(c => ['UK', 'France', 'Italy', 'Spain', 'Netherlands', 'Germany', 'Czech Republic', 'Turkey'].includes(c.country)),
      'Asia': cities.filter(c => ['Japan', 'Singapore', 'UAE', 'Thailand', 'China', 'South Korea', 'India', 'Indonesia'].includes(c.country)),
      'Oceania': cities.filter(c => ['Australia', 'New Zealand'].includes(c.country)),
      'Africa & Middle East': cities.filter(c => ['South Africa', 'Israel'].includes(c.country))
    };

    Object.entries(citiesByRegion).forEach(([region, regionCities]) => {
      console.log(`\n${region}:`);
      regionCities.forEach(city => {
        const cityProps = properties.filter(p => p.city === city.name);
        console.log(`   • ${city.name}, ${city.country} (${cityProps.length} properties)`);
      });
    });

    console.log('\n📋 TEST CREDENTIALS:');
    console.log('='.repeat(70));
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

    console.log('='.repeat(70));
    console.log('✨ Database seeding completed successfully!');
    console.log('🌍 Now featuring 100 properties across 30 cities worldwide!');
    console.log('🚀 You can now browse properties or login with credentials above.');
    console.log('='.repeat(70) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
