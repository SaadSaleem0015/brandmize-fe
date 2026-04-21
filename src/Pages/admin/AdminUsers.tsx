import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Calendar,
  Shield,
  UserCheck,
  UserX,
  TrendingUp,
  ChevronDown,
  Eye,
  Edit,
  Ban,
  Trash2,
  Download
} from "lucide-react";
import { api } from "../../Helpers/BackendRequest";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<User[]>("/admin/users");
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError(err.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...users];

    // Apply search
    if (searchQuery) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        result = result.filter(user => user.is_active);
      } else if (statusFilter === "inactive") {
        result = result.filter(user => !user.is_active);
      } else if (statusFilter === "verified") {
        result = result.filter(user => user.email_verified);
      } else if (statusFilter === "unverified") {
        result = result.filter(user => !user.email_verified);
      }
    }

    setFilteredUsers(result);
  }, [searchQuery, roleFilter, statusFilter, users]);

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    verified: users.filter(u => u.email_verified).length,
    admins: users.filter(u => u.role === "admin").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Users</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage and monitor all registered users</p>
              </div>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export Users
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>All registered accounts</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(stats.active / stats.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{Math.round((stats.active / stats.total) * 100)}% of total</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Email Verified</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.verified}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(stats.verified / stats.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{Math.round((stats.verified / stats.total) * 100)}% verified</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Administrators</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.admins}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-3.5 h-3.5" />
              <span>With admin privileges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-all min-w-[140px]"
              >
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="flex-1 text-left">
                  {roleFilter === "all" ? "All Roles" : roleFilter}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRoleDropdown ? "rotate-180" : ""}`} />
              </button>
              {showRoleDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowRoleDropdown(false)} />
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1">
                    {["all", "admin", "user"].map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setRoleFilter(role);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          roleFilter === role ? "text-primary-600 bg-primary-50" : "text-gray-700"
                        }`}
                      >
                        {role === "all" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-all min-w-[140px]"
              >
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="flex-1 text-left">
                  {statusFilter === "all" ? "All Status" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`} />
              </button>
              {showStatusDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowStatusDropdown(false)} />
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1">
                    {["all", "active", "inactive", "verified", "unverified"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          statusFilter === status ? "text-primary-600 bg-primary-50" : "text-gray-700"
                        }`}
                      >
                        {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Active Filters Indicator */}
            {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700">{filteredUsers.length}</span> of{" "}
            <span className="font-medium text-gray-700">{users.length}</span> users
          </p>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-700">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {user.is_active ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      user.email_verified
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {user.email_verified ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Mail className="w-3 h-3" />
                      )}
                      {user.email_verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {showActionMenu === user.id && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setShowActionMenu(null)} />
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-200 z-30 py-1">
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Edit className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                              <Ban className="w-3.5 h-3.5" />
                              Suspend
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-700 mb-1">No users found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}