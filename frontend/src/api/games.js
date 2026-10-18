// frontend/src/api/games.js

import client from './client';

export async function getGames() {
  const response = await client.get('/games');

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.data || [];
}

export async function getGameById(id) {
  const response = await client.get(`/games/${id}`);

  return response.data?.data || response.data;
}

export async function createGame(gameData) {
  const response = await client.post('/games', gameData);

  return response.data?.data || response.data;
}

export async function updateGame(id, gameData) {
  const response = await client.put(
    `/games/${id}`,
    gameData
  );

  return response.data?.data || response.data;
}

export async function deleteGame(id) {
  const response = await client.delete(`/games/${id}`);

  return response.data;
}

export async function getGameComments(gameKey) {
  const response = await client.get(
    `/games/comments/${encodeURIComponent(gameKey)}`
  );

  return response.data?.data || [];
}

export async function createGameComment(
  gameKey,
  content,
  userName
) {
  const response = await client.post(
    `/games/comments/${encodeURIComponent(gameKey)}`,
    { content, userName }
  );

  return response.data?.data;
}