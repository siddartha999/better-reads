//INITIAL SETUP.
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { retrieveUserProfile, retrieveUserProfileBooksByType } = require('../controllers/userProfile');

//Get the requested profile.
router.get('/:profileId', auth, retrieveUserProfile);

//Get the requested profiles books. 
router.get('/:profileId/:type', auth, retrieveUserProfileBooksByType);


module.exports = router;