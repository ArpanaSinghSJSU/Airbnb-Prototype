-- Airbnb Prototype Database Initialization Script
-- This script creates the database, tables, and populates them with sample data

-- Create and use database
CREATE DATABASE IF NOT EXISTS airbnb_db;
USE airbnb_db;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('traveler', 'owner') NOT NULL,
    phone VARCHAR(50),
    about_me TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    country VARCHAR(100),
    languages VARCHAR(255),
    gender VARCHAR(50),
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create properties table
CREATE TABLE properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    location VARCHAR(255),
    price_per_night DECIMAL(10,2),
    bedrooms INT,
    bathrooms INT,
    max_guests INT,
    amenities TEXT,
    photos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    traveler_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    guests INT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'CANCELLED') DEFAULT 'PENDING',
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (traveler_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create favorites table
CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, property_id)
);

-- Insert sample users (Travelers)
-- Password for all users: password123 (hashed with bcrypt)
INSERT INTO users (name, email, password, role, phone, about_me, city, state, country, languages, gender) VALUES
('John Smith', 'john.traveler@example.com', '$2a$10$9M9R74UxGCOb0ULoFWlQfOKLBxFQ3rvqoxme8RggaAKPxItmaTmCe', 'traveler', '+1-555-0101', 'Love exploring new places and cultures!', 'Los Angeles', 'CA', 'United States', 'English, Spanish', 'Male'),
('Emma Johnson', 'emma.traveler@example.com', '$2a$10$au0yPG.CG4xXneW73KDjG.z0vnw8CNAweIMEYFHeAhlLTMDeadzG6', 'traveler', '+1-555-0102', 'Digital nomad and adventure seeker', 'New York', 'NY', 'United States', 'English, French', 'Female'),
('Michael Chen', 'michael.traveler@example.com', '$2a$10$txAWGHi9jVfrXfnJEkwh9eSxg7RvNbbv/E9rvHTIsEP5j4UtFyZu2', 'traveler', '+1-555-0103', 'Business traveler who appreciates comfort', 'Toronto', 'ON', 'Canada', 'English, Mandarin', 'Male'),
('Sarah Williams', 'sarah.traveler@example.com', '$2a$10$VsK981bVhFtn09MPnTzMu.Kt5PPHFDbOo4uFmStSCI718wsdRGuJ6', 'traveler', '+1-555-0104', 'Family vacation planner', 'Chicago', 'IL', 'United States', 'English', 'Female');

-- Insert sample users (Owners)
INSERT INTO users (name, email, password, role, phone, about_me, city, state, country) VALUES
('Robert Martinez', 'robert.owner@example.com', '$2a$10$o0H8PPt6mcAq.tOv27IgsufB8SN17GKSFjzflrosT87gcdctMRnMG', 'owner', '+1-555-0201', 'Professional property host with 5+ years experience', 'Miami', 'FL', 'United States'),
('Lisa Anderson', 'lisa.owner@example.com', '$2a$10$oi0kdOXajvNd3KYwZLHvPed.Iv6XPP/d6k4SCw/uay22PX5MWvTq.', 'owner', '+1-555-0202', 'Boutique property owner, hospitality enthusiast', 'San Francisco', 'CA', 'United States'),
('David Thompson', 'david.owner@example.com', '$2a$10$PuUJKNGnqamBaP0PU7pNJOOw2pp93PjsghbHLbzUU6OSyDoTcdCVG', 'owner', '+1-555-0203', 'Real estate investor and vacation rental specialist', 'Austin', 'TX', 'United States'),
('Jennifer Lee', 'jennifer.owner@example.com', '$2a$10$wAJgFJ/KFfjYDd7csCZD/uMnBsU1tO3ABoO944m2IYByLuL3Bzh56', 'owner', '+1-555-0204', 'Luxury property manager', 'Vancouver', 'BC', 'Canada');

-- Insert sample properties
INSERT INTO properties (owner_id, name, type, description, location, price_per_night, bedrooms, bathrooms, max_guests, amenities) VALUES
(5, 'Beachfront Paradise Villa', 'Villa', 'Stunning oceanfront property with private beach access. Perfect for families and groups seeking a luxurious beach getaway.', 'Miami Beach, FL', 350.00, 4, 3, 8, '["WiFi", "Pool", "Beach Access", "Air Conditioning", "Kitchen", "Parking", "Hot Tub"]'),
(5, 'Downtown Miami Apartment', 'Apartment', 'Modern apartment in the heart of downtown Miami. Walking distance to restaurants and nightlife.', 'Downtown Miami, FL', 150.00, 2, 2, 4, '["WiFi", "Air Conditioning", "Kitchen", "Gym Access", "Elevator"]'),
(6, 'Golden Gate View Loft', 'Loft', 'Spacious loft with breathtaking views of the Golden Gate Bridge. Industrial chic meets modern comfort.', 'San Francisco, CA', 280.00, 3, 2, 6, '["WiFi", "City Views", "Modern Kitchen", "Workspace", "Washer/Dryer"]'),
(6, 'Cozy Napa Valley Cottage', 'Cottage', 'Charming cottage nestled in wine country. Perfect romantic getaway for couples.', 'Napa Valley, CA', 200.00, 1, 1, 2, '["WiFi", "Fireplace", "Wine Cellar Access", "Garden", "Hot Tub"]'),
(7, 'Austin Music District Condo', 'Condo', 'Hip condo in the heart of Austin\'s live music scene. Walk to famous venues and BBQ joints.', 'Downtown Austin, TX', 120.00, 1, 1, 2, '["WiFi", "Air Conditioning", "Kitchen", "Balcony", "Music District"]'),
(7, 'Lake Travis Retreat', 'House', 'Waterfront house on Lake Travis. Includes private dock and kayaks. Great for water sports enthusiasts.', 'Lake Travis, TX', 300.00, 3, 2, 6, '["WiFi", "Lake Access", "Dock", "Kayaks", "BBQ Grill", "Fire Pit"]'),
(8, 'Vancouver Mountain View Chalet', 'Chalet', 'Luxurious mountain chalet with panoramic views. Close to ski resorts and hiking trails.', 'Whistler, BC', 450.00, 5, 4, 10, '["WiFi", "Mountain Views", "Fireplace", "Hot Tub", "Ski Storage", "Game Room"]'),
(8, 'Downtown Vancouver Studio', 'Studio', 'Modern studio in the heart of downtown. Perfect for solo travelers or couples.', 'Downtown Vancouver, BC', 100.00, 0, 1, 2, '["WiFi", "Air Conditioning", "Kitchenette", "Gym Access"]');

-- Insert sample bookings
INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, status, total_price) VALUES
-- Accepted bookings (past)
(1, 1, '2025-09-01', '2025-09-05', 6, 'ACCEPTED', 1400.00),
(3, 2, '2025-08-15', '2025-08-20', 4, 'ACCEPTED', 1400.00),
(5, 3, '2025-09-10', '2025-09-12', 2, 'ACCEPTED', 240.00),

-- Accepted bookings (upcoming)
(2, 1, '2025-11-01', '2025-11-05', 3, 'ACCEPTED', 600.00),
(4, 2, '2025-11-15', '2025-11-17', 2, 'ACCEPTED', 400.00),
(6, 4, '2025-12-20', '2025-12-27', 5, 'ACCEPTED', 2100.00),

-- Pending bookings
(7, 1, '2025-11-10', '2025-11-15', 8, 'PENDING', 2250.00),
(8, 3, '2025-11-05', '2025-11-07', 2, 'PENDING', 200.00),
(1, 4, '2025-12-01', '2025-12-05', 6, 'PENDING', 1400.00),

-- Cancelled bookings
(3, 1, '2025-10-01', '2025-10-05', 4, 'CANCELLED', 1120.00),
(5, 2, '2025-10-15', '2025-10-17', 2, 'CANCELLED', 240.00);

-- Insert sample favorites
INSERT INTO favorites (user_id, property_id) VALUES
(1, 1),
(1, 3),
(1, 7),
(2, 4),
(2, 6),
(2, 8),
(3, 2),
(3, 5),
(3, 8),
(4, 1),
(4, 6),
(4, 7);

-- Display summary
SELECT 'Database initialization complete!' as Status;
SELECT COUNT(*) as 'Total Users' FROM users;
SELECT COUNT(*) as 'Total Properties' FROM properties;
SELECT COUNT(*) as 'Total Bookings' FROM bookings;
SELECT COUNT(*) as 'Total Favorites' FROM favorites;

