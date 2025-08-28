import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import ActivitiesScreen from '../screens/ActivitiesScreen';
import FriendsScreen from '../screens/FriendsScreen';
import FriendRequestsScreen from '../screens/FriendRequestsScreen';
import GroupsScreen from '../screens/GroupsScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import AddBillScreen from '../screens/AddBillScreen';
import BillDetailsScreen from '../screens/BillDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoadingSpinner from '../components/LoadingSpinner';

import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const FriendsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Friends"
      component={FriendsScreen}
      options={{ title: 'Friends' }}
    />
    <Stack.Screen
      name="AddFriend"
      component={AddFriendScreen}
      options={{ title: 'Add Friend' }}
    />
    <Stack.Screen
      name="FriendRequests"
      component={FriendRequestsScreen}
      options={{ title: 'Friend Requests' }}
    />
  </Stack.Navigator>
);

const GroupsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Groups"
      component={GroupsScreen}
      options={{ title: 'Groups' }}
    />
    <Stack.Screen
      name="CreateGroup"
      component={CreateGroupScreen}
      options={{ title: 'Create Group' }}
    />
    <Stack.Screen
      name="GroupDetails"
      component={GroupDetailsScreen}
      options={{ title: 'Group Details' }}
    />
    <Stack.Screen
      name="AddBill"
      component={AddBillScreen}
      options={{ title: 'Add Bill' }}
    />
    <Stack.Screen
      name="BillDetails"
      component={BillDetailsScreen}
      options={{ title: 'Bill Details' }}
    />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'FriendsTab') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'GroupsTab') {
          iconName = focused ? 'folder' : 'folder-outline';
        } else if (route.name === 'Activities') {
          iconName = focused ? 'notifications' : 'notifications-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else {
          iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >

    <Tab.Screen
      name="FriendsTab"
      component={FriendsStack}
      options={{ title: 'Friends' }}
    />
    <Tab.Screen
      name="GroupsTab"
      component={GroupsStack}
      options={{ title: 'Groups' }}
    />
    <Tab.Screen
      name="Activities"
      component={ActivitiesScreen}
      options={{ title: 'Activities' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

const LoadingScreen = () => <LoadingSpinner />;

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { state } = useAuth();

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {state.isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};



export default AppNavigator;
