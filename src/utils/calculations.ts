import { Bill, Expense, SplitResult, User } from '../types';

export const calculateEqualSplit = (bill: Bill, participants: User[]): SplitResult[] => {
  const amountPerPerson = bill.amount / participants.length;
  
  return participants.map(user => ({
    userId: user.id,
    userName: user.name,
    amount: amountPerPerson,
    isPaid: user.id === bill.paidBy,
  }));
};

export const calculatePercentageSplit = (
  bill: Bill,
  participants: User[],
  percentages: { [userId: string]: number }
): SplitResult[] => {
  return participants.map(user => {
    const percentage = percentages[user.id] || 0;
    const amount = (bill.amount * percentage) / 100;
    
    return {
      userId: user.id,
      userName: user.name,
      amount,
      isPaid: user.id === bill.paidBy,
    };
  });
};

export const calculateCustomSplit = (
  bill: Bill,
  participants: User[],
  customAmounts: { [userId: string]: number }
): SplitResult[] => {
  return participants.map(user => {
    const amount = customAmounts[user.id] || 0;
    
    return {
      userId: user.id,
      userName: user.name,
      amount,
      isPaid: user.id === bill.paidBy,
    };
  });
};

export const getTotalOwed = (expenses: Expense[], userId: string): number => {
  return expenses
    .filter(expense => expense.userId === userId && !expense.isPaid)
    .reduce((total, expense) => total + expense.amount, 0);
};

export const getTotalOwedToYou = (expenses: Expense[], paidByUserId: string): number => {
  return expenses
    .filter(expense => expense.userId !== paidByUserId && !expense.isPaid)
    .reduce((total, expense) => total + expense.amount, 0);
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
