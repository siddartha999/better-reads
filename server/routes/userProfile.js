//INITIAL SETUP.
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { retrieveUserProfile, retrieveUserProfileBooksByType, updateUserProfileName, 
    validateUserProfileName, followUserProfile,unFollowUserProfile } = require('../controllers/userProfile');

//Get the requested profile.
router.get('/:profileName', auth, retrieveUserProfile);

//Validate the User's profileName
router.get('/profileName/:profileName', auth, validateUserProfileName);

//Update the User's profileName.
router.patch('/profileName/:profileName', auth, updateUserProfileName);

//Update profile details.
router.patch('/', auth);

//Get the requested profiles books. 
router.get('/:profileName/:type', auth, retrieveUserProfileBooksByType);

//Follow a profile by the current User.
router.patch('/:profileName/follow', auth, followUserProfile);

//UnFollow a profile by the current User.
router.patch('/:profileName/unFollow', auth, unFollowUserProfile);


module.exports = router;