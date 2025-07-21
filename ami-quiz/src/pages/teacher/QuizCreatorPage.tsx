import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

interface AcademicTarget {
  level?: string;
  program?: string;
  branch?: string;
  specialization?: string;
  semester?: string;
  section?: string;
  group?: string;
}

interface Question {
  id?: string;
  text?: string;
  type?: string;
  options?: string[];
  correctAnswer?: string;
  points?: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  type: string;
  timer: number;
  negativeMarking: boolean;
  topicTag: string;
  assignedBatch: string;
  academicTarget: AcademicTarget;
  teacherId: string;
  createdAt: Date;
  isActive: boolean;
  questions: Question[];
}

const QuizCreatorPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('MCQ');
  const [timer, setTimer] = useState(60);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [topicTag, setTopicTag] = useState('');
  const [assignedBatch, setAssignedBatch] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [academicTarget, setAcademicTarget] = useState<AcademicTarget>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchQuizzes();
  }, [user]);

  const fetchQuizzes = async () => {
    if (!user || !user.uid) return;
    setLoading(true);
    try {
      const quizzesRef = collection(db, 'quizzes');
      const teacherQuizzesQuery = query(quizzesRef, where('teacherId', '==', user.uid));
      const snapshot = await getDocs(teacherQuizzesQuery);
      const quizzesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          type: data.type || '',
          timer: data.timer || 0,
          negativeMarking: data.negativeMarking || false,
          topicTag: data.topicTag || '',
          assignedBatch: data.assignedBatch || '',
          academicTarget: data.academicTarget || {},
          teacherId: data.teacherId || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          isActive: data.isActive || false,
          questions: data.questions || [],
        } as Quiz;
      });
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuiz = async () => {
    if (!user || !user.uid || !title.trim()) return;
    try {
      const quizData = {
        title,
        type,
        timer,
        negativeMarking,
        topicTag,
        assignedBatch,
        academicTarget,
        teacherId: user.uid,
        createdAt: new Date(),
        isActive: false,
        questions: [], // Placeholder for now
      };
      await addDoc(collection(db, 'quizzes'), quizData);
      setTitle('');
      setType('MCQ');
      setTimer(60);
      setNegativeMarking(false);
      setTopicTag('');
      setAssignedBatch('');
      setAcademicTarget({});
      setSubmitted(true);
      fetchQuizzes();
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Quiz/Test Creator</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Quiz Creation Form */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Create New Quiz/Test</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input className="rounded-lg border border-secondary-200 px-3 py-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <select title="Type" className="rounded-lg border border-secondary-200 px-3 py-2" value={type} onChange={e => setType(e.target.value)}>
                <option value="MCQ">MCQ</option>
                <option value="Numeric">Numeric</option>
                <option value="Subjective">Subjective</option>
              </select>
              <input type="number" className="rounded-lg border border-secondary-200 px-3 py-2" placeholder="Timer (min)" value={timer} onChange={e => setTimer(Number(e.target.value))} />
              <input className="rounded-lg border border-secondary-200 px-3 py-2" placeholder="Topic Tag" value={topicTag} onChange={e => setTopicTag(e.target.value)} />
              <input className="rounded-lg border border-secondary-200 px-3 py-2" placeholder="Assign to Batch" value={assignedBatch} onChange={e => setAssignedBatch(e.target.value)} />
              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={negativeMarking} onChange={e => setNegativeMarking(e.target.checked)} /> Negative Marking
              </label>
            </div>
            {/* Academic Targeting */}
            <div className="mb-4">
              <h3 className="text-md font-semibold text-[#003366] mb-2">Quiz Targeting (Academic)</h3>
              <AcademicDropdowns onChange={setAcademicTarget} />
            </div>
            <button className="btn btn-primary" onClick={addQuiz}>Add Quiz/Test</button>
            {submitted && (
              <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">Quiz created! (Firestore)</div>
            )}
          </div>
          {/* Existing Quizzes */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Existing Quizzes/Tests</h2>
            {loading ? (
              <div>Loading quizzes...</div>
            ) : (
              <ul className="list-disc pl-6">
                {quizzes.map(q => (
                  <li key={q.id} className="mb-2">
                    <span className="font-semibold">{q.title}</span> <span className="text-xs text-secondary-500">({q.type}, {q.assignedBatch}, {q.timer} min)</span>
                    <button className="btn btn-outline btn-xs ml-2">Edit</button>
                    <button className="btn btn-ghost btn-xs ml-2">Preview</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizCreatorPage; 