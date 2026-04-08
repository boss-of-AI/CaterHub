import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('caterer_token') : null;
    if (token) {
        // Remove wrapping quotes if they exist from storage
        const cleanToken = token.startsWith('"') && token.endsWith('"')
            ? token.slice(1, -1)
            : token;
        config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
});

export default api;