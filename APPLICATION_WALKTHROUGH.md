# Learn Vanguard Application Walkthrough

## Table of Contents
1. [Application Overview](#application-overview)
2. [Application Walkthrough](#application-walkthrough)
3. [Code Structure & Architecture](#code-structure--architecture)
4. [Challenges & Solutions](#challenges--solutions)
5. [Notable Features](#notable-features)

## Application Overview

Learn Vanguard is a comprehensive educational management platform built with React.js frontend and Node.js/Express backend. The application serves as a centralized hub for educational institutions to manage students, tasks, resources, events, and announcements with role-based access control and real-time features.

### Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: JWT, Firebase Authentication, bcryptjs
- **Real-time Communication**: Socket.IO, WebSockets
- **UI Components**: Radix UI, Shad, Lucide Icons, Framer Motion
- **State Management**: React Query (TanStack Query), Zustand, Context API
- **File Storage**: Cloudinary, Multer
- **Email Service**: SendGrid, Nodemailer
- **Testing**: Jest, React Testing Library

---

## Application Walkthrough

### 1. Frontend-Backend Integration

The React frontend seamlessly integrates with the Node.js/Express backend through a well-structured API client system:

#### API Client Architecture
```javascript
// Frontend API Client (src/lib/api/client.js)
const apiClient = axios.create({
  baseURL: environment.API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
```

The API client features:
- **Automatic Token Injection**: JWT tokens are automatically added to request headers
- **Response Interceptors**: Handle common HTTP errors (401, 404, 500) with centralized error handling
- **Request Retry Logic**: Implements exponential backoff for failed requests
- **Network Error Handling**: Custom events for offline/timeout scenarios

#### Backend API Structure
```javascript
// Backend Server (learn-vanguard-server/src/index.js)
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);
```

### 2. Data Communication Patterns

#### Authentication Flow
1. **User Registration**: Multi-step process with email verification
   - Step 1: Basic info validation and temporary token generation
   - Step 2: Academic details completion and account creation
   - Email verification with 24-hour expiry

2. **Login Process**: 
   - JWT token generation and storage
   - User data caching for performance
   - Role-based redirections

#### Data Fetching with React Query
```javascript
// Example: Tasks Query Hook
const { data: user, isLoading } = useQuery({
  queryKey: ["user"],
  queryFn: async () => {
    const token = localStorage.getItem("authToken");
    const verifyResult = await authService.verifyToken();
    return verifyResult.user;
  },
  staleTime: 5 * 60 * 1000,
  cacheTime: 30 * 60 * 1000,
});
```

### 3. Key Functional Features

#### User Authentication System
- **Multi-provider Support**: Local authentication and Firebase Google OAuth
- **Role-based Access Control**: Student, PIO (Program in Office), and Admin roles
- **Email Verification**: Mandatory email verification with secure token generation
- **Password Security**: bcrypt hashing with complexity validation

#### Dynamic Dashboard
- **Role-based Navigation**: Different interfaces for students, PIOs, and admins
- **Real-time Updates**: WebSocket integration for live notifications
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Permission Guards**: Component-level access control

#### Task Management System
- **CRUD Operations**: Full task lifecycle management
- **Due Date Tracking**: Automatic deadline notifications
- **Assignment Distribution**: PIOs can assign tasks to specific classes
- **Progress Tracking**: Visual indicators for task completion

#### Resource Management
- **File Upload/Download**: Cloudinary integration for media storage
- **Categorization**: Subject and topic-based organization
- **Access Control**: Role-based resource visibility
- **Search Functionality**: Full-text search capabilities

#### Event Calendar
- **Interactive Calendar**: Month/week/day views with event visualization
- **Event Creation**: Rich form validation and scheduling
- **Notifications**: Automated reminders for upcoming events
- **Recurring Events**: Support for repeating schedules

---

## Code Structure & Architecture

### Frontend Architecture

#### Component Organization
```
src/
├── app/                    # Page-level components
│   ├── auth/              # Authentication pages
│   ├── pages/             # Main application pages
│   └── dashboard/         # Dashboard-specific components
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix-based)
│   ├── layout/           # Layout components (Sidebar, Topbar)
│   ├── modal/            # Modal components
│   └── section/          # Section-specific components
1├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries and configurations
├── services/             # API service layers
└── utils/                # Helper functions
```

#### State Management Strategy
- **React Query**: Server state management and caching
- **Context API**: Authentication and permission state
- **Local State**: Component-specific state with useState/useReducer
- **Zustand**: Client-side state for complex UI interactions

#### Component Interface Pattern
```javascript
// Example: Protected Route Component
const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { user, isLoading } = useAuth();
  const { hasAllPermissions } = usePermission();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (!hasAllPermissions(requiredPermissions)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

### Backend Architecture

#### MVC Pattern Implementation
```
src/
├── controllers/          # Business logic handlers
├── models/              # MongoDB schemas with Mongoose
├── routes/              # Express route definitions
├── middleware/          # Custom middleware functions
├── utils/               # Helper utilities
└── config/              # Configuration files
```

#### Route Structure
```javascript
// Example: Task Routes (src/routes/taskRoutes.js)
router.get('/', auth, taskController.getAllTasks);
router.post('/', auth, validateTask, taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);
```

#### Controller Pattern
```javascript
// Example: Task Controller
exports.getAllTasks = async (req, res) => {
  try {
    const { role, assignedClass } = req.user;
    let filter = {};
    
    if (role === 'student') {
      filter.assignedClass = assignedClass;
    }
    
    const tasks = await Task.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ dueDate: 1 });
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
```

#### Database Integration
- **MongoDB with Mongoose**: Document-based data modeling
- **Schema Validation**: Comprehensive data validation at model level
- **Indexing Strategy**: Optimized queries with compound indexes
- **Connection Pooling**: Efficient database connection management

```javascript
// User Model Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: v => v.endsWith('@student.laverdad.edu.ph'),
      message: 'Must use school email domain'
    }
  },
  role: { 
    type: String, 
    enum: ['student', 'pio', 'admin'], 
    default: 'student' 
  }
});
```

---

## Challenges & Solutions

### 1. CORS Configuration
**Challenge**: Complex cross-origin setup between frontend and backend deployments.

**Solution**: Dynamic CORS configuration with multiple allowed origins:
```javascript
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'https://learnvanguard.vercel.app'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};
```

### 2. Authentication Token Management
**Challenge**: Secure token storage and automatic refresh handling.

**Solution**: Implemented token caching with automatic cleanup and verification:
```javascript
// Token verification with fallback to cached data
const { data: user } = useQuery({
  queryKey: ["user"],
  queryFn: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return restoreUserData();
    
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem("authToken");
      return restoreUserData();
    }
    
    return await authService.verifyToken();
  }
});
```

### 3. Real-time Notification System
**Challenge**: Ensuring reliable message delivery across different connection types.

**Solution**: Hybrid WebSocket implementation with Socket.IO and native WebSocket fallback:
```javascript
// Dual WebSocket server implementation
const { io, wss } = initializeWebSocket(server);

// Socket.IO for modern browsers
io.on('connection', (socket) => {
  socket.join(`user_${userId}`);
  socket.on('notification_ack', handleAcknowledgment);
});

// Native WebSocket for legacy support
wss.on('connection', (ws) => {
  ws.on('message', handleMessage);
});
```

### 4. File Upload Security
**Challenge**: Secure file handling with size limits and type validation.

**Solution**: Multi-layer validation with Cloudinary integration:
```javascript
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const isValid = allowedTypes.test(file.mimetype);
    cb(null, isValid);
  }
});
```

### 5. Role-based Access Control
**Challenge**: Granular permission system across multiple user roles.

**Solution**: Context-based permission management with route guards:
```javascript
const PermissionContext = createContext();

export const usePermission = () => {
  const { hasAllPermissions, hasAnyPermission } = useContext(PermissionContext);
  return { hasAllPermissions, hasAnyPermission };
};

// Usage in components
const { hasAllPermissions } = usePermission();
if (!hasAllPermissions(['task:create'])) {
  return <UnauthorizedComponent />;
}
```

---

## Notable Features

### 1. Advanced Authentication System
- **Multi-step Registration**: Prevents incomplete registrations
- **Email Domain Validation**: Restricts access to institutional emails
- **Password Complexity**: Enforced strong password policies
- **Firebase Integration**: Seamless Google OAuth implementation

### 2. Real-time Communication
- **WebSocket Integration**: Live notifications and updates
- **Connection Management**: Automatic reconnection and fallback handling
- **Message Acknowledgment**: Ensures reliable message delivery
- **User Presence**: Online/offline status tracking

### 3. Comprehensive Form Validation
- **Client-side Validation**: Immediate feedback with React Hook Form
- **Server-side Validation**: Express-validator for security
- **Schema Validation**: Mongoose model-level validation
- **Error Handling**: Centralized error management system

### 4. Responsive Design System
- **Mobile-first Approach**: Optimized for all device sizes
- **Component Library**: Radix UI for accessible components
- **Theme System**: Consistent design tokens with CSS variables
- **Animation Framework**: Framer Motion for smooth interactions

### 5. Performance Optimization
- **Query Caching**: React Query for efficient data management
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Cloudinary for responsive images
- **Database Indexing**: Optimized query performance

### 6. Error Handling & Monitoring
- **Global Error Boundary**: React error boundary for crash recovery
- **API Error Interceptors**: Centralized error handling
- **Logging System**: Winston for comprehensive logging
- **User Feedback**: Toast notifications for user actions

### 7. Testing Strategy
- **Unit Testing**: Jest for business logic testing
- **Component Testing**: React Testing Library for UI testing
- **API Testing**: Supertest for endpoint validation
- **Integration Testing**: End-to-end workflow validation

---

This Learn Vanguard application demonstrates a production-ready implementation of modern web development practices, featuring robust authentication, real-time capabilities, comprehensive error handling, and scalable architecture patterns suitable for educational institutions.
