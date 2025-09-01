import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingActionButtonProps {
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
    size?: number;
    color?: string;
    backgroundColor?: string;
}

const { width } = Dimensions.get('window');

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    onPress,
    icon = 'add',
    style,
    size = 56,
    color = 'white',
    backgroundColor = '#007AFF',
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.fab,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor,
                },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Ionicons name={icon} size={size * 0.4} color={color} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },
});

export default FloatingActionButton;
