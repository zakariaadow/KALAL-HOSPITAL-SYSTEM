// src/pages/public/Services.jsx
import React from 'react';
import PublicLayout from '../../components/PublicLayout';

const Services = () => {
  const services = [
    { icon: '🩺', title: 'General Medicine', description: 'Comprehensive medical care for all ages with personalized treatment plans.' },
    { icon: '❤️', title: 'Cardiology', description: 'Expert heart care with advanced diagnostic and treatment services.' },
    { icon: '🧠', title: 'Neurology', description: 'Advanced neurological diagnosis and treatment for brain and nervous system.' },
    { icon: '🦴', title: 'Orthopedics', description: 'Bone and joint care with modern surgical and non-surgical techniques.' },
    { icon: '👶', title: 'Pediatrics', description: 'Specialized care for infants, children, and adolescents in a child-friendly environment.' },
    { icon: '🤰', title: 'Obstetrics & Gynecology', description: "Complete women's health services from adolescence to menopause." },
    { icon: '👁️', title: 'Ophthalmology', description: 'Comprehensive eye care from routine checkups to advanced surgery.' },
    { icon: '🦷', title: 'Dentistry', description: 'Full range of dental services including preventive, restorative, and cosmetic.' },
  ];

  return (
    <PublicLayout>
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">We offer a wide range of medical services to meet all your healthcare needs.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-6 border border-gray-100 text-center">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Need Help Choosing a Service?</h3>
          <p className="text-gray-400 mb-6">Our team is here to guide you to the right specialist.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">Contact Us</button>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Services;