import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  displayName?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

interface Quiz {
  id: string;
  title: string;
  teacherId: string;
  createdAt: Date;
  isActive: boolean;
  questions: unknown[];
}

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalPoints: number;
  completedAt: Date;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'quizzes' | 'analytics'>('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch all users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLoginAt: doc.data().lastLoginAt?.toDate()
      })) as User[];
      setUsers(usersData);

      // Fetch all quizzes
      const quizzesRef = collection(db, 'quizzes');
      const quizzesSnapshot = await getDocs(quizzesRef);
      const quizzesData = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Quiz[];
      setQuizzes(quizzesData);

      // Fetch all attempts
      const attemptsRef = collection(db, 'quizAttempts');
      const attemptsSnapshot = await getDocs(attemptsRef);
      const attemptsData = attemptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate() || new Date()
      })) as QuizAttempt[];
      setAttempts(attemptsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
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

  const getStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const students = users.filter(u => u.role === 'student').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const totalQuizzes = quizzes.length;
    const activeQuizzes = quizzes.filter(q => q.isActive).length;
    const totalAttempts = attempts.length;
    const averageScore = attempts.length > 0 
      ? Math.round((attempts.reduce((sum, a) => sum + a.score, 0) / attempts.reduce((sum, a) => sum + a.totalPoints, 0)) * 100)
      : 0;

    return {
      totalUsers,
      activeUsers,
      students,
      teachers,
      admins,
      totalQuizzes,
      activeQuizzes,
      totalAttempts,
      averageScore
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading admin dashboard...</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-secondary-900">AmiQuiz Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-secondary-900">{user?.email}</p>
                <p className="text-xs text-secondary-500">Administrator</p>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container-fluid">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
              { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
              { id: 'quizzes', label: 'Quizzes', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'quizzes' | 'analytics')}
                className={`nav-link ${activeTab === tab.id ? 'nav-link-active' : 'nav-link-inactive'}`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-fluid py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">System Overview</h2>
              <p className="text-secondary-600">Monitor the overall health and performance of AmiQuiz platform.</p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4 mx-auto">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="stat-number">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mb-4 mx-auto">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="stat-number">{stats.totalQuizzes}</div>
                <div className="stat-label">Total Quizzes</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-lg mb-4 mx-auto">
                  <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-number">{stats.totalAttempts}</div>
                <div className="stat-label">Quiz Attempts</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-center w-12 h-12 bg-error-100 rounded-lg mb-4 mx-auto">
                  <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="stat-number">{stats.averageScore}%</div>
                <div className="stat-label">Avg Score</div>
              </div>
            </div>

            {/* User Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-secondary-900">User Distribution</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                        <span className="text-sm text-secondary-700">Students</span>
                      </div>
                      <span className="text-sm font-medium text-secondary-900">{stats.students}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-success-500 rounded-full mr-3"></div>
                        <span className="text-sm text-secondary-700">Teachers</span>
                      </div>
                      <span className="text-sm font-medium text-secondary-900">{stats.teachers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-warning-500 rounded-full mr-3"></div>
                        <span className="text-sm text-secondary-700">Administrators</span>
                      </div>
                      <span className="text-sm font-medium text-secondary-900">{stats.admins}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-secondary-900">Quiz Status</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-success-500 rounded-full mr-3"></div>
                        <span className="text-sm text-secondary-700">Active Quizzes</span>
                      </div>
                      <span className="text-sm font-medium text-secondary-900">{stats.activeQuizzes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-secondary-500 rounded-full mr-3"></div>
                        <span className="text-sm text-secondary-700">Inactive Quizzes</span>
                      </div>
                      <span className="text-sm font-medium text-secondary-900">{stats.totalQuizzes - stats.activeQuizzes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">Recent System Activity</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-secondary-600">
                    <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                    <span>{stats.totalUsers} users registered in the system</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    <span>{stats.totalQuizzes} quizzes created by teachers</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <div className="w-2 h-2 bg-warning-500 rounded-full mr-3"></div>
                    <span>{stats.totalAttempts} quiz attempts completed</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <div className="w-2 h-2 bg-error-500 rounded-full mr-3"></div>
                    <span>Average student score: {stats.averageScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">User Management</h2>
              <p className="text-secondary-600">Manage all users in the AmiQuiz system.</p>
            </div>

            <div className="card">
              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">User</th>
                      <th className="table-header-cell">Role</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Joined</th>
                      <th className="table-header-cell">Last Login</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {users.map((user) => (
                      <tr key={user.id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-primary-600">
                                {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-secondary-900">{user.displayName || 'No Name'}</div>
                              <div className="text-sm text-secondary-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${
                            user.role === 'admin' ? 'badge-error' :
                            user.role === 'teacher' ? 'badge-success' :
                            'badge-primary'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-secondary'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="table-cell text-secondary-600">
                          {user.createdAt.toLocaleDateString()}
                        </td>
                        <td className="table-cell text-secondary-600">
                          {user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : 'Never'}
                        </td>
                        <td className="table-cell">
                          <button className="btn btn-ghost btn-sm">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Quiz Management</h2>
              <p className="text-secondary-600">Monitor and manage all quizzes in the system.</p>
            </div>

            <div className="card">
              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Quiz</th>
                      <th className="table-header-cell">Teacher</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Questions</th>
                      <th className="table-header-cell">Created</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {quizzes.map((quiz) => {
                      const teacher = users.find(u => u.id === quiz.teacherId);
                      return (
                        <tr key={quiz.id} className="table-row">
                          <td className="table-cell">
                            <div>
                              <div className="font-medium text-secondary-900">{quiz.title}</div>
                              <div className="text-sm text-secondary-500">ID: {quiz.id.slice(-8)}</div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="text-sm text-secondary-600">{teacher?.email || 'Unknown'}</span>
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${quiz.isActive ? 'badge-success' : 'badge-secondary'}`}>
                              {quiz.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="table-cell text-secondary-600">
                            {quiz.questions.length}
                          </td>
                          <td className="table-cell text-secondary-600">
                            {quiz.createdAt.toLocaleDateString()}
                          </td>
                          <td className="table-cell">
                            <button className="btn btn-ghost btn-sm">View</button>
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

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">System Analytics</h2>
              <p className="text-secondary-600">Detailed analytics and performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-secondary-900">Performance Metrics</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-600">System Uptime</span>
                      <span className="text-sm font-medium text-success-600">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-600">Active Sessions</span>
                      <span className="text-sm font-medium text-primary-600">{stats.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-600">Average Response Time</span>
                      <span className="text-sm font-medium text-secondary-900">120ms</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-secondary-900">Quiz Performance</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-600">Total Attempts</span>
                      <span className="text-sm font-medium text-secondary-900">{stats.totalAttempts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-600">Average Score</span>
                      <span className="text-sm font-medium text-success-600">{stats.averageScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-600">Completion Rate</span>
                      <span className="text-sm font-medium text-primary-600">94.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard; 