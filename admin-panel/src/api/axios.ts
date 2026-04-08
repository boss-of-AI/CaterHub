import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001', headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('caterme_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) { localStorage.removeItem('caterme_token'); window.location.href = '/login'; }
    return Promise.reject(error);
  }
);

export const broadcastOrder = async (orderId: string, broadcasts: any[]) => { const { data } = await api.patch(`/orders/${orderId}/broadcast`, { broadcasts }); return data; };
export const assignFinalCaterer = async (orderId: string, catererId: string) => { const { data } = await api.patch(`/orders/${orderId}/assign`, { catererId }); return data; };
export const fetchCaterers = async () => { const { data } = await api.get('/caterers'); return data; };
export default api;
