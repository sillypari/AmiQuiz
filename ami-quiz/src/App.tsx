import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RoleDetailsPage from './pages/auth/RoleDetailsPage';
import StudentDashboard from './pages/student/StudentDashboard';
import QuizReview from './pages/student/QuizReview';
import AdvancedQuizInterface from './pages/student/AdvancedQuizInterface';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import QuizAnalytics from './pages/teacher/QuizAnalytics';
import QuizTemplates from './pages/teacher/QuizTemplates';
import AIQuizGenerator from './pages/teacher/AIQuizGenerator';
import CommunityLibrary from './pages/teacher/CommunityLibrary';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import IndexPage from './pages/IndexPage';
import RoleSelectPage from './pages/auth/RoleSelectPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/role" element={<RoleDetailsPage />} />
      <Route path="/select-role" element={<RoleSelectPage />} />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/quiz/:quizId/take" element={<ProtectedRoute><AdvancedQuizInterface /></ProtectedRoute>} />
      <Route path="/student/quiz/:quizId/review" element={<ProtectedRoute><QuizReview /></ProtectedRoute>} />
      
      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/templates" element={<ProtectedRoute><QuizTemplates /></ProtectedRoute>} />
      <Route path="/teacher/ai-generator" element={<ProtectedRoute><AIQuizGenerator /></ProtectedRoute>} />
      <Route path="/teacher/community" element={<ProtectedRoute><CommunityLibrary /></ProtectedRoute>} />
      <Route path="/teacher/quiz/:quizId/edit" element={<ProtectedRoute><div>Quiz Edit Page (Coming Soon)</div></ProtectedRoute>} />
      <Route path="/teacher/quiz/:quizId/analytics" element={<ProtectedRoute><QuizAnalytics /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
