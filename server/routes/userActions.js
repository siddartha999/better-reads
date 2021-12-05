//INITIAL SETUP
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { retrieveUserActions } = require('../controllers/userActions');

//Router to retrieve all the actions of the current-user.
router.get('/', auth, retrieveUserActions);

module.exports = router;