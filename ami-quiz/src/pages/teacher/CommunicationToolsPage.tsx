import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';

const announcements = [
  { id: 1, message: 'Test on Monday for Batch A.' },
  { id: 2, message: 'Submit assignments by Friday.' },
];
const feedbacks = [
  { id: 1, student: 'Rahul', feedback: 'Great improvement in Algebra.' },
  { id: 2, student: 'Sneha', feedback: 'Focus on Physics concepts.' },
];
const doubts = [
  { id: 1, student: 'Rahul', doubt: 'How to solve quadratic equations?', flag: 'Needs Attention' },
  { id: 2, student: 'Sneha', doubt: 'Explain Newton’s Laws.', flag: 'Resolved' },
];

const CommunicationToolsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'announcements' | 'feedback' | 'doubts'>('announcements');

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Communication Tools</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1">
          <div className="mb-6 flex gap-4">
            <button className={`px-4 py-2 rounded-t-lg font-semibold ${selectedTab === 'announcements' ? 'bg-[#003366] text-white' : 'bg-white text-secondary-700 border-b-2 border-secondary-200'}`} onClick={() => setSelectedTab('announcements')}>Announcements</button>
            <button className={`px-4 py-2 rounded-t-lg font-semibold ${selectedTab === 'feedback' ? 'bg-[#003366] text-white' : 'bg-white text-secondary-700 border-b-2 border-secondary-200'}`} onClick={() => setSelectedTab('feedback')}>1-on-1 Feedback</button>
            <button className={`px-4 py-2 rounded-t-lg font-semibold ${selectedTab === 'doubts' ? 'bg-[#003366] text-white' : 'bg-white text-secondary-700 border-b-2 border-secondary-200'}`} onClick={() => setSelectedTab('doubts')}>Doubt Replies</button>
          </div>
          {selectedTab === 'announcements' && (
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#003366] mb-4">Broadcast Announcements</h2>
              <ul className="list-disc pl-6">
                {announcements.map(a => (
                  <li key={a.id} className="mb-2">{a.message}</li>
                ))}
              </ul>
            </div>
          )}
          {selectedTab === 'feedback' && (
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#003366] mb-4">1-on-1 Feedback</h2>
              <ul className="list-disc pl-6">
                {feedbacks.map(f => (
                  <li key={f.id} className="mb-2"><span className="font-semibold">{f.student}:</span> {f.feedback}</li>
                ))}
              </ul>
            </div>
          )}
          {selectedTab === 'doubts' && (
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#003366] mb-4">Doubt Replies</h2>
              <ul className="list-disc pl-6">
                {doubts.map(d => (
                  <li key={d.id} className="mb-2 flex items-center gap-2">
                    <span className="font-semibold">{d.student}:</span> {d.doubt}
                    <span className={`badge ${d.flag === 'Resolved' ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'} px-2 py-1 rounded-full text-xs font-semibold`}>{d.flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CommunicationToolsPage; 