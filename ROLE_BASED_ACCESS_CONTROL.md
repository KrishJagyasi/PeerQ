# Role-Based Access Control (RBAC) System

## Overview

PeerQ implements a comprehensive role-based access control system with three user roles and specific permissions: **Guest** (View), **User** (Post/Vote), and **Admin** (Moderate).

## Role → Permissions Mapping

### 1. Guest Users
**Permissions**: View all questions and answers
- ✅ Browse and read all questions and answers
- ✅ Search questions and tags
- ✅ View user profiles
- ❌ Cannot post questions or answers
- ❌ Cannot vote on content
- ❌ Cannot edit or delete content

### 2. Regular Users
**Permissions**: Register, log in, post questions/answers, vote
- ✅ All guest permissions (view)
- ✅ Register and log in
- ✅ Post questions and answers
- ✅ Vote on questions and answers
- ✅ Edit their own content
- ✅ Accept answers to their questions
- ✅ Update profile information

### 3. Admin Users
**Permissions**: Moderate content
- ✅ All user permissions (view, post, vote)
- ✅ Moderate all content
- ✅ Manage all users (view, update roles, delete)
- ✅ Edit or delete any content
- ✅ Access admin panel
- ✅ Platform moderation

## Backend Implementation

### Permission-Based Middleware

The system uses permission-based middleware for precise access control:

```javascript
// View permission - All roles can view
const guestAuth = async (req, res, next) => { ... }

// Post permission - Users and admins can post
const requirePermission = (permission) => {
  switch (permission) {
    case 'view': return next(); // All roles
    case 'post': // Users and admins only
    case 'vote': // Users and admins only
    case 'moderate': // Admins only
  }
}
```

### API Endpoints by Permission

#### View Permission (All Roles)
```
GET /api/questions - View all questions
GET /api/questions/:id - View single question
GET /api/questions/tags/popular - View popular tags
GET /api/answers - View answers
```

#### Post Permission (Users & Admins)
```
POST /api/questions - Create question
POST /api/answers - Create answer
```

#### Vote Permission (Users & Admins)
```
POST /api/questions/:id/vote - Vote on question
POST /api/answers/:id/vote - Vote on answer
```

#### Moderate Permission (Admins Only)
```
GET /api/questions/admin/all - View all questions (admin)
PUT /api/auth/users/:id/role - Update user role
DELETE /api/auth/users/:id - Delete user
```

## Frontend Implementation

### Permission-Based Helper Functions

```javascript
// Permission checks
const canView = () => true; // All roles can view
const canPost = () => isAuthenticated() && !isGuest(); // Users and admins
const canVote = () => isAuthenticated() && !isGuest(); // Users and admins
const canModerate = () => isAdmin(); // Only admins

// Role checks
const isGuest = () => user?.role === 'guest';
const isUser = () => user?.role === 'user';
const isAdmin = () => user?.role === 'admin';
```

### UI Components by Permission

#### View Permission (All Users)
- Question and answer display
- Search functionality
- Tag browsing
- User profile viewing

#### Post Permission (Users & Admins)
- "Ask Question" button
- Answer submission forms
- Profile editing

#### Vote Permission (Users & Admins)
- Upvote/downvote buttons
- Vote count displays

#### Moderate Permission (Admins Only)
- Admin panel access
- User management interface
- Content moderation tools

## Database Schema

### User Model
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['guest', 'user', 'admin'], 
    default: 'user' 
  },
  avatar: { type: String, default: '' },
  reputation: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
```

## Permission Flow

### Guest User Flow
1. Visit site → View content (read-only)
2. Click "Continue as Guest" → Enter username
3. Browse questions and answers
4. Optionally upgrade to full account

### User Registration Flow
1. Click "Register" → Enter credentials
2. Get post and vote permissions
3. Can create questions and answers
4. Can vote on content

### Admin Management Flow
1. Login as admin → Access admin panel
2. View all users and content
3. Moderate content and manage users
4. Full platform control

## Security Features

### Permission-Based Access Control
- **View**: Open to all users
- **Post**: Requires user or admin role
- **Vote**: Requires user or admin role
- **Moderate**: Requires admin role only

### Token Management
- **Guest tokens**: 30-day expiration
- **User tokens**: 7-day expiration
- **Admin tokens**: 7-day expiration

### Content Protection
- Role-based route protection
- Owner-only content editing
- Admin override capabilities
- Guest action restrictions

## Setup Instructions

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Set up Environment Variables
Create a `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/peerq
JWT_SECRET=your-secret-key
PORT=5000
```

### 3. Create Admin User
```bash
npm run setup-admin
```

### 4. Start Application
```bash
npm run dev
```

## Usage Examples

### Guest User Experience
```javascript
// Guest can view but not post
if (canView()) {
  // Show questions and answers
}
if (!canPost()) {
  // Show "Sign Up to Post" button
}
```

### User Experience
```javascript
// User can view, post, and vote
if (canPost()) {
  // Show "Ask Question" button
}
if (canVote()) {
  // Show vote buttons
}
```

### Admin Experience
```javascript
// Admin can moderate
if (canModerate()) {
  // Show admin panel
  // Show user management
  // Show content moderation tools
}
```

## API Response Examples

### Guest User Response
```json
{
  "user": {
    "username": "guest123",
    "role": "guest",
    "email": "guest_1234567890@peerq.com"
  },
  "permissions": {
    "canView": true,
    "canPost": false,
    "canVote": false,
    "canModerate": false
  }
}
```

### User Response
```json
{
  "user": {
    "username": "john_doe",
    "role": "user",
    "email": "john@example.com"
  },
  "permissions": {
    "canView": true,
    "canPost": true,
    "canVote": true,
    "canModerate": false
  }
}
```

### Admin Response
```json
{
  "user": {
    "username": "admin",
    "role": "admin",
    "email": "admin@peerq.com"
  },
  "permissions": {
    "canView": true,
    "canPost": true,
    "canVote": true,
    "canModerate": true
  }
}
```

## Troubleshooting

### Common Issues

1. **Guest can't post**: Expected behavior - guests must upgrade
2. **User can't vote**: Check if user is authenticated and not guest
3. **Admin not working**: Run `npm run setup-admin`
4. **Permission denied**: Check user role and required permissions

### Debug Commands

```bash
# Check permissions
console.log('Can view:', canView());
console.log('Can post:', canPost());
console.log('Can vote:', canVote());
console.log('Can moderate:', canModerate());

# Check user role
console.log('User role:', user?.role);
```

## Future Enhancements

- **Permission Groups**: Custom permission sets
- **Role Hierarchy**: More granular roles
- **Audit Logging**: Track permission usage
- **Dynamic Permissions**: Runtime permission changes
- **Permission Inheritance**: Role-based permission inheritance 