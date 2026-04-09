import React, { createContext, useContext, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { isLoaded: isAuthLoaded, getToken } = useClerkAuth();
  const { signOut } = useClerk();

  // Map Clerk user to our app's user format
  const user = isSignedIn && clerkUser ? {
    email: clerkUser.primaryEmailAddress?.emailAddress,
    role: clerkUser.publicMetadata?.role || 'user',
    id: clerkUser.id
  } : null;

  const loading = !isUserLoaded || !isAuthLoaded;

  // Intercept all axios requests to automatically attach the Clerk Token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(async (config) => {
      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          if (clerkUser?.primaryEmailAddress?.emailAddress) {
             config.headers['X-User-Email'] = clerkUser.primaryEmailAddress.emailAddress;
          }
        }
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [isSignedIn, getToken, clerkUser]);

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
