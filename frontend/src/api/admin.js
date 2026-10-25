
import client from './client';

export async function adminLogin(password) {
  const response = await client.post('/api/admin/login', { password });
  return response.data;
}

export async function getAdminStatus() {
  const response = await client.get('/api/admin/me');
  return response.data;
}

export async function getAdminOrders() {
  const response = await client.get('/api/admin/orders');
  return response.data;
}

export async function adminLogout() {
  const response = await client.post('/api/admin/logout');
  return response.data;
}

export async function updateOrderStatus(id, status) {
  const response = await client.patch(
    `/api/admin/orders/${id}/status`,
    { status }
  );

  return response.data;
}

// Stol band qilishlar ro‘yxatini olish
export async function getAdminBookings() {
  const response = await client.get('/api/admin/bookings');
  return response.data;
}

// Stol band qilish holatini o‘zgartirish
export async function updateBookingStatus(id, status) {
  const response = await client.patch(
    `/api/admin/bookings/${id}/status`,
    { status }
  );

  return response.data;
}
