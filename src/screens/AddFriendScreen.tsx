import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { searchUserByEmail, sendFriendRequest, getUser } from '../utils/api';

const AddFriendScreen: React.FC = () => {
  const navigation = useNavigation();
  const { dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);

  const handleSearch = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email');
      return;
    }
    try {
      setSearching(true);
      setFoundUser(null);
      const user = await searchUserByEmail(email.trim());
      if (!user) {
        Alert.alert('Not found', 'No user found with that email');
        return;
      }
      setFoundUser(user);
    } catch (e: any) {
      Alert.alert('Search failed', e?.message || 'Unable to search user');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!foundUser) return;
    try {
      setSending(true);
      const currentUser = await getUser();
      if (!currentUser) {
        Alert.alert('Error', 'User not found');
        return;
      }
      await sendFriendRequest(currentUser.id, foundUser.id);
      Alert.alert('Request sent', 'Friend request has been sent.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not send friend request');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Friend</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Search by Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="friend@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton, !email.trim() && styles.addButtonDisabled]}
            onPress={handleSearch}
            disabled={!email.trim() || searching}
          >
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.addButtonText}>{searching ? 'Searching...' : 'Search'}</Text>
          </TouchableOpacity>

          {foundUser && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 8 }}>User found</Text>
              <View style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' }}>
                <Text style={{ fontSize: 16 }}>{foundUser.name}</Text>
                <Text style={{ color: '#666', marginTop: 4 }}>{foundUser.email}</Text>
              </View>

              <TouchableOpacity
                style={[styles.addButton, { marginTop: 16 }, sending && styles.addButtonDisabled]}
                onPress={handleSendRequest}
                disabled={sending}
              >
                <Ionicons name="person-add" size={20} color="white" />
                <Text style={styles.addButtonText}>{sending ? 'Sending...' : 'Send Friend Request'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={20} color="#757575" />
          <Text style={styles.infoText}>Search for an existing user by email and send a friend request. Once they accept, they will appear in your friends list.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#F0F8FF',
    margin: 20,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    lineHeight: 20,
  },
});

export default AddFriendScreen;
