import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    RefreshControl,
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Friend, Expense } from '../types';
import { useAuth } from '../context/AuthContext';
import { getFriendExpenses } from '../utils/api';
import { showErrorAlert } from '../utils/alerts';
import Avatar from '../components/Avatar';
import FriendExpenseCard from '../components/FriendExpenseCard';
import FloatingActionButton from '../components/FloatingActionButton';
import { formatCurrency } from '../utils/calculations';
import { getContainerTopPadding, getHeaderTopPadding } from '../utils/statusBar';

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

const { width } = Dimensions.get('window');

const FriendDetailsScreen: React.FC = () => {
    const navigation = useNavigation<FriendDetailsScreenNavigationProp>();
    const route = useRoute<FriendDetailsScreenRouteProp>();
    const { state: authState } = useAuth();
    const { friend } = route.params;
    const currentUser = authState.user;

    const [expenseData, setExpenseData] = useState<FriendExpenseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Only keep scroll animation for subtle header effects
    const scrollY = new Animated.Value(0);

    const user = useMemo(() => friend.user || friend, [friend]);

    // Optimized data loading with better error handling
    const loadFriendExpenses = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const data = await getFriendExpenses(user.id);
            const responseData = data.data || data;
            setExpenseData(responseData);
        } catch (error: any) {
            console.error('Error loading friend expenses:', error);
            showErrorAlert(error.message || 'Failed to load friend expenses');
            // Only set empty data if we don't have existing data
            if (!expenseData) {
                setExpenseData({
                    friendId: Number(user.id),
                    friendName: user.name,
                    totalOwedToFriend: 0,
                    totalOwedByFriend: 0,
                    netBalance: 0,
                    sharedExpenses: []
                });
            }
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFriendExpenses(false);
        setRefreshing(false);
    };

    // Use useFocusEffect for better performance
    useFocusEffect(
        React.useCallback(() => {
            loadFriendExpenses();
        }, [user.id])
    );

    // Memoized calculations
    const balanceInfo = useMemo(() => {
        const balance = expenseData?.netBalance || 0;
        const isPositive = balance > 0;
        const isNegative = balance < 0;


        return {
            amount: Math.abs(balance),
            color: isPositive ? '#10B981' : isNegative ? '#EF4444' : '#6B7280',
            text: isPositive ? 'owes you' : isNegative ? 'you owe' : 'settled up',
            bgColor: isPositive ? '#ECFDF5' : isNegative ? '#FEF2F2' : '#F9FAFB',
            icon: isPositive ? 'trending-up' as const : isNegative ? 'trending-down' as const : 'checkmark-circle' as const
        };
    }, [expenseData?.netBalance]);

    const expenseStats = useMemo(() => {
        if (!expenseData?.sharedExpenses) return { total: 0, count: 0 };

        const expenses = expenseData.sharedExpenses;
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        return {
            total,
            count: expenses.length,
            avgAmount: expenses.length > 0 ? total / expenses.length : 0
        };
    }, [expenseData?.sharedExpenses]);

    const sortedExpenses = useMemo(() => {
        return expenseData?.sharedExpenses?.sort((a, b) =>
            new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
        ) || [];
    }, [expenseData?.sharedExpenses]);

    const renderExpense = ({ item, index }: { item: Expense; index: number }) => (
        <View style={styles.expenseCard}>
            <FriendExpenseCard
                expense={item}
                currentUserId={currentUser?.id || ''}
                friendId={user.id}
                onPress={() => navigation.navigate('ExpenseDetails', {
                    expense: item,
                    friendId: user.id
                })}
            />
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyStateTitle}>No shared expenses yet</Text>
            <Text style={styles.emptyStateSubtitle}>
                Start tracking expenses with {user.name}
            </Text>
            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('AddExpense', { friends: [user.id] })}
                activeOpacity={0.8}
            >
                <Ionicons name="add-circle" size={18} color="white" />
                <Text style={styles.primaryButtonText}>Add First Expense</Text>
            </TouchableOpacity>
        </View>
    );

    const renderQuickActions = () => (
        <View style={styles.quickActions}>
            <TouchableOpacity
                style={[styles.actionButton, styles.primaryAction]}
                onPress={() => navigation.navigate('AddExpense', { friends: [user.id] })}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={16} color="white" />
                <Text style={styles.actionButtonText}>Add Expense</Text>
            </TouchableOpacity>

            {balanceInfo.amount > 0 && (
                <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryAction]}
                    onPress={() => {
                        // TODO: Implement settle up functionality
                        console.log('Settle up with', user.id);
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="card" size={16} color="#007AFF" />
                    <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>
                        Settle Up
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading expenses...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Animated Header */}
            <Animated.View
                style={[
                    styles.customHeader,
                    {
                        shadowOpacity: scrollY.interpolate({
                            inputRange: [0, 50],
                            outputRange: [0, 0.08],
                            extrapolate: 'clamp',
                        })
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="chevron-back" size={22} color="#007AFF" />
                </TouchableOpacity>

                <Animated.Text
                    style={[
                        styles.headerTitle,
                        {
                            opacity: scrollY.interpolate({
                                inputRange: [0, 80],
                                outputRange: [0, 1],
                                extrapolate: 'clamp',
                            })
                        }
                    ]}
                >
                    {user.name}
                </Animated.Text>

                <TouchableOpacity
                    style={styles.headerAction}
                    onPress={() => {/* More options */ }}
                >
                    <Ionicons name="ellipsis-horizontal" size={18} color="#007AFF" />
                </TouchableOpacity>
            </Animated.View>

            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#007AFF"
                    />
                }
            >
                {/* Compact Friend Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileRow}>
                        <Avatar
                            name={user.name}
                            size={56}
                            type="user"
                            customAvatar={user.avatar}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user.name}</Text>

                        </View>
                    </View>
                </View>

                {/* Compact Balance Overview */}
                <View style={styles.balanceSection}>
                    <View style={[styles.balanceCard, { backgroundColor: balanceInfo.bgColor }]}>
                        <View style={styles.balanceContent}>
                            <View style={styles.balanceLeft}>
                                {/* <View style={styles.balanceIconContainer}>
                                    <Ionicons
                                        name={balanceInfo.icon}
                                        size={20}
                                        color={balanceInfo.color}
                                    />
                                </View> */}
                                <View style={styles.balanceTextContainer}>
                                    {/*   <Text style={styles.balanceLabel}>Current Balance</Text> */}
                                    <Text style={[styles.balanceDescription, { color: balanceInfo.color }]}>
                                        {balanceInfo.amount > 0 ? `${balanceInfo.text}` : 'All settled up! 🎉'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.balanceAmount, { color: balanceInfo.color }]}>
                                {balanceInfo.amount > 0 && formatCurrency(balanceInfo.amount, 'USD')}
                                {balanceInfo.amount === 0 && '—'}
                            </Text>
                        </View>
                    </View>

                </View>

                {/* Quick Actions */}
                {renderQuickActions()}

                {/* Expenses Section */}
                <View style={styles.expensesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Expenses</Text>
                        {expenseStats.count > 0 && (
                            <TouchableOpacity style={styles.viewAllButton}>
                                <Text style={styles.viewAllText}>View All</Text>
                                <Ionicons name="chevron-forward" size={14} color="#007AFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {sortedExpenses.length > 0 ? (
                        <FlatList
                            data={sortedExpenses}
                            renderItem={renderExpense}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            contentContainerStyle={styles.expensesList}
                        />
                    ) : (
                        renderEmptyState()
                    )}
                </View>
            </ScrollView>

            <FloatingActionButton
                onPress={() => navigation.navigate('AddExpense', { friends: [user.id] })}
                icon="add"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: getHeaderTopPadding(12),
        backgroundColor: 'white',
        zIndex: 1000,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        flex: 1,
    },
    headerAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },

    // Profile Section
    profileSection: {
        backgroundColor: 'white',
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileInfo: {
        marginLeft: 16,

    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#6B7280',
    },

    // Balance Section - Completely redesigned
    balanceSection: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    balanceCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    balanceContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 16,
    },
    balanceIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E0F2FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    balanceTextContainer: {
        flex: 1,
    },
    balanceLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    balanceDescription: {
        fontSize: 14,
        fontWeight: '500',
    },
    balanceAmount: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'right',
        flexShrink: 1,
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 12,
    },

    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 24,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryAction: {
        backgroundColor: '#007AFF',
    },
    secondaryAction: {
        backgroundColor: 'white',
        borderWidth: 1.5,
        borderColor: '#007AFF',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },

    // Expenses Section
    expensesSection: {
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginRight: 4,
    },
    expensesList: {
        paddingBottom: 100, // Space for FAB
    },
    expenseCard: {
        marginBottom: 8,
    },

    // Empty State - Improved
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
        backgroundColor: 'white',
        marginHorizontal: 16,
        borderRadius: 16,
        marginTop: 20,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
});

export default FriendDetailsScreen;