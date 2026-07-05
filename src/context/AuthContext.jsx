import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session is saved locally
    const savedUser = localStorage.getItem('shivshakti_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = (identity, password) => {
    // Simulated auth check logic
    let profile = null;

    if (identity === 'admin@shivshakti.com' && password === 'admin123') {
      profile = { identity, role: 'admin', name: 'Ravi Ramesh Nishad' };
    } else if (identity.toUpperCase().startsWith('L-') && password === 'worker123') {
      profile = { identity: identity.toUpperCase(), role: 'labour', name: 'Ramesh Kumar' };
    }

    if (profile) {
      localStorage.setItem('shivshakti_session', JSON.stringify(profile));
      setUser(profile);
      return { success: true, role: profile.role };
    }
    
    return { success: false, message: 'Invalid credentials! Use admin@shivshakti.com/admin123 or L-101/worker123' };
  };

  // Registration handler (Simulated)
  const registerLabour = (name, mobile, password) => {
    // In production, this hits your MongoDB backend API
    const mockGeneratedId = `L-${Math.floor(100 + Math.random() * 900)}`;
    alert(`Registration Successful! Your Worker Login ID is: ${mockGeneratedId}`);
    return { success: true, id: mockGeneratedId };
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('shivshakti_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerLabour, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);