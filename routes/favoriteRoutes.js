const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { auth, isTraveler } = require('../middleware/auth');

router.use(auth);
router.use(isTraveler);

router.post('/', favoriteController.addFavorite);
router.get('/', favoriteController.getFavorites);
router.delete('/:propertyId', favoriteController.removeFavorite);

module.exports = router;
