import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import GroupCard from '../components/GroupCard';
import FloatingActionButton from '../components/FloatingActionButton';
import { getMyGroups } from '../utils/api';
import { getContainerTopPadding, getHeaderTopPadding } from '../utils/statusBar';

const GroupsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useApp();
  const { groups } = state;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await getMyGroups();
      dispatch({ type: 'SET_GROUPS', payload: groupsData });
    } catch (error) {
      console.error('Failed to load groups:', error);
      Alert.alert('Error', 'Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // Refresh groups when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadGroups();
    }, [])
  );

  const renderGroup = ({ item }: { item: any }) => (
    <GroupCard
      group={item}
      onPress={() => (navigation as any).navigate('GroupDetails', { group: item })}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-outline" size={64} color="#9E9E9E" />
      <Text style={styles.emptyStateTitle}>No groups yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Create a group to split bills with multiple friends
      </Text>
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={() => (navigation as any).navigate('CreateGroup')}
      >
        <Ionicons name="add-circle" size={20} color="white" />
        <Text style={styles.createGroupButtonText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => (navigation as any).navigate('CreateGroup')}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={32} color="#007AFF" />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      ) : groups.length > 0 ? (
        <FlatList
          data={groups}
          renderItem={renderGroup}
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

      <FloatingActionButton
        onPress={() => (navigation as any).navigate('AddExpense')}
        icon="add"
      />
    </SafeAreaView >
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
    paddingBottom: 100, // Space for FAB
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
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createGroupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 12,
  },
});

export default GroupsScreen;
