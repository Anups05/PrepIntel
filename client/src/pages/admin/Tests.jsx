import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Calendar,
  Users,
  Clock,
  Edit,
  Trash,
  Eye,
  BarChart3,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Award,
  Hash
} from "lucide-react";
import { getAllTests, createTest, deleteTest, getTestById, updateTest } from "../../services/testService";

const Tests = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // View test detail
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTest, setViewTest] = useState(null);
  const [viewQuestions, setViewQuestions] = useState([]);
  const [isLoadingView, setIsLoadingView] = useState(false);

  // Edit test
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTestId, setEditTestId] = useState(null);

  // Create test form state
  const [formData, setFormData] = useState({
    title: "",
    testType: "Full Syllabus",
    testDate: "",
    duration: "",
    assignedBatches: [],
    instructions: "",
  });

  // Excel upload state
  const [uploadStep, setUploadStep] = useState("form");
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [fileName, setFileName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Today's date for min restriction
  const todayStr = new Date().toISOString().split("T")[0];

  // Fetch tests from API
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const { data } = await getAllTests();
      setTests(data.tests || []);
    } catch (err) {
      console.error("Failed to fetch tests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBatchToggle = (batch) => {
    const current = formData.assignedBatches;
    if (current.includes(batch)) {
      setFormData({ ...formData, assignedBatches: current.filter(b => b !== batch) });
    } else {
      setFormData({ ...formData, assignedBatches: [...current, batch] });
    }
  };

  // Calculate marks based on batch
  const getMarksMultiplier = () => {
    const batches = formData.assignedBatches;
    if (batches.length === 1 && batches[0] === "CET") return 2;
    return 4;
  };

  const totalQuestions = parsedQuestions.length;
  const totalMarks = totalQuestions * getMarksMultiplier();
  const errorCount = parsedQuestions.filter(q => q.hasError).length;
  const validCount = totalQuestions - errorCount;

  // Process file (shared between click upload and drag-drop)
  const processFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    try {
      const XLSX = await import("xlsx");
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const binaryStr = evt.target.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

          const questions = [];
          const errors = [];

          rawData.forEach((row, idx) => {
            const rowNum = idx + 2;
            const rowErrors = [];
            const nr = {};
            Object.keys(row).forEach(key => { nr[key.toLowerCase().trim()] = row[key]; });

            const question = nr["question"] || nr["questions"] || nr["question_text"] || "";
            const optionA = nr["option a"] || nr["optiona"] || nr["option_a"] || nr["a"] || "";
            const optionB = nr["option b"] || nr["optionb"] || nr["option_b"] || nr["b"] || "";
            const optionC = nr["option c"] || nr["optionc"] || nr["option_c"] || nr["c"] || "";
            const optionD = nr["option d"] || nr["optiond"] || nr["option_d"] || nr["d"] || "";
            const answer = (nr["answer"] || nr["correct_answer"] || nr["ans"] || "").toString().trim().toUpperCase();
            const difficulty = nr["difficulty"] || nr["level"] || "Medium";
            const subject = nr["subject"] || "";
            const topic = nr["topic"] || "";

            if (!question.toString().trim()) rowErrors.push(`Row ${rowNum}: Question text is empty`);
            if (!optionA.toString().trim()) rowErrors.push(`Row ${rowNum}: Option A is empty`);
            if (!optionB.toString().trim()) rowErrors.push(`Row ${rowNum}: Option B is empty`);
            if (!answer || !["A", "B", "C", "D"].includes(answer.charAt(0))) {
              rowErrors.push(`Row ${rowNum}: Answer must be A, B, C, or D (got "${answer}")`);
            }

            questions.push({
              question: question.toString().trim(),
              optionA: optionA.toString().trim(),
              optionB: optionB.toString().trim(),
              optionC: optionC.toString().trim(),
              optionD: optionD.toString().trim(),
              answer: ["A", "B", "C", "D"].includes(answer.charAt(0)) ? answer.charAt(0) : "A",
              difficulty: ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium",
              subject: subject.toString().trim(),
              topic: topic.toString().trim(),
              hasError: rowErrors.length > 0
            });
            errors.push(...rowErrors);
          });

          setParsedQuestions(questions);
          setParseErrors(errors);
          setUploadStep("preview");
        } catch (parseErr) {
          console.error("Parse error:", parseErr);
          setParseErrors(["Failed to parse the Excel file. Please check the format."]);
          setUploadStep("preview");
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error("Import error:", err);
    }
  };

  const handleFileUpload = (e) => processFile(e.target.files[0]);

  // Drag & drop handlers
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      processFile(file);
    }
  };

  const handleQuestionEdit = (index, field, value) => {
    const updated = [...parsedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    const q = updated[index];
    updated[index].hasError = !q.question.trim() || !q.optionA.trim() || !q.optionB.trim() || !["A", "B", "C", "D"].includes(q.answer);
    setParsedQuestions(updated);
  };

  const handleQuestionDelete = (index) => {
    setParsedQuestions(parsedQuestions.filter((_, i) => i !== index));
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (!formData.title.trim()) { setSubmitMessage({ type: "error", text: "Test title is required" }); return; }
    if (!formData.testDate) { setSubmitMessage({ type: "error", text: "Test date is required" }); return; }
    if (!formData.duration || formData.duration <= 0) { setSubmitMessage({ type: "error", text: "Duration must be greater than 0" }); return; }
    if (parsedQuestions.length === 0) { setSubmitMessage({ type: "error", text: "No questions to submit" }); return; }
    if (errorCount > 0) { setSubmitMessage({ type: "error", text: `${errorCount} question(s) still have errors` }); return; }

    setIsSubmitting(true);
    setSubmitMessage({ type: "", text: "" });

    try {
      const payload = {
        title: formData.title,
        testType: formData.testType,
        testDate: formData.testDate,
        duration: parseInt(formData.duration),
        assignedBatches: formData.assignedBatches,
        instructions: formData.instructions,
        questions: parsedQuestions
      };

      if (isEditMode && editTestId) {
        await updateTest(editTestId, payload);
        setSubmitMessage({ type: "success", text: "Test updated successfully!" });
      } else {
        await createTest(payload);
        setSubmitMessage({ type: "success", text: "Test created successfully!" });
      }
      setTimeout(() => { resetForm(); fetchTests(); }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save test";
      setSubmitMessage({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", testType: "Full Syllabus", testDate: "", duration: "", assignedBatches: [], instructions: "" });
    setParsedQuestions([]); setParseErrors([]); setFileName(""); setUploadStep("form");
    setEditingIndex(null); setSubmitMessage({ type: "", text: "" });
    setShowCreateModal(false); setIsEditMode(false); setEditTestId(null);
  };

  // View test details
  const handleViewTest = async (test) => {
    setShowViewModal(true);
    setIsLoadingView(true);
    try {
      const { data } = await getTestById(test.id);
      setViewTest(data.test);
      setViewQuestions(data.questionsList || []);
    } catch (err) {
      console.error("Failed to load test:", err);
    } finally {
      setIsLoadingView(false);
    }
  };

  // Edit test — load data into form
  const handleEditTest = async (test) => {
    if (test.status !== "Scheduled") return;
    setIsEditMode(true);
    setEditTestId(test.id);
    try {
      const { data } = await getTestById(test.id);
      const t = data.test;
      setFormData({
        title: t.title,
        testType: t.type,
        testDate: t.date ? new Date(t.date).toISOString().split("T")[0] : "",
        duration: t.duration.toString(),
        assignedBatches: t.assignedTo ? t.assignedTo.split(", ").filter(Boolean) : [],
        instructions: t.instructions || "",
      });
      const qs = (data.questionsList || []).map(q => ({
        ...q,
        hasError: false
      }));
      setParsedQuestions(qs);
      setUploadStep("form");
      setShowCreateModal(true);
    } catch (err) {
      console.error("Failed to load test for edit:", err);
    }
  };

  // Delete
  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTest(testToDelete.id);
      setTests(tests.filter(t => t.id !== testToDelete.id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false); setShowDeleteConfirm(false); setTestToDelete(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tests</h1>
          <p className="text-gray-500 mt-1">Create, schedule, and manage tests</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchTests} className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
            <Plus size={18} /> Create New Test
          </button>
        </div>
      </div>

      {/* Tests Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileSpreadsheet size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No tests created yet</h3>
          <p className="text-gray-400 mb-4">Click "Create New Test" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {tests.map(test => (
            <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{test.title}</h3>
                  <p className="text-sm text-gray-500">{test.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${test.status === "Active" ? "bg-green-100 text-green-600" :
                    test.status === "Scheduled" ? "bg-yellow-100 text-yellow-600" :
                      "bg-gray-100 text-gray-600"
                  }`}>{test.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-600">{test.date ? new Date(test.date).toLocaleDateString("en-IN") : "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-gray-600">{test.duration} min</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-gray-600">{test.assignedTo || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 size={16} className="text-gray-400" />
                  <span className="text-gray-600">{test.questions} Q • {test.totalMarks} marks</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500">Created: <span className="font-medium text-gray-700">{test.createdAt ? new Date(test.createdAt).toLocaleDateString("en-IN") : "—"}</span></p>
                <div className="flex gap-2">
                  <button onClick={() => handleViewTest(test)} className="p-2 hover:bg-gray-100 rounded-lg" title="View Details">
                    <Eye size={18} className="text-purple-500" />
                  </button>
                  {test.status === "Scheduled" && (
                    <button onClick={() => handleEditTest(test)} className="p-2 hover:bg-gray-100 rounded-lg" title="Edit Test">
                      <Edit size={18} className="text-blue-500" />
                    </button>
                  )}
                  <button onClick={() => { setTestToDelete(test); setShowDeleteConfirm(true); }} className="p-2 hover:bg-gray-100 rounded-lg" title="Delete">
                    <Trash size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========= CREATE / EDIT TEST MODAL ========= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? "Edit Test" : uploadStep === "form" ? "Create New Test" : uploadStep === "preview" ? "Review Parsed Questions" : "Confirm & Create Test"}
                </h2>
                {uploadStep !== "form" && (
                  <p className="text-sm text-gray-500 mt-1">
                    {totalQuestions} questions • {totalMarks} marks ({getMarksMultiplier()}× per question) • {errorCount} errors
                  </p>
                )}
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
            </div>

            {submitMessage.text && (
              <div className={`mx-6 mt-4 p-3 rounded-lg border flex items-center gap-2 ${submitMessage.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                }`}>
                {submitMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <p className="text-sm">{submitMessage.text}</p>
              </div>
            )}

            {/* STEP: FORM */}
            {uploadStep === "form" && (
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Test Title *</label>
                      <input type="text" name="title" value={formData.title} onChange={handleFormChange}
                        className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g., JEE Advanced Mock #1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Test Type</label>
                      <select name="testType" value={formData.testType} onChange={handleFormChange}
                        className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                        <option>Full Syllabus</option><option>Topic Test</option><option>Practice Test</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date *</label>
                      <input type="date" name="testDate" value={formData.testDate} onChange={handleFormChange}
                        min={todayStr}
                        className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Duration (minutes) *</label>
                      <input type="number" name="duration" value={formData.duration} onChange={handleFormChange} min="1"
                        className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="180" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Questions</label>
                      <input type="text" value={parsedQuestions.length > 0 ? parsedQuestions.length : "Auto-filled from Excel"} disabled
                        className="w-full mt-1 p-3 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Total Marks <span className="text-xs text-gray-400">(Q × {getMarksMultiplier()})</span>
                      </label>
                      <input type="text" value={parsedQuestions.length > 0 ? totalMarks : "Auto-calculated"} disabled
                        className="w-full mt-1 p-3 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>

                  {/* Batch selector */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assign to Batches</label>
                    <div className="mt-2 flex gap-3">
                      {["JEE Advanced", "JEE Main", "NEET", "CET"].map(batch => (
                        <button key={batch} type="button" onClick={() => handleBatchToggle(batch)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${formData.assignedBatches.includes(batch) ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}>{batch}</button>
                      ))}
                    </div>
                    {formData.assignedBatches.length === 1 && formData.assignedBatches[0] === "CET" && (
                      <p className="text-xs text-blue-500 mt-1">CET: Marks = Questions × 2</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Test Instructions</label>
                    <textarea name="instructions" value={formData.instructions} onChange={handleFormChange} rows="3"
                      className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter test instructions..." />
                  </div>

                  {/* File Upload — full area clickable + drag-and-drop */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Upload Questions (Excel) {!isEditMode && "*"}</label>
                    <p className="text-xs text-gray-400 mb-2">
                      Columns: Question, Option A, Option B, Option C, Option D, Answer (A/B/C/D), Difficulty, Subject, Topic
                    </p>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition cursor-pointer ${isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-500 bg-gray-50"
                        }`}
                    >
                      <div className="space-y-1 text-center">
                        <Upload className={`mx-auto h-12 w-12 ${isDragging ? "text-purple-500" : "text-gray-400"}`} />
                        <p className="text-sm font-medium text-purple-600">{fileName || "Click to upload or drag and drop"}</p>
                        <p className="text-xs text-gray-500">.xlsx, .xls, or .csv up to 10MB</p>
                        {isEditMode && parsedQuestions.length > 0 && !fileName && (
                          <p className="text-xs text-green-600 font-medium">{parsedQuestions.length} questions loaded from existing test</p>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP: PREVIEW */}
            {uploadStep === "preview" && (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                    <p className="text-xs text-gray-500">Total Extracted</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{validCount}</p>
                    <p className="text-xs text-gray-500">Valid</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                    <p className="text-xs text-gray-500">With Errors</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{totalMarks}</p>
                    <p className="text-xs text-gray-500">Total Marks ({getMarksMultiplier()}×)</p>
                  </div>
                </div>

                {parseErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-700 mb-1 text-sm">Parse Warnings ({parseErrors.length})</h4>
                    <div className="max-h-24 overflow-y-auto">
                      {parseErrors.map((err, i) => (<p key={i} className="text-xs text-red-600">{err}</p>))}
                    </div>
                  </div>
                )}

                <div className="bg-white border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left font-medium text-gray-600 w-8">#</th>
                        <th className="p-3 text-left font-medium text-gray-600">Question</th>
                        <th className="p-3 text-left font-medium text-gray-600 w-16">Ans</th>
                        <th className="p-3 text-left font-medium text-gray-600 w-20">Diff</th>
                        <th className="p-3 text-left font-medium text-gray-600 w-24">Subject</th>
                        <th className="p-3 text-left font-medium text-gray-600 w-24">Topic</th>
                        <th className="p-3 text-left font-medium text-gray-600 w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedQuestions.map((q, idx) => (
                        <tr key={idx} className={`border-b ${q.hasError ? "bg-red-50" : "hover:bg-gray-50"}`}>
                          {editingIndex === idx ? (
                            <>
                              <td className="p-2 text-gray-400">{idx + 1}</td>
                              <td className="p-2" colSpan={5}>
                                <div className="space-y-2">
                                  <input className="w-full p-2 border rounded text-sm" value={q.question} onChange={e => handleQuestionEdit(idx, "question", e.target.value)} placeholder="Question" />
                                  <div className="grid grid-cols-2 gap-2">
                                    <input className="p-2 border rounded text-sm" value={q.optionA} onChange={e => handleQuestionEdit(idx, "optionA", e.target.value)} placeholder="Option A" />
                                    <input className="p-2 border rounded text-sm" value={q.optionB} onChange={e => handleQuestionEdit(idx, "optionB", e.target.value)} placeholder="Option B" />
                                    <input className="p-2 border rounded text-sm" value={q.optionC} onChange={e => handleQuestionEdit(idx, "optionC", e.target.value)} placeholder="Option C" />
                                    <input className="p-2 border rounded text-sm" value={q.optionD} onChange={e => handleQuestionEdit(idx, "optionD", e.target.value)} placeholder="Option D" />
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    <select className="p-2 border rounded text-sm" value={q.answer} onChange={e => handleQuestionEdit(idx, "answer", e.target.value)}>
                                      <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                    </select>
                                    <select className="p-2 border rounded text-sm" value={q.difficulty} onChange={e => handleQuestionEdit(idx, "difficulty", e.target.value)}>
                                      <option>Easy</option><option>Medium</option><option>Hard</option>
                                    </select>
                                    <input className="p-2 border rounded text-sm" value={q.subject} onChange={e => handleQuestionEdit(idx, "subject", e.target.value)} placeholder="Subject" />
                                    <input className="p-2 border rounded text-sm" value={q.topic} onChange={e => handleQuestionEdit(idx, "topic", e.target.value)} placeholder="Topic" />
                                  </div>
                                </div>
                              </td>
                              <td className="p-2"><button onClick={() => setEditingIndex(null)} className="p-1 bg-green-100 text-green-600 rounded text-xs font-medium">Done</button></td>
                            </>
                          ) : (
                            <>
                              <td className="p-3 text-gray-400">{idx + 1}</td>
                              <td className="p-3">
                                <p className="text-gray-800 truncate max-w-xs">{q.question || <span className="text-red-400 italic">Empty</span>}</p>
                                <p className="text-xs text-gray-400 mt-0.5">A: {q.optionA?.slice(0, 20) || "—"} | B: {q.optionB?.slice(0, 20) || "—"}</p>
                              </td>
                              <td className="p-3 font-bold text-purple-600">{q.answer}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${q.difficulty === "Easy" ? "bg-green-100 text-green-600" :
                                    q.difficulty === "Hard" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                                  }`}>{q.difficulty}</span>
                              </td>
                              <td className="p-3 text-gray-600 text-xs">{q.subject || "—"}</td>
                              <td className="p-3 text-gray-600 text-xs">{q.topic || "—"}</td>
                              <td className="p-3">
                                <div className="flex gap-1">
                                  <button onClick={() => setEditingIndex(idx)} className="p-1 hover:bg-gray-100 rounded" title="Edit"><Edit size={14} className="text-blue-500" /></button>
                                  <button onClick={() => handleQuestionDelete(idx)} className="p-1 hover:bg-gray-100 rounded" title="Delete"><Trash size={14} className="text-red-500" /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP: CONFIRM */}
            {uploadStep === "confirm" && (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Test Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Title:</span><span className="font-medium">{formData.title}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="font-medium">{formData.testType}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Date:</span><span className="font-medium">{formData.testDate}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Duration:</span><span className="font-medium">{formData.duration} min</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Total Questions:</span><span className="font-bold text-purple-600">{totalQuestions}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Total Marks:</span><span className="font-bold text-purple-600">{totalMarks} ({getMarksMultiplier()}× per Q)</span></div>
                    <div className="flex justify-between col-span-2"><span className="text-gray-500">Assigned To:</span><span className="font-medium">{formData.assignedBatches.join(", ") || "None"}</span></div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 mb-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={20} />
                    <p className="font-medium">Ready! {totalQuestions} questions will be stored.</p>
                  </div>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b"><h4 className="font-medium text-gray-700 text-sm">Questions Preview (first 5)</h4></div>
                  <div className="divide-y">
                    {parsedQuestions.slice(0, 5).map((q, i) => (
                      <div key={i} className="p-3 flex items-center gap-3">
                        <span className="text-xs bg-purple-100 text-purple-600 w-6 h-6 rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 truncate">{q.question}</p>
                          <p className="text-xs text-gray-400">Ans: {q.answer} • {q.difficulty} • {q.subject}</p>
                        </div>
                      </div>
                    ))}
                    {totalQuestions > 5 && <div className="p-3 text-center text-xs text-gray-400">... and {totalQuestions - 5} more</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t flex gap-3 shrink-0">
              {uploadStep === "form" && (
                <>
                  <button type="button" onClick={resetForm} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={() => {
                    if (parsedQuestions.length > 0) setUploadStep("preview");
                    else setSubmitMessage({ type: "error", text: "Please upload an Excel file with questions first" });
                  }} className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                    Next: Review Questions →
                  </button>
                </>
              )}
              {uploadStep === "preview" && (
                <>
                  <button type="button" onClick={() => setUploadStep("form")} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={() => {
                    if (errorCount > 0) setSubmitMessage({ type: "error", text: `Fix ${errorCount} error(s) before proceeding` });
                    else { setSubmitMessage({ type: "", text: "" }); setUploadStep("confirm"); }
                  }} className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2">
                    Next: Confirm <ChevronRight size={16} />
                  </button>
                </>
              )}
              {uploadStep === "confirm" && (
                <>
                  <button type="button" onClick={() => setUploadStep("preview")} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={handleSubmitTest} disabled={isSubmitting}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50">
                    <CheckCircle size={16} /> {isSubmitting ? "Saving..." : isEditMode ? "Update Test" : "Confirm & Create Test"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========= VIEW TEST DETAIL MODAL ========= */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-gray-800">{viewTest?.title || "Test Details"}</h2>
              <button onClick={() => { setShowViewModal(false); setViewTest(null); setViewQuestions([]); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {isLoadingView ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
              </div>
            ) : viewTest && (
              <div className="flex-1 overflow-y-auto p-6">
                {/* Test Info */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <Hash size={20} className="mx-auto text-purple-500 mb-1" />
                    <p className="text-xl font-bold text-purple-600">{viewTest.questions}</p>
                    <p className="text-xs text-gray-500">Questions</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <Award size={20} className="mx-auto text-blue-500 mb-1" />
                    <p className="text-xl font-bold text-blue-600">{viewTest.totalMarks}</p>
                    <p className="text-xs text-gray-500">Total Marks</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <Users size={20} className="mx-auto text-green-500 mb-1" />
                    <p className="text-xl font-bold text-green-600">{Math.floor(Math.random() * 200 + 50)}</p>
                    <p className="text-xs text-gray-500">Attempts</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <BarChart3 size={20} className="mx-auto text-orange-500 mb-1" />
                    <p className="text-xl font-bold text-orange-600">{(Math.random() * 30 + 55).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Avg Score</p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="font-medium">{viewTest.type}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Date:</span><span className="font-medium">{viewTest.date ? new Date(viewTest.date).toLocaleDateString("en-IN") : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Duration:</span><span className="font-medium">{viewTest.duration} min</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Assigned To:</span><span className="font-medium">{viewTest.assignedTo || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${viewTest.status === "Active" ? "bg-green-100 text-green-600" :
                          viewTest.status === "Scheduled" ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"
                        }`}>{viewTest.status}</span>
                    </div>
                    {viewTest.instructions && (
                      <div className="col-span-2"><span className="text-gray-500">Instructions:</span><p className="text-gray-700 mt-1">{viewTest.instructions}</p></div>
                    )}
                  </div>
                </div>

                {/* Questions List */}
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen size={18} className="text-purple-500" />
                  All Questions ({viewQuestions.length})
                </h3>
                <div className="space-y-3">
                  {viewQuestions.map((q, idx) => (
                    <div key={q.id} className="bg-white border rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-xs bg-purple-100 text-purple-600 w-7 h-7 rounded-full flex items-center justify-center font-bold mt-0.5 shrink-0">{idx + 1}</span>
                          <p className="text-sm font-medium text-gray-800">{q.question}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${q.difficulty === "Easy" ? "bg-green-100 text-green-600" :
                              q.difficulty === "Hard" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                            }`}>{q.difficulty}</span>
                          {q.subject && <span className="text-xs text-gray-400">{q.subject}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 ml-10">
                        {["A", "B", "C", "D"].map(opt => {
                          const optVal = q[`option${opt}`];
                          const isCorrect = q.answer === opt;
                          return (
                            <div key={opt} className={`text-sm p-2 rounded-lg border ${isCorrect ? "bg-green-50 border-green-300 text-green-700 font-medium" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                              <span className="font-bold mr-1">{opt}.</span> {optVal}
                              {isCorrect && <span className="text-xs ml-1 font-bold">✓</span>}
                            </div>
                          );
                        })}
                      </div>
                      {q.topic && <p className="text-xs text-gray-400 ml-10 mt-2">Topic: {q.topic}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t flex justify-between shrink-0">
              {viewTest?.status === "Scheduled" && (
                <button onClick={() => { setShowViewModal(false); handleEditTest(viewTest); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
                  <Edit size={16} /> Edit Test
                </button>
              )}
              {viewTest?.status !== "Scheduled" && (
                <p className="text-xs text-gray-400 italic self-center">
                  {viewTest?.status === "Active" ? "Cannot edit active tests" : "Cannot edit completed tests"}
                </p>
              )}
              <button onClick={() => { setShowViewModal(false); setViewTest(null); setViewQuestions([]); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ========= DELETE CONFIRM ========= */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Deletion</h2>
            <p className="text-gray-500 text-sm mb-6">
              Delete <span className="font-semibold text-gray-700">{testToDelete?.title}</span>? This will remove all questions too.
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setTestToDelete(null); }} disabled={isDeleting}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleDeleteTest} disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-sm shadow-red-600/20 transition disabled:opacity-50">
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;