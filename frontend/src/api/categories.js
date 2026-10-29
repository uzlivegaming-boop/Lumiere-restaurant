
import client from './client';

export async function getCategories() {
  const response = await client.get('/api/categories');
  const result = response.data;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;

  return [];
}

export async function createCategory(categoryData) {
  const response = await client.post('/api/categories', categoryData);
  return response.data;
}

export async function updateCategory(id, categoryData) {
  const response = await client.put(
    `/api/categories/${id}`,
    categoryData
  );

  return response.data;
}

export async function deleteCategory(id) {
  const response = await client.delete(`/api/categories/${id}`);
  return response.data;
}
