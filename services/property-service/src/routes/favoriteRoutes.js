const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateJWT, requireTraveler } = require('../middleware/jwtAuth');

router.use(authenticateJWT);
router.use(requireTraveler);

router.post('/', favoriteController.addFavorite);
router.get('/', favoriteController.getFavorites);
router.delete('/:propertyId', favoriteController.removeFavorite);

module.exports = router;
