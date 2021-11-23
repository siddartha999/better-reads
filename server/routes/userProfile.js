//INITIAL SETUP.
const express = require('express');
const router = express.Router();

//Create a new user
router.post('/', (req, res) => {

});

//Get the current user's profile
router.get('/:id', (req, res) => {
    res.send('Hello User : ' + req.params.id);
});


//Update the current user's profile
router.patch('/:id', (req, res) => {

});

//Delete the current user
router.delete('/:id', (req, res) => {

});


module.exports = router;