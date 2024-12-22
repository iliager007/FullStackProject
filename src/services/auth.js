const API_URL = 'http://84.201.154.208:8000/api/auth';

function getCsrfToken() {
    const name = 'csrftoken';
    if (!document.cookie) return null;
    
    const cookie = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith(`${name}=`));
        
    return cookie ? decodeURIComponent(cookie.trim().substring(name.length + 1)) : null;
}

const getDefaultHeaders = () => ({
    'Content-Type': 'application/json',
    'X-CSRFToken': getCsrfToken()
 });
 const getDefaultOptions = () => ({
    credentials: 'include',
    headers: getDefaultHeaders()
 });

export const authService = {
    async login(username, password) {
        const response = await fetch(`${API_URL}/login/`, {
            ...getDefaultOptions(),
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        return response.json();
    },

    async register(username, password) {
        const response = await fetch(`${API_URL}/register/`, {
            ...getDefaultOptions(),
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        return response.json();
    },

    async checkAuth() {
        const response = await fetch(`${API_URL}/check-auth/`, {
            credentials: 'include'
        });
        return response.json();
    },

    async logout() {
        const response = await fetch(`${API_URL}/logout/`, {
            ...getDefaultOptions(),
            method: 'POST'
        });
        return response.json();
    }
};