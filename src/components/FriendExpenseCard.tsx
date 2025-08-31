import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types';
import { formatCurrency } from '../utils/calculations';

interface FriendExpenseCardProps {
    expense: Expense;
    currentUserId: string;
    friendId: string;
    onPress?: () => void;
}

const FriendExpenseCard: React.FC<FriendExpenseCardProps> = ({
    expense,
    currentUserId,
    friendId,
    onPress
}) => {
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

    const getExpenseTypeSubtitle = () => {
        const participants = expense.participants || [];
        const hasFriendParticipants = participants.some(p => p.source === 'FRIEND' || p.source === 'friend');
        const hasGroupParticipants = participants.some(p => p.source === 'GROUP' || p.source === 'group');

        if (hasFriendParticipants && hasGroupParticipants) {
            return 'Mixed · group + friends';
        } else if (hasGroupParticipants) {
            // Try to get group name from sourceId if available
            const groupParticipant = participants.find(p => p.source === 'GROUP' || p.source === 'group');
            const groupName = groupParticipant?.sourceId ? `Group ${groupParticipant.sourceId}` : 'Group';
            return `Group · ${groupName}`;
        } else {
            return 'Shared between you';
        }
    };

    const calculatePairBalance = () => {
        const participants = expense.participants || [];
        const currentUserEntry = participants.find(p => p.userId === currentUserId);
        const friendEntry = participants.find(p => p.userId === friendId);

        if (expense.paidBy === currentUserId) {
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

    const getBalanceLabel = (pairBalance: number) => {
        if (pairBalance > 0) {
            return {
                text: 'you lent',
                amount: formatCurrency(pairBalance, 'USD'),
                color: '#4CAF50'
            };
        } else if (pairBalance < 0) {
            return {
                text: 'you borrowed',
                amount: formatCurrency(Math.abs(pairBalance), 'USD'),
                color: '#F44336'
            };
        } else {
            return {
                text: 'settled up',
                amount: '',
                color: '#757575'
            };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        return { day, month };
    };

    const pairBalance = calculatePairBalance();
    const balanceLabel = getBalanceLabel(pairBalance);
    const dateInfo = formatDate(expense.paidAt);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Date Column */}
            <View style={styles.dateColumn}>
                <Text style={styles.dayText}>{dateInfo.day}</Text>
                <Text style={styles.monthText}>{dateInfo.month}</Text>
            </View>

            {/* Icon Column */}
            <View style={styles.iconColumn}>
                <View style={styles.iconSquare}>
                    <Ionicons
                        name={getCategoryIcon(expense.category) as any}
                        size={16}
                        color="#007AFF"
                    />
                </View>
            </View>

            {/* Main Content Column */}
            <View style={styles.mainColumn}>
                <Text style={styles.title} numberOfLines={1}>
                    {expense.title}
                </Text>
                <Text style={styles.subtitle}>
                    {getExpenseTypeSubtitle()}
                </Text>
            </View>

            {/* Balance Column */}
            <View style={styles.balanceColumn}>
                <Text style={[styles.balanceText, { color: balanceLabel.color }]}>
                    {balanceLabel.text}
                </Text>
                {balanceLabel.amount && (
                    <Text style={[styles.balanceAmount, { color: balanceLabel.color }]}>
                        {balanceLabel.amount}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 4,
        marginHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    dateColumn: {
        alignItems: 'center',
        marginRight: 12,
        minWidth: 30,
    },
    dayText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        lineHeight: 18,
    },
    monthText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#757575',
        lineHeight: 14,
    },
    iconColumn: {
        marginRight: 12,
    },
    iconSquare: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#F0F8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainColumn: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: '#757575',
        fontStyle: 'italic',
    },
    balanceColumn: {
        alignItems: 'flex-end',
        minWidth: 80,
    },
    balanceText: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    balanceAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default FriendExpenseCard;
