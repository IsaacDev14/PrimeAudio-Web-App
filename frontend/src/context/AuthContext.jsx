import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Idle timeout in milliseconds (15 minutes)
const IDLE_TIMEOUT = 15 * 60 * 1000;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const idleTimerRef = useRef(null);

    // Check for idle timeout
    const checkIdleTimeout = useCallback(() => {
        if (user && Date.now() - lastActivity > IDLE_TIMEOUT) {
            console.log('Session expired due to inactivity');
            logout('Your session has expired due to inactivity.');
        }
    }, [user, lastActivity]);

    // Reset activity timer on user interaction
    const resetActivityTimer = useCallback(() => {
        setLastActivity(Date.now());
    }, []);

    // Set up event listeners for user activity
    useEffect(() => {
        if (user) {
            const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

            events.forEach(event => {
                document.addEventListener(event, resetActivityTimer);
            });

            // Check idle timeout every minute
            idleTimerRef.current = setInterval(checkIdleTimeout, 60000);

            return () => {
                events.forEach(event => {
                    document.removeEventListener(event, resetActivityTimer);
                });
                if (idleTimerRef.current) {
                    clearInterval(idleTimerRef.current);
                }
            };
        }
    }, [user, resetActivityTimer, checkIdleTimeout]);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('http://localhost:8000/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setLastActivity(Date.now());
                } else {
                    // Token invalid - clear everything
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        } else {
            // No token - ensure user is null
            setUser(null);
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch('http://localhost:8000/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                const user = await checkUser();
                setLastActivity(Date.now());
                return { success: true, user };
            } else {
                return { success: false, message: data.detail || 'Login failed' };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Network error" };
        }
    };

    const register = async (email, password, fullName) => {
        const response = await fetch('http://localhost:8000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, full_name: fullName })
        });

        if (response.ok) {
            return login(email, password);
        } else {
            const errorData = await response.json();
            return { success: false, message: errorData.detail || 'Registration failed' };
        }
    };

    const logout = (message = null) => {
        localStorage.removeItem('token');
        setUser(null);
        if (idleTimerRef.current) {
            clearInterval(idleTimerRef.current);
        }
        // Store message for login page to show
        if (message) {
            sessionStorage.setItem('logoutMessage', message);
        }
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading, lastActivity }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
