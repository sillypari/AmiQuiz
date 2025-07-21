import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const kpis = [
  { label: 'Users', value: 3500, batch: 'A' },
  { label: 'Tests', value: 120, batch: 'B' },
  { label: 'Active Batches', value: 24, batch: 'A' },
  { label: 'Server Load', value: '65%', batch: 'B' },
];
const serverHealth = [
  { metric: 'CPU', value: 65, batch: 'A' },
  { metric: 'RAM', value: 72, batch: 'B' },
  { metric: 'Disk', value: 80, batch: 'A' },
];
const activityHeatmap = [
  { day: 'Mon', activity: 120, batch: 'A' },
  { day: 'Tue', activity: 150, batch: 'B' },
  { day: 'Wed', activity: 90, batch: 'A' },
  { day: 'Thu', activity: 180, batch: 'B' },
  { day: 'Fri', activity: 200, batch: 'A' },
  { day: 'Sat', activity: 80, batch: 'B' },
  { day: 'Sun', activity: 60, batch: 'A' },
];

const AdminDashboard: React.FC = () => {
  const [academic, setAcademic] = useState({});
  const batch = (academic as any).section;
  const filteredKpis = batch ? kpis.filter(k => k.batch === batch) : kpis;
  const filteredServerHealth = batch ? serverHealth.filter(s => s.batch === batch) : serverHealth;
  const filteredActivityHeatmap = batch ? activityHeatmap.filter(a => a.batch === batch) : activityHeatmap;

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Admin Dashboard & Monitoring</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Academic Filter */}
          <div className="mb-6">
            <AcademicDropdowns onChange={setAcademic} />
            <div className="mt-2 text-secondary-700 text-sm">Current Filter: {JSON.stringify(academic)}</div>
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {filteredKpis.map(card => (
              <div key={card.label} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <span className="font-semibold text-secondary-700 mb-2">{card.label}</span>
                <span className="text-2xl font-bold text-[#003366]">{card.value}</span>
              </div>
            ))}
          </div>
          {/* Server Health Stats */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Server Health</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredServerHealth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="metric" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Bar dataKey="value" fill="#FFD600" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Activity Heatmap (simulated as bar chart) */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Activity Heatmap</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredActivityHeatmap} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#003366" fontSize={12} />
                <YAxis stroke="#003366" fontSize={12} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#003366' }} />
                <Legend />
                <Bar dataKey="activity" fill="#003366" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 