import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Question {
  id: string;
  topicTag?: string; // Assuming questions can be tagged by topic/chapter
  points: number;
}

interface Quiz {
  id: string;
  subject: string;
  topicTag?: string; // Overall topic for the quiz
  questions: Question[];
  title: string;
}

interface Attempt {
  quizId: string;
  score: number;
  totalPoints: number;
  timeTaken: number; // in seconds
  completedAt: Date;
  answers: { [questionId: string]: { isCorrect?: boolean } };
}

interface Analytics {
  subjectData?: { subject: string; score: number }[];
  chapterData?: { chapter: string; strength: number; weakness: number }[];
  accuracySpeedData?: { name: string; accuracy: number; speed: number }[];
  scoreTrendData?: { test: string; score: number }[];
  timeHeatmapData?: { topic: string; time: number }[];
  perfCompData?: { name: string; score: number }[];
}

const ReportsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [academic, setAcademic] = useState({});
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics>({});

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user || !user.uid) return;
    setLoading(true);
    try {
      // Fetch attempts
      const attemptsRef = collection(db, 'quizAttempts');
      const attemptsQuery = query(attemptsRef, where('studentId', '==', user.uid));
      const attemptsSnapshot = await getDocs(attemptsQuery);
      const attempts: Attempt[] = attemptsSnapshot.docs.map(doc => doc.data() as Attempt);
      // Fetch quizzes
      const quizzesRef = collection(db, 'quizzes');
      const quizzesSnapshot = await getDocs(quizzesRef);
      const quizzes: Quiz[] = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
      // Process analytics
      const analyticsData = processAnalytics(attempts, quizzes);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (attempts: Attempt[], quizzes: Quiz[]): Analytics => {
    // 1. Subject-wise Performance
    const subjectPerformance: { [subject: string]: { scores: number[], count: number } } = {};
    attempts.forEach(attempt => {
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      if (quiz && quiz.subject) {
        if (!subjectPerformance[quiz.subject]) {
          subjectPerformance[quiz.subject] = { scores: [], count: 0 };
        }
        subjectPerformance[quiz.subject].scores.push((attempt.score / attempt.totalPoints) * 100);
        subjectPerformance[quiz.subject].count++;
      }
    });
    const subjectData = Object.entries(subjectPerformance).map(([subject, data]) => ({
      subject,
      score: data.scores.reduce((a, b) => a + b, 0) / data.count,
    }));

    // 2. Score Trend
    const sortedAttempts = [...attempts].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
    const scoreTrendData = sortedAttempts.map((attempt, index) => {
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      return {
        test: quiz?.title.substring(0, 10) + '...' || `Test ${index + 1}`,
        score: (attempt.score / attempt.totalPoints) * 100,
      };
    });
    
    // 3. Chapter-wise Strength vs Weakness (simplified)
    const chapterPerformance: { [chapter: string]: { correct: number, total: number } } = {};
    attempts.forEach(attempt => {
        const quiz = quizzes.find(q => q.id === attempt.quizId);
        if (quiz) {
            quiz.questions.forEach(q => {
                const chapter = q.topicTag || quiz.topicTag || 'General';
                if (!chapterPerformance[chapter]) chapterPerformance[chapter] = { correct: 0, total: 0 };
                
                const answer = attempt.answers[q.id];
                if (answer && answer.isCorrect) { // This assumes 'isCorrect' is part of the answer object
                    chapterPerformance[chapter].correct++;
                }
                chapterPerformance[chapter].total++;
            });
        }
    });
    const chapterData = Object.entries(chapterPerformance).map(([chapter, perfData]) => ({
        chapter,
        strength: (perfData.correct / perfData.total) * 100,
        weakness: 100 - ((perfData.correct / perfData.total) * 100),
    }));

    // 4. Accuracy vs Speed
    const accuracySpeedData = quizzes.map(quiz => {
        const relevantAttempts = attempts.filter(a => a.quizId === quiz.id);
        const avgAccuracy = relevantAttempts.reduce((sum, a) => sum + (a.score / a.totalPoints), 0) / relevantAttempts.length * 100;
        const avgSpeed = relevantAttempts.reduce((sum, a) => sum + (a.totalPoints / (a.timeTaken / 60)), 0) / relevantAttempts.length; // Questions per minute

        return {
            name: quiz.subject || quiz.topicTag || 'General',
            accuracy: avgAccuracy || 0,
            speed: avgSpeed || 0,
        };
    }).filter(d => d.accuracy > 0);
    
    // 5. Time per topic (Heatmap)
    const timeHeatmapData = Object.keys(chapterPerformance).map((topic) => {
      // This is a simplification. Real calculation would need time per question.
      const totalTimeForTopic = attempts.reduce((sum, a) => {
        const quiz = quizzes.find(q => q.id === a.quizId);
        if (quiz?.topicTag === topic || quiz?.questions.some(q => q.topicTag === topic)) {
          return sum + a.timeTaken;
        }
        return sum;
      }, 0);
      return {
        topic,
        time: Math.round(totalTimeForTopic / 60), // in minutes
      };
    });

    // 6. Performance Comparison (mocking others)
    const userAvgScore = scoreTrendData.reduce((sum, d) => sum + d.score, 0) / scoreTrendData.length;
    const perfCompData = [
        { name: 'You', score: userAvgScore || 0 },
        { name: 'Batch Avg', score: 75 }, // Mocked
        { name: 'Topper', score: 95 }, // Mocked
    ];

    return { subjectData, scoreTrendData, chapterData, accuracySpeedData, timeHeatmapData, perfCompData };
  };

  // Filter logic to be implemented with dynamic processing

  const filteredSubjectData = analytics.subjectData;
  const filteredChapterData = analytics.chapterData;
  const filteredAccuracySpeedData = analytics.accuracySpeedData;
  const filteredScoreTrendData = analytics.scoreTrendData;
  const filteredTimeHeatmapData = analytics.timeHeatmapData;
  const filteredPerfCompData = analytics.perfCompData;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-secondary-50">
        <Sidebar />
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="loading-spinner w-8 h-8 mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Reports & Analytics</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Academic Filter */}
          <div className="mb-6">
            <AcademicDropdowns onChange={setAcademic} />
            <div className="mt-2 text-secondary-700 text-sm">Current Filter: {JSON.stringify(academic)}</div>
          </div>
          {/* Subject-wise Performance */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Subject-wise Performance</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredSubjectData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="subject" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Bar dataKey="score" fill="#003366" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Chapter-wise Strength vs Weakness */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Chapter-wise Strength vs Weakness</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredChapterData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="chapter" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Bar dataKey="strength" fill="#FFD600" radius={[8, 8, 0, 0]} />
                <Bar dataKey="weakness" fill="#003366" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Accuracy vs Speed */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Accuracy vs Speed</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={filteredAccuracySpeedData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#003366" fontSize={12} />
                <YAxis yAxisId="left" stroke="#003366" fontSize={12} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#FFD600" fontSize={12} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#003366" strokeWidth={3} dot={{ r: 5, fill: '#FFD600' }} />
                <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#FFD600" strokeWidth={3} dot={{ r: 5, fill: '#003366' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Score Trend Line Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Score Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={filteredScoreTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="test" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#003366" strokeWidth={3} dot={{ r: 5, fill: '#FFD600' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Time per Topic/Question Heatmap (simulated as bar chart) */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Time per Topic</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredTimeHeatmapData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="topic" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Bar dataKey="time" fill="#003366" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Performance Comparison */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Performance Comparison</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredPerfCompData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Bar dataKey="score" fill="#FFD600" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage; 