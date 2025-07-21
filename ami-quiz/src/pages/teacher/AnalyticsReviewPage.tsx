import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const batchAnalytics = [
  { batch: 'A', avg: 80, topper: 95, lowest: 60, branch: 'CSE' },
  { batch: 'B', avg: 75, topper: 90, lowest: 55, branch: 'ECE' },
];
const difficultyHeatmap = [
  { topic: 'Kinematics', difficulty: 70, branch: 'CSE' },
  { topic: 'Algebra', difficulty: 60, branch: 'CSE' },
  { topic: 'Organic', difficulty: 80, branch: 'ECE' },
];
const students = [
  { name: 'Rahul', score: 70, batch: 'A' },
  { name: 'Sneha', score: 85, batch: 'B' },
  { name: 'Amit', score: 90, batch: 'A' },
];
const suggestions = [
  { student: 'Rahul', suggestion: 'Needs help in Algebra', batch: 'A' },
  { student: 'Sneha', suggestion: 'Doing well in Physics', batch: 'B' },
];

const AnalyticsReviewPage: React.FC = () => {
  const [academic, setAcademic] = useState({});
  const batch = (academic as any).section;
  const filteredBatchAnalytics = batch ? batchAnalytics.filter(b => b.batch === batch) : batchAnalytics;
  const filteredDifficultyHeatmap = batch ? difficultyHeatmap.filter(d => d.branch === batch) : difficultyHeatmap;
  const filteredStudents = batch ? students.filter(s => s.batch === batch) : students;
  const filteredSuggestions = batch ? suggestions.filter(s => s.batch === batch) : suggestions;
  const [selectedStudent, setSelectedStudent] = useState('');

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Analytics & Review</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Academic Filter */}
          <div className="mb-6">
            <AcademicDropdowns onChange={setAcademic} />
            <div className="mt-2 text-secondary-700 text-sm">Current Filter: {JSON.stringify(academic)}</div>
          </div>
          {/* Batch Analytics */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Batch Analytics</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredBatchAnalytics} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="batch" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Bar dataKey="avg" fill="#FFD600" radius={[8, 8, 0, 0]} />
                <Bar dataKey="topper" fill="#003366" radius={[8, 8, 0, 0]} />
                <Bar dataKey="lowest" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Difficulty Heatmap (simulated as bar chart) */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Difficulty Heatmap</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredDifficultyHeatmap} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="topic" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Bar dataKey="difficulty" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Individual Drill-down */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Individual Drill-down</h2>
            <label className="block mb-1 font-medium text-secondary-700">Select Student</label>
            <select className="w-full rounded-lg border border-secondary-200 px-3 py-2 mb-4" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} aria-label="Filter by">
              <option value="">Select Student</option>
              {filteredStudents.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
            {selectedStudent && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">Drill-down for <span className="font-semibold">{selectedStudent}</span> coming soon!</div>
            )}
          </div>
          {/* Auto-generated Suggestions */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Auto-generated Suggestions</h2>
            <ul className="list-disc pl-6">
              {filteredSuggestions.map(s => (
                <li key={s.student} className="mb-2"><span className="font-semibold">{s.student}</span>: {s.suggestion}</li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsReviewPage; 