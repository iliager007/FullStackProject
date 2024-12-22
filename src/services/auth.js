const API_URL = 'http://localhost:8000/api/auth';

// Add this function to get CSRF token from cookies
function getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export const authService = {
    async login(username, password) {
        const response = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),  // Add CSRF token
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        return response.json();
    },

    async register(username, password) {
        const response = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),  // Add CSRF token
            },
            credentials: 'include',
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
            method: 'POST',
            headers: {
                'X-CSRFToken': getCsrfToken(),  // Add CSRF token
            },
            credentials: 'include'
        });
        return response.json();
    }
}; 