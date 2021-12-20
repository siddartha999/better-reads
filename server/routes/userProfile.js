//INITIAL SETUP.
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { retrieveUserProfile, retrieveUserProfileBooksByType, updateUserProfileName, 
    validateUserProfileName, toggleFollowUserProfile, updateUserProfileDetails, retrieveProfileFollowers, retrieveProfileFollowing } 
    = require('../controllers/userProfile');

//Retrieve the followers of a Profile.
router.get('/:profileName/followers', auth, retrieveProfileFollowers);

//Retrieve the profiles followed by the current Profile.
router.get('/:profileName/following', auth, retrieveProfileFollowing);

//Get the requested profile.
router.get('/:profileName', auth, retrieveUserProfile);

//Validate the User's profileName
router.get('/profileName/:profileName', auth, validateUserProfileName);

//Update the User's profileName.
router.patch('/profileName/:profileName', auth, updateUserProfileName);

//Update profile details.
router.patch('/details', auth, updateUserProfileDetails);

//Get the requested profiles books. 
router.get('/:profileName/:type', auth, retrieveUserProfileBooksByType);

//Follow/UnFollow a profile by the current User.
router.patch('/:profileName/follow', auth, toggleFollowUserProfile);


module.exports = router;