import axios from 'axios';

// No baseURL: let Vite proxy forward /api/* to http://localhost:8000
const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
