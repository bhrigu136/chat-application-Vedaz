const messageService = require('../services/messageService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/messages
 * Returns the full chat history (oldest -> newest).
 */
const getMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getMessages();
  res.status(200).json(messages);
});

/**
 * POST /api/messages
 * Creates and persists a new message, then returns it.
 * Body is validated upstream by the validateMessage middleware.
 * The server assigns the id and timestamp.
 */
const createMessage = asyncHandler(async (req, res) => {
  const { text, sender } = req.body;
  const saved = await messageService.saveMessage({ text, sender });
  res.status(201).json(saved);
});

module.exports = { getMessages, createMessage };
