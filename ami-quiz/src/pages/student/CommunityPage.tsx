import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';

const feed = [
  { id: 1, user: 'Amit Sharma', type: 'post', content: 'Scored 95% in Physics Mock Test!', time: '2h ago', branch: 'CSE' },
  { id: 2, user: 'Priya Singh', type: 'doubt', content: 'Can someone explain organic chemistry basics?', time: '1h ago', branch: 'ECE' },
  { id: 3, user: 'Teacher', type: 'announcement', content: 'New practice set available for Algebra.', time: '30m ago', branch: 'CSE' },
];
const messages = [
  { id: 1, from: 'Mentor', content: 'Great job on your last test!', time: 'Today', branch: 'CSE' },
];
const notifications = [
  { id: 1, message: 'Test deadline tomorrow: Chemistry Full Test', branch: 'ECE' },
  { id: 2, message: 'Priya Singh commented on your post.', branch: 'CSE' },
];

const CommunityPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'feed' | 'messages' | 'notifications'>('feed');
  const [academic, setAcademic] = useState({});
  const branch = (academic as any).branch;
  const filteredFeed = branch ? feed.filter(f => f.branch === branch) : feed;
  const filteredMessages = branch ? messages.filter(m => m.branch === branch) : messages;
  const filteredNotifications = branch ? notifications.filter(n => n.branch === branch) : notifications;

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Community & Communication</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1">
          {/* Academic Filter */}
          <div className="mb-6">
            <AcademicDropdowns onChange={setAcademic} />
            <div className="mt-2 text-secondary-700 text-sm">Current Filter: {JSON.stringify(academic)}</div>
          </div>
          <div className="mb-6 flex gap-4">
            <button className={`px-4 py-2 rounded-t-lg font-semibold ${selectedTab === 'feed' ? 'bg-[#003366] text-white' : 'bg-white text-secondary-700 border-b-2 border-secondary-200'}`} onClick={() => setSelectedTab('feed')}>Feed Wall</button>
            <button className={`px-4 py-2 rounded-t-lg font-semibold ${selectedTab === 'messages' ? 'bg-[#003366] text-white' : 'bg-white text-secondary-700 border-b-2 border-secondary-200'}`} onClick={() => setSelectedTab('messages')}>Messages</button>
            <button className={`px-4 py-2 rounded-t-lg font-semibold ${selectedTab === 'notifications' ? 'bg-[#003366] text-white' : 'bg-white text-secondary-700 border-b-2 border-secondary-200'}`} onClick={() => setSelectedTab('notifications')}>Notifications</button>
          </div>
          {selectedTab === 'feed' && (
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#003366] mb-4">Feed Wall</h2>
              <ul className="space-y-4">
                {filteredFeed.map(item => (
                  <li key={item.id} className="border-b pb-4">
                    <div className="font-semibold text-secondary-900">{item.user} <span className="text-xs text-secondary-500">({item.type})</span></div>
                    <div className="mb-1">{item.content}</div>
                    <div className="text-xs text-secondary-400">{item.time}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedTab === 'messages' && (
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#003366] mb-4">1:1 Messaging</h2>
              <ul className="space-y-4">
                {filteredMessages.map(m => (
                  <li key={m.id} className="border-b pb-4">
                    <div className="font-semibold text-secondary-900">{m.from}</div>
                    <div className="mb-1">{m.content}</div>
                    <div className="text-xs text-secondary-400">{m.time}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#003366] mb-4">Notification Center</h2>
              <ul className="space-y-4">
                {filteredNotifications.map(n => (
                  <li key={n.id} className="border-b pb-4">
                    <div>{n.message}</div>
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

export default CommunityPage; 