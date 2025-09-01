import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Expense } from '../types';
import { formatCurrency } from '../utils/calculations';
import ExpenseCard from '../components/ExpenseCard';
import FloatingActionButton from '../components/FloatingActionButton';
import { getContainerTopPadding, getHeaderTopPadding } from '../utils/statusBar';

const ActivitiesScreen = () => {
    const navigation = useNavigation<any>();
    const { state } = useApp();
    const { enhancedExpenses, currentUser } = state;
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'expenses'>('all');

    const onRefresh = async () => {
        setRefreshing(true);
        // TODO: Refresh data from API
        setTimeout(() => setRefreshing(false), 1000);
    };

    // Sort all expenses by date
    const allActivities = enhancedExpenses
        .map(expense => ({ ...expense, type: 'expense' as const, date: new Date(expense.createdAt) }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    const filteredActivities = allActivities;

    const renderActivity = ({ item }: { item: any }) => {
        return (
            <ExpenseCard
                expense={item}
                onPress={() => navigation.navigate('ExpenseDetails', { expense: item })}
            />
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#9E9E9E" />
            <Text style={styles.emptyStateTitle}>No activities yet</Text>
            <Text style={styles.emptyStateDescription}>
                Your expenses will appear here
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddExpense')}
            >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.addButtonText}>Add Expense</Text>
            </TouchableOpacity>
        </View>
    );

    const renderTabButton = (tab: 'all' | 'expenses', label: string, icon: string) => (
        <TouchableOpacity
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
        >
            <Ionicons
                name={icon as any}
                size={20}
                color={activeTab === tab ? '#007AFF' : '#757575'}
            />
            <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Activities</Text>
                <Text style={styles.headerSubtitle}>Your bills and expenses</Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                {renderTabButton('all', 'All', 'list')}
                {renderTabButton('expenses', 'Expenses', 'card')}
            </View>

            {/* Activity Count */}
            <View style={styles.countContainer}>
                <Text style={styles.countText}>
                    {filteredActivities.length} {filteredActivities.length === 1 ? 'item' : 'items'}
                </Text>
                <TouchableOpacity
                    style={styles.addButtonSmall}
                    onPress={() => navigation.navigate('AddExpense')}
                >
                    <Ionicons name="add" size={20} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredActivities}
                renderItem={renderActivity}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={renderEmptyState}
            />

            <FloatingActionButton
                onPress={() => navigation.navigate('AddExpense')}
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
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: getHeaderTopPadding(),
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#757575',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    tabButtonActive: {
        backgroundColor: '#F0F8FF',
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#757575',
        marginLeft: 6,
    },
    tabButtonTextActive: {
        color: '#007AFF',
        fontWeight: '600',
    },
    countContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    countText: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '500',
    },
    addButtonSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 20,
        paddingTop: 12,
        paddingBottom: 100, // Space for FAB
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
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateDescription: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        paddingHorizontal: 40,
        marginBottom: 32,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default ActivitiesScreen;
