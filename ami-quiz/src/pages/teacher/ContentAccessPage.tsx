import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';

const notes = [
  { id: 1, title: 'Physics Notes', type: 'PDF', link: '#', branch: 'CSE' },
  { id: 2, title: 'Algebra Video', type: 'Link', link: '#', branch: 'ECE' },
];
const topics = [
  { name: 'Kinematics', enabled: true, branch: 'CSE' },
  { name: 'Algebra', enabled: false, branch: 'ECE' },
];
const practiceSets = [
  { id: 1, title: 'Physics Practice Set', questions: 20, branch: 'CSE' },
  { id: 2, title: 'Algebra Practice Set', questions: 15, branch: 'ECE' },
];

const ContentAccessPage: React.FC = () => {
  const [topicStates, setTopicStates] = useState(topics);
  const [academic, setAcademic] = useState({});
  const branch = (academic as any).branch;
  const filteredNotes = branch ? notes.filter(n => n.branch === branch) : notes;
  const filteredTopics = branch ? topicStates.filter(t => t.branch === branch) : topicStates;
  const filteredPracticeSets = branch ? practiceSets.filter(p => p.branch === branch) : practiceSets;
  const toggleTopic = (name: string) => {
    setTopicStates(ts => ts.map(t => t.name === name ? { ...t, enabled: !t.enabled } : t));
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Content & Access Management</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Academic Filter */}
          <div className="mb-6">
            <AcademicDropdowns onChange={setAcademic} />
            <div className="mt-2 text-secondary-700 text-sm">Current Filter: {JSON.stringify(academic)}</div>
          </div>
          {/* Upload Notes, PDFs, Links */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Uploaded Materials</h2>
            <ul className="list-disc pl-6">
              {filteredNotes.map(n => (
                <li key={n.id} className="mb-2">
                  <span className="font-semibold">{n.title}</span> <span className="text-xs text-secondary-500">({n.type})</span> <a href={n.link} className="text-blue-600 underline ml-2">View</a>
                </li>
              ))}
            </ul>
          </div>
          {/* Enable/Disable Topic Access */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Topic Access</h2>
            <ul className="list-disc pl-6">
              {filteredTopics.map(t => (
                <li key={t.name} className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">{t.name}</span>
                  <button className={`btn btn-xs ${t.enabled ? 'btn-success' : 'btn-outline'}`} onClick={() => toggleTopic(t.name)}>{t.enabled ? 'Enabled' : 'Disabled'}</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Personalized Practice Sets */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Personalized Practice Sets</h2>
            <ul className="list-disc pl-6">
              {filteredPracticeSets.map(p => (
                <li key={p.id} className="mb-2">
                  <span className="font-semibold">{p.title}</span> <span className="text-xs text-secondary-500">({p.questions} questions)</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ContentAccessPage; 