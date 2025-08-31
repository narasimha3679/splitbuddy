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
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/calculations';
import LogoutTest from '../components/LogoutTest';
import Avatar from '../components/Avatar';
import { showConfirmationAlert } from '../utils/alerts';
import { getContainerTopPadding, getHeaderTopPadding } from '../utils/statusBar';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state } = useApp();
  const { enhancedExpenses } = state;
  const { state: authState, logout } = useAuth();
  const currentUser = authState.user;

  // Calculate totals from enhanced expenses
  const totalBills = enhancedExpenses.length;
  const totalOwed = enhancedExpenses
    .filter(expense => {
      const participant = expense.participants.find(p => p.userId === currentUser?.id);
      return participant && !participant.isPaid;
    })
    .reduce((sum, expense) => {
      const participant = expense.participants.find(p => p.userId === currentUser?.id);
      return sum + (participant?.amount || 0);
    }, 0);
  const totalOwedToYou = enhancedExpenses
    .filter(expense => expense.paidBy === currentUser?.id)
    .reduce((sum, expense) => {
      const unpaidParticipants = expense.participants.filter(p => !p.isPaid && p.userId !== currentUser?.id);
      return sum + unpaidParticipants.reduce((participantSum, p) => participantSum + p.amount, 0);
    }, 0);

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon as any} size={24} color="#007AFF" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#757575" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Avatar
              name={currentUser?.name || 'User'}
              size={80}
              type="user"
              customAvatar={currentUser?.avatar}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{currentUser?.name}</Text>
            <Text style={styles.userEmail}>{currentUser?.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalBills}</Text>
            <Text style={styles.statLabel}>Total Bills</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>
              {formatCurrency(totalOwed)}
            </Text>
            <Text style={styles.statLabel}>You Owe</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
              {formatCurrency(totalOwedToYou)}
            </Text>
            <Text style={styles.statLabel}>You're Owed</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          <MenuItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => {
              // Navigate to edit profile
            }}
          />

          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={() => {
              // Navigate to notifications settings
            }}
          />

          <MenuItem
            icon="lock-closed-outline"
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() => {
              // Navigate to privacy settings
            }}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>App</Text>

          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => {
              // Navigate to help
            }}
          />

          <MenuItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => {
              // Navigate to terms
            }}
          />

          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => {
              // Navigate to privacy policy
            }}
          />

          <MenuItem
            icon="information-circle-outline"
            title="About"
            subtitle="App version and information"
            onPress={() => {
              // Navigate to about
            }}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Data</Text>

          <MenuItem
            icon="download-outline"
            title="Export Data"
            subtitle="Download your data"
            onPress={() => {
              // Handle data export
            }}
          />

          <MenuItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={() => {
              showConfirmationAlert(
                'Delete Account',
                'Are you sure you want to delete your account? This action cannot be undone.',
                () => {
                  // Handle account deletion
                }
              );
            }}
          />
        </View>

        <View style={styles.versionSection}>
          <Text style={styles.versionText}>SplitBuddy v1.0.0</Text>
        </View>

        {/* Debug Test Component */}
        <LogoutTest />
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
    paddingTop: getHeaderTopPadding(),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#757575',
  },
  statsSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
  },
  menuSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  versionSection: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
});

export default ProfileScreen;
