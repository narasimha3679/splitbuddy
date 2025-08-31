import { Platform, StatusBar } from 'react-native';

/**
 * Get the status bar height for the current platform
 * @returns The status bar height in pixels
 */
export const getStatusBarHeight = (): number => {
    if (Platform.OS === 'android') {
        return StatusBar.currentHeight || 0;
    }
    return 0;
};

/**
 * Get the top padding for headers that accounts for status bar height
 * @param basePadding - The base padding to add (default: 20)
 * @returns The calculated top padding
 */
export const getHeaderTopPadding = (basePadding: number = 20): number => {
    return getStatusBarHeight() + basePadding;
};

/**
 * Get the container top padding that accounts for status bar height
 * @returns The calculated top padding for containers
 */
export const getContainerTopPadding = (): number => {
    return getStatusBarHeight();
};
