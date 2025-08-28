import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getInitials, getAvatarColor } from '../utils/avatar';

interface AvatarProps {
    name: string;
    size?: number;
    type?: 'user' | 'group';
    customAvatar?: string;
}

const Avatar: React.FC<AvatarProps> = ({
    name,
    size = 50,
    type = 'user',
    customAvatar
}) => {
    const containerStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: getAvatarColor(name, type === 'group'),
    };

    const textStyle = {
        fontSize: size * 0.4,
        fontWeight: '600' as const,
        color: '#FFFFFF',
    };

    return (
        <View style={[styles.avatarContainer, containerStyle]}>
            <Text style={[styles.avatarText, textStyle]}>
                {getInitials(name)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    avatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
    },
});

export default Avatar;
