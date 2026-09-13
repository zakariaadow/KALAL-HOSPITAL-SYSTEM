import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const Profile = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
          <p className="text-gray-600">Manage your profile settings</p>
          <div className="mt-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-500">Profile management will be displayed here.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;