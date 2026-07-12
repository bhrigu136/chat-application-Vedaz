/**
 * Validates the body of POST /api/messages before it reaches the controller.
 * Responds with 400 on invalid input; otherwise passes control onward.
 */
const validateMessage = (req, res, next) => {
  const { text, sender } = req.body || {};

  if (typeof text !== 'string' || !text.trim()) {
    return res
      .status(400)
      .json({ error: 'Message "text" is required and must be a non-empty string.' });
  }

  if (typeof sender !== 'string' || !sender.trim()) {
    return res
      .status(400)
      .json({ error: 'Message "sender" is required and must be a non-empty string.' });
  }

  next();
};

module.exports = validateMessage;
