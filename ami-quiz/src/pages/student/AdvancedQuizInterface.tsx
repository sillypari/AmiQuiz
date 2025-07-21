import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
  createdAt: Date;
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  targetProgramme?: string;
  targetBranch?: string;
  targetYear?: string;
  targetSection?: string;
}

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'matching';
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
}

interface QuizSession {
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

const AdvancedQuizInterface: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  // Refs for anti-cheating
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const lastActivityRef = useRef<Date>(new Date());
  const warningCountRef = useRef(0);

  useEffect(() => {
    if (quizId && user) {
      initializeQuiz();
      setupAntiCheating();
    }
  }, [quizId, user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const initializeQuiz = async () => {
    try {
      // Fetch quiz details
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId!));
      if (!quizDoc.exists()) {
        alert('Quiz not found');
        navigate('/student/dashboard');
        return;
      }

      const quizData = {
        id: quizDoc.id,
        ...quizDoc.data(),
        createdAt: quizDoc.data().createdAt?.toDate() || new Date(),
        startTime: quizDoc.data().startTime?.toDate(),
        endTime: quizDoc.data().endTime?.toDate()
      } as Quiz;

      setQuiz(quizData);
      setTimeLeft(quizData.timeLimit * 60);

      // Check if quiz is within time window
      const now = new Date();
      if (quizData.startTime && now < quizData.startTime) {
        alert('Quiz has not started yet');
        navigate('/student/dashboard');
        return;
      }
      if (quizData.endTime && now > quizData.endTime) {
        alert('Quiz has ended');
        navigate('/student/dashboard');
        return;
      }

      // Create or resume session
      await createOrResumeSession(quizData);
    } catch (error) {
      console.error('Error initializing quiz:', error);
      alert('Error loading quiz');
    } finally {
      setLoading(false);
    }
  };

  const createOrResumeSession = async (quizData: Quiz) => {
    try {
      // Check for existing session
      // TODO: Query for existing session
      const existingSession = null;
      
      if (existingSession) {
        // Resume existing session
        setSession(existingSession);
        // setAnswers(existingSession.answers);
        // setFlaggedQuestions(existingSession.flaggedQuestions);
        setCurrentQuestionIndex(0); // Could be enhanced to remember last question
      } else {
        // Create new session
        const sessionData: Omit<QuizSession, 'id'> = {
          quizId: quizData.id,
          studentId: user!.uid,
          answers: {},
          flaggedQuestions: [],
          startTime: new Date(),
          lastActivity: new Date(),
          isCompleted: false
        };

        const sessionRef = await addDoc(collection(db, 'quizSessions'), sessionData);
        const newSession = { id: sessionRef.id, ...sessionData };
        setSession(newSession);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const setupAntiCheating = () => {
    // Fullscreen detection
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Tab visibility detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Window focus detection
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    // Keyboard shortcuts prevention
    document.addEventListener('keydown', handleKeyDown);
    
    // Right-click prevention
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Copy-paste prevention
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    
    // Screenshot prevention (basic)
    document.addEventListener('keyup', handleScreenshotAttempt);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keyup', handleScreenshotAttempt);
    };
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      addWarning('Fullscreen mode is required for this quiz');
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      addWarning('Tab switching is not allowed during the quiz');
    }
  };

  const handleWindowFocus = () => {
    lastActivityRef.current = new Date();
  };

  const handleWindowBlur = () => {
    addWarning('Please stay focused on the quiz window');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Prevent common shortcuts
    if (e.ctrlKey || e.metaKey) {
      const preventedKeys = ['c', 'v', 'x', 'a', 'z', 'y', 'f', 'p', 's'];
      if (preventedKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        addWarning('Keyboard shortcuts are disabled during the quiz');
      }
    }
    
    // Prevent F11, F12, etc.
    if (e.key.startsWith('F') && e.key !== 'F5') {
      e.preventDefault();
      addWarning('Function keys are disabled during the quiz');
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    addWarning('Right-click is disabled during the quiz');
  };

  const handleCopy = (e: ClipboardEvent) => {
    e.preventDefault();
    addWarning('Copying is disabled during the quiz');
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    addWarning('Pasting is disabled during the quiz');
  };

  const handleScreenshotAttempt = (e: KeyboardEvent) => {
    if (e.key === 'PrintScreen' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      addWarning('Screenshots are not allowed during the quiz');
    }
  };

  const addWarning = (message: string) => {
    warningCountRef.current += 1;
    setWarnings(prev => [...prev, `${warningCountRef.current}. ${message}`]);
    
    if (warningCountRef.current >= 3) {
      handleAutoSubmit();
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Update session
    if (session) {
      updateDoc(doc(db, 'quizSessions', session.id), {
        answers: { ...answers, [questionId]: answer },
        lastActivity: new Date()
      });
    }
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newFlags = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
      
      // Update session
      if (session) {
        updateDoc(doc(db, 'quizSessions', session.id), {
          flaggedQuestions: newFlags,
          lastActivity: new Date()
        });
      }
      
      return newFlags;
    });
  };

  const handleAutoSubmit = async () => {
    if (session && !session.isCompleted) {
      await submitQuiz();
    }
  };

  const submitQuiz = async () => {
    if (!session || !quiz) return;

    try {
      // Calculate score
      let totalScore = 0;
      let totalPoints = 0;

      quiz.questions.forEach(question => {
        totalPoints += question.points;
        const userAnswer = answers[question.id];
        if (userAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
          totalScore += question.points;
        }
      });

      const timeTaken = quiz.timeLimit * 60 - timeLeft;

      // Update session
      await updateDoc(doc(db, 'quizSessions', session.id), {
        isCompleted: true,
        score: totalScore,
        totalPoints,
        timeTaken,
        lastActivity: new Date()
      });

      // Create quiz attempt record
      await addDoc(collection(db, 'quizAttempts'), {
        quizId: quiz.id,
        studentId: user!.uid,
        answers,
        score: totalScore,
        totalPoints,
        completedAt: new Date(),
        timeTaken,
        sessionId: session.id
      });

      // Navigate to results
      navigate(`/student/quiz/${quiz.id}/review`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullscreenRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-xl">Quiz not found or session error</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div 
      ref={fullscreenRef}
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}
    >
      {/* Anti-cheating warnings */}
      {warnings.length > 0 && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          {warnings.slice(-3).map((warning, index) => (
            <div
              key={index}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2"
            >
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {quiz.title}
              </h1>
              <span className={`px-2 py-1 rounded-full text-xs ${
                isFullscreen ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isFullscreen ? 'Fullscreen' : 'Windowed'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Accessibility Controls */}
              <div className="flex items-center space-x-2">
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Font:
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className={`px-2 py-1 border rounded text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  aria-label="Font size"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {isFullscreen ? '⛶' : '⛶'}
              </button>

              {/* Timer */}
              <div className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
              {/* Question Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </h2>
                  <p className={`${getFontSizeClass()} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentQuestion.text}
                  </p>
                </div>
                <button
                  onClick={() => toggleFlagQuestion(currentQuestion.id)}
                  className={`p-2 rounded ${
                    flaggedQuestions.includes(currentQuestion.id)
                      ? 'bg-yellow-500 text-white'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🚩
                </button>
              </div>

              {/* Question Content */}
              <div className="space-y-4">
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          answers[currentQuestion.id] === option
                            ? 'border-blue-500 bg-blue-50'
                            : theme === 'dark' ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`${getFontSizeClass()} ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'true-false' && (
                  <div className="space-y-3">
                    {['True', 'False'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          answers[currentQuestion.id] === option
                            ? 'border-blue-500 bg-blue-50'
                            : theme === 'dark' ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`${getFontSizeClass()} ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'short-answer' && (
                  <div>
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className={`w-full p-4 border-2 rounded-lg resize-none ${getFontSizeClass()} ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      rows={4}
                      placeholder="Enter your answer here..."
                    />
                  </div>
                )}

                {currentQuestion.type === 'matching' && (
                  <div className="space-y-4">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Matching questions will be implemented in future versions.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                <div className="flex space-x-4">
                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700`}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitConfirm(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 sticky top-24`}>
              <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Question Navigator
              </h3>
              
              <div className="grid grid-cols-5 gap-2 mb-6">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[quiz.questions[index].id]
                        ? flaggedQuestions.includes(quiz.questions[index].id)
                          ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                        : flaggedQuestions.includes(quiz.questions[index].id)
                        ? 'bg-yellow-200 text-yellow-800'
                        : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Answered
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Flagged
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Unanswered
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowExitConfirm(true)}
                  className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  Exit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
            <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Exit Quiz?
            </h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to exit? Your progress will be saved, but you may not be able to return to this quiz.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowExitConfirm(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
            <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Submit Quiz?
            </h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              You have answered {Object.keys(answers).length} out of {quiz.questions.length} questions. 
              Are you sure you want to submit?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Review More
              </button>
              <button
                onClick={submitQuiz}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedQuizInterface; 