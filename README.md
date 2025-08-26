# CodeReviewAI - AI-Powered Code Review Platform

CodeReviewAI is a full-stack web application that provides AI-powered code reviews for developers. The platform features user authentication, credit-based review system, and a typewriter effect for displaying review results.

## Features

### 🚀 Core Functionality

- **AI-Powered Code Reviews**: Submit JavaScript code and receive detailed AI-generated reviews
- **Real-time Typewriter Effect**: Code reviews are displayed with a smooth typewriter animation
- **Syntax Highlighting**: Code editor with Prism.js syntax highlighting
- **Markdown Support**: Reviews support markdown formatting with code highlighting

### 🔐 Authentication System

- **User Registration & Login**: Secure authentication with JWT tokens
- **Credit Management**: Users start with initial credits for code reviews
- **Profile Management**: User profile and credit balance tracking
- **Protected Routes**: Authentication-required access to core features

### 💻 Technical Stack

- **Frontend**: React.js with Vite, React Router, Axios
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **Styling**: Custom CSS with responsive design

## Project Structure

```
code-review-ai/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controllers.js    # Authentication logic
│   │   │   └── aicontrollers.js       # AI review processing
│   │   ├── models/
│   │   │   └── User.js                # User schema and model
│   │   ├── routes/
│   │   │   ├── airoutes.js            # AI review endpoints
│   │   │   └── auth.routes.js         # Authentication endpoints
│   │   └── config/                    # Database and app configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/                  # Login/Signup components
│   │   │   ├── Navbar/                # Navigation component
│   │   │   ├── Footer/                # Footer component
│   │   │   ├── Legal/                 # Legal pages
│   │   │   └── typewriter/            # Typewriter effect component
│   │   ├── App.jsx                    # Main application component
│   │   └── main.jsx                   # Application entry point
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/logout` - User logout

### AI Review Endpoints

- `POST /ai/get-review` - Submit code for AI review
- (Requires authentication and credits)

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```
4. Start development server: `npm run dev`

### Frontend Setup

1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create `.env` file with:
   ```
   VITE_API_URL=http://localhost:3000
   ```
4. Start development server: `npm run dev`

## Usage

1. **Register/Login**: Create an account or login to access the platform
2. **Write Code**: Use the built-in code editor to write or paste JavaScript code
3. **Get Review**: Click "Review" to submit code for AI analysis (consumes 1 credit)
4. **View Results**: Watch the typewriter effect display your code review
5. **Manage Credits**: Monitor your credit balance in the navigation bar

## Credit System

- New users receive initial credits upon registration
- Each code review consumes 1 credit (except for default example code)
- Credits prevent abuse and manage API usage costs

## Development

### Key Components

**Frontend Components:**

- `App.jsx` - Main application with code editor and review display
- `Auth/Login.jsx` & `Auth/Signup.jsx` - Authentication forms
- `typewriter/typewriterEffect.jsx` - Animated text display component
- `Navbar/Navbar.jsx` - Navigation with user info and credits

**Backend Controllers:**

- `auth.controllers.js` - User registration, login, and profile management
- `aicontrollers.js` - AI integration and code review processing

### Environment Variables

**Backend (.env):**

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)

**Frontend (.env):**

- `VITE_API_URL` - Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue on GitHub or contact the development team.

## Acknowledgments

- React.js and Vite for frontend framework
- Express.js for backend API
- MongoDB for database storage
- Prism.js for code syntax highlighting
- React Markdown for review formatting
