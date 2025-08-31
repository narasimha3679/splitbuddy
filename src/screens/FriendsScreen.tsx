import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getTotalOwed, formatCurrency } from '../utils/calculations';
import FriendCard from '../components/FriendCard';
import { getFriendsWithBalances, getPendingFriendRequests, getUser } from '../utils/api';
import { showErrorAlert } from '../utils/alerts';

type FriendsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const FriendsScreen: React.FC = () => {
  const navigation = useNavigation<FriendsScreenNavigationProp>();
  const { state, dispatch } = useApp();
  const { state: authState } = useAuth();
  const { friends, expenses } = state;
  const currentUser = authState.user;
  const [refreshing, setRefreshing] = useState(false);

  const loadFriends = async () => {
    try {
      const currentUser = await getUser();
      if (!currentUser) {
        showErrorAlert('User not found');
        return;
      }

      console.log('FriendsScreen: Loading friends with balances for user:', currentUser.id);
      const friendsWithBalances = await getFriendsWithBalances(currentUser.id);
      console.log('FriendsScreen: Received friends with balances:', friendsWithBalances.length, 'friends');
      console.log('FriendsScreen: Friends with balances data:', JSON.stringify(friendsWithBalances, null, 2));

      // Transform the FriendBalance data to match the Friend structure expected by the app
      const friendsList = friendsWithBalances.map(friendBalance => ({
        id: friendBalance.friendId,
        user: {
          id: friendBalance.friendId,
          name: friendBalance.friendName,
          email: '', // Not provided by the new API
          phone: '', // Not provided by the new API
          avatar: '' // Not provided by the new API
        },
        addedAt: new Date(), // Not provided by the new API
        balance: friendBalance.balance // Add balance to the friend object
      }));

      dispatch({ type: 'SET_FRIENDS', payload: friendsList });
    } catch (error: any) {
      console.error('FriendsScreen: Error loading friends with balances:', error);
      showErrorAlert(error.message || 'Failed to load friends');
    }
  };

  const loadPendingRequests = async () => {
    try {
      const currentUser = await getUser();
      if (!currentUser) return;

      const requests = await getPendingFriendRequests(currentUser.id);
      console.log('FriendsScreen - Friend requests loaded:', requests.length);
      dispatch({ type: 'SET_FRIEND_REQUESTS', payload: requests });
    } catch (error: any) {
      console.error('Failed to load pending requests:', error);
      // Don't show alert here as it's not critical for the main screen
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFriends(), loadPendingRequests()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);



  const renderFriend = ({ item }: { item: any }) => {
    console.log('Rendering friend item:', JSON.stringify(item, null, 2));

    // Handle case where user property might not exist
    if (!item) {
      console.warn('Friend item is null or undefined:', item);
      return null;
    }

    // Handle both old format (direct user object) and new format (nested user object)
    const user = item.user || item;
    if (!user || !user.id) {
      console.warn('Friend item missing user data:', item);
      return null;
    }

    // Use the balance from the API response instead of calculating it locally
    const balance = item.balance || 0;

    return (
      <FriendCard
        friend={item}
        showBalance={true}
        balance={balance}
        onPress={() => {
          navigation.navigate('FriendDetails', { friend: item });
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
        onPress={() => navigation.navigate('AddFriend')}
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
        <View style={styles.headerButtons}>
          {state.friendRequests.length > 0 && (
            <TouchableOpacity
              style={styles.requestsButton}
              onPress={() => navigation.navigate('FriendRequests')}
            >
              <Ionicons name="mail" size={20} color="#007AFF" />
              <Text style={styles.requestsButtonText}>{state.friendRequests.length}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddFriend')}
          >
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {friends.length > 0 ? (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  requestsButtonText: {
    color: '#E65100',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
