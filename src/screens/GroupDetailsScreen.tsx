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
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Group, RootStackParamList } from '../types';

type GroupDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GroupDetails'>;
type GroupDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetails'>;
import BillCard from '../components/BillCard';
import FriendCard from '../components/FriendCard';
import Avatar from '../components/Avatar';
import FloatingActionButton from '../components/FloatingActionButton';
import { getContainerTopPadding, getHeaderTopPadding } from '../utils/statusBar';

const GroupDetailsScreen: React.FC = () => {
  const navigation = useNavigation<GroupDetailsScreenNavigationProp>();
  const route = useRoute<GroupDetailsScreenRouteProp>();
  const { state } = useApp();
  const { group } = route.params;

  // Filter enhanced expenses for this group
  const groupBills = state.enhancedExpenses.filter(expense =>
    expense.participants.some(p => p.source === 'group' && p.sourceId === group.id)
  );
  const groupMembers = group.members;

  const renderMember = ({ item }: { item: any }) => (
    <FriendCard
      friend={{ id: item.id, user: item, addedAt: new Date() }}
      onPress={() => {
        // Navigate to member details or chat
      }}
    />
  );

  const renderBill = ({ item }: { item: any }) => (
    <BillCard
      bill={item}
      onPress={() => navigation.navigate('BillDetails', { bill: item })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{group.name}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddBill', { groupId: group.id })}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Info */}
        <View style={styles.groupInfo}>
          <View style={styles.groupAvatar}>
            <Avatar
              name={group.name}
              size={60}
              type="group"
              customAvatar={group.avatar}
            />
          </View>
          <View style={styles.groupDetails}>
            <Text style={styles.groupName}>{group.name}</Text>
            {group.description && (
              <Text style={styles.groupDescription}>{group.description}</Text>
            )}
            <Text style={styles.memberCount}>
              {groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('AddBill', { groupId: group.id })}
          >
            <Ionicons name="add-circle" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Add Bill</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              // Navigate to group settings or edit
            }}
          >
            <Ionicons name="settings" size={24} color="#757575" />
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members</Text>
            <Text style={styles.sectionCount}>{groupMembers.length}</Text>
          </View>

          <FlatList
            data={groupMembers}
            renderItem={renderMember}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.membersList}
          />
        </View>

        {/* Bills Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bills</Text>
            <Text style={styles.sectionCount}>{groupBills.length}</Text>
          </View>

          {groupBills.length > 0 ? (
            <FlatList
              data={groupBills}
              renderItem={renderBill}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              style={styles.billsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#9E9E9E" />
              <Text style={styles.emptyStateText}>No bills yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add the first bill to this group
              </Text>
              <TouchableOpacity
                style={styles.addBillButton}
                onPress={() => navigation.navigate('AddBill', { groupId: group.id })}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.addBillButtonText}>Add Bill</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton
        onPress={() => navigation.navigate('AddBill', { groupId: group.id })}
        icon="add"
      />
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  groupAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickActionText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
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
  membersList: {
    backgroundColor: 'white',
  },
  billsList: {
    backgroundColor: 'white',
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
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  addBillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addBillButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default GroupDetailsScreen;
