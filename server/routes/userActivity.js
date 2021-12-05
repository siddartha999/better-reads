//INITIAL SETUP
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { retrieveUserRatingsInfo, retrieveUserActivities, retrieveUserReviews } = require('../controllers/userActivity');

router.get('/rating', auth, retrieveUserRatingsInfo);
router.get('/', auth, retrieveUserActivities);
router.get('/userReviews', auth, retrieveUserReviews);

module.exports = router;