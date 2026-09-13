import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_date: '',
    type: 'regular',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchDoctors();
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const defaultDate = tomorrow.toISOString().slice(0, 16);
    setFormData(prev => ({ ...prev, appointment_date: defaultDate }));
  }, []);

  const fetchDoctors = async () => {
    try {
      // Use the correct endpoint with trailing slash
      const response = await api.get('/doctors/');
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast.error('Failed to load doctors');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get the patient ID from the user context
      const patientId = user?.patient?.id;
      
      if (!patientId) {
        toast.error('Patient profile not found. Please contact support.');
        setLoading(false);
        return;
      }

      // Format the date properly
      const appointmentDate = new Date(formData.appointment_date);
      
      if (isNaN(appointmentDate.getTime())) {
        toast.error('Invalid date format');
        setLoading(false);
        return;
      }

      // Prepare the data for backend - use trailing slash
      const appointmentData = {
        patient_id: patientId,
        doctor_id: parseInt(formData.doctor_id),
        appointment_date: appointmentDate.toISOString(),
        type: formData.type,
        reason: formData.reason || '',
        notes: formData.notes || '',
      };

      console.log('Sending appointment data:', appointmentData);

      const response = await api.post('/appointments/', appointmentData);
      
      toast.success('Appointment booked successfully!');
      navigate('/patient/my-appointments');
    } catch (error) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 'Failed to book appointment';
      toast.error(errorMessage);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Doctor *</label>
                <select
                  name="doctor_id"
                  required
                  value={formData.doctor_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Choose a doctor</option>
                  {doctors.filter(d => d.is_available).map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.full_name} - {doctor.specialization} 
                      {doctor.consultation_fee && ` ($${doctor.consultation_fee})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time *</label>
                <input
                  type="datetime-local"
                  name="appointment_date"
                  required
                  value={formData.appointment_date}
                  onChange={handleChange}
                  className="input-field"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Please select a future date and time
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="regular">Regular Checkup</option>
                  <option value="emergency">Emergency</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Brief reason for visit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Any additional information..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" variant="primary" loading={loading}>
                  Book Appointment
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => navigate('/patient/my-appointments')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default BookAppointment;