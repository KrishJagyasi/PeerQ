# PeerQ - A Minimal Q&A Forum Platform (StackIt)

StackIt is a modern, feature-rich question-and-answer platform designed for collaborative learning and structured knowledge sharing. Built with React, Node.js, and MongoDB, it provides a clean, user-friendly interface for asking and answering questions within a community.

## Team Information

**Team Name:** VR Voyagers  
**Team Members:**
- [Krish Jagyasi](https://github.com/KrishJagyasi) (Team Leader)
- [Krish Lakhani](https://github.com/Krisshhh)
- [Ved Suthar](https://github.com/Ved210105)
- [Darshil Padmani](https://github.com/DarshilPadmani)

**Problem Statement:** PeerQ is a minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing. It's designed to be simple, user-friendly, and focused on the core experience of asking and answering questions within a community.

## 🚀 Features

### Core Features
- **Ask Questions**: Create detailed questions with rich text formatting
- **Rich Text Editor**: Full-featured editor with formatting, images, and links
- **Tagging System**: Multi-select tags for better organization
- **Voting System**: Upvote/downvote questions and answers
- **Answer Acceptance**: Question owners can mark best answers
- **Real-time Notifications**: Instant notifications for answers and mentions
- **Search & Filtering**: Advanced search with tag filtering
- **User Profiles**: Complete user profiles with statistics

### User Roles
- **Guest**: View questions and answers
- **User**: Register, login, post questions/answers, vote
- **Admin**: Moderate content (future feature)

### Rich Text Editor Features
- Bold, Italic, Strikethrough formatting
- Numbered and bullet lists
- Emoji insertion
- Hyperlink insertion
- Image upload and embedding
- Text alignment (Left, Center, Right)

### Notification System
- Real-time notifications via WebSocket
- Notification bell with unread count
- Notifications for:
  - New answers to your questions
  - Comments on your answers
  - @username mentions
  - Answer acceptance

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time features
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads

### Frontend
- **React 18** with hooks
- **React Router** for navigation
- **React Quill** for rich text editing
- **Socket.io Client** for real-time features
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/KrishJagyasi/PeerQ.git
   cd PeerQ
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://ved-21:ved-21@cluster0.tgavbcl.mongodb.net/stackit
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

4. **Start the development servers**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only
   cd client && npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🗄️ Database Schema

### User Model
- Username, email, password
- Role (guest, user, admin)
- Avatar, reputation
- Created timestamp

### Question Model
- Title, description (rich text)
- Tags array
- Author reference
- Votes (upvotes/downvotes)
- Views count
- Accepted answer reference
- Created/updated timestamps

### Answer Model
- Content (rich text)
- Question reference
- Author reference
- Votes (upvotes/downvotes)
- Acceptance status
- Created/updated timestamps

### Notification Model
- Recipient and sender references
- Type (answer, comment, mention, vote, accept)
- Content and metadata
- Read status
- Created timestamp

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Questions
- `GET /api/questions` - List questions with filtering
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question
- `GET /api/questions/tags/popular` - Get popular tags

### Answers
- `POST /api/answers` - Create answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

### Uploads
- `POST /api/upload/image` - Upload image
- `DELETE /api/upload/image/:filename` - Delete image

## 🎨 UI/UX Features

### Modern Design
- Clean, responsive layout
- Intuitive navigation
- Consistent color scheme
- Mobile-friendly design

### Interactive Elements
- Real-time voting
- Dynamic notifications
- Smooth animations
- Loading states

### Rich Text Editing
- Full formatting toolbar
- Image upload integration
- Link insertion
- Emoji support

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- File upload restrictions

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or Vercel

### Frontend Deployment
1. Build the React app: `cd client && npm run build`
2. Deploy to platforms like Vercel, Netlify, or GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**StackIt** - Empowering communities through collaborative learning and knowledge sharing.
