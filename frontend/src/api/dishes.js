
import client from './client';

export async function getDishes() {
  const response = await client.get('/api/dishes');
  const result = response.data;

  // Backend { success: true, data: [...] } qaytarsa,
  // faqat taomlar massivini qaytaramiz.
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;

  return [];
}

export async function getDishById(id) {
  const response = await client.get(`/api/dishes/${id}`);
  const result = response.data;

  return result?.data ?? result;
}

export async function createDish(dishData) {
  const response = await client.post('/api/dishes', dishData);
  return response.data;
}

export async function updateDish(id, dishData) {
  const response = await client.put(`/api/dishes/${id}`, dishData);
  return response.data;
}

export async function deleteDish(id) {
  const response = await client.delete(`/api/dishes/${id}`);
  return response.data;
}
