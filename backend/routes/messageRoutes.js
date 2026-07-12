const express = require('express');

const messageController = require('../controllers/messageController');
const validateMessage = require('../middleware/validateMessage');

const router = express.Router();

// Mounted at /api/messages in app.js
router.get('/', messageController.getMessages);
router.post('/', validateMessage, messageController.createMessage);

module.exports = router;
