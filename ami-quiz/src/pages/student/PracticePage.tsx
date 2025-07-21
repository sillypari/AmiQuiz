import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';

const chapters = [
  { name: 'Kinematics', concepts: ['Motion', 'Velocity', 'Acceleration'] },
  { name: 'Algebra', concepts: ['Equations', 'Inequalities', 'Polynomials'] },
  { name: 'Organic', concepts: ['Hydrocarbons', 'Alcohols', 'Amines'] },
];
const suggestions = [
  { concept: 'Motion', type: 'Top Concept' },
  { concept: 'Polynomials', type: 'Weak Topic' },
];
const flashcards = [
  { front: 'What is velocity?', back: 'Rate of change of displacement.' },
  { front: 'Define hydrocarbon.', back: 'Compound of hydrogen and carbon.' },
];
const pyqs = [
  { question: 'JEE 2022: What is the SI unit of acceleration?', topic: 'Kinematics' },
  { question: 'JEE 2021: Solve x^2 - 4x + 4 = 0', topic: 'Algebra' },
];

const PracticePage: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('');
  const [showBack, setShowBack] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
          <div className="container-fluid flex items-center h-16 px-4">
            <h1 className="text-xl font-bold text-secondary-900">Practice & Revision</h1>
          </div>
        </header>
        <main className="container-fluid py-8 flex-1 space-y-10">
          {/* Concept Explorer */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Concept Explorer</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-secondary-700">Chapter</label>
              <select title="Chapter" className="w-full rounded-lg border border-secondary-200 px-3 py-2 mb-2" value={selectedChapter} onChange={e => { setSelectedChapter(e.target.value); setSelectedConcept(''); }}>
                <option value="">Select Chapter</option>
                {chapters.map(ch => <option key={ch.name} value={ch.name}>{ch.name}</option>)}
              </select>
              {selectedChapter && (
                <>
                  <label className="block mb-1 font-medium text-secondary-700">Concept</label>
                  <select title="Concept" className="w-full rounded-lg border border-secondary-200 px-3 py-2" value={selectedConcept} onChange={e => setSelectedConcept(e.target.value)}>
                    <option value="">Select Concept</option>
                    {chapters.find(ch => ch.name === selectedChapter)?.concepts.map(con => <option key={con} value={con}>{con}</option>)}
                  </select>
                </>
              )}
              {selectedConcept && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">Practice questions for <span className="font-semibold">{selectedConcept}</span> coming soon!</div>
              )}
            </div>
          </div>
          {/* Smart Suggestions */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Smart Suggestions</h2>
            <ul className="list-disc pl-6">
              {suggestions.map(s => (
                <li key={s.concept} className="mb-2"><span className="font-semibold">{s.concept}</span> <span className="text-xs text-secondary-500">({s.type})</span></li>
              ))}
            </ul>
          </div>
          {/* Flashcards Engine */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Flashcards</h2>
            <div className="flex flex-col items-center">
              <div className="w-64 h-40 bg-yellow-100 rounded-lg flex items-center justify-center text-xl font-semibold text-[#003366] cursor-pointer mb-4" onClick={() => setShowBack(!showBack)}>
                {showBack ? flashcards[flashcardIndex].back : flashcards[flashcardIndex].front}
              </div>
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={() => { setShowBack(false); setFlashcardIndex((i) => (i - 1 + flashcards.length) % flashcards.length); }}>Prev</button>
                <button className="btn btn-outline" onClick={() => { setShowBack(false); setFlashcardIndex((i) => (i + 1) % flashcards.length); }}>Next</button>
              </div>
            </div>
          </div>
          {/* Topic-tagged PYQs */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-[#003366] mb-4">Topic-tagged PYQs</h2>
            <ul className="list-disc pl-6">
              {pyqs.map(q => (
                <li key={q.question} className="mb-2"><span className="font-semibold">{q.question}</span> <span className="text-xs text-secondary-500">({q.topic})</span></li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PracticePage; 