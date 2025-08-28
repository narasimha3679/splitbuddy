import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ActivitiesScreen = () => {
    // Placeholder data - will be replaced with API data later
    const placeholderActivities = [
        {
            id: '1',
            type: 'bill_added',
            title: 'New bill added',
            description: 'You added a bill for $25.00 in "Dinner Group"',
            timestamp: '2 hours ago',
            icon: 'receipt-outline'
        },
        {
            id: '2',
            type: 'friend_added',
            title: 'Friend added',
            description: 'John Doe accepted your friend request',
            timestamp: '1 day ago',
            icon: 'person-add-outline'
        },
        {
            id: '3',
            type: 'payment_received',
            title: 'Payment received',
            description: 'Jane Smith paid you $12.50',
            timestamp: '2 days ago',
            icon: 'card-outline'
        },
        {
            id: '4',
            type: 'group_created',
            title: 'Group created',
            description: 'You created "Weekend Trip" group',
            timestamp: '3 days ago',
            icon: 'folder-open-outline'
        }
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'bill_added':
                return 'receipt-outline';
            case 'friend_added':
                return 'person-add-outline';
            case 'payment_received':
                return 'card-outline';
            case 'group_created':
                return 'folder-open-outline';
            default:
                return 'notifications-outline';
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'bill_added':
                return '#007AFF';
            case 'friend_added':
                return '#34C759';
            case 'payment_received':
                return '#FF9500';
            case 'group_created':
                return '#AF52DE';
            default:
                return '#8E8E93';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Activities</Text>
                <Text style={styles.headerSubtitle}>Your recent activity history</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {placeholderActivities.length > 0 ? (
                    placeholderActivities.map((activity) => (
                        <TouchableOpacity key={activity.id} style={styles.activityCard}>
                            <View style={styles.activityIcon}>
                                <Ionicons
                                    name={getActivityIcon(activity.type) as any}
                                    size={24}
                                    color={getActivityColor(activity.type)}
                                />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>{activity.title}</Text>
                                <Text style={styles.activityDescription}>{activity.description}</Text>
                                <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={64} color="#8E8E93" />
                        <Text style={styles.emptyStateTitle}>No activities yet</Text>
                        <Text style={styles.emptyStateDescription}>
                            Your activities will appear here once you start using the app
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    activityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activityIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    activityDescription: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 4,
    },
    activityTimestamp: {
        fontSize: 12,
        color: '#C7C7CC',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateDescription: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default ActivitiesScreen;
