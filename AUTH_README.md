# SplitBuddy Authentication

This document describes the authentication implementation in SplitBuddy.

## Features

- **Login Screen**: Email and password authentication
- **Registration Screen**: New user account creation
- **Secure Token Storage**: JWT tokens stored using Expo SecureStore
- **Automatic Authentication Check**: App checks for existing tokens on startup
- **Protected Routes**: Only authenticated users can access the main app
- **Logout Functionality**: Secure logout with token removal

## API Endpoints

The app expects the following API endpoints to be available:

### Registration
```
POST http://localhost:4321/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

### Login
```
POST http://localhost:4321/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Response Format
Both endpoints return:
```json
{
  "token": "jwt_token_here",
  "message": "Login successful"
}
```

### User Data Endpoint
The app will make an additional call to get user data:
```
GET http://localhost:4321/api/auth/me
Authorization: Bearer jwt_token_here
```

This should return:
```json
{
  "id": "user_id",
  "name": "User Name",
  "email": "user@example.com"
}
```

## Security Features

1. **Secure Token Storage**: Uses Expo SecureStore for encrypted token storage
2. **Automatic Token Injection**: All API requests automatically include the JWT token
3. **Token Validation**: App checks token validity on startup
4. **Secure Logout**: Properly removes tokens and user data on logout

## File Structure

```
src/
├── context/
│   ├── AuthContext.tsx      # Authentication state management
│   └── AppContext.tsx       # App state (updated to sync with auth)
├── screens/
│   ├── LoginScreen.tsx      # Login UI
│   └── RegisterScreen.tsx   # Registration UI
├── utils/
│   └── api.ts              # API utilities and token management
├── components/
│   └── LoadingSpinner.tsx  # Loading component
└── navigation/
    └── AppNavigator.tsx    # Navigation with auth flow
```

## Usage

1. **Login**: Users enter email and password
2. **Registration**: New users create accounts with name, email, and password
3. **Automatic Login**: App remembers logged-in users
4. **Logout**: Users can logout from the Profile screen

## Configuration

The app automatically tries multiple API endpoints in order of preference:

1. **Primary**: `http://100.78.225.115:4321/api` (IP address)
2. **Fallback**: `http://localhost:4321/api` (localhost)

The app will automatically test connectivity and use the first available endpoint. You can modify these URLs in `src/utils/api.ts`:

```typescript
const API_BASE_URL = 'http://100.78.225.115:4321/api';
const FALLBACK_API_BASE_URL = 'http://localhost:4321/api';
```

## Dependencies

- `expo-secure-store`: For secure token storage
- `@react-navigation/native`: For navigation
- `@expo/vector-icons`: For UI icons

## Error Handling

- Network errors are displayed to users
- Invalid credentials show appropriate error messages
- Loading states prevent multiple submissions
- Form validation ensures data quality
