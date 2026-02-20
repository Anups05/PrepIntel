import React from "react";
import { Plus, Edit, Trash, Copy, Eye, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ManageTests = () => {
  const navigate = useNavigate();

  const tests = [
    { id: 1, title: "JEE Advanced Mock #1", subject: "Multi", questions: 60, duration: 180, attempts: 234, status: "Active" },
    { id: 2, title: "Physics: Mechanics", subject: "Physics", questions: 30, duration: 60, attempts: 156, status: "Active" },
    { id: 3, title: "Chemistry: Organic", subject: "Chemistry", questions: 25, duration: 45, attempts: 89, status: "Draft" },
    { id: 4, title: "Mathematics: Calculus", subject: "Math", questions: 20, duration: 40, attempts: 67, status: "Active" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Tests</h1>
          <p className="text-gray-500">Create and manage all test papers</p>
        </div>
        <button 
          onClick={() => navigate("/admin/tests/create")}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <Plus size={18} />
          Create New Test
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search tests..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Test Title</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Subject</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Questions</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Duration</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Attempts</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr key={test.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{test.title}</td>
                <td className="p-4">{test.subject}</td>
                <td className="p-4">{test.questions}</td>
                <td className="p-4">{test.duration} min</td>
                <td className="p-4">{test.attempts}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    test.status === "Active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {test.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                      <Edit size={16} className="text-blue-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="Copy">
                      <Copy size={16} className="text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="Delete">
                      <Trash size={16} className="text-red-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="Preview">
                      <Eye size={16} className="text-purple-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageTests;