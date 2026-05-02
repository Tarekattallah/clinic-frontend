import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const GUEST = { _id:'guest', name:'Guest', email:'', role:'guest', token:null, isGuest:true };

// Parse JWT payload to check expiry
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch { return false; }
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token  = localStorage.getItem('token');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // If not guest and token is expired, clear and redirect to login
        if (!parsed.isGuest && !isTokenValid(token)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          setUser(parsed);
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const loginAsGuest = () => {
    localStorage.removeItem('token');
    localStorage.setItem('user', JSON.stringify(GUEST));
    setUser(GUEST);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, loginAsGuest, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
