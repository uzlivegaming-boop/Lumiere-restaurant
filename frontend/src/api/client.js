
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: API_URL || 'https://lumiere-restaurant-sjkw.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default client;
