import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';

const weeklyLeaders = [
  { name: 'Amit Sharma', xp: 1200, badge: 'Top 10%', batch: 'A' },
  { name: 'Priya Singh', xp: 1100, badge: 'Fast Finisher', batch: 'B' },
  { name: 'You', xp: 1050, badge: 'Daily Streak', batch: 'A' },
];
const testLeaders = [
  { test: 'Physics Mock', name: 'Amit Sharma', score: 98, batch: 'A' },
  { test: 'Maths Practice', name: 'Priya Singh', score: 95, batch: 'B' },
  { test: 'Chemistry Full', name: 'You', score: 90, batch: 'A' },
];
const subjectLeaders = [
  { subject: 'Physics', name: 'Amit Sharma', score: 98, batch: 'A' },
  { subject: 'Maths', name: 'Priya Singh', score: 95, batch: 'B' },
  { subject: 'Chemistry', name: 'You', score: 90, batch: 'A' },
];
const referralRewards = [
  { code: 'AMIQ123', reward: '50 XP' },
  { code: 'AMIQ456', reward: 'Badge: Referrer' },
];

const LeaderboardsPage: React.FC = () => {
  const [academic, setAcademic] = useState({});
  const batch = (academic as any).section;
  const filteredWeekly = batch ? weeklyLeaders.filter(l => l.batch === batch) : weeklyLeaders;
  const filteredTest = batch ? testLeaders.filter(l => l.batch === batch) : testLeaders;
  const filteredSubject = batch ? subjectLeaders.filter(l => l.batch === batch) : subjectLeaders;

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Leaderboards & Gamification</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Academic Filter */}
          <div className="mb-6">
            <AcademicDropdowns onChange={setAcademic} />
            <div className="mt-2 text-secondary-700 text-sm">Current Filter: {JSON.stringify(academic)}</div>
          </div>
          {/* Weekly Leaderboard */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Weekly Leaderboard</h2>
            <ol className="list-decimal pl-6">
              {filteredWeekly.map((l, i) => (
                <li key={i} className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">{l.name}</span> <span className="text-xs text-secondary-500">({l.xp} XP, {l.badge})</span>
                </li>
              ))}
            </ol>
          </div>
          {/* Test-wise Leaderboard */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Test-wise Leaderboard</h2>
            <ol className="list-decimal pl-6">
              {filteredTest.map((l, i) => (
                <li key={i} className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">{l.test}:</span> {l.name} <span className="text-xs text-secondary-500">({l.score})</span>
                </li>
              ))}
            </ol>
          </div>
          {/* Subject-wise Leaderboard */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Subject-wise Leaderboard</h2>
            <ol className="list-decimal pl-6">
              {filteredSubject.map((l, i) => (
                <li key={i} className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">{l.subject}:</span> {l.name} <span className="text-xs text-secondary-500">({l.score})</span>
                </li>
              ))}
            </ol>
          </div>
          {/* XP Points, Badges, Referral Rewards */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">XP Points, Badges & Referral Rewards</h2>
            <ul className="list-disc pl-6">
              {referralRewards.map((r, i) => (
                <li key={i} className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">{r.code}</span> <span className="text-xs text-secondary-500">({r.reward})</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeaderboardsPage; 