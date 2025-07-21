import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, increment, addDoc } from 'firebase/firestore';

interface CommunityQuiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: any[];
  createdBy: string;
  creatorName: string;
  createdAt: Date;
  rating: number;
  ratingCount: number;
  downloadCount: number;
  tags: string[];
  isPublic: boolean;
  isVerified: boolean;
}

const CommunityLibrary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [quizzes, setQuizzes] = useState<CommunityQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'date'>('rating');
  const [selectedQuiz, setSelectedQuiz] = useState<CommunityQuiz | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Sample subjects
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Engineering', 'Business', 'Economics', 'History', 'Geography',
    'Literature', 'Philosophy', 'Psychology', 'Sociology', 'Political Science'
  ];

  useEffect(() => {
    fetchCommunityQuizzes();
  }, []);

  const fetchCommunityQuizzes = async () => {
    try {
      const quizzesRef = collection(db, 'communityQuizzes');
      const publicQuizzesQuery = query(
        quizzesRef,
        where('isPublic', '==', true),
        orderBy('rating', 'desc')
      );
      const snapshot = await getDocs(publicQuizzesQuery);
      
      const quizzesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as CommunityQuiz[];
      
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching community quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (quiz: CommunityQuiz) => {
    try {
      // Increment download count
      await updateDoc(doc(db, 'communityQuizzes', quiz.id), {
        downloadCount: increment(1)
      });

      // Create a copy in user's quizzes
      const quizCopy = {
        title: `${quiz.title} (Downloaded)`,
        description: quiz.description,
        subject: quiz.subject,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        questions: quiz.questions,
        timeLimit: 30, // Default time limit
        createdAt: new Date(),
        isActive: false,
        createdBy: user!.uid,
        isDownloaded: true,
        originalQuizId: quiz.id
      };

      await addDoc(collection(db, 'quizzes'), quizCopy);
      
      // Refresh the list
      fetchCommunityQuizzes();
      
      alert('Quiz downloaded successfully! You can find it in your quiz library.');
      navigate('/teacher/dashboard');
    } catch (error) {
      console.error('Error downloading quiz:', error);
      alert('Error downloading quiz. Please try again.');
    }
  };

  // TODO: Implement rating functionality
  // const handleRate = async (quizId: string, rating: number) => {
  //   try {
  //     // This would typically update the rating in the database
  //     // For now, we'll just show a success message
  //     alert('Rating submitted successfully!');
  //   } catch (error) {
  //     console.error('Error submitting rating:', error);
  //     alert('Error submitting rating. Please try again.');
  //   }
  // };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !filterSubject || quiz.subject === filterSubject;
    const matchesDifficulty = !filterDifficulty || quiz.difficulty === filterDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloadCount - a.downloadCount;
      case 'date':
        return b.createdAt.getTime() - a.createdAt.getTime();
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading community library...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Community Quiz Library</h1>
              <p className="text-gray-600">Discover and download quizzes from other teachers</p>
            </div>
            <button
              onClick={() => navigate('/teacher/ai-generator')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create AI Quiz
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Sort by Rating</option>
                <option value="downloads">Sort by Downloads</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSubject('');
                  setFilterDifficulty('');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sortedQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new quizzes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                      {quiz.title}
                    </h3>
                    {quiz.isVerified && (
                      <span className="text-blue-600 text-sm">✓ Verified</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {quiz.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Subject:</span>
                      <span className="font-medium">{quiz.subject}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Topic:</span>
                      <span className="font-medium">{quiz.topic}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Questions:</span>
                      <span className="font-medium">{quiz.questions.length}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quiz.difficulty}
                    </span>
                    <div className="text-sm text-gray-500">
                      {quiz.downloadCount} downloads
                    </div>
                  </div>

                  <div className="mb-4">
                    {renderStars(quiz.rating)}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedQuiz(quiz);
                        setShowQuizModal(true);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(quiz)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                    >
                      Download
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>By {quiz.creatorName}</span>
                      <span>{quiz.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Quiz Preview Modal */}
      {showQuizModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h2>
                  <p className="text-gray-600">{selectedQuiz.description}</p>
                </div>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="font-medium">Subject:</span> {selectedQuiz.subject}
                </div>
                <div>
                  <span className="font-medium">Topic:</span> {selectedQuiz.topic}
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span> {selectedQuiz.difficulty}
                </div>
                <div>
                  <span className="font-medium">Questions:</span> {selectedQuiz.questions.length}
                </div>
              </div>

              <div className="mb-6">
                {renderStars(selectedQuiz.rating)}
                <p className="text-sm text-gray-600 mt-1">
                  {selectedQuiz.ratingCount} ratings • {selectedQuiz.downloadCount} downloads
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium">Questions Preview</h3>
                {selectedQuiz.questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded p-4">
                    <p className="font-medium mb-2">
                      Question {index + 1}: {question.text}
                    </p>
                    {question.type === 'multiple-choice' && question.options && (
                      <div className="space-y-1">
                        {question.options.map((option: string, optionIndex: number) => (
                          <div key={optionIndex} className="text-sm text-gray-600">
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {selectedQuiz.questions.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    ... and {selectedQuiz.questions.length - 3} more questions
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownload(selectedQuiz);
                    setShowQuizModal(false);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Download Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityLibrary; 