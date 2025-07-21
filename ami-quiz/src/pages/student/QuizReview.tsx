import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  answers: { [questionId: string]: string };
  score: number;
  totalPoints: number;
  completedAt: Date;
  timeTaken: number;
}

const QuizReview: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId && user) {
      fetchQuizData();
    }
  }, [quizId, user]);

  const fetchQuizData = async () => {
    try {
      // Fetch quiz details
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId!));
      if (quizDoc.exists()) {
        const quizData = {
          id: quizDoc.id,
          ...quizDoc.data(),
          createdAt: quizDoc.data().createdAt?.toDate() || new Date()
        } as Quiz;
        setQuiz(quizData);
      }

      // Fetch student's attempt
      const attemptsRef = collection(db, 'quizAttempts');
      const attemptQuery = query(
        attemptsRef, 
        where('quizId', '==', quizId),
        where('studentId', '==', user!.uid)
      );
      const attemptSnapshot = await getDocs(attemptQuery);
      
      if (!attemptSnapshot.empty) {
        const attemptData = {
          id: attemptSnapshot.docs[0].id,
          ...attemptSnapshot.docs[0].data(),
          completedAt: attemptSnapshot.docs[0].data().completedAt?.toDate() || new Date()
        } as QuizAttempt;
        setAttempt(attemptData);
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAnswerCorrect = (questionId: string) => {
    if (!attempt || !quiz) return false;
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return false;
    
    const userAnswer = attempt.answers[questionId];
    return userAnswer?.toLowerCase() === question.correctAnswer.toLowerCase();
  };

  const getScorePercentage = () => {
    if (!attempt) return 0;
    return Math.round((attempt.score / attempt.totalPoints) * 100);
  };

  const getPerformanceMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return { message: 'Excellent! Outstanding performance!', color: 'text-green-600' };
    if (percentage >= 80) return { message: 'Great job! Well done!', color: 'text-green-600' };
    if (percentage >= 70) return { message: 'Good work! Keep it up!', color: 'text-blue-600' };
    if (percentage >= 60) return { message: 'Not bad! Room for improvement.', color: 'text-yellow-600' };
    if (percentage >= 50) return { message: 'You can do better! Study more.', color: 'text-orange-600' };
    return { message: 'Keep practicing! You\'ll improve.', color: 'text-red-600' };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading quiz review...</div>
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Quiz or attempt not found</div>
      </div>
    );
  }

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Review</h1>
              <p className="text-gray-600">{quiz.title}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Completed</div>
              <div className="text-lg font-medium">
                {attempt.completedAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {attempt.score}/{attempt.totalPoints}
              </h2>
              <div className={`text-xl font-medium ${performance.color} mb-2`}>
                {performance.message}
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {getScorePercentage()}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{attempt.score}</div>
                <div className="text-sm text-gray-500">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{attempt.totalPoints}</div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(attempt.timeTaken)}
                </div>
                <div className="text-sm text-gray-500">Time Taken</div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Question Review</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {quiz.questions.map((question, index) => {
              const userAnswer = attempt.answers[question.id];
              const isCorrect = isAnswerCorrect(question.id);
              
              return (
                <div key={question.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Question {index + 1}: {question.text}
                      </h3>

                      {/* Question Type and Options */}
                      {question.type === 'multiple-choice' && question.options && (
                        <div className="space-y-2 mb-4">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded border ${
                                option === question.correctAnswer
                                  ? 'bg-green-50 border-green-200'
                                  : option === userAnswer && !isCorrect
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  option === question.correctAnswer
                                    ? 'border-green-500 bg-green-500'
                                    : option === userAnswer && !isCorrect
                                    ? 'border-red-500 bg-red-500'
                                    : 'border-gray-300'
                                }`}>
                                  {option === question.correctAnswer && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                  {option === userAnswer && !isCorrect && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className={option === question.correctAnswer ? 'font-medium text-green-700' : ''}>
                                  {option}
                                </span>
                                {option === question.correctAnswer && (
                                  <span className="text-green-600 text-sm font-medium">Correct Answer</span>
                                )}
                                {option === userAnswer && !isCorrect && (
                                  <span className="text-red-600 text-sm font-medium">Your Answer</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'true-false' && (
                        <div className="space-y-2 mb-4">
                          {['True', 'False'].map((option) => (
                            <div
                              key={option}
                              className={`p-3 rounded border ${
                                option === question.correctAnswer
                                  ? 'bg-green-50 border-green-200'
                                  : option === userAnswer && !isCorrect
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  option === question.correctAnswer
                                    ? 'border-green-500 bg-green-500'
                                    : option === userAnswer && !isCorrect
                                    ? 'border-red-500 bg-red-500'
                                    : 'border-gray-300'
                                }`}>
                                  {option === question.correctAnswer && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                  {option === userAnswer && !isCorrect && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className={option === question.correctAnswer ? 'font-medium text-green-700' : ''}>
                                  {option}
                                </span>
                                {option === question.correctAnswer && (
                                  <span className="text-green-600 text-sm font-medium">Correct Answer</span>
                                )}
                                {option === userAnswer && !isCorrect && (
                                  <span className="text-red-600 text-sm font-medium">Your Answer</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'short-answer' && (
                        <div className="space-y-3 mb-4">
                          <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <div className="text-sm text-green-600 font-medium mb-1">Correct Answer:</div>
                            <div className="text-green-700">{question.correctAnswer}</div>
                          </div>
                          {userAnswer && (
                            <div className={`p-3 border rounded ${
                              isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}>
                              <div className={`text-sm font-medium mb-1 ${
                                isCorrect ? 'text-green-600' : 'text-red-600'
                              }`}>
                                Your Answer:
                              </div>
                              <div className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                {userAnswer}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Points */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Points: {question.points}</span>
                        <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {isCorrect ? `+${question.points} points` : '0 points'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Print Results
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuizReview; 