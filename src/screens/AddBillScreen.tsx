import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Bill, Expense } from '../types';
import { generateId, formatCurrency } from '../utils/calculations';
import { showErrorAlert, showSuccessAlert } from '../utils/alerts';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Other'
];

const SPLIT_TYPES = [
  { key: 'equal', label: 'Equal Split' },
  { key: 'percentage', label: 'Percentage Split' },
  { key: 'custom', label: 'Custom Amounts' },
];

const AddBillScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { state, dispatch } = useApp();
  const { friends, groups, currentUser } = state;

  // Get pre-selected participants from navigation params
  const preSelectedGroupId = route.params?.groupId;
  const preSelectedFriends = route.params?.friends || [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(preSelectedGroupId);
  const [selectedFriends, setSelectedFriends] = useState<string[]>(preSelectedFriends);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSplitTypePicker, setShowSplitTypePicker] = useState(false);

  const handleAddBill = () => {
    if (!title.trim()) {
      showErrorAlert('Please enter a bill title');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showErrorAlert('Please enter a valid amount');
      return;
    }

    const participants: string[] = [];

    // Add group members if group is selected
    if (selectedGroupId) {
      const group = groups.find(g => g.id === selectedGroupId);
      if (group) {
        participants.push(...group.members.map(m => m.id));
      }
    }

    // Add selected friends
    participants.push(...selectedFriends);

    // Add current user if not already included
    if (!participants.includes(currentUser?.id || '')) {
      participants.push(currentUser?.id || '');
    }

    if (participants.length < 2) {
      showErrorAlert('Please select at least one participant');
      return;
    }

    const newBill: Bill = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      amount: parseFloat(amount),
      currency: 'USD',
      paidBy: currentUser?.id || '',
      paidAt: new Date(),
      category,
      splitType,
      groupId: selectedGroupId,
      friends: selectedFriends.length > 0 ? selectedFriends : undefined,
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_BILL', payload: newBill });

    // Create expenses for each participant
    const amountPerPerson = parseFloat(amount) / participants.length;
    participants.forEach(participantId => {
      if (participantId !== currentUser?.id) {
        const expense: Expense = {
          id: generateId(),
          billId: newBill.id,
          userId: participantId,
          amount: amountPerPerson,
          isPaid: false,
        };
        dispatch({ type: 'ADD_EXPENSE', payload: expense });
      }
    });

    showSuccessAlert(`Bill "${title}" has been added!`, () => navigation.goBack());
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const renderFriend = ({ item }: { item: any }) => {
    const isSelected = selectedFriends.includes(item.user.id);

    return (
      <TouchableOpacity
        style={[styles.participantItem, isSelected && styles.participantItemSelected]}
        onPress={() => toggleFriendSelection(item.user.id)}
      >
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{item.user.name}</Text>
          <Text style={styles.participantEmail}>{item.user.email}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroup = ({ item }: { item: any }) => {
    const isSelected = selectedGroupId === item.id;

    return (
      <TouchableOpacity
        style={[styles.participantItem, isSelected && styles.participantItemSelected]}
        onPress={() => setSelectedGroupId(isSelected ? undefined : item.id)}
      >
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{item.name}</Text>
          <Text style={styles.participantEmail}>
            {item.members.length} member{item.members.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Bill</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Bill Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bill Details</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter bill title"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter description (optional)"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text style={styles.pickerButtonText}>{category}</Text>
                  <Ionicons name="chevron-down" size={20} color="#757575" />
                </TouchableOpacity>
                {showCategoryPicker && (
                  <View style={styles.pickerOptions}>
                    {CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={styles.pickerOption}
                        onPress={() => {
                          setCategory(cat);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Split Type</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowSplitTypePicker(!showSplitTypePicker)}
                >
                  <Text style={styles.pickerButtonText}>
                    {SPLIT_TYPES.find(t => t.key === splitType)?.label}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#757575" />
                </TouchableOpacity>
                {showSplitTypePicker && (
                  <View style={styles.pickerOptions}>
                    {SPLIT_TYPES.map(type => (
                      <TouchableOpacity
                        key={type.key}
                        style={styles.pickerOption}
                        onPress={() => {
                          setSplitType(type.key as any);
                          setShowSplitTypePicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{type.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Participants */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Participants</Text>

              {groups.length > 0 && (
                <View style={styles.participantsSubsection}>
                  <Text style={styles.subsectionTitle}>Groups</Text>
                  <FlatList
                    data={groups}
                    renderItem={renderGroup}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    style={styles.participantsList}
                  />
                </View>
              )}

              {friends.length > 0 && (
                <View style={styles.participantsSubsection}>
                  <Text style={styles.subsectionTitle}>Friends</Text>
                  <FlatList
                    data={friends}
                    renderItem={renderFriend}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    style={styles.participantsList}
                  />
                </View>
              )}

              {groups.length === 0 && friends.length === 0 && (
                <View style={styles.noParticipantsContainer}>
                  <Ionicons name="people-outline" size={48} color="#9E9E9E" />
                  <Text style={styles.noParticipantsText}>No groups or friends</Text>
                  <Text style={styles.noParticipantsSubtext}>
                    Create groups or add friends to split bills
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                (!title.trim() || !amount || parseFloat(amount) <= 0) && styles.addButtonDisabled,
              ]}
              onPress={handleAddBill}
              disabled={!title.trim() || !amount || parseFloat(amount) <= 0}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Bill</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptions: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 4,
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  participantsSubsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    marginBottom: 8,
  },
  participantsList: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  participantItemSelected: {
    backgroundColor: '#F0F8FF',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  participantEmail: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  noParticipantsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  noParticipantsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  noParticipantsSubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddBillScreen;
