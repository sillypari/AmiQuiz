import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

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
  studentEmail?: string;
  answers: { [questionId: string]: string };
  score: number;
  totalPoints: number;
  completedAt: Date;
  timeTaken: number;
}

interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  correctAnswers: number;
  totalAttempts: number;
  averageScore: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  commonWrongAnswers: string[];
}

const QuizAnalytics: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  // const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId, selectedTimeframe]);

  const fetchQuizData = async () => {
    try {
      // Fetch quiz details
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId!));
      let quizData: Quiz | null = null;
      if (quizDoc.exists()) {
        quizData = {
          id: quizDoc.id,
          ...quizDoc.data(),
          createdAt: quizDoc.data().createdAt?.toDate() || new Date()
        } as Quiz;
        setQuiz(quizData);
      }

      // Fetch quiz attempts
      const attemptsRef = collection(db, 'quizAttempts');
      const attemptsQuery = query(attemptsRef, where('quizId', '==', quizId));
      const attemptsSnapshot = await getDocs(attemptsQuery);
      const attemptsData = attemptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate() || new Date()
      })) as QuizAttempt[];

      // Filter by timeframe
      const filteredAttempts = filterAttemptsByTimeframe(attemptsData, selectedTimeframe);
      setAttempts(filteredAttempts);

      // Calculate question analytics
      if (quizData) {
        const analytics = calculateQuestionAnalytics(quizData, filteredAttempts);
        setQuestionAnalytics(analytics);
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAttemptsByTimeframe = (attempts: QuizAttempt[], timeframe: string) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (timeframe) {
      case 'week':
        return attempts.filter(attempt => attempt.completedAt >= weekAgo);
      case 'month':
        return attempts.filter(attempt => attempt.completedAt >= monthAgo);
      default:
        return attempts;
    }
  };

  const calculateQuestionAnalytics = (quiz: Quiz, attempts: QuizAttempt[]): QuestionAnalytics[] => {
    return quiz.questions.map(question => {
      const questionAttempts = attempts.filter(attempt => 
        attempt.answers[question.id] !== undefined
      );

      const correctAnswers = questionAttempts.filter(attempt => 
        attempt.answers[question.id]?.toLowerCase() === question.correctAnswer.toLowerCase()
      ).length;

      const totalAttempts = questionAttempts.length;
      const averageScore = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

      // Calculate difficulty based on success rate
      let difficulty: 'Easy' | 'Medium' | 'Hard';
      if (averageScore >= 80) difficulty = 'Easy';
      else if (averageScore >= 60) difficulty = 'Medium';
      else difficulty = 'Hard';

      // Find common wrong answers
      const wrongAnswers = questionAttempts
        .filter(attempt => 
          attempt.answers[question.id]?.toLowerCase() !== question.correctAnswer.toLowerCase()
        )
        .map(attempt => attempt.answers[question.id])
        .filter(answer => answer && answer.trim() !== '');

      const commonWrongAnswers = [...new Set(wrongAnswers)].slice(0, 3);

      return {
        questionId: question.id,
        questionText: question.text,
        correctAnswers,
        totalAttempts,
        averageScore,
        difficulty,
        commonWrongAnswers
      };
    });
  };

  const getOverallStats = () => {
    if (attempts.length === 0) return null;

    const totalAttempts = attempts.length;
    const averageScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts;
    const averageTime = attempts.reduce((sum, attempt) => sum + attempt.timeTaken, 0) / totalAttempts;
    const completionRate = (attempts.length / (attempts.length + 0)) * 100; // Simplified for now

    const scoreDistribution = {
      excellent: attempts.filter(a => (a.score / a.totalPoints) >= 0.9).length,
      good: attempts.filter(a => (a.score / a.totalPoints) >= 0.7 && (a.score / a.totalPoints) < 0.9).length,
      average: attempts.filter(a => (a.score / a.totalPoints) >= 0.5 && (a.score / a.totalPoints) < 0.7).length,
      poor: attempts.filter(a => (a.score / a.totalPoints) < 0.5).length
    };

    return {
      totalAttempts,
      averageScore,
      averageTime,
      completionRate,
      scoreDistribution
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Quiz not found</div>
      </div>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Analytics</h1>
              <p className="text-gray-600">{quiz.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <>
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Attempts</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.averageScore.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Average Time</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round(stats.averageTime / 60)}m {Math.round(stats.averageTime % 60)}s
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.completionRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Score Distribution</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.scoreDistribution.excellent}</div>
                    <div className="text-sm text-gray-500">Excellent (90%+)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.scoreDistribution.good}</div>
                    <div className="text-sm text-gray-500">Good (70-89%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.scoreDistribution.average}</div>
                    <div className="text-sm text-gray-500">Average (50-69%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.scoreDistribution.poor}</div>
                    <div className="text-sm text-gray-500">Poor (&lt;50%)</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Question Analytics */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Question Performance</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {questionAnalytics.map((question, index) => (
              <div key={question.questionId} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Question {index + 1}: {question.questionText}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{question.correctAnswers}/{question.totalAttempts} correct</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {question.averageScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${question.averageScore}%` }}
                  ></div>
                </div>

                {/* Common Wrong Answers */}
                {question.commonWrongAnswers.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Common Wrong Answers:</h4>
                    <div className="flex flex-wrap gap-2">
                      {question.commonWrongAnswers.map((answer, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                        >
                          "{answer}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Attempts</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {attempts.slice(0, 10).map((attempt) => (
                <div key={attempt.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {attempt.studentEmail || `Student ${attempt.studentId.slice(-6)}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {attempt.completedAt.toLocaleDateString()} at {attempt.completedAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {attempt.score}/{attempt.totalPoints}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.round((attempt.score / attempt.totalPoints) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizAnalytics; 