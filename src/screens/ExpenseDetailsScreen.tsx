import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Expense, ExpenseParticipant } from '../types';
import { formatCurrency } from '../utils/calculations';
import Avatar from '../components/Avatar';

const ExpenseDetailsScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { state, dispatch } = useApp();
    const { state: authState } = useAuth();
    const { currentUser } = state;
    const currentAuthUser = authState.user;

    const expense: Expense = (route.params as any)?.expense;
    const friendId: string = (route.params as any)?.friendId; // Optional friend ID for context
    const [isEditing, setIsEditing] = useState(false);

    if (!expense) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
                    <Text style={styles.errorText}>Expense not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'food & dining':
                return 'restaurant';
            case 'transportation':
                return 'car';
            case 'entertainment':
                return 'game-controller';
            case 'shopping':
                return 'bag';
            case 'utilities':
                return 'flash';
            case 'healthcare':
                return 'medical';
            case 'travel':
                return 'airplane';
            case 'education':
                return 'school';
            default:
                return 'card';
        }
    };

    const getSplitTypeLabel = (splitType: string) => {
        switch (splitType) {
            case 'equal':
                return 'Equal Split';
            case 'percentage':
                return 'Percentage Split';
            case 'custom':
                return 'Custom Amounts';
            case 'full_on_other':
                return 'Full on Other';
            case 'full_on_me':
                return 'Full on Me';
            default:
                return splitType;
        }
    };

    const getExpenseTypeInfo = () => {
        const participants = expense.participants || [];
        const hasFriendParticipants = participants.some(p => String(p.source).toUpperCase() === 'FRIEND');
        const hasGroupParticipants = participants.some(p => String(p.source).toUpperCase() === 'GROUP');

        if (hasFriendParticipants && hasGroupParticipants) {
            return {
                type: 'Mixed',
                subtitle: 'Mixed · Group + Friends',
                description: 'This expense is mixed — shared in a group and split among friends.'
            };
        } else if (hasGroupParticipants) {
            const groupParticipant = participants.find(p => String(p.source).toUpperCase() === 'GROUP');
            const groupName = groupParticipant?.sourceId ? `Group ${groupParticipant.sourceId}` : 'Group';
            return {
                type: 'Group',
                subtitle: `Group · ${groupName}`,
                description: `This expense is shared in ${groupName}.`
            };
        } else {
            return {
                type: 'Friend',
                subtitle: 'Shared between you',
                description: 'This expense is shared between you and your friend.'
            };
        }
    };

    const calculatePairBalance = () => {
        if (!friendId || !currentAuthUser?.id) return 0;

        const participants = expense.participants || [];
        const currentUserEntry = participants.find(p => p.userId === currentAuthUser.id);
        const friendEntry = participants.find(p => p.userId === friendId);

        if (expense.paidBy === currentAuthUser.id) {
            // You paid, friend owes you their share
            return friendEntry?.amount ?? 0;
        } else if (expense.paidBy === friendId) {
            // Friend paid, you owe friend your share
            return -(currentUserEntry?.amount ?? 0);
        } else {
            // Paid by a third-party
            return (friendEntry?.amount ?? 0) - (currentUserEntry?.amount ?? 0);
        }
    };

    const getPairBalanceLabel = (pairBalance: number) => {
        if (pairBalance > 0) {
            return {
                text: 'You lent',
                amount: formatCurrency(pairBalance, 'USD'),
                color: '#4CAF50',
                subtext: 'Friend owes you'
            };
        } else if (pairBalance < 0) {
            return {
                text: 'You borrowed',
                amount: formatCurrency(Math.abs(pairBalance), 'USD'),
                color: '#F44336',
                subtext: 'You owe friend'
            };
        } else {
            return {
                text: 'Settled up',
                amount: '',
                color: '#757575',
                subtext: 'No balance between you'
            };
        }
    };

    const handleMarkAsPaid = (participantId: string) => {
        Alert.alert(
            'Mark as Paid',
            'Are you sure you want to mark this payment as completed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Mark as Paid',
                    onPress: () => {
                        dispatch({
                            type: 'UPDATE_ENHANCED_EXPENSE',
                            payload: {
                                id: expense.id,
                                updates: {
                                    participants: expense.participants.map(p =>
                                        p.userId === participantId
                                            ? { ...p, isPaid: true, paidAt: new Date() }
                                            : p
                                    ),
                                },
                            },
                        });
                    },
                },
            ]
        );
    };

    const handleMarkAsUnpaid = (participantId: string) => {
        Alert.alert(
            'Mark as Unpaid',
            'Are you sure you want to mark this payment as unpaid?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Mark as Unpaid',
                    onPress: () => {
                        dispatch({
                            type: 'UPDATE_ENHANCED_EXPENSE',
                            payload: {
                                id: expense.id,
                                updates: {
                                    participants: expense.participants.map(p =>
                                        p.userId === participantId
                                            ? { ...p, isPaid: false, paidAt: undefined }
                                            : p
                                    ),
                                },
                            },
                        });
                    },
                },
            ]
        );
    };

    const handleDeleteExpense = () => {
        Alert.alert(
            'Delete Expense',
            'Are you sure you want to delete this expense? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        dispatch({
                            type: 'DELETE_ENHANCED_EXPENSE',
                            payload: expense.id,
                        });
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const renderParticipant = ({ item }: { item: ExpenseParticipant }) => {
        const isCurrentUser = item.userId === currentUser?.id;

        return (
            <View style={styles.participantItem}>
                <View style={styles.participantInfo}>
                    <View style={styles.participantHeader}>
                        <Text style={styles.participantName}>
                            {item.userName}
                            {isCurrentUser && ' (You)'}
                        </Text>
                        {friendId && (
                            <View style={styles.sourceBadge}>
                                <Text style={styles.sourceText}>
                                    {String(item.source).toUpperCase()}
                                </Text>
                                {item.source === 'group' && item.sourceId && (
                                    <Text style={styles.groupNameText}>
                                        · Group {item.sourceId}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                    <Text style={styles.participantEmail}>{item.userEmail}</Text>
                    {item.percentage && (
                        <Text style={styles.participantPercentage}>
                            {item.percentage}% of total
                        </Text>
                    )}
                </View>

                <View style={styles.participantAmountSection}>
                    <Text style={styles.participantAmount}>
                        {formatCurrency(item.amount)}
                    </Text>

                    <View style={styles.paymentStatus}>
                        {item.isPaid ? (
                            <View style={styles.paidStatus}>
                                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                <Text style={styles.paidText}>Paid</Text>
                                {item.paidAt && (
                                    <Text style={styles.paidDate}>
                                        {new Date(item.paidAt).toLocaleDateString()}
                                    </Text>
                                )}
                            </View>
                        ) : (
                            <View style={styles.unpaidStatus}>
                                <Ionicons name="time" size={20} color="#FFA726" />
                                <Text style={styles.unpaidText}>Unpaid</Text>
                            </View>
                        )}
                    </View>

                    {!isCurrentUser && (
                        <TouchableOpacity
                            style={[
                                styles.paymentButton,
                                item.isPaid ? styles.unpaidButton : styles.paidButton,
                            ]}
                            onPress={() =>
                                item.isPaid
                                    ? handleMarkAsUnpaid(item.userId)
                                    : handleMarkAsPaid(item.userId)
                            }
                        >
                            <Ionicons
                                name={item.isPaid ? "close-circle" : "checkmark-circle"}
                                size={16}
                                color="white"
                            />
                            <Text style={styles.paymentButtonText}>
                                {item.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                            </Text>
                        </TouchableOpacity>
                    )}
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
                <Text style={styles.title}>Expense Details</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                        <Ionicons name="create" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteExpense} style={{ marginLeft: 16 }}>
                        <Ionicons name="trash" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Expense Header */}
                <View style={styles.expenseHeader}>
                    <View style={styles.categoryIcon}>
                        <Ionicons
                            name={getCategoryIcon(expense.category) as any}
                            size={32}
                            color="#007AFF"
                        />
                    </View>
                    <View style={styles.expenseInfo}>
                        <View style={styles.titleRow}>
                            <Text style={styles.expenseTitle}>{expense.title}</Text>
                            {friendId && (
                                <View style={styles.expenseTypeTag}>
                                    <Text style={styles.expenseTypeText}>
                                        {getExpenseTypeInfo().type}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.expenseCategory}>{expense.category}</Text>
                        <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>

                        {/* Pair Balance Section (only shown when viewing from friend context) */}
                        {friendId && (
                            <View style={styles.pairBalanceSection}>
                                {(() => {
                                    const pairBalance = calculatePairBalance();
                                    const balanceLabel = getPairBalanceLabel(pairBalance);
                                    return (
                                        <View style={styles.pairBalanceContainer}>
                                            <Text style={[styles.pairBalanceText, { color: balanceLabel.color }]}>
                                                {balanceLabel.text}
                                            </Text>
                                            {balanceLabel.amount && (
                                                <Text style={[styles.pairBalanceAmount, { color: balanceLabel.color }]}>
                                                    {balanceLabel.amount}
                                                </Text>
                                            )}
                                            <Text style={styles.pairBalanceSubtext}>
                                                {balanceLabel.subtext}
                                            </Text>
                                        </View>
                                    );
                                })()}
                            </View>
                        )}
                    </View>
                </View>

                {/* Expense Type Description (only for mixed expenses) */}
                {friendId && getExpenseTypeInfo().type === 'Mixed' && (
                    <View style={styles.mixedExpenseNotice}>
                        <Text style={styles.mixedExpenseText}>
                            {getExpenseTypeInfo().description}
                        </Text>
                    </View>
                )}

                {/* Expense Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>

                    <View style={styles.detailRow}>
                        <Ionicons name="git-branch" size={20} color="#757575" />
                        <Text style={styles.detailLabel}>Split Type:</Text>
                        <Text style={styles.detailValue}>{getSplitTypeLabel(expense.splitType)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={20} color="#757575" />
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={styles.detailValue}>
                            {new Date(expense.paidAt).toLocaleDateString()}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="person" size={20} color="#757575" />
                        <Text style={styles.detailLabel}>Paid by:</Text>
                        <View style={styles.payerInfo}>
                            <Avatar
                                name={expense.participants.find(p => p.userId === expense.paidBy)?.userName || 'Unknown'}
                                size={24}
                                type="user"
                            />
                            <Text style={styles.detailValue}>
                                {expense.participants.find(p => p.userId === expense.paidBy)?.userName || 'Unknown'}
                            </Text>
                            <Text style={styles.paidLabel}>paid {formatCurrency(expense.amount, 'USD')}</Text>
                        </View>
                    </View>

                    {expense.description && (
                        <View style={styles.descriptionContainer}>
                            <Ionicons name="document-text" size={20} color="#757575" />
                            <Text style={styles.detailLabel}>Description:</Text>
                            <Text style={styles.detailValue}>{expense.description}</Text>
                        </View>
                    )}
                </View>

                {/* Participants */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Participants ({expense.participants.length})
                    </Text>

                    <FlatList
                        data={expense.participants}
                        renderItem={renderParticipant}
                        keyExtractor={(item) => item.userId}
                        scrollEnabled={false}
                        style={styles.participantsList}
                    />
                </View>

                {/* Summary */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Amount:</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(expense.amount)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Paid Amount:</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(
                                expense.participants
                                    .filter(p => p.isPaid)
                                    .reduce((sum, p) => sum + p.amount, 0)
                            )}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Remaining:</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(
                                expense.participants
                                    .filter(p => !p.isPaid)
                                    .reduce((sum, p) => sum + p.amount, 0)
                            )}
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#FF6B6B',
        marginTop: 16,
    },
    expenseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        marginBottom: 12,
    },
    categoryIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    expenseInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    expenseTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    expenseTypeTag: {
        backgroundColor: '#F0F8FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    expenseTypeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#007AFF',
    },
    pairBalanceSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    pairBalanceContainer: {
        alignItems: 'center',
    },
    pairBalanceText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    pairBalanceAmount: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    pairBalanceSubtext: {
        fontSize: 12,
        color: '#757575',
        fontStyle: 'italic',
    },
    mixedExpenseNotice: {
        backgroundColor: '#FFF3E0',
        padding: 12,
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FFA726',
    },
    mixedExpenseText: {
        fontSize: 14,
        color: '#E65100',
        fontStyle: 'italic',
    },
    expenseCategory: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 8,
    },
    expenseAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#007AFF',
    },
    section: {
        backgroundColor: 'white',
        marginBottom: 12,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
        marginRight: 8,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: '#757575',
        flex: 1,
    },
    payerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paidLabel: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
        marginLeft: 8,
    },
    descriptionContainer: {
        marginTop: 8,
    },
    participantsList: {
        backgroundColor: 'white',
    },
    participantItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    participantInfo: {
        flex: 1,
    },
    participantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    participantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    sourceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    sourceText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#007AFF',
        textTransform: 'uppercase',
    },
    groupNameText: {
        fontSize: 10,
        color: '#007AFF',
        marginLeft: 2,
    },
    participantEmail: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 2,
    },
    participantPercentage: {
        fontSize: 12,
        color: '#007AFF',
        fontStyle: 'italic',
    },
    participantAmountSection: {
        alignItems: 'flex-end',
    },
    participantAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    paymentStatus: {
        alignItems: 'center',
        marginBottom: 8,
    },
    paidStatus: {
        alignItems: 'center',
    },
    paidText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
        marginTop: 2,
    },
    paidDate: {
        fontSize: 10,
        color: '#757575',
        marginTop: 2,
    },
    unpaidStatus: {
        alignItems: 'center',
    },
    unpaidText: {
        fontSize: 12,
        color: '#FFA726',
        fontWeight: '600',
        marginTop: 2,
    },
    paymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    paidButton: {
        backgroundColor: '#4CAF50',
    },
    unpaidButton: {
        backgroundColor: '#FFA726',
    },
    paymentButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    summarySection: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default ExpenseDetailsScreen;
