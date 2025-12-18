import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Interceptor asíncrono para adjuntar el access token de Supabase como Bearer
api.interceptors.request.use(
  async (config) => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      const accessToken = session?.access_token;
      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (err) {
      // Si no hay sesión o hay error, no hacemos nada y dejamos la petición seguir
      console.debug('Could not attach Supabase token to request:', err?.message || err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;