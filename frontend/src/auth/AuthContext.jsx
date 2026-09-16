import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { refreshSession } from '../api/auth';

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'chatty.authToken';
const REFRESH_AHEAD_MS = 5 * 60 * 1000;
const AuthContext = createContext(null);

export function getTokenMsRemaining(token) {
    if (!token) {
        return 0;
    }

    try {
        const { exp } = jwtDecode(token);

        if (typeof exp !== 'number') {
            return 0;
        }

        return exp * 1000 - Date.now();
    } catch {
        return 0;
    }
}

export function isTokenValid(token) {
    return getTokenMsRemaining(token) > 0;
}

function readStoredToken() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!isTokenValid(token)) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
    }

    return token;
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(readStoredToken);
    const tokenRef = useRef(token);
    const refreshingRef = useRef(false);

    tokenRef.current = token;

    const login = useCallback((newToken) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
    }, []);

    const refreshIfNeeded = useCallback(async () => {
        const current = tokenRef.current;

        if (!isTokenValid(current)) {
            if (current) {
                logout();
            }

            return;
        }

        if (getTokenMsRemaining(current) > REFRESH_AHEAD_MS || refreshingRef.current) {
            return;
        }

        refreshingRef.current = true;

        try {
            const response = await refreshSession();
            const nextToken = response.data?.token;

            if (nextToken) {
                login(nextToken);
            }
        } catch (error) {
            if (error.response?.status === 401 || !isTokenValid(tokenRef.current)) {
                logout();
            }
        } finally {
            refreshingRef.current = false;
        }
    }, [login, logout]);

    useEffect(() => {
        if (!token || !isTokenValid(token)) {
            return;
        }

        const delay = Math.max(0, getTokenMsRemaining(token) - REFRESH_AHEAD_MS);
        const timeoutId = setTimeout(() => {
            refreshIfNeeded();
        }, delay);

        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                refreshIfNeeded();
            }
        };

        document.addEventListener('visibilitychange', onVisible);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [token, refreshIfNeeded]);

    const userId = token && isTokenValid(token) ? jwtDecode(token).userId : null;
    const value = useMemo(
        () => ({
            token: userId ? token : null,
            userId,
            isLoggedIn: Boolean(userId),
            login,
            logout,
        }),
        [token, userId, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>
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
