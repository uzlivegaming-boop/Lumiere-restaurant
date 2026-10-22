
import client from './client';

export async function createOrder(orderData) {
  const response = await client.post('/api/orders', orderData);

  return response.data;
}
