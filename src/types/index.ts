export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface Friend {
  id: string;
  user: User;
  addedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: User[];
  createdBy: string;
  createdAt: Date;
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
  Home: undefined;
  Friends: undefined;
  Groups: undefined;
  AddFriend: undefined;
  CreateGroup: undefined;
  GroupDetails: { group: Group };
  AddBill: { groupId?: string; friends?: string[] };
  BillDetails: { bill: Bill };
  Profile: undefined;
};
