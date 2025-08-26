import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getTotalOwed, formatCurrency } from '../utils/calculations';
import FriendCard from '../components/FriendCard';

const FriendsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state } = useApp();
  const { friends, expenses } = state;

  const getFriendBalance = (friendId: string) => {
    const friendExpenses = expenses.filter(expense => 
      expense.userId === friendId || 
      (expense.billId && state.bills.find(bill => 
        bill.id === expense.billId && bill.paidBy === friendId
      ))
    );
    
    let balance = 0;
    friendExpenses.forEach(expense => {
      const bill = state.bills.find(b => b.id === expense.billId);
      if (bill) {
        if (expense.userId === friendId) {
          balance += expense.amount; // Friend owes this amount
        } else if (bill.paidBy === friendId) {
          balance -= expense.amount; // You owe friend this amount
        }
      }
    });
    
    return balance;
  };

  const renderFriend = ({ item }: { item: any }) => {
    const balance = getFriendBalance(item.user.id);
    
    return (
      <FriendCard
        friend={item}
        showBalance={true}
        balance={balance}
        onPress={() => {
          // Navigate to friend details or chat
        }}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#9E9E9E" />
      <Text style={styles.emptyStateTitle}>No friends yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Add friends to start splitting bills together
      </Text>
      <TouchableOpacity
        style={styles.addFriendButton}
        onPress={() => navigation.navigate('AddFriend' as any)}
      >
        <Ionicons name="person-add" size={20} color="white" />
        <Text style={styles.addFriendButtonText}>Add Friend</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddFriend' as any)}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {friends.length > 0 ? (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
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
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 32,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFriendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FriendsScreen;
