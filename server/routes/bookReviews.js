//INITIAL SETUP
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const {retrieveBookReviews} = require('../controllers/bookReviews');

router.get('/:bookId', auth, retrieveBookReviews);

module.exports = router;