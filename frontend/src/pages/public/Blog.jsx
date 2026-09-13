// src/pages/public/Blog.jsx
import React from 'react';
import PublicLayout from '../../components/PublicLayout';

const Blog = () => {
  const posts = [
    { id: 1, title: '5 Tips for a Healthy Heart', excerpt: 'Learn about the best practices to keep your heart healthy and strong.', date: 'July 1, 2026', author: 'Dr. Sarah Johnson', category: 'Cardiology', image: '❤️', readTime: '5 min' },
    { id: 2, title: 'Understanding Mental Health', excerpt: 'Mental health is just as important as physical health. Here\'s what you need to know.', date: 'June 25, 2026', author: 'Dr. Michael Chen', category: 'Mental Health', image: '🧠', readTime: '4 min' },
    { id: 3, title: 'Nutrition for a Healthy Life', excerpt: 'Discover the foods that can boost your immune system and overall health.', date: 'June 18, 2026', author: 'Dr. Emily Brown', category: 'Nutrition', image: '🥗', readTime: '6 min' },
  ];

  return (
    <PublicLayout>
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Health Blog</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Stay informed with the latest health tips and medical insights.</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
              <div className="flex items-start">
                <div className="text-4xl mr-4">{post.image}</div>
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium mb-2">{post.category}</span>
                  <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition cursor-pointer">{post.title}</h2>
                  <p className="text-gray-600 mt-2 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center mt-4 text-sm text-gray-500">
                    <span>✍️ {post.author}</span>
                    <span className="mx-2">•</span>
                    <span>📅 {post.date}</span>
                    <span className="mx-2">•</span>
                    <span>⏱️ {post.readTime}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-blue-600 hover:text-blue-700 font-medium">Read More →</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Blog;