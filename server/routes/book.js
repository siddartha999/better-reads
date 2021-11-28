//INITIAL SETUP
const express = require('express');
const router = express.Router();

const {updateUserBookDetails, getUserBookInfo} = require('../controllers/book');
const auth = require('../middleware/auth');

//Update the details of the book for the current user. Details include stuff such as Status, Rating etc..
router.patch('/:bookId', auth, updateUserBookDetails);

//Get the current User's contribution for the current book.
router.get('/:bookId', auth, getUserBookInfo);

module.exports = router;