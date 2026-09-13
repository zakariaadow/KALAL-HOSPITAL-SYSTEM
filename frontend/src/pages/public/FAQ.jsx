// src/pages/public/FAQ.jsx
import React, { useState } from 'react';
import PublicLayout from '../../components/PublicLayout';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { question: 'How do I book an appointment?', answer: 'You can book an appointment by clicking the "Book Appointment" button on our website, through our Patient Portal, or by calling our reception desk at +254 712 345 678.' },
    { question: 'What are the visiting hours?', answer: 'Visiting hours are from 8:00 AM to 6:00 PM, Monday through Saturday. Sunday visiting hours are from 10:00 AM to 2:00 PM. Emergency cases are allowed 24/7.' },
    { question: 'Do you accept insurance?', answer: 'Yes, we work with major insurance providers including NHIF, AAR, and multiple private insurance companies. Please contact our billing department for specific details.' },
    { question: 'How do I access my medical records?', answer: 'You can access your medical records through our Patient Portal. Login with your credentials to view, download, and share your medical records securely.' },
    { question: 'What emergency services do you offer?', answer: 'We offer 24/7 emergency services including trauma care, cardiac emergencies, stroke care, and critical care. Our emergency department is fully equipped and staffed with experienced physicians.' },
  ];

  const toggle = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <PublicLayout>
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Find answers to the most common questions about our hospital and services.</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
              <button onClick={() => toggle(index)} className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition">
                <span className="font-medium text-gray-900">{faq.question}</span>
                <span className={`text-2xl transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-3 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default FAQ;