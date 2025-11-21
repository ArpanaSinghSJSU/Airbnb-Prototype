const db = require('../config/db');

class Owner {
  static async getDashboard(ownerId) {
    // Get total properties
    const [propertiesCount] = await db.query(
      'SELECT COUNT(*) as count FROM properties WHERE owner_id = ?',
      [ownerId]
    );

    // Get pending bookings count
    const [pendingCount] = await db.query(
      `SELECT COUNT(*) as count FROM bookings b 
       JOIN properties p ON b.property_id = p.id 
       WHERE p.owner_id = ? AND b.status = 'PENDING'`,
      [ownerId]
    );

    // Get accepted bookings count
    const [acceptedCount] = await db.query(
      `SELECT COUNT(*) as count FROM bookings b 
       JOIN properties p ON b.property_id = p.id 
       WHERE p.owner_id = ? AND b.status = 'ACCEPTED'`,
      [ownerId]
    );

    // Get recent bookings
    const [recentBookings] = await db.query(
      `SELECT b.*, p.name as property_name, u.name as traveler_name 
       FROM bookings b 
       JOIN properties p ON b.property_id = p.id 
       JOIN users u ON b.traveler_id = u.id 
       WHERE p.owner_id = ? 
       ORDER BY b.created_at DESC 
       LIMIT 5`,
      [ownerId]
    );

    return {
      totalProperties: propertiesCount[0].count,
      pendingBookings: pendingCount[0].count,
      acceptedBookings: acceptedCount[0].count,
      recentBookings
    };
  }
}

module.exports = Owner;