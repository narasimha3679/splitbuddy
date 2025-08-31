import React, { useState, useEffect, useMemo } from 'react';
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
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Expense, ExpenseParticipant, SplitType, SplitOption, User } from '../types';
import { generateId, formatCurrency } from '../utils/calculations';
import { showErrorAlert, showSuccessAlert } from '../utils/alerts';

const CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Other'
];

const SPLIT_OPTIONS: SplitOption[] = [
    {
        key: 'equal',
        label: 'Equal Split',
        description: 'Split equally among all participants',
        availableFor: 'both'
    },
    {
        key: 'percentage',
        label: 'Percentage Split',
        description: 'Split based on percentages',
        availableFor: 'multiple'
    },
    {
        key: 'custom',
        label: 'Custom Amounts',
        description: 'Set specific amounts for each person',
        availableFor: 'multiple'
    },
    {
        key: 'full_on_other',
        label: 'Full on Other',
        description: 'Other person pays the full amount',
        availableFor: 'single'
    },
    {
        key: 'full_on_me',
        label: 'Full on Me',
        description: 'I pay the full amount',
        availableFor: 'single'
    },
];

const AddExpenseScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { state, dispatch } = useApp();
    const { friends, groups, currentUser } = state;

    // Get pre-selected participants from navigation params
    const preSelectedGroupId = (route.params as any)?.groupId;
    const preSelectedFriends = (route.params as any)?.friends || [];

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food & Dining');
    const [splitType, setSplitType] = useState<SplitType>('equal');
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(preSelectedGroupId ? [preSelectedGroupId] : []);
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(preSelectedFriends);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showSplitTypePicker, setShowSplitTypePicker] = useState(false);
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
    const [percentages, setPercentages] = useState<Record<string, string>>({});

    // Get all unique participants (deduplicated)
    const allParticipants = useMemo(() => {
        const participants = new Map<string, User>();

        // Add current user
        if (currentUser) {
            participants.set(currentUser.id, currentUser);
        }

        // Add selected friends
        selectedFriendIds.forEach(friendId => {
            const friend = friends.find(f => f.user.id === friendId);
            if (friend) {
                participants.set(friend.user.id, friend.user);
            }
        });

        // Add group members (deduplicated)
        selectedGroupIds.forEach(groupId => {
            const group = groups.find(g => g.id === groupId);
            if (group) {
                group.members.forEach(member => {
                    participants.set(member.id, member);
                });
            }
        });

        return Array.from(participants.values());
    }, [currentUser, friends, groups, selectedFriendIds, selectedGroupIds]);

    const participantCount = allParticipants.length;
    const isSingleParticipant = participantCount === 2; // Current user + 1 other
    const isMultipleParticipants = participantCount > 2;

    // Filter split options based on participant count
    const availableSplitOptions = useMemo(() => {
        return SPLIT_OPTIONS.filter(option => {
            if (option.availableFor === 'both') return true;
            if (option.availableFor === 'single' && isSingleParticipant) return true;
            if (option.availableFor === 'multiple' && isMultipleParticipants) return true;
            return false;
        });
    }, [isSingleParticipant, isMultipleParticipants]);

    // Auto-select appropriate split type when participant count changes
    useEffect(() => {
        if (isSingleParticipant && !['full_on_other', 'full_on_me', 'equal'].includes(splitType)) {
            setSplitType('equal');
        } else if (isMultipleParticipants && ['full_on_other', 'full_on_me'].includes(splitType)) {
            setSplitType('equal');
        }
    }, [isSingleParticipant, isMultipleParticipants, splitType]);

    // Calculate split amounts
    const calculateSplitAmounts = (): ExpenseParticipant[] => {
        const totalAmount = parseFloat(amount) || 0;
        const participants = allParticipants.filter(p => p.id !== currentUser?.id);

        if (splitType === 'full_on_other' && participants.length === 1) {
            return [{
                userId: participants[0].id,
                userName: participants[0].name,
                userEmail: participants[0].email,
                amount: totalAmount,
                isPaid: false,
                source: 'friend',
                sourceId: selectedFriendIds[0],
            }];
        }

        if (splitType === 'full_on_me') {
            return participants.map(p => ({
                userId: p.id,
                userName: p.name,
                userEmail: p.email,
                amount: 0,
                isPaid: false,
                source: 'friend',
                sourceId: selectedFriendIds.find(fid => {
                    const friend = friends.find(f => f.user.id === fid);
                    return friend?.user.id === p.id;
                }),
            }));
        }

        if (splitType === 'equal') {
            const amountPerPerson = totalAmount / participantCount;
            return participants.map(p => ({
                userId: p.id,
                userName: p.name,
                userEmail: p.email,
                amount: amountPerPerson,
                isPaid: false,
                source: 'friend',
                sourceId: selectedFriendIds.find(fid => {
                    const friend = friends.find(f => f.user.id === fid);
                    return friend?.user.id === p.id;
                }),
            }));
        }

        if (splitType === 'percentage') {
            return participants.map(p => {
                const percentage = parseFloat(percentages[p.id] || '0');
                return {
                    userId: p.id,
                    userName: p.name,
                    userEmail: p.email,
                    amount: (totalAmount * percentage) / 100,
                    percentage,
                    isPaid: false,
                    source: 'friend',
                    sourceId: selectedFriendIds.find(fid => {
                        const friend = friends.find(f => f.user.id === fid);
                        return friend?.user.id === p.id;
                    }),
                };
            });
        }

        if (splitType === 'custom') {
            return participants.map(p => {
                const customAmount = parseFloat(customAmounts[p.id] || '0');
                return {
                    userId: p.id,
                    userName: p.name,
                    userEmail: p.email,
                    amount: customAmount,
                    isPaid: false,
                    source: 'friend',
                    sourceId: selectedFriendIds.find(fid => {
                        const friend = friends.find(f => f.user.id === fid);
                        return friend?.user.id === p.id;
                    }),
                };
            });
        }

        return [];
    };

    const handleAddExpense = () => {
        if (!title.trim()) {
            showErrorAlert('Please enter an expense title');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            showErrorAlert('Please enter a valid amount');
            return;
        }

        if (allParticipants.length < 2) {
            showErrorAlert('Please select at least one participant');
            return;
        }

        // Validate custom amounts
        if (splitType === 'custom') {
            const totalCustomAmount = Object.values(customAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            const totalAmount = parseFloat(amount);
            if (Math.abs(totalCustomAmount - totalAmount) > 0.01) {
                showErrorAlert('Custom amounts must equal the total expense amount');
                return;
            }
        }

        // Validate percentages
        if (splitType === 'percentage') {
            const totalPercentage = Object.values(percentages).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            if (Math.abs(totalPercentage - 100) > 0.01) {
                showErrorAlert('Percentages must equal 100%');
                return;
            }
        }

        const participants = calculateSplitAmounts();

        const newExpense: Expense = {
            id: generateId(),
            title: title.trim(),
            description: description.trim() || undefined,
            amount: parseFloat(amount),
            currency: 'USD',
            paidBy: currentUser?.id || '',
            paidAt: new Date(),
            category,
            splitType,
            participants,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Add to context (will be replaced with API call later)
        dispatch({ type: 'ADD_ENHANCED_EXPENSE', payload: newExpense });

        showSuccessAlert(`Expense "${title}" has been added!`, () => navigation.goBack());
    };

    const toggleGroupSelection = (groupId: string) => {
        setSelectedGroupIds(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const toggleFriendSelection = (friendId: string) => {
        setSelectedFriendIds(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const renderParticipant = ({ item }: { item: User }) => {
        const isCurrentUser = item.id === currentUser?.id;
        const isSelected = selectedFriendIds.includes(item.id) ||
            selectedGroupIds.some(groupId => {
                const group = groups.find(g => g.id === groupId);
                return group?.members.some(m => m.id === item.id);
            });

        return (
            <View style={styles.participantItem}>
                <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>
                        {item.name}{isCurrentUser ? ' (You)' : ''}
                    </Text>
                </View>
                {splitType === 'custom' && (
                    <TextInput
                        style={styles.amountInput}
                        value={customAmounts[item.id] || ''}
                        onChangeText={(text) => setCustomAmounts(prev => ({ ...prev, [item.id]: text }))}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                    />
                )}
                {splitType === 'percentage' && (
                    <TextInput
                        style={styles.percentageInput}
                        value={percentages[item.id] || ''}
                        onChangeText={(text) => setPercentages(prev => ({ ...prev, [item.id]: text }))}
                        placeholder="0"
                        keyboardType="decimal-pad"
                    />
                )}
                {splitType === 'equal' && (
                    <Text style={styles.equalAmount}>
                        {formatCurrency((parseFloat(amount) || 0) / participantCount)}
                    </Text>
                )}
            </View>
        );
    };

    const renderGroup = ({ item }: { item: any }) => {
        const isSelected = selectedGroupIds.includes(item.id);

        return (
            <TouchableOpacity
                style={[styles.participantItem, isSelected && styles.participantItemSelected]}
                onPress={() => toggleGroupSelection(item.id)}
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

    const renderFriend = ({ item }: { item: any }) => {
        const isSelected = selectedFriendIds.includes(item.user.id);

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
                    <Text style={styles.title}>Add Expense</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        {/* Expense Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Expense Details</Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Title *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Enter expense title"
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
                        </View>

                        {/* Participants */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Participants ({allParticipants.length})</Text>

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
                                        Create groups or add friends to split expenses
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Split Type */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Split Type</Text>
                            <TouchableOpacity
                                style={styles.pickerButton}
                                onPress={() => setShowSplitTypePicker(!showSplitTypePicker)}
                            >
                                <Text style={styles.pickerButtonText}>
                                    {availableSplitOptions.find(t => t.key === splitType)?.label}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#757575" />
                            </TouchableOpacity>
                            {showSplitTypePicker && (
                                <View style={styles.pickerOptions}>
                                    {availableSplitOptions.map(option => (
                                        <TouchableOpacity
                                            key={option.key}
                                            style={styles.pickerOption}
                                            onPress={() => {
                                                setSplitType(option.key);
                                                setShowSplitTypePicker(false);
                                            }}
                                        >
                                            <Text style={styles.pickerOptionText}>{option.label}</Text>
                                            <Text style={styles.pickerOptionDescription}>{option.description}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Split Preview */}
                        {allParticipants.length > 1 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Split Preview</Text>
                                <View style={styles.splitPreviewContainer}>
                                    <FlatList
                                        data={allParticipants}
                                        renderItem={renderParticipant}
                                        keyExtractor={(item) => item.id}
                                        scrollEnabled={false}
                                    />
                                    {splitType === 'custom' && (
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Total:</Text>
                                            <Text style={styles.totalAmount}>
                                                {formatCurrency(Object.values(customAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0))}
                                            </Text>
                                        </View>
                                    )}
                                    {splitType === 'percentage' && (
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Total:</Text>
                                            <Text style={styles.totalAmount}>
                                                {Object.values(percentages).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)}%
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                (!title.trim() || !amount || parseFloat(amount) <= 0) && styles.addButtonDisabled,
                            ]}
                            onPress={handleAddExpense}
                            disabled={!title.trim() || !amount || parseFloat(amount) <= 0}
                        >
                            <Ionicons name="add-circle" size={20} color="white" />
                            <Text style={styles.addButtonText}>Add Expense</Text>
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
    pickerOptionDescription: {
        fontSize: 14,
        color: '#757575',
        marginTop: 2,
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
    amountInput: {
        width: 80,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        padding: 8,
        fontSize: 14,
        textAlign: 'center',
    },
    percentageInput: {
        width: 60,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        padding: 8,
        fontSize: 14,
        textAlign: 'center',
    },
    equalAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    splitPreviewContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#F8F9FA',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
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

export default AddExpenseScreen;
