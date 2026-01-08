import axios from 'axios';

//create axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    headers:{
        'Content-Type': 'application/json',
    }
})
// Request interceptor - automatically adds authentication token to requests
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        // If request setup fails, reject the promise
        return Promise.reject(error)
    }
)
// Response interceptor - handles errors and authentication failures
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response && error.response.status === 401) {

            if (typeof window !== 'undefined') {

                localStorage.removeItem('token')

                window.location.href ='/login'
            }
        }
        return Promise.reject(error)
    }
)
export default api