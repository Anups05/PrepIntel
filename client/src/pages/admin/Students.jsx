import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  Clock,
  Target,
  X,
  Download,
  User,
  Trash2,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from "recharts";
import { getAllStudents, deleteStudent, deleteBulkStudents } from "../../services/studentService";

const Students = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOption, setExportOption] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [atRiskFilter, setAtRiskFilter] = useState(null);

  // Read at-risk filter from AI Insights navigation
  useEffect(() => {
    if (location.state?.atRiskNames && location.state.atRiskNames.length > 0) {
      setAtRiskFilter(location.state.atRiskNames);
    }
  }, [location.state]);

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedBatch !== "all") params.batch = selectedBatch;
      const { data } = await getAllStudents(params);
      setStudents(data.students || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedBatch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter students (risk level is client-side since it's not in DB yet)
  const filteredStudents = students.filter(student => {
    const matchesRisk = selectedRisk === "all" || student.riskLevel === selectedRisk;
    const matchesAtRisk = !atRiskFilter || atRiskFilter.some(name =>
      student.name?.toLowerCase().includes(name.toLowerCase())
    );
    return matchesRisk && matchesAtRisk;
  });

  // Get risk color
  const getRiskColor = (risk) => {
    switch (risk) {
      case "Low": return "text-green-600 bg-green-50";
      case "Medium": return "text-yellow-600 bg-yellow-50";
      case "High": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  // Handle student click
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowDetailPanel(true);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(sid => sid !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (studentToDelete) {
        // Single student delete
        await deleteStudent(studentToDelete.id);
      } else if (selectedStudents.length > 0) {
        // Bulk delete
        await deleteBulkStudents(selectedStudents);
      }
      // Refresh list
      await fetchStudents();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete student(s). Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setShowDetailPanel(false);
      setSelectedStudents([]);
      setStudentToDelete(null);
    }
  };

  return (
    <div>
      {/* At-Risk Filter Banner */}
      {atRiskFilter && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <div>
              <p className="font-medium text-red-800">Showing At-Risk Students</p>
              <p className="text-sm text-red-600">Filtered from AI Insights — {filteredStudents.length} student(s) found</p>
            </div>
          </div>
          <button
            onClick={() => setAtRiskFilter(null)}
            className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 bg-red-100 rounded-lg hover:bg-red-200 transition"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{atRiskFilter ? 'At-Risk Students' : 'Students'}</h1>
          <p className="text-gray-500 mt-1">{atRiskFilter ? 'Students flagged by AI Insights as needing attention' : 'Manage and analyze student performance'}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStudents}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          {selectedStudents.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition border border-red-100"
            >
              <Trash2 size={18} />
              Delete ({selectedStudents.length})
            </button>
          )}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="all">All Batches</option>
            <option value="JEE Advanced">JEE Advanced</option>
            <option value="JEE Main">JEE Main</option>
            <option value="NEET">NEET</option>
            <option value="CET">CET</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-500">Loading students...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <User size={48} className="mb-3" />
            <p className="text-lg font-medium">No students found</p>
            <p className="text-sm">Students will appear here once they register.</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 w-12 text-left">
                    <input
                      type="checkbox"
                      className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      checked={selectedStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Student</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Batch</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Phone</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Location</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Joined</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className={`border-b hover:bg-gray-50 cursor-pointer ${selectedStudents.includes(student.id) ? "bg-purple-50/50" : ""}`}
                    onClick={() => handleStudentClick(student)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleSelectStudent(student.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{student.avatar || student.name?.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{student.batch}</td>
                    <td className="p-4 text-sm text-gray-600">{student.phone || "—"}</td>
                    <td className="p-4 text-sm text-gray-600">{student.location || "—"}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleStudentClick(student)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye size={18} className="text-purple-600" />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToDelete(student);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">Showing {filteredStudents.length} student(s)</p>
            </div>
          </>
        )}
      </div>

      {/* Student Detail Panel */}
      {showDetailPanel && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b sticky top-0 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{selectedStudent.avatar || selectedStudent.name?.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h2>
                  <p className="text-sm text-gray-500">{selectedStudent.email} • {selectedStudent.batch}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setStudentToDelete(selectedStudent);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition border border-red-100"
                >
                  <Trash2 size={16} />
                  Delete Student
                </button>
                <button
                  onClick={() => setShowDetailPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Student Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Batch / Exam</p>
                  <p className="text-lg font-bold text-gray-800">{selectedStudent.batch}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-lg font-bold text-gray-800">{selectedStudent.phone || "Not provided"}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="text-lg font-bold text-gray-800">{selectedStudent.location || "Not provided"}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Joined</p>
                  <p className="text-lg font-bold text-gray-800">
                    {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>

              {/* Display Name */}
              {selectedStudent.displayName && (
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <p className="text-sm text-gray-600 mb-1">Display Name</p>
                  <p className="text-lg font-bold text-gray-800">{selectedStudent.displayName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Export Student Data</h2>
              <button onClick={() => setShowExportModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">Select the data you want to export as XLSX.</p>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition">
                <input
                  type="radio"
                  name="exportOption"
                  checked={exportOption === "all"}
                  onChange={() => setExportOption("all")}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <p className="font-medium text-gray-800">All Students</p>
                  <p className="text-xs text-gray-500">Export records for all {students.length} students</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition">
                <input
                  type="radio"
                  name="exportOption"
                  checked={exportOption === "current_view"}
                  onChange={() => setExportOption("current_view")}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <p className="font-medium text-gray-800">Current View</p>
                  <p className="text-xs text-gray-500">Export the {filteredStudents.length} students matching current filters</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const dataToExport = exportOption === "all" ? students : filteredStudents;
                  const rows = dataToExport.map(s => ({
                    "Name": s.name || "",
                    "Email": s.email || "",
                    "Batch": s.batch || "",
                    "Phone": s.phone || "",
                    "Location": s.location || "",
                    "Display Name": s.displayName || "",
                    "Target Exam": s.targetExam || s.batch || "",
                    "Date of Joining": s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : ""
                  }));
                  import("xlsx").then((XLSX) => {
                    const ws = XLSX.utils.json_to_sheet(rows);
                    // Auto-size columns
                    const colWidths = Object.keys(rows[0] || {}).map(key => ({
                      wch: Math.max(key.length, ...rows.map(r => (r[key] || "").toString().length)) + 2
                    }));
                    ws["!cols"] = colWidths;
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Students");
                    XLSX.writeFile(wb, `PrepIntel_Students_${new Date().toISOString().slice(0, 10)}.xlsx`);
                  });
                  setShowExportModal(false);
                }}
                className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download XLSX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Deletion</h2>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete {studentToDelete ? <span className="font-semibold text-gray-700">{studentToDelete.name}</span> : `the selected ${selectedStudents.length} student(s)`}? This action cannot be undone and all their data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setStudentToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-sm shadow-red-600/20 transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;