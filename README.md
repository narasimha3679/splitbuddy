# SplitBuddy - Splitwise Clone

A modern React Native app built with Expo for splitting bills and expenses with friends and groups.

## Features

### 🏠 Home Dashboard
- Overview of your balances (owed and owed to you)
- Quick actions for adding bills, friends, and groups
- Recent bills display
- Beautiful and intuitive UI

### 👥 Friends Management
- Add friends by email or phone number
- View friend balances and payment status
- Track individual expenses with friends

### 👨‍👩‍👧‍👦 Groups
- Create groups for shared expenses
- Add multiple friends to groups
- Group-specific bill management
- View group members and their balances

### 💰 Bill Management
- Add bills with detailed information
- Multiple split types:
  - Equal split
  - Percentage split
  - Custom amounts
- Category-based organization (Food, Transport, Entertainment, etc.)
- Split between friends, groups, or both

### 📊 Expense Tracking
- Real-time balance calculations
- Payment status tracking
- Detailed bill breakdowns
- Expense history

### 👤 User Profile
- Personal information management
- Account statistics
- App settings and preferences
- Data export and account management

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Context** for state management
- **Expo Vector Icons** for icons
- **React Native Paper** for UI components

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BillCard.tsx
│   ├── FriendCard.tsx
│   └── GroupCard.tsx
├── context/            # React Context for state management
│   └── AppContext.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── screens/           # App screens
│   ├── HomeScreen.tsx
│   ├── FriendsScreen.tsx
│   ├── GroupsScreen.tsx
│   ├── AddFriendScreen.tsx
│   ├── CreateGroupScreen.tsx
│   ├── AddBillScreen.tsx
│   ├── GroupDetailsScreen.tsx
│   ├── BillDetailsScreen.tsx
│   └── ProfileScreen.tsx
├── types/             # TypeScript type definitions
│   └── index.ts
└── utils/             # Utility functions
    └── calculations.ts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd splitbuddy
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# For iOS
npm run ios

# For Android
npm run android

# For web
npm run web
```

## Usage

### Adding Friends
1. Navigate to the Friends tab
2. Tap the "+" button
3. Enter friend's name and contact information
4. Tap "Add Friend"

### Creating Groups
1. Navigate to the Groups tab
2. Tap the "+" button
3. Enter group name and description
4. Select members from your friends list
5. Tap "Create Group"

### Adding Bills
1. Navigate to the Home tab or any group
2. Tap "Add Bill"
3. Enter bill details (title, amount, category)
4. Choose split type (equal, percentage, custom)
5. Select participants (friends and/or groups)
6. Tap "Add Bill"

### Viewing Balances
- Home screen shows your overall balances
- Friends screen shows individual friend balances
- Group details show group-specific balances
- Bill details show split breakdown

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Splitwise
- Built with Expo and React Native
- Icons from Expo Vector Icons
