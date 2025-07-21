import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import AcademicDropdowns from '../../components/AcademicDropdowns';

const uploads = [
  { id: 1, title: 'Physics Notes', status: 'Pending', branch: 'CSE' },
  { id: 2, title: 'Algebra Video', status: 'Approved', branch: 'ECE' },
];
const auditTrail = [
  { id: 1, action: 'Edited Test', user: 'Amit', time: '2024-06-01', branch: 'CSE' },
  { id: 2, action: 'Updated Question', user: 'Priya', time: '2024-06-02', branch: 'ECE' },
];
const tags = [
  { id: 1, tag: 'Physics' },
  { id: 2, tag: 'Algebra' },
];

const ContentModerationPage: React.FC = () => {
  const [uploadList, setUploadList] = useState(uploads);
  const [academic, setAcademic] = useState({});
  const branch = (academic as any).branch;
  const filteredUploads = branch ? uploadList.filter(u => u.branch === branch) : uploadList;
  const filteredAuditTrail = branch ? auditTrail.filter(a => a.branch === branch) : auditTrail;
  const approveUpload = (id: number) => {
    setUploadList(uploadList.map(u => u.id === id ? { ...u, status: 'Approved' } : u));
  };
  const rejectUpload = (id: number) => {
    setUploadList(uploadList.map(u => u.id === id ? { ...u, status: 'Rejected' } : u));
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Content Moderation & Logging</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Academic Filter */}
          <div className="mb-6">
            <AcademicDropdowns onChange={setAcademic} />
            <div className="mt-2 text-secondary-700 text-sm">Current Filter: {JSON.stringify(academic)}</div>
          </div>
          {/* Approve/Reject Uploads */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Uploads</h2>
            <ul className="list-disc pl-6">
              {filteredUploads.map(u => (
                <li key={u.id} className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">{u.title}</span> <span className="text-xs text-secondary-500">({u.status})</span>
                  {u.status === 'Pending' && <>
                    <button className="btn btn-success btn-xs ml-2" onClick={() => approveUpload(u.id)}>Approve</button>
                    <button className="btn btn-error btn-xs ml-2" onClick={() => rejectUpload(u.id)}>Reject</button>
                  </>}
                </li>
              ))}
            </ul>
          </div>
          {/* Audit Trail */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Audit Trail</h2>
            <ul className="list-disc pl-6">
              {filteredAuditTrail.map(a => (
                <li key={a.id} className="mb-2">
                  <span className="font-semibold">{a.action}</span> <span className="text-xs text-secondary-500">({a.user}, {a.time})</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Intelligent Tag System */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Intelligent Tag System</h2>
            <ul className="list-disc pl-6">
              {tags.map(t => (
                <li key={t.id} className="mb-2">
                  <span className="font-semibold">{t.tag}</span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ContentModerationPage; 