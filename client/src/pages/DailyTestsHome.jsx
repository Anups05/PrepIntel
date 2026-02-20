import React, { useState } from "react";
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Flag,
  Award,
  Copy,
  Share2,
  Shield,
  Search,
  Zap,
  BarChart3,
  RotateCcw,
  Home
} from "lucide-react";

const DailyTestsHome = () => {
  const [activeView, setActiveView] = useState("home"); // "home", "test", "result", "review"
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1770); // 29:30 as shown in screenshot

  // Mock questions data (15 questions)
  const questions = [
    {
      id: 1,
      question: "What is the integral of sin(x) dx?",
      options: ["cos(x) + C", "-cos(x) + C", "tan(x) + C", "-sin(x) + C"],
      correct: 1,
      subject: "Math",
      timeSpent: 27,
    },
    {
      id: 2,
      question: "A bag contains 3 red and 5 blue balls. What is the probability of drawing a red ball?",
      options: ["3/8", "5/8", "3/5", "2/5"],
      correct: 0,
      subject: "Math",
      timeSpent: 45,
    },
    {
      id: 3,
      question: "What is the derivative of e^x?",
      options: ["e^x", "xe^x", "ln(x)", "1"],
      correct: 0,
      subject: "Math",
      timeSpent: 32,
    },
    {
      id: 4,
      question: "Which law of thermodynamics states that energy cannot be created or destroyed?",
      options: ["First Law", "Second Law", "Third Law", "Zeroth Law"],
      correct: 0,
      subject: "Physics",
      timeSpent: 28,
    },
    {
      id: 5,
      question: "The electric field inside a hollow conducting sphere is:",
      options: ["Zero", "Constant", "Infinite", "Varies with radius"],
      correct: 0,
      subject: "Physics",
      timeSpent: 35,
    },
    {
      id: 6,
      question: "Which phenomenon explains the blue color of the sky?",
      options: ["Rayleigh scattering", "Tyndall effect", "Mie scattering", "Raman effect"],
      correct: 0,
      subject: "Physics",
      timeSpent: 27,
    },
    {
      id: 7,
      question: "An ideal gas undergoes isothermal expansion. Which quantity remains constant?",
      options: ["Temperature", "Pressure", "Volume", "Internal Energy"],
      correct: 0,
      subject: "Physics",
      timeSpent: 42,
    },
    {
      id: 8,
      question: "Which reagent is used for the oxidation of primary alcohols to aldehydes?",
      options: ["KMnO4", "K2Cr2O7", "PCC", "H2SO4"],
      correct: 2,
      subject: "Chemistry",
      timeSpent: 38,
    },
    {
      id: 9,
      question: "Which element has the highest electronegativity?",
      options: ["Oxygen", "Fluorine", "Chlorine", "Nitrogen"],
      correct: 1,
      subject: "Chemistry",
      timeSpent: 25,
    },
    {
      id: 10,
      question: "The pH of a 0.001 M HCl solution is:",
      options: ["1", "2", "3", "4"],
      correct: 2,
      subject: "Chemistry",
      timeSpent: 31,
    },
    {
      id: 11,
      question: "Which organelle is known as the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
      correct: 1,
      subject: "Biology",
      timeSpent: 22,
    },
    {
      id: 12,
      question: "The process by which mRNA is synthesized from DNA is called:",
      options: ["Translation", "Transcription", "Replication", "Mutation"],
      correct: 1,
      subject: "Biology",
      timeSpent: 29,
    },
    {
      id: 13,
      question: "∫ xe^x dx equals:",
      options: ["xe^x + C", "xe^x - e^x + C", "e^x - xe^x + C", "x^2e^x/2 + C"],
      correct: 1,
      subject: "Math",
      timeSpent: 85,
    },
    {
      id: 14,
      question: "In a standing wave, the points of maximum displacement are called:",
      options: ["Nodes", "Antinodes", "Harmonics", "Overtones"],
      correct: 1,
      subject: "Physics",
      timeSpent: 41,
    },
    {
      id: 15,
      question: "Which of the following is an electrophile?",
      options: ["OH-", "NH3", "AlCl3", "H2O"],
      correct: 2,
      subject: "Chemistry",
      timeSpent: 55,
    },
  ];

  // Calculate statistics
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.length;
  const notVisitedCount = questions.length - answeredCount - markedCount;

  // Test result data (matching screenshot 3.png)
  const testResult = {
    score: 45,
    totalMarks: 60,
    accuracy: 80,
    attempted: 100,
    tabSwitches: 0,
    correct: 11,
    incorrect: 2,
    skipped: 2,
    totalTime: "15m 43s",
    avgTimePerQuestion: "1m 3s",
    fastestQuestion: { q: 6, time: "27s" },
    slowestQuestion: { q: 15, time: "1m 25s" },
    weakAreas: [
      { subject: "Math", errors: 25 },
      { subject: "Chemistry", errors: 25 },
      { subject: "Physics", errors: 20 },
    ],
  };

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle option selection
  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex,
    });
  };

  // Handle mark for review
  const toggleMarkForReview = () => {
    if (markedForReview.includes(currentQuestion)) {
      setMarkedForReview(markedForReview.filter(q => q !== currentQuestion));
    } else {
      setMarkedForReview([...markedForReview, currentQuestion]);
    }
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(answers[currentQuestion + 1] || null);
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] || null);
    }
  };

  // Handle test submission
  const handleSubmitTest = () => {
    setTestSubmitted(true);
    setActiveView("result");
  };

  // Handle retake test
  const handleRetakeTest = () => {
    // Reset all test state
    setCurrentQuestion(0);
    setSelectedOption(null);
    setMarkedForReview([]);
    setAnswers({});
    setTimeLeft(1770);
    setActiveView("test");
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setActiveView("home");
  };

  // Get question status for navigator
  const getQuestionStatus = (index) => {
    if (markedForReview.includes(index)) return "marked";
    if (answers[index] !== undefined) return "answered";
    return "not-visited";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case "answered": return "bg-green-500";
      case "marked": return "bg-yellow-500";
      default: return "bg-gray-200";
    }
  };

  // Render Home View (1.png)
  const renderHomeView = () => (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Daily Tests</h1>
      <p className="text-gray-500 mb-6">Sharpen your skills with timed, AI-curated MCQ tests.</p>

      {/* Test Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Daily Mixed Test – Feb 20</h2>
              <p className="text-purple-600 font-medium mt-1">Today's Test</p>
            </div>
          </div>

          {/* Test Info Row with Icons */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📅</span>
              <span className="text-gray-600">15 Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">⏱️</span>
              <span className="text-gray-600">60 Marks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🕒</span>
              <span className="text-gray-600">30 Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🔄</span>
              <span className="text-gray-600">+4 / -1</span>
            </div>
          </div>

          {/* Subject Tags */}
          <div className="flex gap-3 mb-4">
            <span className="px-4 py-1.5 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">Math</span>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">Physics</span>
            <span className="px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-sm font-medium">Chemistry</span>
            <span className="px-4 py-1.5 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium">Biology</span>
          </div>


          {/* Start Test Button */}
          <button 
            onClick={() => setActiveView("test")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition"
          >
            Start Test
          </button>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Instructions</h3>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">1️⃣</span>
            <span>Each question has 4 options — select the best answer.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">2️⃣</span>
            <span>You can mark questions for review and revisit them anytime.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">3️⃣</span>
            <span>Timer runs continuously and auto-submits at 00:00.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">4️⃣</span>
            <span>Use the navigation panel on the right to jump between questions.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">5️⃣</span>
            <span className="text-red-500 font-medium">Do not switch tabs — your activity is monitored.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">6️⃣</span>
            <span>Scoring: +4 correct, -1 incorrect, 0 unattempted.</span>
          </li>
        </ul>
      </div>
    </div>
  );

  // Render Test View (2.png) with updated navigator
  const renderTestView = () => (
    <div className="grid grid-cols-4 gap-6">
      {/* Main Content - Question Area */}
      <div className="col-span-3">
        {/* Test Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Daily Mixed Test – Feb 20</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">Multi-Subject</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">Medium</span>
                <span className="text-sm text-gray-500">15 Questions · 60 Marks +4 / -1</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
              <Clock size={18} className="text-gray-600" />
              <span className="font-mono font-bold text-gray-700">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl text-gray-800 mb-6">
            {currentQuestion + 1}. {questions[currentQuestion].question}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full p-4 rounded-xl border-2 text-left transition ${
                  selectedOption === index
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <span className="text-gray-600">
                  <span className="font-bold text-gray-800 mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMarkForReview}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                markedForReview.includes(currentQuestion)
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Flag size={18} />
              {markedForReview.includes(currentQuestion) ? "Marked for Review" : "Mark for Review"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
              Clear Response
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl ${
              currentQuestion === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ChevronLeft size={18} />
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={currentQuestion === questions.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Right Sidebar - Updated Question Navigator as per image */}
      <div className="col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <h3 className="font-semibold text-gray-800 mb-4">Question Navigator</h3>
          
          {/* Legend */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-200"></div>
              <span className="text-sm text-gray-600">Not Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-600">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Marked</span>
            </div>
          </div>

          {/* Question Grid - 3x5 as shown in image */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {questions.map((_, index) => {
              const status = getQuestionStatus(index);
              let bgColor = "bg-gray-200"; // Not Visited
              if (status === "answered") bgColor = "bg-green-500";
              if (status === "marked") bgColor = "bg-yellow-500";
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestion(index);
                    setSelectedOption(answers[index] || null);
                  }}
                  className={`w-8 h-8 rounded-lg ${bgColor} text-white font-medium flex items-center justify-center text-xs
                    ${currentQuestion === index ? "ring-2 ring-purple-600 ring-offset-2" : ""}
                    ${status === "not-visited" ? "text-gray-600" : "text-white"}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Statistics - as shown in image */}
          <div className="space-y-2 mb-6 text-sm border-t pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Answered</span>
              <span className="font-bold text-gray-800">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unanswered</span>
              <span className="font-bold text-gray-800">{questions.length - answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Marked</span>
              <span className="font-bold text-gray-800">{markedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Not Visited</span>
              <span className="font-bold text-gray-800">{notVisitedCount}</span>
            </div>
          </div>

          {/* Submit Test Button */}
          <button
            onClick={handleSubmitTest}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );

  // Render Result View (3.png) with Retake Test and Back to Dashboard buttons
  const renderResultView = () => (
    <div>
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Test Result</h2>
      <p className="text-gray-500 mb-6">Daily Mixed Test — Feb 20</p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500 mb-2">Score</h3>
          <p className="text-3xl font-bold text-gray-800">{testResult.score}/{testResult.totalMarks}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500 mb-2">Accuracy</h3>
          <p className="text-3xl font-bold text-gray-800">{testResult.accuracy}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500 mb-2">Attempted</h3>
          <p className="text-3xl font-bold text-gray-800">{testResult.attempted}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm text-gray-500 mb-2">Tab Switched</h3>
          <p className="text-3xl font-bold text-gray-800">{testResult.tabSwitches}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Attempt Breakdown</h3>
          <div className="flex items-center gap-8 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{testResult.correct}</p>
                <p className="text-xs text-gray-500">Correct</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{testResult.incorrect}</p>
                <p className="text-xs text-gray-500">Incorrect</p>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 mb-3">Time per Question</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium text-green-600">Smarter</span> Q{testResult.fastestQuestion.q} ({testResult.fastestQuestion.time})
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-red-600">Weaker</span> Q{testResult.slowestQuestion.q} ({testResult.slowestQuestion.time})
            </p>
          </div>
        </div>

        {/* Right Column - Time Analytics */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Time Analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total time used</span>
              <span className="font-medium text-gray-800">{testResult.totalTime}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Average per question</span>
              <span className="font-medium text-gray-800">{testResult.avgTimePerQuestion}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Fastest answer</span>
              <span className="font-medium text-gray-800">Q{testResult.fastestQuestion.q} — {testResult.fastestQuestion.time}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Slowest answer</span>
              <span className="font-medium text-gray-800">Q{testResult.slowestQuestion.q} — {testResult.slowestQuestion.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Areas */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Weak Areas</h3>
        {testResult.weakAreas.map((area, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">{area.subject}</span>
              <span className="text-sm font-medium text-gray-800">{area.errors}% errors</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${area.errors}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons - Review Answers, Retake Test, Back to Dashboard */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setActiveView("review")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium"
        >
          Review Answers
        </button>
        
        <button 
          onClick={handleRetakeTest}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium"
        >
          <RotateCcw size={18} />
          Retake Test
        </button>
        
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium"
        >
          <Home size={18} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  // Render Review Answers View (4.png)
  const renderReviewView = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Answers</h2>

      {/* Questions Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Questions 1-7 */}
        <div className="space-y-4">
          {questions.slice(0, 7).map((q, index) => (
            <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start gap-2 mb-3">
                <span className="font-medium text-gray-800">{index + 1}.</span>
                <span className="text-gray-800">{q.question}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-600">{q.options[0]}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Questions 8-15 */}
        <div className="space-y-4">
          {questions.slice(7, 15).map((q, index) => {
            const actualIndex = index + 7;
            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start gap-2 mb-3">
                  <span className="font-medium text-gray-800">{actualIndex + 1}.</span>
                  <span className="text-gray-800">{q.question}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm text-gray-600">{q.options[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back to Dashboard button in Review View */}
      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium"
        >
          <Home size={18} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  // Render appropriate view
  return (
    <div className="pb-8">
      {activeView === "home" && renderHomeView()}
      {activeView === "test" && renderTestView()}
      {activeView === "result" && renderResultView()}
      {activeView === "review" && renderReviewView()}
    </div>
  );
};

export default DailyTestsHome;