import React, { useState } from 'react';

// ProgramData structure
interface ProgramData {
  level: 'UG' | 'PG';
  programs: {
    name: string;
    duration: number;
    branches: Array<{
      name: string;
      specializations?: string[];
    }> | string[];
  }[];
}

// Mock data
const programData: ProgramData[] = [
  {
    level: 'UG',
    programs: [
      {
        name: 'B.Tech',
        duration: 4,
        branches: [
          { name: 'CSE', specializations: ['AI', 'Data Science'] },
          { name: 'ECE' },
          { name: 'ME' },
        ],
      },
      {
        name: 'BBA',
        duration: 3,
        branches: ['General'],
      },
    ],
  },
  {
    level: 'PG',
    programs: [
      {
        name: 'M.Tech',
        duration: 2,
        branches: [
          { name: 'CSE', specializations: ['Cyber Security'] },
          { name: 'ME' },
        ],
      },
      {
        name: 'MBA',
        duration: 2,
        branches: ['General'],
      },
    ],
  },
];

const sections = ['A', 'B', 'C', 'D'];
const groups = ['G1', 'G2', 'G3'];

interface AcademicSelection {
  level?: string;
  program?: string;
  branch?: string;
  specialization?: string;
  semester?: string;
  section?: string;
  group?: string;
}

const AcademicDropdowns: React.FC<{
  onChange?: (data: AcademicSelection) => void;
  initial?: AcademicSelection;
}> = ({ onChange, initial }) => {
  const [level, setLevel] = useState(initial?.level || '');
  const [program, setProgram] = useState(initial?.program || '');
  const [branch, setBranch] = useState(initial?.branch || '');
  const [specialization, setSpecialization] = useState(initial?.specialization || '');
  const [semester, setSemester] = useState(initial?.semester || '');
  const [section, setSection] = useState(initial?.section || '');
  const [group, setGroup] = useState(initial?.group || '');

  // Filtered options
  const filteredPrograms = level ? programData.find(d => d.level === level)?.programs || [] : [];
  const selectedProgram = filteredPrograms.find(p => p.name === program);
  type BranchType = { name: string; specializations?: string[] };
  const filteredBranches: BranchType[] = selectedProgram
    ? Array.isArray(selectedProgram.branches)
      ? (selectedProgram.branches as BranchType[]).map(b =>
          typeof b === 'string' ? { name: b } : b
        )
      : []
    : [];
  const selectedBranch = filteredBranches.find(b => b.name === branch);
  const hasSpecializations = selectedBranch && Array.isArray(selectedBranch.specializations) && selectedBranch.specializations.length > 0;
  const filteredSpecializations = hasSpecializations ? selectedBranch!.specializations! : [];
  const duration = selectedProgram?.duration || 0;
  const semesterOptions = duration ? Array.from({ length: duration * 2 }, (_, i) => `${i + 1}`) : [];

  // Handle change
  React.useEffect(() => {
    if (onChange) {
      onChange({ level, program, branch, specialization, semester, section, group });
    }
  }, [level, program, branch, specialization, semester, section, group]);

  // Reset lower fields on change
  const handleLevel = (v: string) => {
    setLevel(v);
    setProgram(''); setBranch(''); setSpecialization(''); setSemester(''); setSection(''); setGroup('');
  };
  const handleProgram = (v: string) => {
    setProgram(v);
    setBranch(''); setSpecialization(''); setSemester(''); setSection(''); setGroup('');
  };
  const handleBranch = (v: string) => {
    setBranch(v);
    setSpecialization(''); setSemester(''); setSection(''); setGroup('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl shadow p-6">
      {/* Level */}
      <div className="relative mb-4">
        <select
          id="level"
          required
          value={level}
          onChange={e => handleLevel(e.target.value)}
          className="peer w-full rounded-lg border border-secondary-200 px-3 py-3 bg-transparent focus:ring-2 focus:ring-[#003366] text-secondary-900"
        >
          <option value="" disabled>Select Level</option>
          <option value="UG">UG</option>
          <option value="PG">PG</option>
        </select>
        <label htmlFor="level" className="floating-label">Level</label>
      </div>
      {/* Program */}
      {level && (
        <div className="relative mb-4">
          <select
            id="program"
            required
            value={program}
            onChange={e => handleProgram(e.target.value)}
            className="peer w-full rounded-lg border border-secondary-200 px-3 py-3 bg-transparent focus:ring-2 focus:ring-[#003366] text-secondary-900"
          >
            <option value="" disabled>Select Program</option>
            {filteredPrograms.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
          <label htmlFor="program" className="floating-label">Program</label>
        </div>
      )}
      {/* Branch */}
      {program && filteredBranches.length > 0 && (
        <div className="relative mb-4">
          <select
            id="branch"
            required
            value={branch}
            onChange={e => handleBranch(e.target.value)}
            className="peer w-full rounded-lg border border-secondary-200 px-3 py-3 bg-transparent focus:ring-2 focus:ring-[#003366] text-secondary-900"
          >
            <option value="" disabled>Select Branch / Stream</option>
            {filteredBranches.map((b: BranchType) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
          <label htmlFor="branch" className="floating-label">Branch / Stream</label>
        </div>
      )}
      {/* Specialization */}
      {hasSpecializations && (
        <div className="relative mb-4">
          <select
            id="specialization"
            value={specialization}
            onChange={e => setSpecialization(e.target.value)}
            className="peer w-full rounded-lg border border-secondary-200 px-3 py-3 bg-transparent focus:ring-2 focus:ring-[#003366] text-secondary-900"
          >
            <option value="" disabled>Select Specialization</option>
            {filteredSpecializations.map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <label htmlFor="specialization" className="floating-label">Specialization</label>
        </div>
      )}
      {/* Semester */}
      {program && (
        <div className="relative mb-4">
          <select
            id="semester"
            required
            value={semester}
            onChange={e => setSemester(e.target.value)}
            className="peer w-full rounded-lg border border-secondary-200 px-3 py-3 bg-transparent focus:ring-2 focus:ring-[#003366] text-secondary-900"
          >
            <option value="" disabled>Select Semester</option>
            {semesterOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <label htmlFor="semester" className="floating-label">Semester</label>
        </div>
      )}
      {/* Section */}
      {program && (
        <div className="relative mb-4">
          <select
            id="section"
            value={section}
            onChange={e => setSection(e.target.value)}
            className="peer w-full rounded-lg border border-secondary-200 px-3 py-3 bg-transparent focus:ring-2 focus:ring-[#003366] text-secondary-900"
          >
            <option value="" disabled>Select Section</option>
            {sections.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <label htmlFor="section" className="floating-label">Section</label>
        </div>
      )}
      {/* Group */}
      {program && (
        <div className="relative mb-4">
          <select
            id="group"
            value={group}
            onChange={e => setGroup(e.target.value)}
            className="peer w-full rounded-lg border border-secondary-200 px-3 py-3 bg-transparent focus:ring-2 focus:ring-[#003366] text-secondary-900"
          >
            <option value="" disabled>Select Group</option>
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <label htmlFor="group" className="floating-label">Group</label>
        </div>
      )}
    </div>
  );
};

export default AcademicDropdowns;

// Floating label styles (add to global CSS):
// .floating-label {
//   position: absolute;
//   left: 1rem;
//   top: 0.75rem;
//   background: white;
//   padding: 0 0.25rem;
//   color: #003366;
//   font-size: 0.9rem;
//   pointer-events: none;
//   transition: 0.2s;
// }
// select:focus + .floating-label,
// select:not(:placeholder-shown) + .floating-label {
//   top: -0.7rem;
//   left: 0.8rem;
//   font-size: 0.8rem;
//   color: #003366;
//   background: white;
// } 