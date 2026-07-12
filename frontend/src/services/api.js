import { SERVER_URL } from '../constants/config';

/**
 * Fetch the full chat history from the REST API.
 * Used on chat screen mount; live updates arrive over the socket.
 */
export const fetchMessages = async () => {
  const response = await fetch(`${SERVER_URL}/api/messages`);
  if (!response.ok) {
    throw new Error(`Failed to load messages (HTTP ${response.status})`);
  }
  return response.json();
};
