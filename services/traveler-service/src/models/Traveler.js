const db = require('../config/db');

class Traveler {
  static async getHistory(travelerId) {
    const [rows] = await db.query(
      `SELECT b.*, p.name as property_name, p.location, p.photos 
       FROM bookings b 
       JOIN properties p ON b.property_id = p.id 
       WHERE b.traveler_id = ? 
       AND b.status = 'ACCEPTED' 
       AND b.end_date < CURDATE() 
       ORDER BY b.end_date DESC`,
      [travelerId]
    );
    return rows;
  }
}

module.exports = Traveler;