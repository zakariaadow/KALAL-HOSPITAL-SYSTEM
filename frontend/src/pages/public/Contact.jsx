// src/pages/public/Contact.jsx
import React, { useState } from 'react';
import PublicLayout from '../../components/PublicLayout';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Have questions? We're here to help.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" name="subject" required value={formData.subject} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="message" required rows="4" value={formData.message} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Your message..."></textarea>
              </div>
              <Button type="submit" variant="primary" loading={loading} className="w-full">Send Message</Button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">📍</span>
                  <div><p className="font-medium text-gray-900">Address</p><p className="text-gray-600">123 Hospital Road, Nairobi, Kenya</p></div>
                </div>
                <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">📞</span>
                  <div><p className="font-medium text-gray-900">Phone</p><p className="text-gray-600">+254 712 345 678</p></div>
                </div>
                <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">✉️</span>
                  <div><p className="font-medium text-gray-900">Email</p><p className="text-gray-600">info@kalalhospital.com</p></div>
                </div>
                <div className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">🕐</span>
                  <div><p className="font-medium text-gray-900">Working Hours</p><p className="text-gray-600">Mon-Fri: 8:00 AM - 6:00 PM<br />Sat: 8:00 AM - 2:00 PM<br />Sun: Closed</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;