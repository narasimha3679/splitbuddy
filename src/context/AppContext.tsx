import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Friend, Group, LegacyExpense, FriendRequest, Expense } from '../types';
import { useAuth } from './AuthContext';

interface AppState {
  currentUser: User | null;
  friends: Friend[];
  groups: Group[];
  expenses: LegacyExpense[];
  enhancedExpenses: Expense[]; // New enhanced expenses
  friendRequests: FriendRequest[];
}

type AppAction =
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'SET_FRIENDS'; payload: Friend[] }
  | { type: 'ADD_FRIEND'; payload: Friend }
  | { type: 'REMOVE_FRIEND'; payload: string }
  | { type: 'SET_FRIEND_REQUESTS'; payload: FriendRequest[] }
  | { type: 'ADD_FRIEND_REQUEST'; payload: FriendRequest }
  | { type: 'UPDATE_FRIEND_REQUEST'; payload: FriendRequest }
  | { type: 'REMOVE_FRIEND_REQUEST'; payload: number }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'CREATE_GROUP'; payload: Group }

  | { type: 'ADD_EXPENSE'; payload: LegacyExpense }
  | { type: 'UPDATE_EXPENSE'; payload: { id: string; updates: Partial<LegacyExpense> } }
  | { type: 'ADD_ENHANCED_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_ENHANCED_EXPENSE'; payload: { id: string; updates: Partial<Expense> } }
  | { type: 'DELETE_ENHANCED_EXPENSE'; payload: string };

const initialState: AppState = {
  currentUser: null,
  friends: [],
  groups: [],

  expenses: [],
  enhancedExpenses: [],
  friendRequests: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_FRIENDS':
      return { ...state, friends: action.payload };
    case 'ADD_FRIEND':
      return { ...state, friends: [...state.friends, action.payload] };
    case 'SET_FRIEND_REQUESTS':
      return { ...state, friendRequests: action.payload };
    case 'ADD_FRIEND_REQUEST':
      return { ...state, friendRequests: [action.payload, ...state.friendRequests] };
    case 'UPDATE_FRIEND_REQUEST':
      return {
        ...state,
        friendRequests: state.friendRequests.map(fr => fr.id === action.payload.id ? action.payload : fr),
      };
    case 'REMOVE_FRIEND_REQUEST':
      return {
        ...state,
        friendRequests: state.friendRequests.filter(fr => fr.id !== action.payload),
      };
    case 'REMOVE_FRIEND':
      return { ...state, friends: state.friends.filter(f => f.id !== action.payload) };
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'CREATE_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };

    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id
            ? { ...expense, ...action.payload.updates }
            : expense
        ),
      };
    case 'ADD_ENHANCED_EXPENSE':
      return { ...state, enhancedExpenses: [...state.enhancedExpenses, action.payload] };
    case 'UPDATE_ENHANCED_EXPENSE':
      return {
        ...state,
        enhancedExpenses: state.enhancedExpenses.map(expense =>
          expense.id === action.payload.id
            ? { ...expense, ...action.payload.updates, updatedAt: new Date() }
            : expense
        ),
      };
    case 'DELETE_ENHANCED_EXPENSE':
      return {
        ...state,
        enhancedExpenses: state.enhancedExpenses.filter(expense => expense.id !== action.payload),
      };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { state: authState } = useAuth();

  // Sync current user with auth state
  useEffect(() => {
    if (authState.user) {
      dispatch({
        type: 'SET_CURRENT_USER',
        payload: authState.user as User
      });
    }
  }, [authState.user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
