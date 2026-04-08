import api from '../api/axios';

const handleLogin = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });

        // Store the JWT token and user info
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        alert('Welcome to CaterMe Mumbai!');
        // Redirect to Admin Dashboard
    } catch (error) {
        alert(error.response?.data?.message || 'Login failed');
    }
};