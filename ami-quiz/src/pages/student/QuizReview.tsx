import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  const [tab, setTab] = useState<'report' | 'solutions'>('report');

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

  return (
    <div className="min-h-screen bg-secondary-50">
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
      <main className="container-fluid py-8">
        <div className="mb-6 flex gap-4">
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'report' ? 'bg-[#003366] text-white' : 'bg-white text-secondary-700 border-b-2 border-secondary-200'}`} onClick={() => setTab('report')}>Report</button>
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === 'solutions' ? 'bg-[#003366] text-white' : 'bg-white text-secondary-700 border-b-2 border-secondary-200'}`} onClick={() => setTab('solutions')}>Solutions</button>
        </div>
        {tab === 'report' ? (
          <div>
            {/* Report Card Content Here */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="text-xl font-bold text-[#003366] mb-4">Report Card</h3>
              <div className="mb-2">Score: <span className="font-semibold">18/20</span></div>
              <div className="mb-2">Percent: <span className="font-semibold">90%</span></div>
              <div className="mb-2">Time Taken: <span className="font-semibold">45 min</span></div>
            </div>
            {/* Peer Comparison Graphs */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h4 className="font-semibold text-secondary-900 mb-4">Peer Comparison</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[{ name: 'You', score: 18 }, { name: 'Batch Avg', score: 15 }, { name: 'Topper', score: 20 }]}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#003366" fontSize={12} />
                  <YAxis stroke="#003366" fontSize={12} domain={[0, 20]} />
                  <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                  <Legend />
                  <Bar dataKey="score" fill="#003366" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Rankings */}
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-semibold text-secondary-900 mb-4">Rankings</h4>
              <ol className="list-decimal pl-6">
                <li className="mb-1">Topper: <span className="font-semibold">Amit Sharma (20/20)</span></li>
                <li className="mb-1">You: <span className="font-semibold">18/20</span></li>
                <li className="mb-1">Batch Avg: <span className="font-semibold">15/20</span></li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-[#003366] mb-4">Solutions</h3>
            {/* Mock questions/answers/explanations */}
            {[{
              id: 'q1',
              text: 'What is the value of g on Earth?',
              userAnswer: '9.8 m/s²',
              correctAnswer: '9.8 m/s²',
              explanation: 'The acceleration due to gravity on Earth is 9.8 m/s².'
            }, {
              id: 'q2',
              text: 'Who discovered gravity?',
              userAnswer: 'Newton',
              correctAnswer: 'Newton',
              explanation: 'Sir Isaac Newton discovered gravity.'
            }].map(q => (
              <div key={q.id} className="mb-6">
                <div className="font-semibold text-secondary-900 mb-1">Q: {q.text}</div>
                <div className="mb-1"><span className="font-medium">Your Answer:</span> {q.userAnswer}</div>
                <div className="mb-1"><span className="font-medium">Correct Answer:</span> {q.correctAnswer}</div>
                <div className="text-secondary-700"><span className="font-medium">Explanation:</span> {q.explanation}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizReview; 