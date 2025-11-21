const db = require('../config/db');

class Booking {
  static async create(bookingData) {
    const { property_id, traveler_id, start_date, end_date, guests, total_price } = bookingData;
    
    const [result] = await db.query(
      `INSERT INTO bookings (property_id, traveler_id, start_date, end_date, guests, total_price, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [property_id, traveler_id, start_date, end_date, guests, total_price]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT b.*, p.name as property_name, p.location, u.name as traveler_name 
       FROM bookings b 
       JOIN properties p ON b.property_id = p.id 
       JOIN users u ON b.traveler_id = u.id 
       WHERE b.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByTravelerId(travelerId) {
    const [rows] = await db.query(
      `SELECT b.*, p.name as property_name, p.location, p.photos 
       FROM bookings b 
       JOIN properties p ON b.property_id = p.id 
       WHERE b.traveler_id = ? 
       ORDER BY b.created_at DESC`,
      [travelerId]
    );
    return rows;
  }

  static async findByOwnerId(ownerId) {
    const [rows] = await db.query(
      `SELECT b.*, p.name as property_name, p.location, p.photos, u.name as traveler_name, u.email as traveler_email 
       FROM bookings b 
       JOIN properties p ON b.property_id = p.id 
       JOIN users u ON b.traveler_id = u.id 
       WHERE p.owner_id = ? 
       ORDER BY b.created_at DESC`,
      [ownerId]
    );
    return rows;
  }

  static async checkAvailability(propertyId, startDate, endDate, excludeBookingId = null) {
    let query = `
      SELECT * FROM bookings 
      WHERE property_id = ? 
      AND status = 'ACCEPTED' 
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `;
    
    const params = [propertyId, startDate, startDate, endDate, endDate, startDate, endDate];
    
    if (excludeBookingId) {
      query += ' AND id != ?';
      params.push(excludeBookingId);
    }

    const [rows] = await db.query(query, params);
    return rows.length === 0;
  }

  static async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  }
}

module.exports = Booking;