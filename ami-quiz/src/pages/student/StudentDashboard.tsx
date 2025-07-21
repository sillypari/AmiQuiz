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

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
    fetchCompletedQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const quizzesRef = collection(db, 'quizzes');
      const activeQuizzesQuery = query(quizzesRef, where('isActive', '==', true));
      const snapshot = await getDocs(activeQuizzesQuery);
      const quizzesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Quiz[];
      setAvailableQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedQuizzes = async () => {
    if (!user) return;
    
    try {
      const attemptsRef = collection(db, 'quizAttempts');
      const studentAttemptsQuery = query(attemptsRef, where('studentId', '==', user.uid));
      const snapshot = await getDocs(studentAttemptsQuery);
      const attemptsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate() || new Date()
      })) as QuizAttempt[];
      setCompletedQuizzes(attemptsData);
    } catch (error) {
      console.error('Error fetching completed quizzes:', error);
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

  const startQuiz = (quiz: Quiz) => {
    navigate(`/student/quiz/${quiz.id}/take`);
  };

  const getQuizAttempt = (quizId: string) => {
    return completedQuizzes.find(attempt => attempt.quizId === quizId);
  };

  const getAverageScore = () => {
    if (completedQuizzes.length === 0) return 0;
    const totalScore = completedQuizzes.reduce((sum, attempt) => sum + attempt.score, 0);
    return Math.round((totalScore / completedQuizzes.length) * 100) / 100;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

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
              <h1 className="text-xl font-bold text-secondary-900">AmiQuiz Student Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-secondary-900">{user?.email}</p>
                <p className="text-xs text-secondary-500">Student</p>
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
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Welcome back!</h2>
          <p className="text-secondary-600">Ready to test your knowledge? Here are your available quizzes and progress.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4 mx-auto">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="stat-number">{availableQuizzes.length}</div>
            <div className="stat-label">Available Quizzes</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mb-4 mx-auto">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-number">{completedQuizzes.length}</div>
            <div className="stat-label">Completed Quizzes</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-lg mb-4 mx-auto">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="stat-number">{getAverageScore()}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>

        {/* Available Quizzes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-secondary-900">Available Quizzes</h3>
            <div className="text-sm text-secondary-500">
              {availableQuizzes.length} quiz{availableQuizzes.length !== 1 ? 'zes' : ''} available
            </div>
          </div>

          {availableQuizzes.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-secondary-900 mb-2">No quizzes available</h4>
                <p className="text-secondary-600">Check back later for new quizzes from your teachers.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableQuizzes.map((quiz) => {
                const attempt = getQuizAttempt(quiz.id);
                return (
                  <div key={quiz.id} className="quiz-card">
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-secondary-900 mb-2">{quiz.title}</h4>
                          <p className="text-sm text-secondary-600 mb-3">{quiz.description}</p>
                        </div>
                        {attempt && (
                          <span className="badge badge-success">Completed</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-secondary-500 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {quiz.timeLimit} min
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {quiz.questions.length} questions
                        </div>
                      </div>

                      {attempt ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-secondary-600">Your Score:</span>
                            <span className="font-semibold text-success-600">
                              {attempt.score}/{attempt.totalPoints} ({Math.round((attempt.score / attempt.totalPoints) * 100)}%)
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-secondary-600">Time Taken:</span>
                            <span className="font-semibold text-secondary-900">{formatTime(attempt.timeTaken)}</span>
                          </div>
                          <button
                            onClick={() => navigate(`/student/quiz/${quiz.id}/review`)}
                            className="btn btn-outline w-full btn-sm"
                          >
                            Review Results
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startQuiz(quiz)}
                          className="btn btn-primary w-full"
                        >
                          Start Quiz
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {completedQuizzes.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-6">Recent Activity</h3>
            <div className="card">
              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Quiz</th>
                      <th className="table-header-cell">Score</th>
                      <th className="table-header-cell">Time</th>
                      <th className="table-header-cell">Date</th>
                      <th className="table-header-cell">Action</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {completedQuizzes.slice(0, 5).map((attempt) => {
                      const quiz = availableQuizzes.find(q => q.id === attempt.quizId);
                      return (
                        <tr key={attempt.id} className="table-row">
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
                            {formatTime(attempt.timeTaken)}
                          </td>
                          <td className="table-cell text-secondary-600">
                            {attempt.completedAt.toLocaleDateString()}
                          </td>
                          <td className="table-cell">
                            <button
                              onClick={() => navigate(`/student/quiz/${attempt.quizId}/review`)}
                              className="btn btn-ghost btn-sm"
                            >
                              Review
                            </button>
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

export default StudentDashboard; 