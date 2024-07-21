const express = require('express');
const router = express.Router();
const { addOrUpdatePreferences, getPreferences, calculateHoliday } = require('../controllers/preferencesController');
const auth = require('../middleware/auth');

router.post('/preferences', auth, addOrUpdatePreferences);
router.get('/preferences', auth, getPreferences);
router.get('/calculate', auth, calculateHoliday);

module.exports = router;
