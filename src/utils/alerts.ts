import { Alert, Platform } from 'react-native';

// Web alert implementation
const showWebAlert = (title: string, message: string, buttons?: Array<{ text: string; onPress?: () => void; style?: string }>) => {
    if (typeof window !== 'undefined') {
        const result = window.confirm(`${title}\n\n${message}`);
        if (result && buttons && buttons.length > 1) {
            // If user clicks OK and there are multiple buttons, trigger the second button (usually the action button)
            const actionButton = buttons.find(btn => btn.style !== 'cancel');
            if (actionButton && actionButton.onPress) {
                actionButton.onPress();
            }
        } else if (result && buttons && buttons.length === 1) {
            // If there's only one button and user clicks OK, trigger it
            if (buttons[0].onPress) {
                buttons[0].onPress();
            }
        }
    }
};

// Cross-platform alert function
export const showAlert = (
    title: string,
    message: string,
    buttons?: Array<{ text: string; onPress?: () => void; style?: string }>
) => {
    if (Platform.OS === 'web') {
        showWebAlert(title, message, buttons);
    } else {
        Alert.alert(title, message, buttons);
    }
};

// Convenience functions for common alert types
export const showSuccessAlert = (message: string, onPress?: () => void) => {
    showAlert('Success', message, [
        {
            text: 'OK',
            onPress,
        },
    ]);
};

export const showErrorAlert = (message: string, onPress?: () => void) => {
    showAlert('Error', message, [
        {
            text: 'OK',
            onPress,
        },
    ]);
};

export const showConfirmationAlert = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
) => {
    showAlert(title, message, [
        {
            text: 'Cancel',
            style: 'cancel',
            onPress: onCancel,
        },
        {
            text: 'OK',
            onPress: onConfirm,
        },
    ]);
};
