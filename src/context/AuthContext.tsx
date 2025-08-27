import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types';
import { login as apiLogin, register as apiRegister, logout as apiLogout, storeToken, storeUser, getToken, getUser, getCurrentUser } from '../utils/api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        const user = await getUser();
        
        if (token && user) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          });
        } else {
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiLogin(credentials);
      
      await storeToken(response.token);
      
      // Fetch user data after successful login
      try {
        const user = await getCurrentUser();
        await storeUser(user);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token: response.token }
        });
      } catch (userError) {
        // If we can't get user data, create a basic user object
        const user: AuthUser = {
          id: '',
          name: '',
          email: credentials.email,
        };
        await storeUser(user);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token: response.token }
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiRegister(credentials);
      
      await storeToken(response.token);
      
      // Fetch user data after successful registration
      try {
        const user = await getCurrentUser();
        await storeUser(user);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token: response.token }
        });
      } catch (userError) {
        // If we can't get user data, create a basic user object
        const user: AuthUser = {
          id: '',
          name: credentials.name,
          email: credentials.email,
        };
        await storeUser(user);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token: response.token }
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Starting logout process...');
      await apiLogout();
      console.log('AuthContext: API logout successful, dispatching LOGOUT action');
      dispatch({ type: 'LOGOUT' });
      console.log('AuthContext: Logout complete');
    } catch (error) {
      console.error('AuthContext: Logout failed:', error);
      // Still clear local state even if API call fails
      console.log('AuthContext: Clearing local state despite API failure');
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
