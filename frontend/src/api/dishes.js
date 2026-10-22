import client from './client';

export async function getDishes() {
  const response = await client.get('/api/dishes');
  return response.data;
}

export async function getDishById(id) {
  const response = await client.get(`/api/dishes/${id}`);
  return response.data;
}
