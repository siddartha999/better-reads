//INITIAL SETUP
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { retrieveUserRatingsInfo } = require('../controllers/userActivity');

router.get('/rating', auth, retrieveUserRatingsInfo);

module.exports = router;