# AmiQuiz - Amity University Quiz Management System

A comprehensive, modern quiz management platform designed specifically for Amity University, featuring advanced AI-powered quiz generation, community sharing, and robust analytics.

## 🎯 **Project Status: FULLY IMPLEMENTED**

### ✅ **All Phases Complete**
- **Phase 1**: Authentication & Role Management ✅
- **Phase 2**: Teacher Portal ✅
- **Phase 3**: Student Portal ✅
- **Phase 4**: Advanced Quiz Taking Experience ✅
- **Phase 5**: Admin Capabilities ✅
- **Phase 6**: AI & Advanced Features ✅

## 🚀 **Key Features**

### **🎓 For Students**
- **Advanced Quiz Interface**: Full-screen, anti-cheating enabled quiz taking experience
- **Real-time Progress Tracking**: Live timer, question navigation, flagging system
- **Performance Analytics**: Detailed review with explanations and score breakdowns
- **Accessibility Features**: Font size adjustment, theme toggle, fullscreen mode
- **Session Persistence**: Save and resume quiz progress

### **👨‍🏫 For Teachers**
- **AI Quiz Generator**: Generate quizzes from topics using artificial intelligence
- **Community Library**: Browse, rate, and download quizzes from other teachers
- **Advanced Analytics**: Question-by-question analysis, performance insights
- **Quiz Templates**: Create and share reusable quiz templates
- **Targeted Distribution**: Assign quizzes to specific programmes, branches, years, sections

### **🛡️ For Administrators**
- **User Management**: Manage students, teachers, and admin roles
- **System Analytics**: Comprehensive system-wide performance metrics
- **Content Moderation**: Review and approve community content
- **Batch Management**: Organize students and teachers into batches
- **Audit Logs**: Complete activity tracking and system monitoring

## 🛠️ **Technical Architecture**

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive design
- **React Router DOM** for navigation
- **React Context API** for state management

### **Backend**
- **Firebase Authentication** (Email + Google)
- **Firestore Database** for real-time data
- **Firebase Storage** for file uploads
- **Firebase Functions** for serverless operations

### **Security & Anti-Cheating**
- **Role-based Authentication**: Strict access control
- **Fullscreen Enforcement**: Prevents tab switching
- **Keyboard Shortcut Blocking**: Disables common shortcuts
- **Copy-Paste Prevention**: Blocks text copying
- **Screenshot Detection**: Prevents screen captures
- **Focus Monitoring**: Tracks user attention

## 📊 **Database Schema**

```typescript
// Core Collections
users: {
  uid: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  programme?: string;
  branch?: string;
  semester?: string;
  year?: string;
  section?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

quizzes: {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
  createdAt: Date;
  isActive: boolean;
  createdBy: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  isAIGenerated?: boolean;
  isDownloaded?: boolean;
  originalQuizId?: string;
}

quizAttempts: {
  id: string;
  quizId: string;
  studentId: string;
  answers: { [questionId: string]: string };
  score: number;
  totalPoints: number;
  completedAt: Date;
  timeTaken: number;
  sessionId?: string;
}

quizSessions: {
  id: string;
  quizId: string;
  studentId: string;
  answers: { [questionId: string]: string };
  flaggedQuestions: string[];
  startTime: Date;
  lastActivity: Date;
  isCompleted: boolean;
  score?: number;
  totalPoints?: number;
  timeTaken?: number;
}

quizTemplates: {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: string;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
  usageCount: number;
  isAIGenerated?: boolean;
}

communityQuizzes: {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: string;
  questions: Question[];
  createdBy: string;
  creatorName: string;
  createdAt: Date;
  rating: number;
  ratingCount: number;
  downloadCount: number;
  tags: string[];
  isPublic: boolean;
  isVerified: boolean;
}

batches: {
  id: string;
  name: string;
  programme: string;
  branch: string;
  year: string;
  section: string;
  studentCount: number;
  teacherCount: number;
  createdAt: Date;
}
```

## 🎮 **Advanced Features**

### **🤖 AI Quiz Generator**
- **Topic-based Generation**: Enter any topic and subject
- **Difficulty Control**: Beginner, Intermediate, Advanced levels
- **Question Type Selection**: Multiple choice, True/False, Short answer
- **Customizable Parameters**: Question count, time limits
- **Smart Explanations**: AI-generated explanations for each answer
- **Template Saving**: Save generated quizzes as templates

### **🌍 Community Library**
- **Browse Shared Quizzes**: Discover quizzes from verified teachers
- **Rating System**: Rate and review community content
- **Download & Customize**: Download and modify community quizzes
- **Search & Filter**: Advanced search with subject, difficulty, rating filters
- **Verification System**: Verified teacher badges for quality content

### **📊 Advanced Analytics**
- **Question Performance**: Identify difficult questions and common mistakes
- **Student Insights**: Individual performance tracking and trends
- **Batch Comparisons**: Compare performance across different groups
- **Time Analysis**: Track completion times and identify bottlenecks
- **SWOT Analysis**: Strengths, weaknesses, opportunities, threats per batch

### **🛡️ Admin Dashboard**
- **User Management**: Add, edit, delete, and manage user roles
- **System Monitoring**: Real-time system statistics and health
- **Content Moderation**: Review and approve community content
- **Batch Management**: Organize students and teachers
- **Audit Trails**: Complete activity logging and compliance

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Firebase account

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ami-quiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase config to `src/firebaseConfig.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎯 **Usage Guide**

### **For Students**
1. **Register/Login** with your Amity University credentials
2. **Select Role** as "Student" and provide academic details
3. **Browse Available Quizzes** on your dashboard
4. **Take Quizzes** using the advanced interface
5. **Review Results** with detailed explanations

### **For Teachers**
1. **Register/Login** and select "Teacher" role
2. **Create Quizzes** manually or use AI generator
3. **Use Templates** for quick quiz creation
4. **Browse Community** for shared content
5. **Analyze Performance** with detailed analytics

### **For Administrators**
1. **Access Admin Dashboard** at `/admin/dashboard`
2. **Manage Users** and their roles
3. **Monitor System** performance and usage
4. **Moderate Content** in community library
5. **Generate Reports** for institutional insights

## 🔧 **Configuration**

### **Environment Variables**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### **Firebase Security Rules**
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin');
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Quizzes
    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Teacher');
    }
    
    // Quiz attempts
    match /quizAttempts/{attemptId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎨 **UI/UX Features**

### **Responsive Design**
- **Mobile-first** approach
- **Progressive Web App** capabilities
- **Cross-browser** compatibility
- **Accessibility** compliant (WCAG 2.1)

### **Theme System**
- **Light/Dark** mode support
- **Customizable** color schemes
- **Font size** adjustment
- **High contrast** options

### **Interactive Elements**
- **Smooth animations** with Framer Motion
- **Loading states** and progress indicators
- **Toast notifications** for user feedback
- **Modal dialogs** for focused interactions

## 🔒 **Security Features**

### **Authentication**
- **Multi-factor authentication** support
- **Session management** with secure tokens
- **Role-based access control** (RBAC)
- **Account lockout** protection

### **Data Protection**
- **End-to-end encryption** for sensitive data
- **Regular backups** and disaster recovery
- **GDPR compliance** for data privacy
- **Audit logging** for compliance

### **Anti-Cheating Measures**
- **Fullscreen enforcement** during quizzes
- **Tab switching detection** and prevention
- **Keyboard shortcut blocking**
- **Copy-paste prevention**
- **Screenshot detection**
- **Focus monitoring** and warnings

## 📈 **Performance Optimization**

### **Frontend**
- **Code splitting** and lazy loading
- **Image optimization** and compression
- **Caching strategies** for static assets
- **Bundle size** optimization

### **Backend**
- **Database indexing** for fast queries
- **Pagination** for large datasets
- **Real-time updates** with Firestore
- **Offline support** with service workers

## 🧪 **Testing**

### **Unit Tests**
```bash
npm run test
```

### **Integration Tests**
```bash
npm run test:integration
```

### **E2E Tests**
```bash
npm run test:e2e
```

## 🚀 **Deployment**

### **Firebase Hosting**
```bash
npm run build
firebase deploy
```

### **Docker Deployment**
```bash
docker build -t amiquiz .
docker run -p 3000:3000 amiquiz
```

## 📊 **Analytics & Monitoring**

### **Performance Metrics**
- **Page load times** and Core Web Vitals
- **User engagement** and session duration
- **Quiz completion rates** and success metrics
- **Error tracking** and crash reporting

### **Business Intelligence**
- **Student performance** trends
- **Teacher productivity** metrics
- **Content popularity** and usage statistics
- **System health** and uptime monitoring

## 🔮 **Future Roadmap**

### **Phase 7: Advanced AI Features**
- **Natural Language Processing** for question generation
- **Adaptive Learning** algorithms
- **Predictive Analytics** for student success
- **Intelligent Tutoring** system

### **Phase 8: Mobile Applications**
- **iOS and Android** native apps
- **Offline quiz taking** capabilities
- **Push notifications** for reminders
- **Biometric authentication**

### **Phase 9: Enterprise Features**
- **Single Sign-On (SSO)** integration
- **Learning Management System (LMS)** integration
- **Advanced reporting** and analytics
- **Multi-tenant** architecture

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Email**: support@amiquiz.edu
- **Phone**: +1-800-AMIQUIZ

## 🙏 **Acknowledgments**

- **Amity University** for the vision and requirements
- **Firebase** for the robust backend infrastructure
- **React Team** for the amazing frontend framework
- **Tailwind CSS** for the beautiful design system
- **Open Source Community** for the invaluable tools and libraries

---

**AmiQuiz** - Empowering Education Through Technology 🎓✨
