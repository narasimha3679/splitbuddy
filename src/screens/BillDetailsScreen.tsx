import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Bill } from '../types';
import { formatCurrency } from '../utils/calculations';

const BillDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { state } = useApp();
  const { bill } = route.params as { bill: Bill };
  
  const billExpenses = state.expenses.filter(expense => expense.billId === bill.id);
  const paidByUser = state.currentUser?.id === bill.paidBy ? state.currentUser : 
    state.friends.find(f => f.user.id === bill.paidBy)?.user;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food':
        return 'restaurant';
      case 'transport':
        return 'car';
      case 'entertainment':
        return 'game-controller';
      case 'shopping':
        return 'bag';
      case 'utilities':
        return 'flash';
      default:
        return 'receipt';
    }
  };

  const renderExpense = ({ item }: { item: any }) => {
    const user = state.currentUser?.id === item.userId ? state.currentUser :
      state.friends.find(f => f.user.id === item.userId)?.user;
    
    if (!user) return null;

    return (
      <View style={styles.expenseItem}>
        <View style={styles.expenseUser}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color="#757575" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
        <View style={styles.expenseAmount}>
          <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
          <View style={[styles.statusBadge, item.isPaid ? styles.paidBadge : styles.unpaidBadge]}>
            <Text style={[styles.statusText, item.isPaid ? styles.paidText : styles.unpaidText]}>
              {item.isPaid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Bill Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bill Info */}
        <View style={styles.billInfo}>
          <View style={styles.billIcon}>
            <Ionicons 
              name={getCategoryIcon(bill.category) as any} 
              size={32} 
              color="#007AFF" 
            />
          </View>
          <View style={styles.billDetails}>
            <Text style={styles.billTitle}>{bill.title}</Text>
            {bill.description && (
              <Text style={styles.billDescription}>{bill.description}</Text>
            )}
            <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
            <Text style={styles.billCategory}>{bill.category}</Text>
          </View>
        </View>

        {/* Bill Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Paid by</Text>
            <Text style={styles.detailValue}>{paidByUser?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {new Date(bill.paidAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Split type</Text>
            <Text style={styles.detailValue}>
              {bill.splitType.charAt(0).toUpperCase() + bill.splitType.slice(1)} split
            </Text>
          </View>
          {bill.groupId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Group</Text>
              <Text style={styles.detailValue}>
                {state.groups.find(g => g.id === bill.groupId)?.name || 'Unknown'}
              </Text>
            </View>
          )}
        </View>

        {/* Split Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Split Breakdown</Text>
            <Text style={styles.sectionCount}>{billExpenses.length} participants</Text>
          </View>
          
          <View style={styles.expensesList}>
            <FlatList
              data={billExpenses}
              renderItem={renderExpense}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>{formatCurrency(bill.amount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(billExpenses.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0))}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(billExpenses.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0))}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  billInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  billIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  billDetails: {
    flex: 1,
  },
  billTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  billDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  billAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  billCategory: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  detailsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionCount: {
    fontSize: 14,
    color: '#757575',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  expensesList: {
    backgroundColor: 'white',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expenseUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  paidBadge: {
    backgroundColor: '#E8F5E8',
  },
  unpaidBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paidText: {
    color: '#4CAF50',
  },
  unpaidText: {
    color: '#F44336',
  },
  summarySection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#757575',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default BillDetailsScreen;
