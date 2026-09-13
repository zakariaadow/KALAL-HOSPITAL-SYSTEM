import React from 'react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;