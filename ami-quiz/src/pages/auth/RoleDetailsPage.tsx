import React, { useState } from 'react';
import AcademicDropdowns from '../../components/AcademicDropdowns';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const RoleDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const [role, setRole] = useState('');
  const [academic, setAcademic] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.uid) {
      alert('You must be logged in to save your profile.');
      return;
    }
    try {
      setSaving(true);
      await setDoc(doc(db, 'users', user.uid), {
        role,
        academic,
        updatedAt: new Date(),
      }, { merge: true });
      setSubmitted(true);
    } catch (err) {
      console.error('Error saving profile', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-[#003366] mb-6">Onboarding: Role & Academic Details</h1>
        {/* Role Selection */}
        <div className="mb-6">
          <label htmlFor="role" className="block mb-2 font-medium text-secondary-700">Select Role</label>
          <select
            id="role"
            required
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full rounded-lg border border-secondary-200 px-3 py-3 focus:ring-2 focus:ring-[#003366] text-secondary-900"
          >
            <option value="" disabled>Select Role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        {/* Academic Details (only for students) */}
        {role === 'student' && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-2">Academic Details</h2>
            <AcademicDropdowns onChange={setAcademic} />
          </div>
        )}
        <button type="submit" className="btn btn-primary w-full mt-4" disabled={saving}>
          {saving ? 'Saving...' : 'Submit'}
        </button>
        {submitted && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">Profile saved! (Mock): {JSON.stringify(academic)}</div>
        )}
      </form>
    </div>
  );
};

export default RoleDetailsPage; 