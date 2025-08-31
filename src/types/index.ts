export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}

export interface Friend {
  id: string;
  user: User;
  addedAt: Date;
  balance?: number; // Optional balance from the API
}

export interface FriendBalance {
  friendId: string;
  friendName: string;
  balance: number;
}

export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface FriendRequest {
  id: number;
  senderName: string;
  senderEmail: string;
  createdAt: string;
  status?: FriendRequestStatus;
  sender?: User;
  receiver?: User;
}

export interface UserSearchResult extends User { }

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: User[];
  createdBy: User;
  createdAt?: Date;
  avatar?: string;
}

// Enhanced Expense/Bill types
export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  paidBy: string; // User ID
  paidAt: Date;
  splitType: SplitType;
  participants: ExpenseParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number; // How much this person owes
  percentage?: number; // For percentage splits
  isPaid: boolean;
  paidAt?: Date;
  source: 'friend' | 'group'; // How they were added
  sourceId?: string; // Friend ID or Group ID
}

export type SplitType =
  | 'equal'
  | 'percentage'
  | 'custom'
  | 'full_on_other'
  | 'full_on_me';

export interface SplitOption {
  key: SplitType;
  label: string;
  description: string;
  availableFor: 'single' | 'multiple' | 'both';
}

// Legacy Bill interface for backward compatibility
export interface Bill {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  paidBy: string; // User ID
  paidAt: Date;
  category: string;
  splitType: 'equal' | 'percentage' | 'custom';
  groupId?: string;
  friends?: string[]; // User IDs
  createdAt: Date;
}

// Legacy Expense interface for backward compatibility
export interface LegacyExpense {
  id: string;
  billId: string;
  userId: string;
  amount: number;
  isPaid: boolean;
  paidAt?: Date;
}

export interface SplitResult {
  userId: string;
  userName: string;
  amount: number;
  isPaid: boolean;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Activities: undefined;
  Friends: undefined;
  Groups: undefined;
  AddFriend: undefined;
  FriendRequests: undefined;
  CreateGroup: undefined;
  GroupDetails: { group: Group };
  AddExpense: { groupId?: string; friends?: string[] };
  AddBill: { groupId: string };
  ExpenseDetails: { expense: Expense; friendId?: string };
  BillDetails: { bill: Expense };
  FriendDetails: { friend: Friend };
  Profile: undefined;
};
