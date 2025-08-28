import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { LoginCredentials, RegisterCredentials, AuthResponse, AuthUser, User, FriendRequest, Friend } from '../types';


// Try IP address first, fallback to localhost
const API_BASE_URL = 'http://100.78.225.115:4321/api';
const FALLBACK_API_BASE_URL = 'http://localhost:4321/api';

// Token management
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'auth_user';

// Fallback storage for web environment
const webStorage = {
  token: null as string | null,
  user: null as any,
};

export const storeToken = async (token: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      webStorage.token = token;
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.warn('Failed to store token:', error);
    // Fallback to web storage even on mobile if SecureStore fails
    webStorage.token = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    let token: string | null;
    if (Platform.OS === 'web') {
      token = webStorage.token || localStorage.getItem(TOKEN_KEY);
    } else {
      token = await SecureStore.getItemAsync(TOKEN_KEY);
    }
    console.log('API: Retrieved token:', token ? 'present' : 'null');
    return token;
  } catch (error) {
    console.warn('Failed to get token:', error);
    // Fallback to web storage
    const fallbackToken = webStorage.token || (typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);
    console.log('API: Fallback token:', fallbackToken ? 'present' : 'null');
    return fallbackToken;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      webStorage.token = null;
      localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.warn('Failed to remove token:', error);
    // Fallback to web storage
    webStorage.token = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
};

export const storeUser = async (user: any): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      webStorage.user = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.warn('Failed to store user:', error);
    // Fallback to web storage
    webStorage.user = user;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }
};

export const getUser = async (): Promise<any | null> => {
  try {
    if (Platform.OS === 'web') {
      // Check if webStorage.user is already an object
      if (webStorage.user) {
        console.log('API: getUser - returning webStorage.user:', webStorage.user);
        return webStorage.user;
      }
      const userStr = localStorage.getItem(USER_KEY);
      console.log('API: getUser - localStorage userStr:', userStr);
      return userStr ? JSON.parse(userStr) : null;
    } else {
      const userStr = await SecureStore.getItemAsync(USER_KEY);
      console.log('API: getUser - SecureStore userStr:', userStr);
      return userStr ? JSON.parse(userStr) : null;
    }
  } catch (error) {
    console.warn('Failed to get user:', error);
    // Fallback to web storage
    if (webStorage.user) {
      console.log('API: getUser - fallback webStorage.user:', webStorage.user);
      return webStorage.user;
    }
    const userStr = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    console.log('API: getUser - fallback localStorage userStr:', userStr);
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      webStorage.user = null;
      localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.warn('Failed to remove user:', error);
    // Fallback to web storage
    webStorage.user = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  }
};

// Test API connectivity
const testApiConnection = async (url: string): Promise<boolean> => {
  try {
    // Use a simple GET request to test connectivity instead of POST
    const response = await fetch(`${url}/auth/login`, {
      method: 'OPTIONS', // Preflight request
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return true; // If we get any response, the server is reachable
  } catch (error) {
    console.log(`API test failed for ${url}:`, error);
    return false;
  }
};

// Get the working API base URL
const getApiBaseUrl = async (): Promise<string> => {
  // Try IP address first
  if (await testApiConnection(API_BASE_URL)) {
    return API_BASE_URL;
  }

  // Fallback to localhost
  if (await testApiConnection(FALLBACK_API_BASE_URL)) {
    return FALLBACK_API_BASE_URL;
  }

  // If neither works, default to IP address (will show proper error)
  return API_BASE_URL;
};

// API functions
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const baseUrl = await getApiBaseUrl();
  console.log('Attempting login with baseUrl:', baseUrl);

  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    console.log('API: Login successful, storing token');
    await storeToken(data.token);
    return data;
  } catch (error) {
    console.error('Login request failed:', error);
    console.log('Request URL:', `${baseUrl}/auth/login`);
    console.log('Request headers:', { 'Content-Type': 'application/json' });
    throw error;
  }
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();
  console.log('API: Registration successful, storing token');
  await storeToken(data.token);
  return data;
};

export const logout = async (): Promise<void> => {
  console.log('API: Starting logout - removing token and user data');
  await removeToken();
  console.log('API: Token removed successfully');
  await removeUser();
  console.log('API: User data removed successfully');
  console.log('API: Logout complete');
};

// Get current user data
export const getCurrentUser = async (): Promise<AuthUser> => {
  const baseUrl = await getApiBaseUrl();
  const response = await authenticatedFetch(`${baseUrl}/auth/me`);

  if (!response.ok) {
    throw new Error('Failed to get user data');
  }

  const user = await response.json();
  return user;
};

// Authenticated API requests
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await getToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  console.log('API: Making authenticated request to:', url);
  console.log('API: Token present:', !!token);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

// Friends: user search and friend requests
export const searchUserByEmail = async (email: string): Promise<User | null> => {
  const baseUrl = await getApiBaseUrl();
  console.log('API: Searching for user with email:', email);
  console.log('API: Using base URL:', baseUrl);

  const response = await authenticatedFetch(`${baseUrl}/users/search?email=${encodeURIComponent(email)}`, {
    method: 'GET',
  });

  console.log('API: Search response status:', response.status);

  if (response.status === 404) {
    console.log('API: User not found');
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.log('API: Search error:', error);
    throw new Error(error.message || 'Failed to search user');
  }

  const user: User = await response.json();
  console.log('API: User found:', user.name);
  return user;
};

// Get friends list
export const getFriends = async (userId: string): Promise<Friend[]> => {
  const baseUrl = await getApiBaseUrl();
  console.log('API: Getting friends for user:', userId);
  console.log('API: Using URL:', `${baseUrl}/friends/${userId}/friends`);

  const response = await authenticatedFetch(`${baseUrl}/friends/${userId}/friends`, {
    method: 'GET',
  });

  console.log('API: Friends response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.log('API: Friends error:', error);
    throw new Error(error.message || 'Failed to get friends');
  }

  const friendsData = await response.json();
  console.log('API: Friends raw response:', JSON.stringify(friendsData, null, 2));

  // Transform the response to match the Friend type structure
  const friends: Friend[] = friendsData.map((user: any) => ({
    id: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar
    },
    addedAt: new Date() // Since the API doesn't provide addedAt, we'll use current date
  }));

  console.log('API: Transformed friends:', JSON.stringify(friends, null, 2));
  return friends;
};

// Get pending friend requests
export const getPendingFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
  const baseUrl = await getApiBaseUrl();
  console.log('API: Getting pending friend requests for user:', userId);
  console.log('API: Using URL:', `${baseUrl}/friends/${userId}/pending-requests`);

  const response = await authenticatedFetch(`${baseUrl}/friends/${userId}/pending-requests`, {
    method: 'GET',
  });

  console.log('API: Pending requests response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.log('API: Pending requests error:', error);
    throw new Error(error.message || 'Failed to get pending requests');
  }

  const requests: FriendRequest[] = await response.json();
  console.log('API: Pending requests response:', JSON.stringify(requests, null, 2));
  return requests;
};

// Send friend request
export const sendFriendRequest = async (senderId: string, receiverId: string): Promise<FriendRequest> => {
  const baseUrl = await getApiBaseUrl();
  const response = await authenticatedFetch(`${baseUrl}/friends/requests`, {
    method: 'POST',
    body: JSON.stringify({ senderId, receiverId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to send friend request');
  }

  const request: FriendRequest = await response.json();
  return request;
};

// Accept friend request
export const acceptFriendRequest = async (requestId: string): Promise<FriendRequest> => {
  const baseUrl = await getApiBaseUrl();
  const response = await authenticatedFetch(`${baseUrl}/friends/requests/${requestId}?response=ACCEPTED`, {
    method: 'PUT',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to accept friend request');
  }

  const updated: FriendRequest = await response.json();
  return updated;
};

// Decline friend request
export const declineFriendRequest = async (requestId: string): Promise<FriendRequest> => {
  const baseUrl = await getApiBaseUrl();
  const response = await authenticatedFetch(`${baseUrl}/friends/requests/${requestId}?response=REJECTED`, {
    method: 'PUT',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to decline friend request');
  }

  const updated: FriendRequest = await response.json();
  return updated;
};
