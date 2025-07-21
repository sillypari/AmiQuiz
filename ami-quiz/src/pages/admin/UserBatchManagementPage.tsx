import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';

const users = [
  { id: 1, name: 'Amit Sharma', role: 'Student', status: 'Active', batch: 'A' },
  { id: 2, name: 'Priya Singh', role: 'Teacher', status: 'Suspended', batch: 'B' },
  { id: 3, name: 'Admin User', role: 'Admin', status: 'Active', batch: 'A' },
];
const batches = [
  { id: 1, name: 'Batch A' },
  { id: 2, name: 'Batch B' },
];

const UserBatchManagementPage: React.FC = () => {
  const [userList, setUserList] = useState(users);
  const [batchList, setBatchList] = useState(batches);
  const [newUser, setNewUser] = useState('');
  const [newRole, setNewRole] = useState('Student');
  const [newBatch, setNewBatch] = useState('');
  const [academic, setAcademic] = useState({});
  const batch = (academic as any).section;
  const filteredUsers = batch ? userList.filter(u => u.batch === batch) : userList;
  const filteredBatches = batch ? batchList.filter(b => b.name.endsWith(batch)) : batchList;

  const addUser = () => {
    if (newUser.trim()) {
      setUserList([...userList, { id: Date.now(), name: newUser, role: newRole, status: 'Active', batch: batch || 'A' }]);
      setNewUser('');
      setNewRole('Student');
    }
  };
  const addBatch = () => {
    if (newBatch.trim()) {
      setBatchList([...batchList, { id: Date.now(), name: newBatch }]);
      setNewBatch('');
    }
  };
  const suspendUser = (id: number) => {
    setUserList(userList.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">User & Batch Management</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Academic Filter */}
          <div className="mb-6">
            <AcademicDropdowns onChange={setAcademic} />
            <div className="mt-2 text-secondary-700 text-sm">Current Filter: {JSON.stringify(academic)}</div>
          </div>
          {/* Add User */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Add User</h2>
            <div className="flex gap-2 mb-4">
              <input className="flex-1 rounded-lg border border-secondary-200 px-3 py-2" placeholder="Name" value={newUser} onChange={e => setNewUser(e.target.value)} />
              <select title="Role" className="rounded-lg border border-secondary-200 px-3 py-2" value={newRole} onChange={e => setNewRole(e.target.value)}>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
              <button className="btn btn-primary" onClick={addUser}>Add</button>
            </div>
            <ul className="list-disc pl-6">
              {filteredUsers.map(u => (
                <li key={u.id} className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">{u.name}</span> <span className="text-xs text-secondary-500">({u.role}, {u.status})</span>
                  <button className={`btn btn-xs ${u.status === 'Active' ? 'btn-warning' : 'btn-success'}`} onClick={() => suspendUser(u.id)}>{u.status === 'Active' ? 'Suspend' : 'Reactivate'}</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Add Batch */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Add Batch</h2>
            <div className="flex gap-2 mb-4">
              <input className="flex-1 rounded-lg border border-secondary-200 px-3 py-2" placeholder="Batch Name" value={newBatch} onChange={e => setNewBatch(e.target.value)} />
              <button className="btn btn-primary" onClick={addBatch}>Add</button>
            </div>
            <ul className="list-disc pl-6">
              {filteredBatches.map(b => (
                <li key={b.id} className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">{b.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserBatchManagementPage; 