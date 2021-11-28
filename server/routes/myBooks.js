//INITIAL SETUP
const express = require('express');
const router = express.Router();
const retrieveUserBooks = require('../controllers/myBooks');
const auth = require('../middleware/auth');

router.get('/', auth, retrieveUserBooks);

module.exports = router;