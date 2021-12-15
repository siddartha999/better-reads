//INITIAL SETUP
const express = require('express');
const router = express.Router();
const {retrieveUserBooks, retrieveUserBooksByType, testUserBooks} = require('../controllers/myBooks');
const auth = require('../middleware/auth');

router.get('/testt', testUserBooks);

//Route to retrieve the initial few books of currently-reading, want-to-read, read books for the user.
router.get('/', auth, retrieveUserBooks);

//Route to retrieve all the books of certain type for the user.
router.get('/:type', auth, retrieveUserBooksByType);

//Test


module.exports = router;