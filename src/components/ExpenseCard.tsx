import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ExpenseCardProps {
    expense: Expense;
    onPress?: () => void;
    showStatus?: boolean;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
    expense,
    onPress,
    showStatus = true
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

    const getSplitTypeLabel = (splitType: string) => {
        switch (splitType) {
            case 'equal':
                return 'Equal';
            case 'percentage':
                return 'Percentage';
            case 'custom':
                return 'Custom';
            case 'full_on_other':
                return 'Full on Other';
            case 'full_on_me':
                return 'Full on Me';
            default:
                return splitType;
        }
    };

    const getStatusColor = () => {
        const paidParticipants = expense.participants.filter(p => p.isPaid).length;
        const totalParticipants = expense.participants.length;

        if (paidParticipants === 0) return '#FF6B6B'; // Red - unpaid
        if (paidParticipants === totalParticipants) return '#4CAF50'; // Green - fully paid
        return '#FFA726'; // Orange - partially paid
    };

    const getStatusText = () => {
        const paidParticipants = expense.participants.filter(p => p.isPaid).length;
        const totalParticipants = expense.participants.length;

        if (paidParticipants === 0) return 'Unpaid';
        if (paidParticipants === totalParticipants) return 'Paid';
        return `${paidParticipants}/${totalParticipants} Paid`;
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.titleSection}>
                    <View style={styles.categoryIcon}>
                        <Ionicons
                            name={getCategoryIcon(expense.category) as any}
                            size={20}
                            color="#007AFF"
                        />
                    </View>
                    <View style={styles.titleInfo}>
                        <Text style={styles.title} numberOfLines={1}>
                            {expense.title}
                        </Text>
                        <Text style={styles.category}>{expense.category}</Text>
                    </View>
                </View>
                <View style={styles.amountSection}>
                    <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
                    {showStatus && (
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                            <Text style={styles.statusText}>{getStatusText()}</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Ionicons name="people" size={16} color="#757575" />
                    <Text style={styles.detailText}>
                        {expense.participants.length} participant{expense.participants.length !== 1 ? 's' : ''}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="git-branch" size={16} color="#757575" />
                    <Text style={styles.detailText}>{getSplitTypeLabel(expense.splitType)}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#757575" />
                    <Text style={styles.detailText}>
                        {new Date(expense.paidAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            {/* {expense.description && (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.description} numberOfLines={2}>
                        {expense.description}
                    </Text>
                </View>
            )} */}

            <View style={styles.participantsPreview}>
                <Text style={styles.participantsLabel}>Participants:</Text>
                <View style={styles.participantsList}>
                    {expense.participants.slice(0, 3).map((participant, index) => (
                        <View key={participant.userId} style={styles.participantItem}>
                            <Text style={styles.participantName}>
                                {participant.userName}
                            </Text>
                            <Text style={styles.participantAmount}>
                                {formatCurrency(participant.amount)}
                            </Text>
                            {participant.isPaid && (
                                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            )}
                        </View>
                    ))}
                    {expense.participants.length > 3 && (
                        <Text style={styles.moreParticipants}>
                            +{expense.participants.length - 3} more
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    titleInfo: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    category: {
        fontSize: 14,
        color: '#757575',
    },
    amountSection: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 14,
        color: '#757575',
        marginLeft: 4,
    },
    descriptionContainer: {
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    participantsPreview: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
    },
    participantsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    participantsList: {
        gap: 8,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    participantName: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    participantAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginRight: 8,
    },
    moreParticipants: {
        fontSize: 14,
        color: '#757575',
        fontStyle: 'italic',
    },
});

export default ExpenseCard;
