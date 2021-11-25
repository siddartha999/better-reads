const express = require('express');
const router = express.Router();
const googleAuthController = require('../controllers/auth');

router.post('/googlelogin', googleAuthController);

module.exports = router;