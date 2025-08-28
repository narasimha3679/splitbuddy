# DiceBear Avatar Implementation

This document describes the implementation of DiceBear avatars in the SplitBuddy app.

## Overview

The app now uses DiceBear avatars to automatically generate unique, consistent avatars for users and groups based on their names. This eliminates the need for users to upload profile photos while providing visually appealing and recognizable avatars.

## Implementation Details

### Dependencies
- `@dicebear/core`: Core DiceBear functionality
- `@dicebear/collection`: Collection of avatar styles

### Avatar Style
- **Users**: Notionists style with soft, pastel background colors
- **Groups**: Notionists style with vibrant, colorful background colors

### Files Created/Modified

#### New Files
1. `src/utils/avatar.ts` - Avatar generation utilities
2. `src/components/Avatar.tsx` - Reusable Avatar component
3. `src/utils/avatar.test.ts` - Test utilities for avatar generation

#### Modified Files
1. `src/components/FriendCard.tsx` - Updated to use new Avatar component
2. `src/components/GroupCard.tsx` - Updated to use new Avatar component
3. `src/screens/ProfileScreen.tsx` - Updated to use new Avatar component
4. `src/screens/GroupDetailsScreen.tsx` - Updated to use new Avatar component
5. `src/screens/BillDetailsScreen.tsx` - Updated to use new Avatar component

## Usage

### Basic Usage
```tsx
import Avatar from '../components/Avatar';

// User avatar
<Avatar 
  name="John Doe"
  size={50}
  type="user"
  customAvatar={user.avatar} // Optional: fallback to custom avatar if provided
/>

// Group avatar
<Avatar 
  name="Trip to Paris"
  size={60}
  type="group"
  customAvatar={group.avatar} // Optional: fallback to custom avatar if provided
/>
```

### Avatar Generation Functions
```tsx
import { generateUserAvatar, generateGroupAvatar, getInitials } from '../utils/avatar';

// Generate avatar data URI
const userAvatarUri = generateUserAvatar('John Doe', 100);
const groupAvatarUri = generateGroupAvatar('Trip to Paris', 100);

// Get initials for fallback
const initials = getInitials('John Doe'); // Returns "JD"
```

## Features

### Consistent Avatars
- Same name always generates the same avatar
- Deterministic based on the name seed

### Fallback System
- If DiceBear generation fails, falls back to initials
- Supports custom avatar URLs as override

### Responsive Design
- Avatars scale appropriately based on size prop
- Maintains aspect ratio and circular shape

### Color Schemes
- **Users**: Soft pastels (light blue, lavender, pink, peach)
- **Groups**: Vibrant colors (red, teal, blue, green, yellow)

## Benefits

1. **No Upload Required**: Users don't need to upload profile photos
2. **Consistent Branding**: All avatars follow the same design language
3. **Performance**: No need to store or download avatar images
4. **Accessibility**: Provides visual distinction between users and groups
5. **Scalability**: Works for any number of users/groups

## Future Enhancements

- Add more avatar styles for different user types
- Implement avatar customization options
- Add avatar caching for better performance
- Support for different avatar shapes (square, rounded square)
