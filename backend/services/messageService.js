const fs = require('fs').promises;
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../storage');
const FILE_PATH = path.join(STORAGE_DIR, 'messages.json');

// Cache messages in memory for fast reads
let messageCache = [];

/**
 * Initialize storage directory and load messages into cache
 */
const initStorage = async () => {
  try {
    // Ensure the storage directory exists
    await fs.mkdir(STORAGE_DIR, { recursive: true });

    // Read the messages file
    const fileExists = await fs.access(FILE_PATH).then(() => true).catch(() => false);
    
    if (fileExists) {
      const fileData = await fs.readFile(FILE_PATH, 'utf8');
      messageCache = JSON.parse(fileData || '[]');
      console.log(`Loaded ${messageCache.length} messages from storage.`);
    } else {
      // Create empty file
      await fs.writeFile(FILE_PATH, JSON.stringify([]));
      messageCache = [];
      console.log('Created new messages.json file.');
    }
  } catch (error) {
    console.error('Failed to initialize message storage:', error);
    messageCache = [];
  }
};

/**
 * Get all stored messages
 */
const getMessages = () => {
  return messageCache;
};

/**
 * Add and persist a new message
 */
const saveMessage = async (message) => {
  try {
    messageCache.push(message);
    // Write cache to disk asynchronously (non-blocking)
    await fs.writeFile(FILE_PATH, JSON.stringify(messageCache, null, 2));
  } catch (error) {
    console.error('Failed to save message to storage:', error);
  }
};

// Initialize right away
initStorage();

module.exports = { getMessages, saveMessage };
