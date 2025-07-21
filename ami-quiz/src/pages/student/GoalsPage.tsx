import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';

const mockGoals = [
  { id: 1, text: 'Score 95% in Chemistry by September', progress: 70, deadline: '2024-09-01', status: 'on track' },
  { id: 2, text: 'Complete all Algebra PYQs by July', progress: 40, deadline: '2024-07-15', status: 'behind' },
];
const notifications = [
  { id: 1, message: 'You are on track for your Chemistry goal!' },
  { id: 2, message: 'Algebra PYQs goal needs attention.' },
];

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState(mockGoals);
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, { id: Date.now(), text: newGoal, progress: 0, deadline: '', status: 'on track' }]);
      setNewGoal('');
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Goal Setting & Tracking</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Goal Creation */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Create a New Goal</h2>
            <div className="flex gap-2 mb-4">
              <input className="flex-1 rounded-lg border border-secondary-200 px-3 py-2" placeholder="E.g., Score 95% in Chemistry by September" value={newGoal} onChange={e => setNewGoal(e.target.value)} />
              <button className="btn btn-primary" onClick={addGoal}>Add Goal</button>
            </div>
          </div>
          {/* MyPlan Timeline */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">MyPlan Timeline</h2>
            <ul className="list-disc pl-6">
              {goals.map(goal => (
                <li key={goal.id} className="mb-2">
                  <span className="font-semibold">{goal.text}</span> <span className="text-xs text-secondary-500">(Deadline: {goal.deadline || 'N/A'})</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Progress Tracker */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Progress Tracker</h2>
            {goals.map(goal => (
              <div key={goal.id} className="mb-4">
                <div className="mb-1 font-medium text-secondary-700">{goal.text}</div>
                <div className="w-full bg-secondary-100 rounded-full h-4">
                  <div className={`h-4 rounded-full ${goal.progress > 70 ? 'bg-green-500' : goal.progress > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${goal.progress}%` }}></div>
                </div>
                <div className="text-xs text-secondary-500 mt-1">{goal.progress}% complete</div>
              </div>
            ))}
          </div>
          {/* Smart Notifications */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Smart Notifications</h2>
            <ul className="list-disc pl-6">
              {notifications.map(n => (
                <li key={n.id} className="mb-2">{n.message}</li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GoalsPage; 