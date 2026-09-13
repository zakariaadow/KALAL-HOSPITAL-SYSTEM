import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-12 rounded-xl shadow-lg max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/"><Button variant="primary">Go Home</Button></Link>
      </div>
    </div>
  );
};

export default NotFound;