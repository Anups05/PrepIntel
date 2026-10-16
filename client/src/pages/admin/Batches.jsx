import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, TrendingUp, TrendingDown, Award, AlertTriangle,
  ChevronDown, Eye, Download, X, User, FileText, Clock
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";
import { getBatchAnalytics, getBatchDetails } from "../../services/testService";
import { getBatchStats } from "../../services/studentService";
import * as XLSX from "xlsx";

const Batches = () => {
  const navigate = useNavigate();
  const [selectedBatches, setSelectedBatches] = useState(["JEE Advanced", "NEET", "JEE Main", "CET"]);
  const [batchAnalytics, setBatchAnalytics] = useState([]);
  const [subjectComparison, setSubjectComparison] = useState([]);
  const [progressTrend, setProgressTrend] = useState([]);
  const [trendPeriod, setTrendPeriod] = useState("weekly");
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Batch detail modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatchName, setSelectedBatchName] = useState("");
  const [batchDetailData, setBatchDetailData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("students");

  const fetchData = async (period) => {
    try {
      setIsLoading(true);
      const [analyticsRes, statsRes] = await Promise.all([
        getBatchAnalytics(period || trendPeriod),
        getBatchStats()
      ]);
      setBatchAnalytics(analyticsRes.data.batches || []);
      setSubjectComparison(analyticsRes.data.subjectComparison || []);
      setProgressTrend(analyticsRes.data.progressTrend || []);
      setTotalStudents(statsRes.data.totalStudents || 0);
    } catch (err) {
      console.error("Failed to fetch batch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleTrendPeriodChange = (period) => {
    setTrendPeriod(period);
    fetchData(period);
  };

  const handleViewBatchDetails = async (batchName) => {
    setSelectedBatchName(batchName);
    setShowBatchModal(true);
    setActiveTab("students");
    setIsLoadingDetails(true);
    try {
      const { data } = await getBatchDetails(batchName);
      setBatchDetailData(data);
    } catch (err) {
      console.error("Failed to fetch batch details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatTime = (s) => {
    if (!s) return "—";
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60), sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  // Batch key colors
  const batchColors = {
    jeeadvanced: "#8B5CF6",
    jeemain: "#F59E0B",
    neet: "#10B981",
    cet: "#3B82F6"
  };
  const batchDisplayNames = {
    jeeadvanced: "JEE Advanced",
    jeemain: "JEE Main",
    neet: "NEET",
    cet: "CET"
  };

  // Get all batch keys from data
  const batchKeys = Object.keys(batchColors);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Batches</h1>
          <p className="text-gray-500 mt-1">Compare and analyze batch performance</p>
        </div>
        <button onClick={() => {
          // Build subject-wise accuracy per batch from subjectComparison data
          const subjectAccByBatch = {};
          subjectComparison.forEach(row => {
            const subject = row.subject;
            batchKeys.forEach(key => {
              const batchName = batchDisplayNames[key];
              if (!subjectAccByBatch[batchName]) subjectAccByBatch[batchName] = {};
              if (row[key] !== undefined) subjectAccByBatch[batchName][subject] = row[key];
            });
          });
          // Get all unique subjects
          const allSubjects = [...new Set(subjectComparison.map(r => r.subject))];

          const data = batchAnalytics.filter(b => selectedBatches.includes(b.name)).map(b => {
            const row = {
              "Batch": b.name,
              "Students": b.students,
              "Avg Accuracy (%)": b.avgAccuracy,
              "Engagement (%)": b.engagement,
              "Strongest Subject": b.strongest,
              "Weakest Subject": b.weakest,
            };
            // Add subject-wise accuracy columns
            allSubjects.forEach(subj => {
              row[`${subj} Accuracy (%)`] = subjectAccByBatch[b.name]?.[subj] ?? "—";
            });
            return row;
          });
          const ws = XLSX.utils.json_to_sheet(data);
          const colCount = 6 + allSubjects.length;
          ws["!cols"] = Array(colCount).fill({ wch: 18 });
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Batch Comparison");
          XLSX.writeFile(wb, `batch_comparison_${new Date().toISOString().split('T')[0]}.xlsx`);
        }} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
          <Download size={18} />
          Export Comparison
        </button>
      </div>

      {/* Batch Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Compare batches:</span>
          <div className="flex gap-2">
            {batchAnalytics.map(batch => (
              <button
                key={batch.name}
                onClick={() => {
                  if (selectedBatches.includes(batch.name)) {
                    setSelectedBatches(selectedBatches.filter(b => b !== batch.name));
                  } else {
                    setSelectedBatches([...selectedBatches, batch.name]);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedBatches.includes(batch.name) ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {batch.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div></div>
      ) : (
        <>
          {/* Batch Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {batchAnalytics.filter(b => selectedBatches.includes(b.name)).map(batch => (
              <div key={batch.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{batch.name}</h3>
                  {batch.accTrend !== null && batch.accTrend !== undefined ? (
                    <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${batch.accTrend >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                      {batch.accTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {batch.accTrend >= 0 ? "+" : ""}{batch.accTrend}%
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">New</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Users size={14} />
                      <span className="text-xs">Students</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{batch.students}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <span className="text-xs">Avg Accuracy</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{batch.avgAccuracy}%</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Engagement Score:</span>
                    <span className="font-medium text-gray-800">{batch.engagement}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Strongest:</span>
                    <span className="font-medium text-green-600">{batch.strongest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Weakest:</span>
                    <span className="font-medium text-red-600">{batch.weakest}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewBatchDetails(batch.name)}
                  className="w-full mt-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition text-sm font-medium"
                >
                  View Batch Details
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Charts — real data */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Subject-wise Comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject-wise Comparison</h3>
              {subjectComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectComparison}>
                    <XAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    {batchKeys.map(key => (
                      <Bar key={key} dataKey={key} fill={batchColors[key]} name={batchDisplayNames[key]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-16">No data yet</p>
              )}
            </div>

            {/* Progress Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Progress Trend</h3>
                <div className="flex gap-1">
                  {["daily", "weekly", "monthly", "yearly"].map(p => (
                    <button key={p} onClick={() => handleTrendPeriodChange(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${trendPeriod === p ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {progressTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressTrend}>
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    {batchKeys.map(key => (
                      <Line key={key} type="monotone" dataKey={key} stroke={batchColors[key]} strokeWidth={2} name={batchDisplayNames[key]} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-16">No data yet</p>
              )}
            </div>
          </div>

          {/* Students by Batch */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Students by Batch</h3>
                <p className="text-sm text-gray-500">Total student distribution across batches</p>
              </div>
              <button onClick={() => navigate('/admin/students')} className="text-purple-600 text-sm font-medium hover:underline">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {batchAnalytics.map(batch => (
                <div key={batch.name} className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{batch.name}</h4>
                    <Users size={16} className="text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600 mb-1">{batch.students}</p>
                  <p className="text-xs text-gray-500">
                    {totalStudents > 0 ? `${((batch.students / totalStudents) * 100).toFixed(1)}% of total` : "—"}
                  </p>
                  <div className="w-full bg-purple-100 h-1.5 rounded-full mt-2">
                    <div className="bg-purple-500 h-1.5 rounded-full"
                      style={{ width: totalStudents > 0 ? `${(batch.students / totalStudents) * 100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Batch Details Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedBatchName} — Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {batchDetailData ? `${batchDetailData.totalStudents} student(s) · ${batchDetailData.totalTests} test(s) · Engagement: ${batchDetailData.engagementScore}%` : "Loading..."}
                </p>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex border-b">
              <button onClick={() => setActiveTab("students")}
                className={`flex-1 py-3 text-sm font-medium text-center transition ${activeTab === "students" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"}`}>
                <Users size={16} className="inline mr-2" />Student Details
              </button>
              <button onClick={() => setActiveTab("tests")}
                className={`flex-1 py-3 text-sm font-medium text-center transition ${activeTab === "tests" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"}`}>
                <FileText size={16} className="inline mr-2" />Test Details
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-500">Loading details...</span>
                </div>
              ) : !batchDetailData ? (
                <p className="text-gray-400 text-center py-16">Failed to load data.</p>
              ) : activeTab === "students" ? (
                batchDetailData.students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <User size={48} className="mb-3" />
                    <p className="text-lg font-medium">No students in this batch</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-gray-600">Student</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-600">Date Joined</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-600">Avg Score</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-600">Avg Accuracy</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-600">Avg Time/Q</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-600">Strongest</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-600">Weakest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchDetailData.students.map(student => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">{student.name?.slice(0, 2).toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center text-sm text-gray-600">
                            {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </td>
                          <td className="p-3 text-center text-sm font-semibold text-gray-800">{student.avgScore}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.avgAccuracy >= 70 ? "bg-green-100 text-green-700" : student.avgAccuracy >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                              {student.avgAccuracy}%
                            </span>
                          </td>
                          <td className="p-3 text-center text-sm text-gray-600">{formatTime(student.avgTimePerQ)}</td>
                          <td className="p-3 text-center text-sm font-medium text-green-600">{student.strongest}</td>
                          <td className="p-3 text-center text-sm font-medium text-red-600">{student.weakest}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                batchDetailData.tests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <FileText size={48} className="mb-3" />
                    <p className="text-lg font-medium">No tests created for this batch</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-purple-50 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Completed/Active Tests: <span className="font-bold text-gray-800">{batchDetailData.totalTests}</span></p>
                        <p className="text-sm text-gray-600">Total Students: <span className="font-bold text-gray-800">{batchDetailData.totalStudents}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Engagement Score</p>
                        <p className="text-2xl font-bold text-purple-600">{batchDetailData.engagementScore}%</p>
                      </div>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-gray-600">Test Name</th>
                          <th className="text-center p-3 text-sm font-medium text-gray-600">Type</th>
                          <th className="text-center p-3 text-sm font-medium text-gray-600">Date</th>
                          <th className="text-center p-3 text-sm font-medium text-gray-600">Avg Score</th>
                          <th className="text-center p-3 text-sm font-medium text-gray-600">Avg Accuracy</th>
                          <th className="text-center p-3 text-sm font-medium text-gray-600">Attempted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchDetailData.tests.map(test => (
                          <tr key={test.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <p className="font-medium text-gray-800 text-sm">{test.title}</p>
                              <p className="text-xs text-gray-500">{test.totalQuestions} Qs · {test.totalMarks} Marks</p>
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">{test.type || "—"}</span>
                            </td>
                            <td className="p-3 text-center text-sm text-gray-600">
                              {test.date ? new Date(test.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                            </td>
                            <td className="p-3 text-center text-sm font-semibold text-gray-800">{test.avgScore}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${test.avgAccuracy >= 70 ? "bg-green-100 text-green-700" : test.avgAccuracy >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                {test.avgAccuracy}%
                              </span>
                            </td>
                            <td className="p-3 text-center text-sm text-gray-600">
                              <span className="font-semibold">{test.attempted}</span>
                              <span className="text-gray-400"> / {test.totalStudents}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setShowBatchModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;