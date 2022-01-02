//INITIAL SETUP.
const express = require('express');
const router = express.Router();
const { migrateExistingUsersToChatEngine } = require('../controllers/chatEngine');

router.patch('/migrateExisting', migrateExistingUsersToChatEngine);

module.exports = router;