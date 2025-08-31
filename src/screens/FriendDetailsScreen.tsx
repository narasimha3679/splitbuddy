import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Friend, Expense } from '../types';
import { useAuth } from '../context/AuthContext';
import { getFriendExpenses } from '../utils/api';
import { showErrorAlert } from '../utils/alerts';
import Avatar from '../components/Avatar';
import FriendExpenseCard from '../components/FriendExpenseCard';
import { formatCurrency } from '../utils/calculations';

type FriendDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FriendDetails'>;
type FriendDetailsScreenRouteProp = RouteProp<RootStackParamList, 'FriendDetails'>;

interface FriendExpenseData {
    friendId: number;
    friendName: string;
    totalOwedToFriend: number;
    totalOwedByFriend: number;
    netBalance: number;
    sharedExpenses: Expense[];
}

const FriendDetailsScreen: React.FC = () => {
    const navigation = useNavigation<FriendDetailsScreenNavigationProp>();
    const route = useRoute<FriendDetailsScreenRouteProp>();
    const { state: authState } = useAuth();
    const { friend } = route.params;
    const currentUser = authState.user;

    const [expenseData, setExpenseData] = useState<FriendExpenseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadFriendExpenses = async () => {
        try {
            setLoading(true);
            const user = friend.user || friend;
            const data = await getFriendExpenses(user.id);

            // Handle different API response structures
            const responseData = data.data || data;
            setExpenseData(responseData);
        } catch (error: any) {
            console.error('Error loading friend expenses:', error);
            showErrorAlert(error.message || 'Failed to load friend expenses');
            // Set empty data to show empty state
            setExpenseData({
                friendId: 0,
                friendName: '',
                totalOwedToFriend: 0,
                totalOwedByFriend: 0,
                netBalance: 0,
                sharedExpenses: []
            });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFriendExpenses();
        setRefreshing(false);
    };

    useEffect(() => {
        loadFriendExpenses();
    }, [friend]);

    const getBalanceColor = (balance: number) => {
        if (balance > 0) return '#4CAF50'; // Green for positive (friend owes you)
        if (balance < 0) return '#F44336'; // Red for negative (you owe friend)
        return '#757575'; // Gray for zero
    };

    const getBalanceText = (balance: number) => {
        if (balance > 0) return `You lent $${balance.toFixed(2)}`;
        if (balance < 0) return `You borrowed $${Math.abs(balance).toFixed(2)}`;
        return 'Settled up';
    };

    const renderExpense = ({ item }: { item: Expense }) => (
        <FriendExpenseCard
            expense={item}
            currentUserId={currentUser?.id || ''}
            friendId={user.id}
            onPress={() => navigation.navigate('ExpenseDetails', { expense: item, friendId: user.id })}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#9E9E9E" />
            <Text style={styles.emptyStateTitle}>No shared expenses</Text>
            <Text style={styles.emptyStateSubtitle}>
                You haven't shared any expenses with this friend yet
            </Text>
            <TouchableOpacity
                style={styles.addExpenseButton}
                onPress={() => navigation.navigate('AddExpense', { friends: [user.id] })}
            >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addExpenseButtonText}>Add Expense</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading friend details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const user = friend.user || friend;
    const netBalance = expenseData?.netBalance || 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom header with back button */}
            <View style={styles.customHeader}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Friend Details</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Header with friend info and balance */}
            <View style={styles.header}>
                <View style={styles.friendInfo}>
                    <Avatar
                        name={user.name}
                        size={60}
                        type="user"
                        customAvatar={user.avatar}
                    />
                    <View style={styles.friendDetails}>
                        <Text style={styles.friendName}>{user.name}</Text>
                        <Text style={styles.friendEmail}>{user.email}</Text>
                    </View>
                </View>
                <View style={styles.balanceContainer}>
                    <Text style={[styles.balanceAmount, { color: getBalanceColor(netBalance) }]}>
                        {formatCurrency(Math.abs(netBalance), 'USD')}
                    </Text>
                    <Text style={[styles.balanceText, { color: getBalanceColor(netBalance) }]}>
                        {getBalanceText(netBalance)}
                    </Text>
                    {expenseData && (
                        <View style={styles.balanceBreakdown}>
                            <Text style={styles.breakdownText}>
                                You owe: {formatCurrency(expenseData.totalOwedToFriend, 'USD')}
                            </Text>
                            <Text style={styles.breakdownText}>
                                They owe: {formatCurrency(expenseData.totalOwedByFriend, 'USD')}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Expenses list */}
            <View style={styles.expensesSection}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <Text style={styles.sectionTitle}>
                            Shared Expenses
                        </Text>
                        <View style={styles.expenseCount}>
                            <Text style={styles.expenseCountText}>
                                {expenseData?.sharedExpenses?.length || 0}
                            </Text>
                        </View>
                    </View>
                    {expenseData?.sharedExpenses && expenseData.sharedExpenses.length > 0 && (
                        <View style={styles.summaryContainer}>
                            <Text style={styles.summaryText}>
                                Total shared: {formatCurrency(expenseData.totalOwedToFriend + expenseData.totalOwedByFriend, 'USD')}
                            </Text>
                        </View>
                    )}
                </View>
                {expenseData?.sharedExpenses && expenseData.sharedExpenses.length > 0 ? (
                    <FlatList
                        data={expenseData.sharedExpenses.sort((a, b) =>
                            new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
                        )}
                        renderItem={renderExpense}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.expensesList}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                ) : (
                    renderEmptyState()
                )}
            </View>

            {/* Floating Action Button for adding expenses */}
            {expenseData?.sharedExpenses && expenseData.sharedExpenses.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddExpense', { friends: [user.id] })}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    headerSpacer: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#757575',
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    friendDetails: {
        marginLeft: 16,
        flex: 1,
    },
    friendName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    friendEmail: {
        fontSize: 16,
        color: '#757575',
    },
    balanceContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
    },
    balanceText: {
        fontSize: 16,
        fontWeight: '500',
    },
    balanceBreakdown: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        alignItems: 'center',
    },
    breakdownText: {
        fontSize: 14,
        color: '#757575',
        marginVertical: 2,
    },
    expensesSection: {
        flex: 1,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expenseCount: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 8,
    },
    expenseCountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    summaryContainer: {
        backgroundColor: '#F0F8FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    summaryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#007AFF',
    },
    expensesList: {
        paddingHorizontal: 16,
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
    addExpenseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addExpenseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default FriendDetailsScreen;
