import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('cg_user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem('cg_user');
    }
  }, []);

  function loginUser(token, userData) {
    localStorage.setItem('cg_user_token', token);
    localStorage.setItem('cg_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logoutUser() {
    localStorage.removeItem('cg_user_token');
    localStorage.removeItem('cg_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
