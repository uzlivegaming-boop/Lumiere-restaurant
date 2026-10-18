
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenProvider = null;

export function setTokenProvider(provider) {
  tokenProvider = provider;
}

client.interceptors.request.use(
  async (config) => {
    if (typeof tokenProvider !== 'function') {
      throw new Error(
        'Clerk hali tayyor emas. Sahifani yangilang va qayta urinib ko‘ring.'
      );
    }

    const token = await tokenProvider();

    if (!token) {
      throw new Error(
        'Clerk token olinmadi. Hisobga kirganingizni tekshiring.'
      );
    }

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        '401 Unauthorized: Clerk kalitlari, token yoki backend autentifikatsiyasini tekshiring.'
      );
    }

    return Promise.reject(error);
  }
);

export default client;
