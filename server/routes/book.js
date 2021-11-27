//INITIAL SETUP
const express = require('express');
const router = express.Router();

const updateUserBookDetails = require('../controllers/book');
const auth = require('../middleware/auth');

//Update the details of the book for the current user. Details include stuff such as Status, Rating etc..
router.patch('/:bookId', auth, updateUserBookDetails);

module.exports = router;