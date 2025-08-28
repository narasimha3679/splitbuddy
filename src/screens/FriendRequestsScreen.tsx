import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { FriendRequest } from '../types';
import { getPendingFriendRequests, acceptFriendRequest, declineFriendRequest, getFriends } from '../utils/api';
import { getUser } from '../utils/api';

const FriendRequestsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { state, dispatch } = useApp();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadPendingRequests = async () => {
        try {
            const currentUser = await getUser();
            if (!currentUser) {
                Alert.alert('Error', 'User not found');
                return;
            }

            const requests = await getPendingFriendRequests(currentUser.id);
            console.log('Friend requests response:', JSON.stringify(requests, null, 2));
            dispatch({ type: 'SET_FRIEND_REQUESTS', payload: requests });
        } catch (error: any) {
            console.error('Failed to load friend requests:', error);
            Alert.alert('Error', error.message || 'Failed to load friend requests');
        }
    };

    const handleAccept = async (request: FriendRequest) => {
        try {
            setLoading(true);
            await acceptFriendRequest(request.id);

            // Remove the request from the list
            dispatch({ type: 'REMOVE_FRIEND_REQUEST', payload: request.id });

            // Reload friends list
            const currentUser = await getUser();
            if (currentUser) {
                const friends = await getFriends(currentUser.id);
                dispatch({ type: 'SET_FRIENDS', payload: friends });
            }

            Alert.alert('Success', 'Friend request accepted!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to accept request');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async (request: FriendRequest) => {
        try {
            setLoading(true);
            await declineFriendRequest(request.id);

            // Remove the request from the list
            dispatch({ type: 'REMOVE_FRIEND_REQUEST', payload: request.id });

            Alert.alert('Success', 'Friend request declined');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to decline request');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPendingRequests();
        setRefreshing(false);
    };

    useEffect(() => {
        loadPendingRequests();
    }, []);

    const renderRequest = ({ item }: { item: FriendRequest }) => (
        <View style={styles.requestCard}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#007AFF" />
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                        {item.sender?.name || 'Friend Request'}
                    </Text>
                    <Text style={styles.userEmail}>
                        {item.sender?.email || `Request ID: ${item.id.slice(0, 8)}...`}
                    </Text>
                    {item.createdAt && (
                        <Text style={styles.requestDate}>
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAccept(item)}
                    disabled={loading}
                >
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleDecline(item)}
                    disabled={loading}
                >
                    <Ionicons name="close" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Decline</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="mail-outline" size={64} color="#9E9E9E" />
            <Text style={styles.emptyStateTitle}>No pending requests</Text>
            <Text style={styles.emptyStateSubtitle}>
                You don't have any pending friend requests
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Friend Requests</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={state.friendRequests}
                renderItem={renderRequest}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={renderEmptyState}
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
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    listContainer: {
        paddingVertical: 8,
    },
    requestCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 4,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    requestDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
    },
    declineButton: {
        backgroundColor: '#F44336',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 100,
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
    },
});

export default FriendRequestsScreen;
