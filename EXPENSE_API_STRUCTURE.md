# Expense Sharing API Structure

This document outlines the API endpoints needed for the enhanced expense sharing feature in your SplitWise clone.

## Database Schema

### Expenses Table
```sql
CREATE TABLE expenses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(100) NOT NULL,
  paid_by VARCHAR(36) NOT NULL,
  paid_at TIMESTAMP NOT NULL,
  split_type ENUM('equal', 'percentage', 'custom', 'full_on_other', 'full_on_me') NOT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (paid_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Expense Participants Table
```sql
CREATE TABLE expense_participants (
  id VARCHAR(36) PRIMARY KEY,
  expense_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2),
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP NULL,
  source ENUM('friend', 'group') NOT NULL,
  source_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_expense_user (expense_id, user_id)
);
```

## API Endpoints

### 1. Create Expense
**POST** `/api/expenses`

**Request Body:**
```json
{
  "title": "Dinner at Restaurant",
  "description": "Group dinner with friends",
  "amount": 150.00,
  "currency": "USD",
  "category": "Food & Dining",
  "paidBy": "user123",
  "paidAt": "2024-01-15T19:30:00Z",
  "splitType": "equal",
  "participants": [
    {
      "userId": "user456",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "amount": 50.00,
      "percentage": null,
      "source": "friend",
      "sourceId": "friend123"
    },
    {
      "userId": "user789",
      "userName": "Jane Smith",
      "userEmail": "jane@example.com",
      "amount": 50.00,
      "percentage": null,
      "source": "group",
      "sourceId": "group456"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "expense123",
    "title": "Dinner at Restaurant",
    "description": "Group dinner with friends",
    "amount": 150.00,
    "currency": "USD",
    "category": "Food & Dining",
    "paidBy": "user123",
    "paidAt": "2024-01-15T19:30:00Z",
    "splitType": "equal",
    "participants": [...],
    "createdAt": "2024-01-15T20:00:00Z",
    "updatedAt": "2024-01-15T20:00:00Z"
  }
}
```

### 2. Get User's Expenses
**GET** `/api/expenses/user/:userId`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page (default: 20)
- `status` (optional): Filter by status ('all', 'paid', 'unpaid', 'partially_paid')
- `category` (optional): Filter by category
- `startDate` (optional): Filter expenses from this date
- `endDate` (optional): Filter expenses until this date

**Response:**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "expense123",
        "title": "Dinner at Restaurant",
        "amount": 150.00,
        "category": "Food & Dining",
        "splitType": "equal",
        "participants": [
          {
            "userId": "user456",
            "userName": "John Doe",
            "amount": 50.00,
            "isPaid": false
          }
        ],
        "paidAt": "2024-01-15T19:30:00Z",
        "createdAt": "2024-01-15T20:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 3. Get Expense Details
**GET** `/api/expenses/:expenseId`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "expense123",
    "title": "Dinner at Restaurant",
    "description": "Group dinner with friends",
    "amount": 150.00,
    "currency": "USD",
    "category": "Food & Dining",
    "paidBy": "user123",
    "paidAt": "2024-01-15T19:30:00Z",
    "splitType": "equal",
    "participants": [
      {
        "userId": "user456",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "amount": 50.00,
        "percentage": null,
        "isPaid": false,
        "paidAt": null,
        "source": "friend",
        "sourceId": "friend123"
      }
    ],
    "createdAt": "2024-01-15T20:00:00Z",
    "updatedAt": "2024-01-15T20:00:00Z"
  }
}
```

### 4. Update Expense
**PUT** `/api/expenses/:expenseId`

**Request Body:** (Same as create, but all fields optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "expense123",
    "title": "Updated Dinner Title",
    "amount": 160.00,
    "updatedAt": "2024-01-15T21:00:00Z"
  }
}
```

### 5. Delete Expense
**DELETE** `/api/expenses/:expenseId`

**Response:**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

### 6. Mark Participant as Paid/Unpaid
**PATCH** `/api/expenses/:expenseId/participants/:participantId/payment`

**Request Body:**
```json
{
  "isPaid": true,
  "paidAt": "2024-01-15T22:00:00Z" // Optional, will use current time if not provided
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "participantId": "user456",
    "isPaid": true,
    "paidAt": "2024-01-15T22:00:00Z"
  }
}
```

### 7. Get User's Balance Summary
**GET** `/api/expenses/user/:userId/balance`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOwed": 250.00,
    "totalOwedToYou": 180.00,
    "netBalance": -70.00,
    "currency": "USD",
    "breakdown": [
      {
        "friendId": "user456",
        "friendName": "John Doe",
        "balance": -50.00,
        "currency": "USD"
      }
    ]
  }
}
```

### 8. Get Expenses Between Two Users
**GET** `/api/expenses/between/:userId1/:userId2`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "expenses": [...],
    "summary": {
      "totalShared": 500.00,
      "user1Owed": 250.00,
      "user2Owed": 250.00,
      "netBalance": 0.00
    }
  }
}
```

### 9. Get Group Expenses
**GET** `/api/groups/:groupId/expenses`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "expenses": [...],
    "summary": {
      "totalExpenses": 1200.00,
      "totalPaid": 800.00,
      "totalUnpaid": 400.00,
      "memberBalances": [
        {
          "userId": "user123",
          "userName": "John Doe",
          "balance": -100.00
        }
      ]
    }
  }
}
```

## Error Responses

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid expense amount",
    "details": {
      "amount": "Amount must be greater than 0"
    }
  }
}
```

## Common Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User not authorized to perform action
- `CONFLICT`: Resource conflict (e.g., duplicate expense)
- `INTERNAL_ERROR`: Server error

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Validation Rules

### Expense Creation/Update
- Title: Required, max 255 characters
- Amount: Required, must be > 0
- Category: Required, must be from predefined list
- Split Type: Required, must be valid enum value
- Participants: Required, at least 2 participants
- For percentage split: Total percentages must equal 100%
- For custom split: Total amounts must equal expense amount

### Participant Management
- User ID must exist in users table
- User must be friend or group member of expense creator
- Cannot add duplicate participants
- Cannot remove participants if expense is fully paid

## Implementation Notes

1. **Deduplication**: When adding both friends and groups, ensure no duplicate participants
2. **Calculations**: Handle floating-point precision for currency calculations
3. **Audit Trail**: Log all expense modifications for debugging
4. **Notifications**: Send push notifications when users are added to expenses
5. **Caching**: Cache frequently accessed data like user balances
6. **Pagination**: Implement proper pagination for large expense lists
7. **Search**: Add search functionality for expense titles and descriptions
8. **Export**: Allow users to export expense data (CSV, PDF)

## Frontend Integration

The frontend should:
1. Use the new `AddExpenseScreen` for creating expenses
2. Display expenses using `ExpenseCard` component
3. Show expense details in `ExpenseDetailsScreen`
4. Update the context with `ADD_ENHANCED_EXPENSE` action
5. Handle loading states and error messages
6. Implement real-time updates for payment status changes
