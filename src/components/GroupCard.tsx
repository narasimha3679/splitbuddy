import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Group } from '../types';
import Avatar from './Avatar';

interface GroupCardProps {
  group: Group;
  onPress?: () => void;
  showMemberCount?: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onPress,
  showMemberCount = true
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Avatar
          name={group.name}
          size={50}
          type="group"
          customAvatar={group.avatar}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{group.name}</Text>
        {group.description && (
          <Text style={styles.description} numberOfLines={2}>
            {group.description}
          </Text>
        )}
        {showMemberCount && (
          <Text style={styles.memberCount}>
            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
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
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});

export default GroupCard;
