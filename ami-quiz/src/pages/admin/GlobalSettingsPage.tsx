import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';

const GlobalSettingsPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [serverConfig, setServerConfig] = useState({ maxUsers: 5000, maintenance: false });
  const [broadcast, setBroadcast] = useState('');
  const [academic, setAcademic] = useState({});

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-secondary-50'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className={`bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}>
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Global Settings</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Academic Filter */}
          <div className="mb-6">
            <AcademicDropdowns onChange={setAcademic} />
            <div className="mt-2 text-secondary-700 text-sm">Current Filter: {JSON.stringify(academic)}</div>
          </div>
          {/* Server Config */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Server Configuration</h2>
            <div className="flex gap-4 mb-4">
              <label htmlFor="maxUsersInput" className="sr-only">Maximum Users</label>
              <input id="maxUsersInput" className="rounded-lg border border-secondary-200 px-3 py-2" type="number" value={serverConfig.maxUsers} onChange={e => setServerConfig({ ...serverConfig, maxUsers: Number(e.target.value) })} placeholder="Maximum Users" />
              <label htmlFor="maintenanceCheckbox" className="sr-only">Maintenance Mode</label>
              <input id="maintenanceCheckbox" type="checkbox" checked={serverConfig.maintenance} onChange={e => setServerConfig({ ...serverConfig, maintenance: e.target.checked })} /> Maintenance Mode
            </div>
          </div>
          {/* Light/Dark Mode */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Theme</h2>
            <button className="btn btn-primary" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </div>
          {/* Broadcast Notification */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Broadcast Notification</h2>
            <div className="flex gap-2 mb-4">
              <label htmlFor="broadcastMessageInput" className="sr-only">Broadcast Message</label>
              <input id="broadcastMessageInput" className="flex-1 rounded-lg border border-secondary-200 px-3 py-2" placeholder="Enter notification message" value={broadcast} onChange={e => setBroadcast(e.target.value)} />
              <button className="btn btn-primary">Send</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GlobalSettingsPage; 