const db = require('../config/db');

class Property {
  static async create(propertyData) {
    const { owner_id, name, type, description, location, price_per_night, 
            bedrooms, bathrooms, max_guests, amenities, photos } = propertyData;
    
    const [result] = await db.query(
      `INSERT INTO properties (owner_id, name, type, description, location, 
       price_per_night, bedrooms, bathrooms, max_guests, amenities, photos) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [owner_id, name, type, description, location, price_per_night, 
       bedrooms, bathrooms, max_guests, amenities, photos]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM properties WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByOwnerId(ownerId) {
    const [rows] = await db.query('SELECT * FROM properties WHERE owner_id = ?', [ownerId]);
    return rows;
  }

  static async search(filters) {
    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];

    if (filters.location) {
      query += ' AND location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.guests) {
      query += ' AND max_guests >= ?';
      params.push(filters.guests);
    }

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async update(id, propertyData) {
    const fields = [];
    const values = [];

    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(propertyData[key]);
      }
    });

    values.push(id);
    const query = `UPDATE properties SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await db.query(query, values);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM properties WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Property;