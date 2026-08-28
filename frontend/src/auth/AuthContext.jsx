import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'chatty.authToken';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

    const login = (newToken) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
    };

    const userId = token ? jwtDecode(token).userId : null;

    return (
        <AuthContext.Provider value={{ token, userId, isLoggedIn: Boolean(token), login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
