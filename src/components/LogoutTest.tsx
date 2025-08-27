import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

const LogoutTest: React.FC = () => {
  const { state, logout } = useAuth();

  const handleTestLogout = async () => {
    console.log('=== LOGOUT TEST START ===');
    console.log('Current auth state:', state);
    console.log('User:', state.user);
    console.log('Token:', state.token);
    console.log('Is authenticated:', state.isAuthenticated);
    
    try {
      await logout();
      console.log('=== LOGOUT TEST SUCCESS ===');
    } catch (error) {
      console.error('=== LOGOUT TEST FAILED ===', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logout Test Component</Text>
      <Text style={styles.info}>User: {state.user?.name || 'None'}</Text>
      <Text style={styles.info}>Authenticated: {state.isAuthenticated ? 'Yes' : 'No'}</Text>
      <TouchableOpacity style={styles.button} onPress={handleTestLogout}>
        <Text style={styles.buttonText}>Test Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default LogoutTest;
