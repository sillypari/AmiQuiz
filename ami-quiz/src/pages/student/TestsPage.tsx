import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';

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
  },
];

const subjects = ['All', 'Physics', 'Mathematics', 'Chemistry'];
const statuses = ['All', 'completed', 'upcoming', 'missed'];

const TestsPage: React.FC = () => {
  const [subject, setSubject] = useState('All');
  const [status, setStatus] = useState('All');
  const [date, setDate] = useState('');

  const filteredTests = mockTests.filter(test =>
    (subject === 'All' || test.subject === subject) &&
    (status === 'All' || test.status === status) &&
    (!date || test.date === date)
  );

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Tests & Assessments</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="subject-select" className="block text-secondary-700 mb-1 font-medium">Subject</label>
              <select id="subject-select" title="Subject" className="w-full rounded-lg border border-secondary-200 px-3 py-2 focus:ring-2 focus:ring-[#003366]" value={subject} onChange={e => setSubject(e.target.value)}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status-select" className="block text-secondary-700 mb-1 font-medium">Status</label>
              <select id="status-select" title="Status" className="w-full rounded-lg border border-secondary-200 px-3 py-2 focus:ring-2 focus:ring-[#003366]" value={status} onChange={e => setStatus(e.target.value)}>
                {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1) }</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="date-input" className="block text-secondary-700 mb-1 font-medium">Date</label>
              <input id="date-input" title="Date" type="date" className="w-full rounded-lg border border-secondary-200 px-3 py-2 focus:ring-2 focus:ring-[#003366]" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.length === 0 ? (
              <div className="col-span-full text-center text-secondary-500 py-12">No tests found for selected filters.</div>
            ) : (
              filteredTests.map(test => (
                <div key={test.id} className="bg-white rounded-xl shadow p-6 flex flex-col">
                  <Link to={`/student/tests/${test.id}`} className="block hover:underline">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-[#003366]">{test.title}</h2>
                      <span className={`badge ${test.status === 'completed' ? 'bg-success-100 text-success-700' : test.status === 'upcoming' ? 'bg-warning-100 text-warning-700' : 'bg-error-100 text-error-700'} px-3 py-1 rounded-full text-xs font-semibold`}>{test.status.charAt(0).toUpperCase() + test.status.slice(1)}</span>
                    </div>
                  </Link>
                  <div className="text-secondary-600 mb-2">{test.subject} &bull; {test.type}</div>
                  <div className="text-sm text-secondary-500 mb-2">Date: <span className="font-medium">{test.date}</span></div>
                  <div className="text-sm text-secondary-500 mb-2">Duration: <span className="font-medium">{test.duration} min</span></div>
                  <div className="text-sm text-secondary-500 mb-4">Syllabus: <span className="font-medium">{test.syllabus}</span></div>
                  <div className="mt-auto flex gap-2">
                    {(test.status === 'upcoming' || test.status === 'missed') && (
                      <Link to={`/student/tests/${test.id}`} className="btn btn-primary flex-1 text-center">{test.status === 'missed' ? 'Resume' : 'Start'}</Link>
                    )}
                    {test.status === 'completed' && (
                      <Link to={`/student/tests/${test.id}`} className="btn btn-outline flex-1 text-center">View Report</Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TestsPage; 