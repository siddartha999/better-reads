//INITIAL SETUP
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {retrieveProfileActivities, retrieveProfileReviews } = require('../controllers/profileActivity');

router.get('/:profileName', auth, retrieveProfileActivities);
router.get('/:profileName/reviews', auth, retrieveProfileReviews);

module.exports = router;