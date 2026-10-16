import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock, ChevronRight, ChevronLeft, BookOpen,
  CheckCircle, XCircle, Flag, BarChart3, Home, Lock, MinusCircle
} from "lucide-react";
import { getStudentTests, startStudentTest, submitStudentTest, getAttemptResult } from "../services/testService";

const DailyTestsHome = () => {
  const [activeView, setActiveView] = useState("home");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [markedForReview, setMarkedForReview] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [availableTests, setAvailableTests] = useState([]);
  const [studentBatch, setStudentBatch] = useState("");
  const [isLoadingTests, setIsLoadingTests] = useState(true);

  const [activeTest, setActiveTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [scoring, setScoring] = useState({ correct: 4, incorrect: -1, unattempted: 0 });
  const [isStartingTest, setIsStartingTest] = useState(false);
  const [realResult, setRealResult] = useState(null);

  const [questionTimes, setQuestionTimes] = useState({});
  const questionStartRef = useRef(null);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const [revisitedQuestions, setRevisitedQuestions] = useState(new Set());

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => { fetchTests(); }, []);

  const fetchTests = async () => {
    try {
      setIsLoadingTests(true);
      const { data } = await getStudentTests();
      setAvailableTests(data.tests || []);
      setStudentBatch(data.batch || "");
    } catch (err) { console.error("Failed to fetch tests:", err); }
    finally { setIsLoadingTests(false); }
  };

  const saveCurrentQuestionTime = useCallback(() => {
    if (questionStartRef.current !== null) {
      const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
      setQuestionTimes(prev => ({ ...prev, [currentQuestion]: (prev[currentQuestion] || 0) + elapsed }));
    }
    questionStartRef.current = Date.now();
  }, [currentQuestion]);

  useEffect(() => {
    if (activeView === "test" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current); handleSubmitTest(); return 0; } return prev - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeView, timeLeft > 0]);

  const formatTime = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const formatDuration = (s) => {
    if (!s || s === 0) return "0s";
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60), sec = s % 60;
    if (m < 60) return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
    const h = Math.floor(m / 60), rm = m % 60;
    return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
  };

  const handleStartTest = async (test) => {
    if (test.attempted) return;
    setIsStartingTest(true);
    try {
      const { data } = await startStudentTest(test.id);
      setActiveTest(data.test); setQuestions(data.questions || []);
      setScoring(data.scoring || { correct: 4, incorrect: -1, unattempted: 0 });
      setTimeLeft(data.test.duration * 60);
      setCurrentQuestion(0); setSelectedOption(null);
      setMarkedForReview([]); setAnswers({});
      setTestSubmitted(false); setRealResult(null);
      setQuestionTimes({}); setVisitedQuestions(new Set([0])); setRevisitedQuestions(new Set());
      startTimeRef.current = Date.now(); questionStartRef.current = Date.now();
      setActiveView("test");
    } catch (err) { alert(err.response?.data?.message || "Failed to start test"); }
    finally { setIsStartingTest(false); }
  };

  // Load past attempt with student answers
  const handleViewAnalytics = async (test) => {
    try {
      const { data } = await getAttemptResult(test.id);
      setActiveTest(data.test); setQuestions(data.questions || []);
      setScoring(data.scoring || { correct: 4, incorrect: -1, unattempted: 0 });

      // Rebuild answers map from studentAnswer field
      const rebuiltAnswers = {};
      data.questions.forEach((q, idx) => {
        if (q.studentAnswer) {
          rebuiltAnswers[idx] = q.studentAnswer.charCodeAt(0) - 65;
        }
      });
      setAnswers(rebuiltAnswers);

      const cCount = data.attempt.correctCount;
      const iCount = data.attempt.incorrectCount;
      const uCount = data.attempt.unattemptedCount;
      const attempted = cCount + iCount;

      setRealResult({
        score: data.attempt.score, totalMarks: data.attempt.totalMarks,
        correctCount: cCount, incorrectCount: iCount,
        unattemptedCount: uCount, timeTaken: data.attempt.timeTaken,
        totalQuestions: data.questions.length,
        accuracy: attempted > 0 ? Math.round((cCount / attempted) * 100) : 0,
        attemptedPct: Math.round((attempted / data.questions.length) * 100),
        fastest: data.fastest, slowest: data.slowest
      });
      setTestSubmitted(true); setActiveView("result");
    } catch (err) { alert("Failed to load test results"); }
  };

  const handleOptionSelect = (i) => { setSelectedOption(i); setAnswers({ ...answers, [currentQuestion]: i }); };
  const handleClearResponse = () => { const u = { ...answers }; delete u[currentQuestion]; setAnswers(u); setSelectedOption(null); };
  const toggleMarkForReview = () => {
    if (markedForReview.includes(currentQuestion)) setMarkedForReview(markedForReview.filter(q => q !== currentQuestion));
    else setMarkedForReview([...markedForReview, currentQuestion]);
  };

  const navigateTo = (index) => {
    saveCurrentQuestionTime();
    setVisitedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(index)) setRevisitedQuestions(r => new Set(r).add(index));
      next.add(index); return next;
    });
    setCurrentQuestion(index);
    setSelectedOption(answers[index] !== undefined ? answers[index] : null);
  };

  const handleNext = () => { if (currentQuestion < questions.length - 1) navigateTo(currentQuestion + 1); };
  const handlePrevious = () => { if (currentQuestion > 0) navigateTo(currentQuestion - 1); };

  const computeResults = () => {
    saveCurrentQuestionTime();
    let correctCount = 0, incorrectCount = 0, unattemptedCount = 0;
    const qResponses = [];
    questions.forEach((q, idx) => {
      const isAttempted = answers[idx] !== undefined;
      let isCorrect = false, selectedLetter = null;
      if (isAttempted) {
        selectedLetter = String.fromCharCode(65 + answers[idx]);
        isCorrect = selectedLetter === q.answer;
        if (isCorrect) correctCount++; else incorrectCount++;
      } else unattemptedCount++;
      qResponses.push({
        questionId: q.id, selectedAnswer: selectedLetter, correctAnswer: q.answer,
        isCorrect, isAttempted, isRevisited: revisitedQuestions.has(idx),
        timeTaken: questionTimes[idx] || 0, difficulty: q.difficulty, subject: q.subject
      });
    });
    const score = (correctCount * scoring.correct) + (incorrectCount * scoring.incorrect);
    const totalMarks = questions.length * scoring.correct;
    const attempted = correctCount + incorrectCount;
    const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
    const attemptedPct = Math.round((attempted / questions.length) * 100);
    const timeTaken = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;

    const attemptedTimes = Object.entries(questionTimes).filter(([idx]) => answers[parseInt(idx)] !== undefined);
    let fastest = null, slowest = null;
    if (attemptedTimes.length > 0) {
      attemptedTimes.sort((a, b) => a[1] - b[1]);
      const fi = parseInt(attemptedTimes[0][0]);
      fastest = { idx: fi, time: attemptedTimes[0][1] };
      const si = parseInt(attemptedTimes[attemptedTimes.length - 1][0]);
      slowest = { idx: si, time: attemptedTimes[attemptedTimes.length - 1][1] };
    }
    return { score, totalMarks, correctCount, incorrectCount, unattemptedCount, accuracy, attemptedPct, timeTaken, totalQuestions: questions.length, questionResponses: qResponses, fastest, slowest };
  };

  const handleSubmitTest = async () => {
    clearInterval(timerRef.current);
    const result = computeResults();
    setRealResult(result); setTestSubmitted(true); setActiveView("result");
    if (activeTest) {
      try {
        await submitStudentTest(activeTest.id, {
          score: result.score, totalMarks: result.totalMarks,
          correctCount: result.correctCount, incorrectCount: result.incorrectCount,
          unattemptedCount: result.unattemptedCount, timeTaken: result.timeTaken,
          questionResponses: result.questionResponses
        });
      } catch (err) { console.error("Failed to record attempt:", err); }
    }
  };

  const handleBackToDashboard = () => { setActiveView("home"); setActiveTest(null); setQuestions([]); setRealResult(null); fetchTests(); };

  const getQuestionStatus = (index) => {
    if (markedForReview.includes(index)) return "marked";
    if (answers[index] !== undefined) return "answered";
    return "not-visited";
  };

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.length;
  const notVisitedCount = questions.length - answeredCount;
  const scoringLabel = scoring.incorrect < 0 ? `+${scoring.correct} / ${scoring.incorrect}` : `+${scoring.correct} / 0`;

  // ============ HOME VIEW ============
  const renderHomeView = () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Daily Tests</h1>
      <p className="text-gray-500 mb-1">Sharpen your skills with timed, AI-curated MCQ tests.</p>
      {studentBatch && (
        <p className="text-sm text-purple-600 font-medium mb-6">
          Batch: {studentBatch} • Scoring: {studentBatch === "CET" ? "+2 correct, 0 incorrect" : "+4 correct, -1 incorrect"}
        </p>
      )}
      {isLoadingTests ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div></div>
      ) : availableTests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No tests available</h3>
          <p className="text-gray-400">Tests assigned to your batch will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {availableTests.map(test => (
            <div key={test.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{test.title}</h2>
                    <p className={`font-medium mt-1 ${test.isToday ? "text-purple-600" : "text-gray-500"}`}>
                      {test.isToday ? "Today's Test" : `Test — ${new Date(test.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`}
                    </p>
                  </div>
                  {test.attempted && <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium"><CheckCircle size={14} /> Completed</span>}
                </div>
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2"><span>📅</span><span className="text-gray-600">{test.totalQuestions} Questions</span></div>
                  <div className="flex items-center gap-2"><span>⏱️</span><span className="text-gray-600">{test.totalMarks} Marks</span></div>
                  <div className="flex items-center gap-2"><span>🕒</span><span className="text-gray-600">{test.duration} Minutes</span></div>
                  <div className="flex items-center gap-2"><span>🔄</span><span className="text-gray-600">{scoringLabel}</span></div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleStartTest(test)} disabled={test.attempted || isStartingTest}
                    className={`px-8 py-3 rounded-xl font-medium transition ${test.attempted ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white"}`}>
                    {test.attempted ? <span className="flex items-center gap-2"><Lock size={16} /> Already Attempted</span> : isStartingTest ? "Loading..." : "Start Test"}
                  </button>
                  {test.attempted && (
                    <button onClick={() => handleViewAnalytics(test)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition">
                      <BarChart3 size={16} /> Analytics
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Instructions</h3>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start gap-3"><span className="text-purple-600 font-bold">1️⃣</span><span>Each question has 4 options — select the best answer.</span></li>
          <li className="flex items-start gap-3"><span className="text-purple-600 font-bold">2️⃣</span><span>You can mark questions for review and revisit them anytime.</span></li>
          <li className="flex items-start gap-3"><span className="text-purple-600 font-bold">3️⃣</span><span>Timer runs continuously and auto-submits at 00:00:00.</span></li>
          <li className="flex items-start gap-3"><span className="text-purple-600 font-bold">4️⃣</span><span>Use the navigation panel on the right to jump between questions.</span></li>
          <li className="flex items-start gap-3"><span className="text-purple-600 font-bold">5️⃣</span><span className="text-red-500 font-medium">Do not switch tabs — your activity is monitored.</span></li>
          <li className="flex items-start gap-3"><span className="text-purple-600 font-bold">6️⃣</span><span>{studentBatch === "CET" ? "Scoring: +2 correct, 0 incorrect, 0 unattempted." : "Scoring: +4 correct, -1 incorrect, 0 unattempted."}</span></li>
        </ul>
      </div>
    </div>
  );

  // ============ TEST VIEW ============
  const renderTestView = () => {
    if (!activeTest || questions.length === 0) return null;
    const q = questions[currentQuestion];
    return (
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{activeTest.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">{activeTest.type}</span>
                  <span className="text-sm text-gray-500">{questions.length} Questions · {activeTest.totalMarks} Marks · {scoringLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Clock size={18} className="text-gray-600" />
                <span className="font-mono font-bold text-gray-700 text-lg">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">{q.subject}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${q.difficulty === "Easy" ? "bg-green-100 text-green-600" : q.difficulty === "Hard" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}>{q.difficulty}</span>
              {q.topic && <span className="text-xs text-gray-400">• {q.topic}</span>}
            </div>
            <h3 className="text-xl text-gray-800 mb-6">{currentQuestion + 1}. {q.question}</h3>
            <div className="space-y-3 mb-6">
              {q.options.map((option, index) => (
                <button key={index} onClick={() => handleOptionSelect(index)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${selectedOption === index ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}>
                  <span className="text-gray-600"><span className="font-bold text-gray-800 mr-3">{String.fromCharCode(65 + index)}</span>{option}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleMarkForReview} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${markedForReview.includes(currentQuestion) ? "bg-yellow-50 border-yellow-300 text-yellow-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                <Flag size={18} />{markedForReview.includes(currentQuestion) ? "Marked for Review" : "Mark for Review"}
              </button>
              <button onClick={handleClearResponse} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">Clear Response</button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <button onClick={handlePrevious} disabled={currentQuestion === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl ${currentQuestion === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
              <ChevronLeft size={18} /> Prev
            </button>
            <button onClick={handleNext} disabled={currentQuestion === questions.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-4">Question Navigator</h3>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-200"></div><span className="text-sm text-gray-600">Not Visited</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span className="text-sm text-gray-600">Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-400"></div><span className="text-sm text-gray-600">Not Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500"></div><span className="text-sm text-gray-600">Marked</span></div>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((_, index) => {
                const status = getQuestionStatus(index);
                let bgColor = "bg-gray-200";
                if (status === "answered") bgColor = "bg-green-500";
                if (status === "marked") bgColor = "bg-yellow-500";
                return (
                  <button key={index} onClick={() => navigateTo(index)}
                    className={`w-8 h-8 rounded-lg ${bgColor} font-medium flex items-center justify-center text-xs
                      ${currentQuestion === index ? "ring-2 ring-purple-600 ring-offset-2" : ""} ${status === "not-visited" ? "text-gray-600" : "text-white"}`}>{index + 1}</button>
                );
              })}
            </div>
            <div className="space-y-2 mb-6 text-sm border-t pt-4">
              <div className="flex justify-between"><span className="text-gray-600">Answered</span><span className="font-bold text-gray-800">{answeredCount}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Unanswered</span><span className="font-bold text-gray-800">{questions.length - answeredCount}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Marked</span><span className="font-bold text-gray-800">{markedCount}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Not Visited</span><span className="font-bold text-gray-800">{notVisitedCount}</span></div>
            </div>
            <button onClick={handleSubmitTest} className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition">Submit Test</button>
          </div>
        </div>
      </div>
    );
  };

  // ============ RESULT VIEW ============
  const renderResultView = () => {
    if (!realResult) return null;
    const r = realResult;
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Test Result</h2>
        <p className="text-gray-500 mb-6">{activeTest?.title || "Daily Test"}</p>
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-sm text-gray-500 mb-2">Score</h3><p className="text-3xl font-bold text-gray-800">{r.score}/{r.totalMarks}</p></div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-sm text-gray-500 mb-2">Accuracy</h3><p className="text-3xl font-bold text-gray-800">{r.accuracy}%</p></div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-sm text-gray-500 mb-2">Attempted</h3><p className="text-3xl font-bold text-gray-800">{r.attemptedPct}%</p></div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-sm text-gray-500 mb-2">Tab Switched</h3><p className="text-3xl font-bold text-gray-800">0</p></div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Attempt Breakdown</h3>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2"><div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle size={18} className="text-green-600" /></div><div><p className="text-lg font-bold text-gray-800">{r.correctCount}</p><p className="text-xs text-gray-500">Correct</p></div></div>
              <div className="flex items-center gap-2"><div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><XCircle size={18} className="text-red-600" /></div><div><p className="text-lg font-bold text-gray-800">{r.incorrectCount}</p><p className="text-xs text-gray-500">Incorrect</p></div></div>
              <div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><MinusCircle size={18} className="text-gray-500" /></div><div><p className="text-lg font-bold text-gray-800">{r.unattemptedCount}</p><p className="text-xs text-gray-500">Unattempted</p></div></div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-3">Scoring</h3>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm"><span className="font-medium text-green-600">Correct:</span> {r.correctCount} × +{scoring.correct} = <span className="font-bold text-green-600">+{r.correctCount * scoring.correct}</span></p>
              <p className="text-gray-600 text-sm"><span className="font-medium text-red-600">Incorrect:</span> {r.incorrectCount} × {scoring.incorrect} = <span className="font-bold text-red-600">{r.incorrectCount * scoring.incorrect}</span></p>
              <p className="text-gray-600 text-sm"><span className="font-medium text-gray-500">Unattempted:</span> {r.unattemptedCount} × 0 = <span className="font-bold">0</span></p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Time Analytics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-gray-600">Total time used</span><span className="font-medium text-gray-800">{formatDuration(r.timeTaken)}</span></div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-gray-600">Average per question</span><span className="font-medium text-gray-800">{r.totalQuestions > 0 ? formatDuration(Math.round(r.timeTaken / r.totalQuestions)) : "—"}</span></div>
              {r.fastest && <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-gray-600">Fastest answer</span><span className="font-medium text-green-600">Q{r.fastest.idx + 1} — {formatDuration(r.fastest.time)}</span></div>}
              {r.slowest && <div className="flex justify-between items-center py-2 border-b border-gray-100"><span className="text-gray-600">Slowest answer</span><span className="font-medium text-red-600">Q{r.slowest.idx + 1} — {formatDuration(r.slowest.time)}</span></div>}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Weak Areas</h3>
          {(() => {
            // compute error % per subject from this test's questions and answers
            const subjectStats = {};
            questions.forEach((q, idx) => {
              const subj = q.subject || 'General';
              if (!subjectStats[subj]) subjectStats[subj] = { total: 0, incorrect: 0 };
              subjectStats[subj].total++;
              const studentAnswer = answers[idx];
              if (studentAnswer !== undefined) {
                const selectedLetter = String.fromCharCode(65 + studentAnswer);
                if (selectedLetter !== q.answer) subjectStats[subj].incorrect++;
              } else {
                // unattempted counts as error for weak area
                subjectStats[subj].incorrect++;
              }
            });
            const weakAreas = Object.entries(subjectStats)
              .map(([subject, s]) => ({ subject, errors: s.total > 0 ? Math.round((s.incorrect / s.total) * 100) : 0, total: s.total, incorrect: s.incorrect }))
              .sort((a, b) => b.errors - a.errors);
            return weakAreas.map((area, i) => (
              <div key={i} className="mb-3"><div className="flex justify-between items-center mb-1"><span className="text-gray-600">{area.subject}</span><span className="text-sm font-medium text-gray-800">{area.errors}% errors ({area.incorrect}/{area.total})</span></div>
                <div className="w-full bg-gray-100 h-2 rounded-full"><div className={`h-2 rounded-full ${area.errors > 50 ? 'bg-red-500' : area.errors > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${area.errors}%` }}></div></div></div>
            ));
          })()}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveView("review")} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium">Review Answers</button>
          <button onClick={handleBackToDashboard} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium"><Home size={18} /> Back to Dashboard</button>
        </div>
      </div>
    );
  };

  // ============ REVIEW VIEW ============
  const renderReviewView = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Answers</h2>
      <p className="text-gray-500 mb-6">{activeTest?.title || "Daily Test"}</p>
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-full"></div><span className="text-sm text-gray-600">Correct</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-full"></div><span className="text-sm text-gray-600">Incorrect</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-300 rounded-full"></div><span className="text-sm text-gray-600">Unattempted</span></div>
      </div>
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const studentAnswer = answers[idx];
          const correctLetterIndex = q.answer.charCodeAt(0) - 65;
          const isAttempted = studentAnswer !== undefined;
          const isCorrect = isAttempted && String.fromCharCode(65 + studentAnswer) === q.answer;
          const isWrong = isAttempted && !isCorrect;
          return (
            <div key={q.id} className={`bg-white rounded-2xl shadow-sm border-2 p-5 ${isCorrect ? "border-green-300" : isWrong ? "border-red-300" : "border-gray-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${isCorrect ? "bg-green-500" : isWrong ? "bg-red-500" : "bg-gray-400"}`}>{idx + 1}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs font-medium">{q.subject}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${q.difficulty === "Easy" ? "bg-green-100 text-green-600" : q.difficulty === "Hard" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}>{q.difficulty}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${isCorrect ? "bg-green-100 text-green-600" : isWrong ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                  {isCorrect ? "✓ Correct" : isWrong ? "✗ Incorrect" : "— Unattempted"}
                </span>
              </div>
              <p className="text-gray-800 font-medium mb-3 ml-9">{q.question}</p>
              <div className="grid grid-cols-2 gap-2 ml-9">
                {q.options.map((opt, optIdx) => {
                  const isCorrectOpt = optIdx === correctLetterIndex;
                  const isStudentPick = isAttempted && optIdx === studentAnswer;
                  let style = "bg-gray-50 border-gray-200 text-gray-600";
                  if (isCorrectOpt) style = "bg-green-50 border-green-300 text-green-700 font-medium";
                  else if (isStudentPick && isWrong) style = "bg-red-50 border-red-300 text-red-700 font-medium";
                  return (
                    <div key={optIdx} className={`text-sm p-2.5 rounded-lg border ${style}`}>
                      <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                      {isCorrectOpt && <span className="text-xs ml-1 font-bold text-green-600">✓</span>}
                      {isStudentPick && isWrong && <span className="text-xs ml-1 font-bold text-red-600">✗ Your answer</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={handleBackToDashboard} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium"><Home size={18} /> Back to Dashboard</button>
      </div>
    </div>
  );

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