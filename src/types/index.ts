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
}

export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface FriendRequest {
  id: string;
  status: FriendRequestStatus;
  createdAt?: string;
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

export interface Expense {
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
  AddBill: { groupId?: string; friends?: string[] };
  BillDetails: { bill: Bill };
  Profile: undefined;
};
