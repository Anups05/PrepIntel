import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye, 
  UserPlus,
  Download,
  Mail,
  Shield,
  User,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  // Mock users data
  const users = [
    { 
      id: 1, 
      name: "Arjun Reddy", 
      email: "arjun.reddy@example.com", 
      role: "student", 
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2024-02-20",
      testsTaken: 45,
      avgScore: 78,
      streak: 14,
      avatar: "AR"
    },
    { 
      id: 2, 
      name: "Priya Sharma", 
      email: "priya.sharma@example.com", 
      role: "student", 
      status: "active",
      joinDate: "2024-01-20",
      lastActive: "2024-02-20",
      testsTaken: 38,
      avgScore: 82,
      streak: 21,
      avatar: "PS"
    },
    { 
      id: 3, 
      name: "Rahul Verma", 
      email: "rahul.verma@example.com", 
      role: "student", 
      status: "inactive",
      joinDate: "2023-12-10",
      lastActive: "2024-02-01",
      testsTaken: 12,
      avgScore: 65,
      streak: 0,
      avatar: "RV"
    },
    { 
      id: 4, 
      name: "Neha Gupta", 
      email: "neha.gupta@example.com", 
      role: "student", 
      status: "active",
      joinDate: "2024-02-01",
      lastActive: "2024-02-19",
      testsTaken: 8,
      avgScore: 71,
      streak: 5,
      avatar: "NG"
    },
    { 
      id: 5, 
      name: "Amit Kumar", 
      email: "amit.kumar@example.com", 
      role: "admin", 
      status: "active",
      joinDate: "2023-11-01",
      lastActive: "2024-02-20",
      testsTaken: 0,
      avgScore: 0,
      streak: 0,
      avatar: "AK"
    },
    { 
      id: 6, 
      name: "Sneha Patel", 
      email: "sneha.patel@example.com", 
      role: "student", 
      status: "active",
      joinDate: "2024-01-05",
      lastActive: "2024-02-18",
      testsTaken: 28,
      avgScore: 88,
      streak: 12,
      avatar: "SP"
    },
    { 
      id: 7, 
      name: "Vikram Singh", 
      email: "vikram.singh@example.com", 
      role: "student", 
      status: "suspended",
      joinDate: "2023-12-20",
      lastActive: "2024-01-15",
      testsTaken: 5,
      avgScore: 45,
      streak: 0,
      avatar: "VS"
    },
    { 
      id: 8, 
      name: "Divya Joshi", 
      email: "divya.joshi@example.com", 
      role: "student", 
      status: "active",
      joinDate: "2024-01-25",
      lastActive: "2024-02-19",
      testsTaken: 18,
      avgScore: 79,
      streak: 8,
      avatar: "DJ"
    },
  ];

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const usersPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const studentsCount = users.filter(u => u.role === "student").length;
  const avgScore = Math.round(users.filter(u => u.role === "student").reduce((acc, u) => acc + u.avgScore, 0) / studentsCount);

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setShowUserModal(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setShowUserModal(true);
  };

  const confirmDelete = () => {
    // Here you would call API to delete user
    console.log("Deleting user:", selectedUser);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    // Here you would call API to save/update user
    console.log("Saving user:", selectedUser);
    setShowUserModal(false);
    setSelectedUser(null);
    setIsEditing(false);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "active":
        return <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Active</span>;
      case "inactive":
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Inactive</span>;
      case "suspended":
        return <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">Suspended</span>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">Admin</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">Student</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <p className="text-gray-500">View and manage all student and admin accounts</p>
        </div>
        <button 
          onClick={handleAddUser}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 rounded-xl">
              <User className="text-purple-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold">{totalUsers}</h3>
          </div>
          <p className="text-gray-500 text-sm">Total Users</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-xl">
              <User className="text-green-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold">{activeUsers}</h3>
          </div>
          <p className="text-gray-500 text-sm">Active Users</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-xl">
              <User className="text-blue-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold">{studentsCount}</h3>
          </div>
          <p className="text-gray-500 text-sm">Total Students</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Award className="text-orange-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold">{avgScore}%</h3>
          </div>
          <p className="text-gray-500 text-sm">Avg. Student Score</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-600">User</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Role</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Join Date</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Tests Taken</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Avg. Score</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Streak</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold">{user.avatar}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">{getRoleBadge(user.role)}</td>
                <td className="p-4">{getStatusBadge(user.status)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm">{new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="p-4 font-medium">{user.testsTaken}</td>
                <td className="p-4">
                  {user.role === "student" ? (
                    <span className={`font-medium ${
                      user.avgScore >= 80 ? "text-green-600" : 
                      user.avgScore >= 60 ? "text-orange-600" : "text-red-600"
                    }`}>
                      {user.avgScore}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="p-4">
                  {user.role === "student" ? (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{user.streak}</span>
                      <span className="text-orange-500">🔥</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit User"
                    >
                      <Edit size={16} className="text-blue-500" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      title="View Details"
                    >
                      <Eye size={16} className="text-purple-500" />
                    </button>
                    <button 
                      onClick={() => handleDelete(user)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Delete User"
                    >
                      <Trash size={16} className="text-red-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Mail size={16} className="text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Delete User</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-bold">{selectedUser?.name}</span>? 
              This action cannot be undone and all user data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{isEditing ? "Edit User" : "Add New User"}</h3>
              <button onClick={() => setShowUserModal(false)}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser?.name || ""}
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedUser?.email || ""}
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Enter email"
                    required
                  />
                </div>

                {!isEditing && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <select 
                      defaultValue={selectedUser?.role || "student"}
                      className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select 
                      defaultValue={selectedUser?.status || "active"}
                      className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">User Statistics</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Tests Taken: <span className="font-bold">{selectedUser?.testsTaken}</span></div>
                      <div>Avg Score: <span className="font-bold">{selectedUser?.avgScore}%</span></div>
                      <div>Join Date: <span className="font-bold">{selectedUser?.joinDate}</span></div>
                      <div>Streak: <span className="font-bold">{selectedUser?.streak} days</span></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 py-3 border rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                  >
                    {isEditing ? "Update User" : "Add User"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;