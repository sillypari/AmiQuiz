import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

interface GeneratedQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface QuizTemplate {
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeLimit: number;
  questions: GeneratedQuestion[];
}

const AIQuizGenerator: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: true,
    trueFalse: true,
    shortAnswer: false
  });
  const [timeLimit, setTimeLimit] = useState(30);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizTemplate | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Sample subjects for dropdown
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Engineering', 'Business', 'Economics', 'History', 'Geography',
    'Literature', 'Philosophy', 'Psychology', 'Sociology', 'Political Science'
  ];

  const generateQuiz = async () => {
    if (!subject || !topic) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate AI generation process
      const steps = [
        'Analyzing topic...',
        'Generating questions...',
        'Creating answer options...',
        'Adding explanations...',
        'Finalizing quiz...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGenerationProgress(((i + 1) / steps.length) * 100);
      }

      // Generate sample questions based on the topic
      const questions: GeneratedQuestion[] = generateSampleQuestions(topic, questionCount, questionTypes, difficulty);
      
      const quiz: QuizTemplate = {
        title: `${topic} Quiz`,
        description: `AI-generated quiz on ${topic} for ${subject}`,
        subject,
        topic,
        difficulty,
        timeLimit,
        questions
      };

      setGeneratedQuiz(quiz);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const generateSampleQuestions = (
    topic: string, 
    count: number, 
    types: any, 
    difficulty: string
  ): GeneratedQuestion[] => {
    const questions: GeneratedQuestion[] = [];
    const questionTypes = [];
    
    if (types.multipleChoice) questionTypes.push('multiple-choice');
    if (types.trueFalse) questionTypes.push('true-false');
    if (types.shortAnswer) questionTypes.push('short-answer');

    for (let i = 0; i < count; i++) {
      const questionType = questionTypes[i % questionTypes.length];
      const question = generateSampleQuestion(topic, questionType, difficulty, i + 1);
      questions.push(question);
    }

    return questions;
  };

  const generateSampleQuestion = (
    topic: string, 
    type: string, 
    difficulty: string, 
    number: number
  ): GeneratedQuestion => {
    const baseQuestion = `Question ${number} about ${topic}`;
    
    switch (type) {
      case 'multiple-choice':
        return {
          id: `q${number}`,
          text: `What is the primary concept related to ${topic}?`,
          type: 'multiple-choice',
          options: [
            `Option A for ${topic}`,
            `Option B for ${topic}`,
            `Option C for ${topic}`,
            `Option D for ${topic}`
          ],
          correctAnswer: `Option A for ${topic}`,
          points: difficulty === 'Advanced' ? 3 : difficulty === 'Intermediate' ? 2 : 1,
          explanation: `This is the correct answer because it represents the fundamental concept of ${topic}.`,
          difficulty: difficulty as any
        };
      
      case 'true-false':
        return {
          id: `q${number}`,
          text: `${topic} is an important concept in this field.`,
          type: 'true-false',
          correctAnswer: 'True',
          points: difficulty === 'Advanced' ? 2 : 1,
          explanation: `This statement is true because ${topic} plays a crucial role in understanding the subject matter.`,
          difficulty: difficulty as any
        };
      
      case 'short-answer':
        return {
          id: `q${number}`,
          text: `Explain the significance of ${topic} in this context.`,
          type: 'short-answer',
          correctAnswer: `${topic} is significant because it provides essential understanding of the subject.`,
          points: difficulty === 'Advanced' ? 5 : difficulty === 'Intermediate' ? 3 : 2,
          explanation: `A comprehensive answer should include the definition, importance, and applications of ${topic}.`,
          difficulty: difficulty as any
        };
      
      default:
        return {
          id: `q${number}`,
          text: baseQuestion,
          type: 'multiple-choice',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          points: 1,
          explanation: 'This is a sample explanation.',
          difficulty: 'Medium'
        };
    }
  };

  const saveQuiz = async () => {
    if (!generatedQuiz || !user) return;

    try {
      const quizData = {
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        timeLimit: generatedQuiz.timeLimit,
        questions: generatedQuiz.questions,
        createdAt: new Date(),
        isActive: false,
        createdBy: user.uid,
        subject: generatedQuiz.subject,
        topic: generatedQuiz.topic,
        difficulty: generatedQuiz.difficulty,
        isAIGenerated: true
      };

      const quizRef = await addDoc(collection(db, 'quizzes'), quizData);
      alert('Quiz saved successfully!');
      navigate(`/teacher/quiz/${quizRef.id}/edit`);
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Error saving quiz. Please try again.');
    }
  };

  const saveAsTemplate = async () => {
    if (!generatedQuiz || !user) return;

    try {
      const templateData = {
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        subject: generatedQuiz.subject,
        topic: generatedQuiz.topic,
        difficulty: generatedQuiz.difficulty,
        questions: generatedQuiz.questions,
        createdBy: user.uid,
        createdAt: new Date(),
        isPublic: false,
        usageCount: 0,
        isAIGenerated: true
      };

      await addDoc(collection(db, 'quizTemplates'), templateData);
      alert('Template saved successfully!');
      navigate('/teacher/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">AI Quiz Generator</h1>
              <p className="text-gray-600">Generate quizzes using artificial intelligence</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Quiz Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    aria-label="Select subject"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Calculus, Quantum Mechanics, Organic Chemistry"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Select difficulty level"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    min="5"
                    max="50"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Number of questions"
                    placeholder="Enter number of questions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    min="5"
                    max="180"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Time limit in minutes"
                    placeholder="Enter time limit in minutes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Types
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={questionTypes.multipleChoice}
                        onChange={(e) => setQuestionTypes(prev => ({
                          ...prev,
                          multipleChoice: e.target.checked
                        }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Multiple Choice</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={questionTypes.trueFalse}
                        onChange={(e) => setQuestionTypes(prev => ({
                          ...prev,
                          trueFalse: e.target.checked
                        }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">True/False</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={questionTypes.shortAnswer}
                        onChange={(e) => setQuestionTypes(prev => ({
                          ...prev,
                          shortAnswer: e.target.checked
                        }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Short Answer</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={generateQuiz}
                  disabled={isGenerating || !subject || !topic}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
                </button>
              </div>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generating Quiz</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  Progress: {Math.round(generationProgress)}%
                </p>
              </div>
            )}
          </div>

          {/* Generated Quiz Preview */}
          <div className="space-y-6">
            {generatedQuiz && (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">{generatedQuiz.title}</h2>
                      <p className="text-sm text-gray-600">{generatedQuiz.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      generatedQuiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      generatedQuiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {generatedQuiz.difficulty}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Subject:</span> {generatedQuiz.subject}
                    </div>
                    <div>
                      <span className="font-medium">Topic:</span> {generatedQuiz.topic}
                    </div>
                    <div>
                      <span className="font-medium">Questions:</span> {generatedQuiz.questions.length}
                    </div>
                    <div>
                      <span className="font-medium">Time Limit:</span> {generatedQuiz.timeLimit} minutes
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={saveQuiz}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                    >
                      Save as Quiz
                    </button>
                    <button
                      onClick={saveAsTemplate}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
                    >
                      Save as Template
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Generated Questions</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {generatedQuiz.questions.map((question, index) => (
                      <div key={question.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-medium text-gray-900">
                            Question {index + 1}: {question.text}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty}
                          </span>
                        </div>

                        {question.type === 'multiple-choice' && question.options && (
                          <div className="space-y-2 mb-4">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-2 rounded ${
                                  option === question.correctAnswer
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <span className={option === question.correctAnswer ? 'font-medium text-green-700' : ''}>
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                </span>
                                {option === question.correctAnswer && (
                                  <span className="ml-2 text-green-600 text-sm">✓ Correct</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === 'true-false' && (
                          <div className="space-y-2 mb-4">
                            <div className={`p-2 rounded ${
                              question.correctAnswer === 'True'
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}>
                              <span className={question.correctAnswer === 'True' ? 'font-medium text-green-700' : ''}>
                                True
                              </span>
                              {question.correctAnswer === 'True' && (
                                <span className="ml-2 text-green-600 text-sm">✓ Correct</span>
                              )}
                            </div>
                            <div className={`p-2 rounded ${
                              question.correctAnswer === 'False'
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}>
                              <span className={question.correctAnswer === 'False' ? 'font-medium text-green-700' : ''}>
                                False
                              </span>
                              {question.correctAnswer === 'False' && (
                                <span className="ml-2 text-green-600 text-sm">✓ Correct</span>
                              )}
                            </div>
                          </div>
                        )}

                        {question.type === 'short-answer' && (
                          <div className="mb-4">
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <div className="text-sm text-green-600 font-medium mb-1">Sample Answer:</div>
                              <div className="text-green-700">{question.correctAnswer}</div>
                            </div>
                          </div>
                        )}

                        <div className="text-sm text-gray-600">
                          <div className="mb-2">
                            <span className="font-medium">Explanation:</span> {question.explanation}
                          </div>
                          <div>
                            <span className="font-medium">Points:</span> {question.points}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!generatedQuiz && !isGenerating && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Quiz Generator</h3>
                  <p className="text-gray-600">
                    Fill in the parameters on the left and click "Generate Quiz" to create a quiz using AI.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIQuizGenerator; 