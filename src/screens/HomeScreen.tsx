import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getTotalOwed, getTotalOwedToYou, formatCurrency } from '../utils/calculations';
import BillCard from '../components/BillCard';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state } = useApp();
  const { currentUser, bills, expenses } = state;

  const totalOwed = getTotalOwed(expenses, currentUser?.id || '');
  const totalOwedToYou = getTotalOwedToYou(expenses, currentUser?.id || '');
  const recentBills = bills.slice(0, 5);

  const QuickActionButton = ({ 
    title, 
    icon, 
    onPress, 
    color = '#007AFF' 
  }: {
    title: string;
    icon: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {currentUser?.name}!</Text>
            <Text style={styles.subtitle}>Let's settle up your expenses</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile' as any)}>
            <View style={styles.profileButton}>
              <Ionicons name="person" size={24} color="#007AFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Balance Cards */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>You owe</Text>
            <Text style={[styles.balanceAmount, { color: '#F44336' }]}>
              {formatCurrency(totalOwed)}
            </Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>You're owed</Text>
            <Text style={[styles.balanceAmount, { color: '#4CAF50' }]}>
              {formatCurrency(totalOwedToYou)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title="Add Bill"
              icon="add-circle"
              onPress={() => navigation.navigate('AddBill' as any)}
              color="#007AFF"
            />
            <QuickActionButton
              title="Add Friend"
              icon="person-add"
              onPress={() => navigation.navigate('AddFriend' as any)}
              color="#4CAF50"
            />
            <QuickActionButton
              title="Create Group"
              icon="people"
              onPress={() => navigation.navigate('CreateGroup' as any)}
              color="#FF9800"
            />
            <QuickActionButton
              title="View Friends"
              icon="people-circle"
              onPress={() => navigation.navigate('FriendsTab' as any)}
              color="#9C27B0"
            />
          </View>
        </View>

        {/* Recent Bills */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bills</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GroupsTab' as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentBills.length > 0 ? (
            recentBills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onPress={() => navigation.navigate('BillDetails' as any, { bill })}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#9E9E9E" />
              <Text style={styles.emptyStateText}>No bills yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add your first bill to get started
              </Text>
            </View>
          )}
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
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
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
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default HomeScreen;
