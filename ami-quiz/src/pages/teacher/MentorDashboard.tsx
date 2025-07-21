import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const overview = [
  { label: 'Total Students', value: 120, batch: 'A' },
  { label: 'Active Tests', value: 5, batch: 'B' },
  { label: 'Flagged Doubts', value: 3, batch: 'A' },
];
const laggingStudents = [
  { name: 'Rahul', reason: 'Low scores', batch: 'A' },
  { name: 'Sneha', reason: 'Low attendance', batch: 'B' },
];
const batchPerformance = [
  { batch: 'A', avg: 80 },
  { batch: 'B', avg: 75 },
  { batch: 'C', avg: 90 },
];
const attendance = [
  { date: 'Mon', rate: 95, batch: 'A' },
  { date: 'Tue', rate: 92, batch: 'B' },
  { date: 'Wed', rate: 88, batch: 'A' },
  { date: 'Thu', rate: 90, batch: 'B' },
  { date: 'Fri', rate: 93, batch: 'A' },
];
const activity = [
  { name: 'Rahul', activity: 5, batch: 'A' },
  { name: 'Sneha', activity: 2, batch: 'B' },
  { name: 'Amit', activity: 8, batch: 'A' },
];

const MentorDashboard: React.FC = () => {
  const [academic, setAcademic] = useState({});
  const batch = (academic as any).section;
  const filteredOverview = batch ? overview.filter(o => o.batch === batch) : overview;
  const filteredLagging = batch ? laggingStudents.filter(s => s.batch === batch) : laggingStudents;
  const filteredAttendance = batch ? attendance.filter(a => a.batch === batch) : attendance;
  const filteredActivity = batch ? activity.filter(a => a.batch === batch) : activity;

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Mentor Dashboard</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Academic Filter */}
          <div className="mb-6">
            <AcademicDropdowns onChange={setAcademic} />
            <div className="mt-2 text-secondary-700 text-sm">Current Filter: {JSON.stringify(academic)}</div>
          </div>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {filteredOverview.map(card => (
              <div key={card.label} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <span className="font-semibold text-secondary-700 mb-2">{card.label}</span>
                <span className="text-2xl font-bold text-[#003366]">{card.value}</span>
              </div>
            ))}
          </div>
          {/* Alerts for Lagging Students */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Alerts for Lagging Students</h2>
            <ul className="list-disc pl-6">
              {filteredLagging.map(s => (
                <li key={s.name} className="mb-2"><span className="font-semibold">{s.name}</span> <span className="text-xs text-secondary-500">({s.reason})</span></li>
              ))}
            </ul>
          </div>
          {/* Batch Performance */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Batch Performance</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={batchPerformance} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="batch" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Bar dataKey="avg" fill="#003366" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Attendance Rate */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Attendance Rate</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={filteredAttendance} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#FFD600" strokeWidth={3} dot={{ r: 5, fill: '#003366' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Student Activity */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Student Activity</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredActivity} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Bar dataKey="activity" fill="#FFD600" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MentorDashboard; 