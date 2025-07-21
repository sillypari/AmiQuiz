import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
  createdAt: Date;
  isActive: boolean;
  teacherId: string;
}

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: { [questionId: string]: string };
  score: number;
  totalPoints: number;
  completedAt: Date;
  timeTaken: number;
}

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    if (!user) return;
    
    try {
      // Fetch teacher's quizzes
      const quizzesRef = collection(db, 'quizzes');
      const teacherQuizzesQuery = query(quizzesRef, where('teacherId', '==', user.uid));
      const quizzesSnapshot = await getDocs(teacherQuizzesQuery);
      const quizzesData = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Quiz[];
      setQuizzes(quizzesData);

      // Fetch attempts for teacher's quizzes
      const attemptsRef = collection(db, 'quizAttempts');
      const quizIds = quizzesData.map(quiz => quiz.id);
      const attemptsData: QuizAttempt[] = [];
      
      for (const quizId of quizIds) {
        const quizAttemptsQuery = query(attemptsRef, where('quizId', '==', quizId));
        const attemptsSnapshot = await getDocs(quizAttemptsQuery);
        const quizAttempts = attemptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          completedAt: doc.data().completedAt?.toDate() || new Date()
        })) as QuizAttempt[];
        attemptsData.push(...quizAttempts);
      }
      
      setAttempts(attemptsData);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getTotalStudents = () => {
    const uniqueStudents = new Set(attempts.map(attempt => attempt.studentId));
    return uniqueStudents.size;
  };

  const getAverageScore = () => {
    if (attempts.length === 0) return 0;
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const totalPossible = attempts.reduce((sum, attempt) => sum + attempt.totalPoints, 0);
    return Math.round((totalScore / totalPossible) * 100);
  };

  const getTotalQuestions = () => {
    return quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);
  };

  const navigationCards = [
    {
      title: 'Create Quiz',
      description: 'Build a new quiz with multiple question types',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'primary',
      onClick: () => navigate('/teacher/templates')
    },
    {
      title: 'AI Quiz Generator',
      description: 'Generate quizzes automatically using AI',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'success',
      onClick: () => navigate('/teacher/ai-generator')
    },
    {
      title: 'Community Library',
      description: 'Browse and download quizzes from the community',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'warning',
      onClick: () => navigate('/teacher/community')
    },
    {
      title: 'Analytics',
      description: 'View detailed performance analytics',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'error',
      onClick: () => navigate('/teacher/analytics')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-secondary-900">AmiQuiz Teacher Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-secondary-900">{user?.email}</p>
                <p className="text-xs text-secondary-500">Teacher</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                aria-label="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Welcome to your Teacher Dashboard</h2>
          <p className="text-secondary-600">Create, manage, and analyze quizzes for your students.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4 mx-auto">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="stat-number">{quizzes.length}</div>
            <div className="stat-label">Total Quizzes</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mb-4 mx-auto">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="stat-number">{getTotalStudents()}</div>
            <div className="stat-label">Active Students</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-lg mb-4 mx-auto">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-number">{getAverageScore()}%</div>
            <div className="stat-label">Average Score</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-center w-12 h-12 bg-error-100 rounded-lg mb-4 mx-auto">
              <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-number">{getTotalQuestions()}</div>
            <div className="stat-label">Total Questions</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-secondary-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {navigationCards.map((card, index) => (
              <div
                key={index}
                className="card hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={card.onClick}
              >
                <div className="card-body text-center p-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200 ${
                    card.color === 'primary' ? 'bg-primary-100 text-primary-600' :
                    card.color === 'success' ? 'bg-success-100 text-success-600' :
                    card.color === 'warning' ? 'bg-warning-100 text-warning-600' :
                    'bg-error-100 text-error-600'
                  }`}>
                    {card.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-secondary-900 mb-2">{card.title}</h4>
                  <p className="text-sm text-secondary-600">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-secondary-900">Recent Quizzes</h3>
            <button
              onClick={() => navigate('/teacher/templates')}
              className="btn btn-primary btn-sm"
            >
              View All
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-secondary-900 mb-2">No quizzes created yet</h4>
                <p className="text-secondary-600 mb-4">Start by creating your first quiz to engage your students.</p>
                <button
                  onClick={() => navigate('/teacher/templates')}
                  className="btn btn-primary"
                >
                  Create Your First Quiz
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.slice(0, 6).map((quiz) => {
                const quizAttempts = attempts.filter(attempt => attempt.quizId === quiz.id);
                const averageScore = quizAttempts.length > 0 
                  ? Math.round((quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.reduce((sum, a) => sum + a.totalPoints, 0)) * 100)
                  : 0;

                return (
                  <div key={quiz.id} className="quiz-card">
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-secondary-900 mb-2">{quiz.title}</h4>
                          <p className="text-sm text-secondary-600 mb-3">{quiz.description}</p>
                        </div>
                        <span className={`badge ${quiz.isActive ? 'badge-success' : 'badge-secondary'}`}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-secondary-500 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {quiz.questions.length} questions
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {quiz.timeLimit} min
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-600">Attempts:</span>
                          <span className="font-semibold text-secondary-900">{quizAttempts.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-600">Avg Score:</span>
                          <span className="font-semibold text-success-600">{averageScore}%</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/teacher/quiz/${quiz.id}/analytics`)}
                            className="btn btn-outline btn-sm flex-1"
                          >
                            Analytics
                          </button>
                          <button
                            onClick={() => navigate(`/teacher/quiz/${quiz.id}/edit`)}
                            className="btn btn-ghost btn-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {attempts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-6">Recent Student Activity</h3>
            <div className="card">
              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Student</th>
                      <th className="table-header-cell">Quiz</th>
                      <th className="table-header-cell">Score</th>
                      <th className="table-header-cell">Time</th>
                      <th className="table-header-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {attempts.slice(0, 5).map((attempt) => {
                      const quiz = quizzes.find(q => q.id === attempt.quizId);
                      return (
                        <tr key={attempt.id} className="table-row">
                          <td className="table-cell">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-primary-600">
                                  {attempt.studentId.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm text-secondary-900">Student {attempt.studentId.slice(-6)}</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div>
                              <div className="font-medium text-secondary-900">{quiz?.title || 'Unknown Quiz'}</div>
                              <div className="text-sm text-secondary-500">{quiz?.description}</div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="font-semibold text-success-600">
                              {attempt.score}/{attempt.totalPoints}
                            </span>
                          </td>
                          <td className="table-cell text-secondary-600">
                            {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                          </td>
                          <td className="table-cell text-secondary-600">
                            {attempt.completedAt.toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard; 