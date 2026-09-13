// src/pages/admin/Approvals.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const Approvals = () => {
  const { api } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending_count: 0 });

  useEffect(() => {
    fetchPendingUsers();
    fetchPendingCount();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/auth/pending-approvals');
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await api.get('/auth/pending-count');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch count:', error);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this user?')) return;
    
    try {
      await api.put(`/auth/approve-user/${userId}`, { action: 'approve' });
      toast.success('User approved successfully!');
      fetchPendingUsers();
      fetchPendingCount();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve user');
    }
  };

  const handleDeny = async (userId) => {
    if (!window.confirm('Deny this user request?')) return;
    
    try {
      await api.put(`/auth/approve-user/${userId}`, { action: 'deny' });
      toast.success('User request denied');
      fetchPendingUsers();
      fetchPendingCount();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to deny user');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Username', accessor: 'username' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
          row.role === 'receptionist' ? 'bg-purple-100 text-purple-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row.role}
        </span>
      )
    },
    { 
      header: 'Requested', 
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleString()
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprove(row.id)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => handleDeny(row.id)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
          >
            ❌ Deny
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Approvals</h1>
              <p className="text-gray-600">Review and approve registration requests</p>
              <div className="flex gap-4 mt-2">
                <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  ⏳ Pending: {stats.pending_count}
                </span>
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  ✅ Total Approved: {pendingUsers.length > 0 ? 'N/A' : 'All approved'}
                </span>
              </div>
            </div>
            <button
              onClick={fetchPendingUsers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={pendingUsers} />
            {pendingUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>No pending requests</p>
                <p className="text-sm">All users have been approved</p>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Doctors Pending</p>
              <p className="text-2xl font-bold text-blue-600">
                {pendingUsers.filter(u => u.role === 'doctor').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Receptionists Pending</p>
              <p className="text-2xl font-bold text-purple-600">
                {pendingUsers.filter(u => u.role === 'receptionist').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-gray-500">
              <p className="text-sm text-gray-500">Patients Pending</p>
              <p className="text-2xl font-bold text-gray-600">
                {pendingUsers.filter(u => u.role === 'patient').length}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Approvals;