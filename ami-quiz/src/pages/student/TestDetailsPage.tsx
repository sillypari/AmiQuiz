import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const mockTests = [
  {
    id: '1',
    title: 'Physics Mock Test',
    subject: 'Physics',
    date: '2024-06-10',
    status: 'upcoming',
    duration: 90,
    type: 'Mock',
    syllabus: 'Kinematics, Laws of Motion',
    description: 'A comprehensive mock test covering core physics topics.'
  },
  {
    id: '2',
    title: 'Maths Practice Test',
    subject: 'Mathematics',
    date: '2024-06-05',
    status: 'completed',
    duration: 60,
    type: 'Practice',
    syllabus: 'Algebra, Calculus',
    description: 'Practice test for algebra and calculus.'
  },
  {
    id: '3',
    title: 'Chemistry Full Test',
    subject: 'Chemistry',
    date: '2024-06-12',
    status: 'missed',
    duration: 120,
    type: 'Full Test',
    syllabus: 'Organic, Inorganic',
    description: 'Full syllabus test for chemistry.'
  },
];

const TestDetailsPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const test = mockTests.find(t => t.id === testId) || mockTests[0];

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Test Details</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 flex justify-center items-start">
          <div className="bg-white rounded-xl shadow p-8 max-w-xl w-full">
            <h2 className="text-2xl font-bold text-[#003366] mb-2">{test.title}</h2>
            <div className="text-secondary-600 mb-4">{test.subject} &bull; {test.type}</div>
            <div className="mb-4 text-secondary-700">{test.description}</div>
            <div className="mb-2"><span className="font-medium">Date:</span> {test.date}</div>
            <div className="mb-2"><span className="font-medium">Duration:</span> {test.duration} min</div>
            <div className="mb-2"><span className="font-medium">Syllabus:</span> {test.syllabus}</div>
            <div className="mb-6"><span className="font-medium">Status:</span> <span className={`badge ${test.status === 'completed' ? 'bg-success-100 text-success-700' : test.status === 'upcoming' ? 'bg-warning-100 text-warning-700' : 'bg-error-100 text-error-700'} px-3 py-1 rounded-full text-xs font-semibold`}>{test.status.charAt(0).toUpperCase() + test.status.slice(1)}</span></div>
            <div className="flex gap-3">
              {(test.status === 'upcoming' || test.status === 'missed') && (
                <button className="btn btn-primary flex-1" onClick={() => navigate(`/student/quiz/${test.id}/take`)}>{test.status === 'missed' ? 'Resume' : 'Start Test'}</button>
              )}
              {test.status === 'completed' && (
                <button className="btn btn-outline flex-1" onClick={() => navigate(`/student/quiz/${test.id}/review`)}>View Report</button>
              )}
              <button className="btn btn-ghost flex-1" onClick={() => navigate(-1)}>Back</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TestDetailsPage; 