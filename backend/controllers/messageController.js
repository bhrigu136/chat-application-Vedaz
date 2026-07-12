const messageService = require('../services/messageService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/messages
 * Returns the full chat history.
 *
 * Note: `messageService.getMessages()` is currently synchronous (in-memory
 * cache), but we await it so the switch to an async database layer in Phase 3
 * requires no change here.
 */
const getMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getMessages();
  res.status(200).json(messages);
});

/**
 * POST /api/messages
 * Creates and persists a new message, then returns it.
 * Body is validated upstream by the validateMessage middleware.
 */
const createMessage = asyncHandler(async (req, res) => {
  const { text, sender, timestamp } = req.body;

  const message = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
    text: text.trim(),
    sender: sender.trim(),
    timestamp:
      timestamp ||
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  await messageService.saveMessage(message);

  res.status(201).json(message);
});

module.exports = { getMessages, createMessage };
