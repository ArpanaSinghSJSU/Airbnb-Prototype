const db = require('../config/db');

class Favorite {
  static async add(userId, propertyId) {
    try {
      const [result] = await db.query(
        'INSERT INTO favorites (user_id, property_id) VALUES (?, ?)',
        [userId, propertyId]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Property already in favorites');
      }
      throw error;
    }
  }

  static async remove(userId, propertyId) {
    const [result] = await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );
    return result.affectedRows;
  }

  static async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT f.*, p.* FROM favorites f 
       JOIN properties p ON f.property_id = p.id 
       WHERE f.user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async isFavorite(userId, propertyId) {
    const [rows] = await db.query(
      'SELECT * FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );
    return rows.length > 0;
  }
}

module.exports = Favorite;