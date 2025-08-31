# Cross-Platform Alert System

## Overview

This document describes the cross-platform alert system implemented to solve the issue where `Alert.alert` from React Native doesn't work on web platforms.

## Problem

- On mobile platforms (iOS/Android), `Alert.alert` works correctly and shows native popup dialogs
- On web platforms, `Alert.alert` is not supported, so users don't see any popup dialogs
- This caused issues where users on web couldn't see confirmation dialogs for actions like logout, friend requests, etc.

## Solution

Created a cross-platform alert utility (`src/utils/alerts.ts`) that:

1. **Mobile**: Uses the native `Alert.alert` from React Native
2. **Web**: Uses the browser's native `window.confirm()` dialog

## Implementation

### Core Functions

- `showAlert(title, message, buttons?)` - Main cross-platform alert function
- `showSuccessAlert(message, onPress?)` - Convenience function for success messages
- `showErrorAlert(message, onPress?)` - Convenience function for error messages  
- `showConfirmationAlert(title, message, onConfirm, onCancel?)` - Convenience function for confirmations

### Usage Examples

```typescript
// Error alert
showErrorAlert('Please enter a valid email');

// Success alert with navigation
showSuccessAlert('Friend request sent!', () => navigation.goBack());

// Confirmation dialog
showConfirmationAlert(
  'Logout',
  'Are you sure you want to logout?',
  () => logout(),
  () => console.log('Cancelled')
);
```

## Updated Screens

The following screens have been updated to use the new alert system:

- ✅ `AddFriendScreen.tsx` - Friend request functionality
- ✅ `FriendRequestsScreen.tsx` - Accept/decline friend requests
- ✅ `LoginScreen.tsx` - Login validation
- ✅ `RegisterScreen.tsx` - Registration validation
- ✅ `AddBillScreen.tsx` - Bill creation
- ✅ `AddExpenseScreen.tsx` - Expense creation
- ✅ `ProfileScreen.tsx` - Delete account confirmation
- ✅ `LogoutTest.tsx` - Logout confirmation

## Benefits

1. **Consistent UX**: Users on both mobile and web now see popup dialogs
2. **Better User Flow**: Web users can now see success messages and navigate properly after actions
3. **Cross-Platform**: Single codebase works on all platforms
4. **Maintainable**: Centralized alert logic in one utility file

## Testing

To test the alert system:

1. **Mobile**: Run on iOS/Android simulator/device - should see native alerts
2. **Web**: Run `npm run web` - should see browser confirm dialogs
3. **Key Test Cases**:
   - Send friend request (should show success and navigate back)
   - Logout (should show confirmation dialog)
   - Form validation errors (should show error messages)
   - Accept/decline friend requests (should show success messages)

## Future Improvements

- Consider using a more sophisticated modal library for web (like react-modal) for better styling
- Add support for custom alert types (warning, info, etc.)
- Add support for more complex button configurations
