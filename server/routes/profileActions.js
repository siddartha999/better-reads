//INITIAL SETUP
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { retrieveUserActions, retrieveProfileActions } = require('../controllers/profileActions');

//Router to retrieve all the actions of the current-user.
router.get('/:profileId', auth, retrieveProfileActions);

module.exports = router;