import React, { useState, useEffect } from "react";
import {
  Search, AlertTriangle, Clock, BarChart3, RefreshCw,
  ChevronLeft, ChevronRight, X, Eye
} from "lucide-react";
import { getAllQuestions, getQuestionBankAnalytics } from "../../services/testService";

const QUESTIONS_PER_PAGE = 20;

const QuestionBank = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // View All modals
  const [showAllIncorrect, setShowAllIncorrect] = useState(false);
  const [showAllTimeConsuming, setShowAllTimeConsuming] = useState(false);

  useEffect(() => {
    fetchQuestions();
    fetchAnalytics();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const { data } = await getAllQuestions();
      setQuestions(data.questions || []);
      setTotalQuestions(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const { data } = await getQuestionBankAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Failed to fetch question analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === "all" || q.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
    const matchesBatch = selectedBatch === "all" || (q.batch && q.batch.includes(selectedBatch));
    return matchesSearch && matchesSubject && matchesDifficulty && matchesBatch;
  });

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedSubject, selectedBatch, selectedDifficulty]);

  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIdx = startIdx + QUESTIONS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(startIdx, endIdx);

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const getPageNumbers = () => {
    const pages = [];
    const maxDisplay = 5;
    let start = Math.max(1, currentPage - Math.floor(maxDisplay / 2));
    let end = Math.min(totalPages, start + maxDisplay - 1);
    if (end - start + 1 < maxDisplay) start = Math.max(1, end - maxDisplay + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const mostIncorrect = analyticsData?.mostIncorrect || [];
  const timeConsuming = analyticsData?.timeConsuming || [];
  const quickStats = analyticsData?.quickStats || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Question Bank</h1>
          <p className="text-gray-500 mt-1">Manage and analyze questions</p>
        </div>
        <button onClick={() => { fetchQuestions(); fetchAnalytics(); }} className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-500">Most Incorrect Questions</h3>
            {mostIncorrect.length > 3 && (
              <button onClick={() => setShowAllIncorrect(true)} className="text-xs text-purple-600 font-medium hover:underline flex items-center gap-1">
                <Eye size={12} /> View All
              </button>
            )}
          </div>
          {isLoadingAnalytics ? (
            <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div></div>
          ) : mostIncorrect.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-3">
              {mostIncorrect.slice(0, 3).map((q, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{q.text}</p>
                    <p className="text-xs text-gray-400">{q.subject} • {q.topic}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600 whitespace-nowrap">{q.errorRate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-500">High Time-Consuming</h3>
            {timeConsuming.length > 3 && (
              <button onClick={() => setShowAllTimeConsuming(true)} className="text-xs text-purple-600 font-medium hover:underline flex items-center gap-1">
                <Eye size={12} /> View All
              </button>
            )}
          </div>
          {isLoadingAnalytics ? (
            <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div></div>
          ) : timeConsuming.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-3">
              {timeConsuming.slice(0, 3).map((q, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{q.text}</p>
                    <p className="text-xs text-gray-400">{q.subject} • {q.topic}</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600 whitespace-nowrap">{q.avgTime}s</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm text-gray-500 mb-4">Quick Stats</h3>
          {isLoadingAnalytics ? (
            <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div></div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Questions</span>
                <span className="font-bold text-gray-800">{(quickStats.totalQuestions || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Error Rate</span>
                <span className="font-bold text-red-600">{quickStats.avgErrorRate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Time</span>
                <span className="font-bold text-orange-600">{quickStats.avgTime || 0}s</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search questions..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
            <option value="all">All Batches</option>
            <option value="JEE Advanced">JEE Advanced</option>
            <option value="JEE Main">JEE Main</option>
            <option value="NEET">NEET</option>
            <option value="CET">CET</option>
          </select>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
            <option value="all">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
          </select>
          <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No questions found</p>
            <p className="text-sm">Create a test with questions to populate the question bank.</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Question</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Subject</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Topic</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Difficulty</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Batch</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-600">Error Rate</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-600">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuestions.map((q) => (
                  <tr key={q.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <p className="text-sm text-gray-800 max-w-xs truncate">{q.text}</p>
                      <p className="text-xs text-gray-400 mt-1">Test: {q.testTitle || "—"}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{q.subject || "—"}</td>
                    <td className="p-4 text-sm text-gray-600">{q.topic || "—"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${q.difficulty === "Easy" ? "bg-green-100 text-green-600" :
                        q.difficulty === "Medium" ? "bg-yellow-100 text-yellow-600" :
                          "bg-red-100 text-red-600"
                        }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{q.batch || "—"}</td>
                    <td className="p-4 text-center">
                      {q.errorRate !== null ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${q.errorRate >= 70 ? "bg-red-100 text-red-700" : q.errorRate >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {q.errorRate}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {q.avgTime !== null ? (
                        <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold">{q.avgTime}s</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {startIdx + 1}-{Math.min(endIdx, filteredQuestions.length)} of {filteredQuestions.length} questions
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={handlePrevPage} disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}>
                    <ChevronLeft size={18} />
                  </button>
                  {getPageNumbers().map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${currentPage === page ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* View All Most Incorrect Modal */}
      {showAllIncorrect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Most Incorrect Questions</h2>
                <p className="text-sm text-gray-500">{mostIncorrect.length} question(s) sorted by error rate</p>
              </div>
              <button onClick={() => setShowAllIncorrect(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Question</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Subject</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Topic</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Error Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {mostIncorrect.map((q, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-800 max-w-xs">{q.text}</td>
                      <td className="p-3 text-center text-sm text-gray-600">{q.subject}</td>
                      <td className="p-3 text-center text-sm text-gray-600">{q.topic}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${q.errorRate >= 70 ? "bg-red-100 text-red-700" : q.errorRate >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {q.errorRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setShowAllIncorrect(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View All High Time-Consuming Modal */}
      {showAllTimeConsuming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">High Time-Consuming Questions</h2>
                <p className="text-sm text-gray-500">{timeConsuming.length} question(s) sorted by avg time</p>
              </div>
              <button onClick={() => setShowAllTimeConsuming(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Question</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Subject</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Topic</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {timeConsuming.map((q, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-800 max-w-xs">{q.text}</td>
                      <td className="p-3 text-center text-sm text-gray-600">{q.subject}</td>
                      <td className="p-3 text-center text-sm text-gray-600">{q.topic}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{q.avgTime}s</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setShowAllTimeConsuming(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;