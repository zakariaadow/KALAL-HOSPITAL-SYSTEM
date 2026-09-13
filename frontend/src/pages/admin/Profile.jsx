import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="User Information">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Username</label>
                  <p className="font-medium text-gray-900">{user?.username}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {user?.role}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Account Status</label>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium ml-2">
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Approved</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ml-2 ${
                    user?.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {user?.is_approved ? 'Yes' : 'Pending'}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Member Since</label>
                  <p className="font-medium text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Change Password">
              <form onSubmit={handleSubmitPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password *</label>
                  <input
                    type="password"
                    name="old_password"
                    required
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password *</label>
                  <input
                    type="password"
                    name="new_password"
                    required
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password *</label>
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button type="submit" variant="primary" loading={loading}>
                  Change Password
                </Button>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;