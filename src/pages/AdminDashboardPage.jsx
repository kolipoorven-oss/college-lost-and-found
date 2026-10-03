import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Flag,
  BarChart3,
  RotateCcw,
  Check,
  X
} from 'lucide-react';

export default function AdminDashboardPage({ setActivePage, setSelectedItem }) {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reports' | 'users' | 'flagged'
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [flaggedReports, setFlaggedReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for items tab
  const [itemSearch, setItemSearch] = useState('');
  const [itemType, setItemType] = useState('all');
  const [itemStatus, setItemStatus] = useState('all');

  // Filters for users tab
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('all');

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, itemsRes, usersRes, flaggedRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/items', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/reports', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setItems(data.items || []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsersList(data.users || []);
      }
      if (flaggedRes.ok) {
        const data = await flaggedRes.json();
        setFlaggedReports(data.reports || []);
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Handle status update of an item
  const handleItemStatusChange = async (itemId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/items/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle delete item by admin
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Admin confirmation: Permanently remove this item and related matches?')) return;
    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle user status toggle
  const handleToggleUserStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle flagged report moderation action
  const handleFlagAction = async (reportId, action) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Re-seed demo database
  const handleReseed = async () => {
    if (!window.confirm('Reset all lost & found items and test users to initial presentation seed data?')) return;
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        alert('Database restored to sample college dataset!');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500">
          This dashboard is reserved for authorized campus safety administrators.
        </p>
        <button
          onClick={() => setActivePage('login')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In with Admin Account
        </button>
      </div>
    );
  }

  // Filter items
  const filteredItems = items.filter(i => {
    if (itemType !== 'all' && i.type !== itemType) return false;
    if (itemStatus !== 'all' && i.status !== itemStatus) return false;
    if (itemSearch.trim()) {
      const q = itemSearch.toLowerCase();
      return i.title.toLowerCase().includes(q) || 
             i.location.toLowerCase().includes(q) || 
             i.user_name.toLowerCase().includes(q) ||
             i.user_college_id.toLowerCase().includes(q);
    }
    return true;
  });

  // Filter users
  const filteredUsers = usersList.filter(u => {
    if (userRole !== 'all' && u.role !== userRole) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || 
             u.email.toLowerCase().includes(q) || 
             u.college_id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-400/30">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>CAMPUS SECURITY & RECOVERY OPERATIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs text-slate-300">
            Moderation, student verification, inventory oversight, and algorithmic matching metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReseed}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Reset database to demo sample records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            title="Refresh All Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'overview', label: 'Analytics & Overview', icon: BarChart3 },
          { key: 'reports', label: `All Reports (${items.length})`, icon: FileText },
          { key: 'users', label: `User Management (${usersList.length})`, icon: Users },
          { key: 'flagged', label: `Flagged Queue (${flaggedReports.filter(r => r.status === 'pending').length})`, icon: Flag },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === t.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-slate-500">Total Registered Users</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{stats.summary.totalUsers}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Students, faculty & staff</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-slate-500">Active Reports</span>
              <div className="text-3xl font-black text-cyan-600 mt-1">{stats.summary.totalActive}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">{stats.summary.totalLost} Lost / {stats.summary.totalFound} Found</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-slate-500">Recovered Items</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">{stats.summary.totalRecovered}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">{stats.summary.recoveryRate}% Recovery success rate</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-slate-500">Smart Matches Generated</span>
              <div className="text-3xl font-black text-purple-600 flex items-center gap-1 mt-1">
                <span>{stats.summary.totalMatches}</span>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">High confidence cross-matches</p>
            </div>
          </div>

          {/* Breakdown Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Reports by Item Category
              </h3>

              <div className="space-y-3">
                {stats.categories.map(c => {
                  const pct = Math.round((c.count / (stats.summary.totalReports || 1)) * 100);
                  return (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{c.category}</span>
                        <span>{c.count} items ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Campus Locations Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Top Campus Loss / Recovery Locations
              </h3>

              <div className="space-y-3">
                {stats.locations.map(loc => (
                  <div key={loc.location} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-medium text-slate-800 truncate mr-2">{loc.location}</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0">
                      {loc.count} {loc.count === 1 ? 'report' : 'reports'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: ALL REPORTS MODERATION */}
      {activeTab === 'reports' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Search reports by title, location, reporter name, ID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="all">All Types</option>
                <option value="lost">Lost Only</option>
                <option value="found">Found Only</option>
              </select>

              <select
                value={itemStatus}
                onChange={(e) => setItemStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">In Review</option>
                <option value="recovered">Recovered</option>
                <option value="returned">Returned</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Reporter</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 max-w-[200px] truncate">
                        {item.title}
                        {item.flag_count > 0 && (
                          <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                            Flagged
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          item.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">{item.category}</td>
                      <td className="p-3.5 text-slate-600 truncate max-w-[150px]">{item.location}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{item.user_name}</div>
                        <div className="text-[10px] text-slate-400">{item.user_college_id}</div>
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={item.status}
                            onChange={(e) => handleItemStatusChange(item.id, e.target.value)}
                            className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium"
                          >
                            <option value="active">Active</option>
                            <option value="pending">In Review</option>
                            <option value="recovered">Recovered</option>
                            <option value="returned">Returned</option>
                            <option value="rejected">Reject</option>
                          </select>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search campus members by name, email, student ID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="staff">Staff / Faculty</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Campus Member</th>
                    <th className="p-3.5">College ID</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Reports Logged</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{u.college_id}</td>
                      <td className="p-3.5 text-slate-600">{u.department || 'Campus'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' 
                            ? 'bg-slate-900 text-white' 
                            : u.role === 'staff' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {u.lost_count} Lost / {u.found_count} Found
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {u.id !== user.id && (
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              u.status === 'active'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FLAGGED CONTENT QUEUE */}
      {activeTab === 'flagged' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Flagged Reports Queue</h3>
            <p className="text-xs text-slate-500">
              Community reports submitted by students regarding suspicious, duplicate, or offensive listings.
            </p>
          </div>

          {flaggedReports.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Pending Flags</h4>
              <p className="text-xs text-slate-400">All student reports have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flaggedReports.map(report => (
                <div key={report.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-xs font-bold uppercase">
                        {report.reason}
                      </span>
                      <span className="text-xs text-slate-400">
                        Reported by {report.reporter_name} ({report.reporter_college_id})
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-start gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Target Item:</span>
                      <h4 className="font-bold text-slate-900 text-sm">{report.item_title}</h4>
                      <p className="text-xs text-slate-500">Posted by {report.owner_name} ({report.owner_college_id})</p>
                      {report.details && (
                        <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-2">
                          <strong>Note:</strong> {report.details}
                        </p>
                      )}
                    </div>
                  </div>

                  {report.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleFlagAction(report.id, 'dismiss')}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleFlagAction(report.id, 'resolve_and_delete_item')}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        Remove Reported Item
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-xs text-slate-400 font-semibold uppercase">
                      Status: {report.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
