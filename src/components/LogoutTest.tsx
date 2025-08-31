import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { showConfirmationAlert, showErrorAlert } from '../utils/alerts';

const LogoutTest: React.FC = () => {
  const { state, logout } = useAuth();

  const handleLogout = async () => {
    showConfirmationAlert(
      'Logout',
      'Are you sure you want to logout?',
      async () => {
        try {
          console.log('Logging out...');
          await logout();
          console.log('Logout successful');
        } catch (error) {
          console.error('Logout error:', error);
          showErrorAlert('Failed to logout. Please try again.');
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logout Test Component</Text>
      <Text style={styles.info}>User: {state.user?.name || 'None'}</Text>
      <Text style={styles.info}>Authenticated: {state.isAuthenticated ? 'Yes' : 'No'}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
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
