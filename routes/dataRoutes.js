const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/countries', dataController.getCountries);
router.get('/states', dataController.getStates);

module.exports = router;

