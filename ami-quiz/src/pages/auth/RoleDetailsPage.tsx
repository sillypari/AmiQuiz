import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const RoleDetailsPage: React.FC = () => {
  const [role, setRole] = useState('Student');
  const [programme, setProgramme] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!auth.currentUser) throw new Error('User not authenticated');
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        role,
        programme,
        branch,
        semester,
        year,
        section,
      });
      // Redirect to dashboard (route to be implemented)
      navigate(`/${role.toLowerCase()}/dashboard`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Select Role & Academic Details</h2>
        <label className="block mb-2">Role</label>
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full mb-4 p-2 border rounded">
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
        </select>
        <input type="text" placeholder="Programme" value={programme} onChange={e => setProgramme(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        <input type="text" placeholder="Branch" value={branch} onChange={e => setBranch(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        <input type="text" placeholder="Semester" value={semester} onChange={e => setSemester(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        <input type="text" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        <input type="text" placeholder="Section" value={section} onChange={e => setSection(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </form>
    </div>
  );
};

export default RoleDetailsPage; 