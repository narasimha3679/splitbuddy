import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Friend } from '../types';
import Avatar from './Avatar';

interface FriendCardProps {
  friend: Friend;
  onPress?: () => void;
  showBalance?: boolean;
  balance?: number;
}

const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onPress,
  showBalance = false,
  balance = 0
}) => {
  const getBalanceColor = (balance: number) => {
    if (balance > 0) return '#4CAF50';
    if (balance < 0) return '#F44336';
    return '#757575';
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `You owe $${balance.toFixed(2)}`;
    if (balance < 0) return `Owes you $${Math.abs(balance).toFixed(2)}`;
    return 'Settled up';
  };

  // Handle both old format (direct user object) and new format (nested user object)
  const user = friend.user || friend;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Avatar
          name={user.name}
          size={50}
          type="user"
          customAvatar={user.avatar}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{user.name}</Text>
      </View>

      {showBalance && (
        <View style={styles.balanceContainer}>
          <Text style={[styles.balance, { color: getBalanceColor(balance) }]}>
            {getBalanceText(balance)}
          </Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={20} color="#757575" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  balanceContainer: {
    marginRight: 8,
  },
  balance: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FriendCard;
