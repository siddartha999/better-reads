//INITIAL SETUP
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {retrieveProfileActivities, retrieveProfileReviews } = require('../controllers/profileActivity');

router.get('/:profileId', auth, retrieveProfileActivities);
router.get('/:profileId/reviews', auth, retrieveProfileReviews);

module.exports = router;