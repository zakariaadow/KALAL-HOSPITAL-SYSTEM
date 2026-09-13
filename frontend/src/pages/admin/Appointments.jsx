import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const Appointments = () => {
  const { api } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    type: 'regular',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apts, pats, docs] = await Promise.all([
        api.get('/appointments/'),
        api.get('/patients/'),
        api.get('/doctors/'),
      ]);
      setAppointments(apts.data);
      setPatients(pats.data);
      setDoctors(docs.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments/', formData);
      toast.success('Appointment created!');
      setShowModal(false);
      fetchData();
      setFormData({ patient_id: '', doctor_id: '', appointment_date: '', type: 'regular', reason: '', notes: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create appointment');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Patient', accessor: 'patient_name' },
    { header: 'Doctor', accessor: 'doctor_name' },
    { header: 'Date', render: (row) => row.appointment_date ? new Date(row.appointment_date).toLocaleString() : 'N/A' },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'scheduled' ? 'bg-green-100 text-green-700' :
          row.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
          row.status === 'completed' ? 'bg-gray-100 text-gray-700' :
          row.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'scheduled' && (
            <button onClick={() => handleStatusChange(row.id, 'confirmed')} className="text-blue-600 text-sm">Confirm</button>
          )}
          {row.status !== 'completed' && row.status !== 'cancelled' && (
            <>
              <button onClick={() => handleStatusChange(row.id, 'completed')} className="text-green-600 text-sm">Complete</button>
              <button onClick={() => handleStatusChange(row.id, 'cancelled')} className="text-red-600 text-sm">Cancel</button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1"><Navbar />
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
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-600">Manage all appointments</p>
              <p className="text-sm text-gray-500">Total: {appointments.length} appointments</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>Book Appointment</Button>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Table columns={columns} data={appointments} />
            {appointments.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>No appointments found</p>
              </div>
            )}
          </div>

          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Book Appointment">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient *</label>
                <select name="patient_id" required value={formData.patient_id} onChange={handleChange} className="input-field">
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor *</label>
                <select name="doctor_id" required value={formData.doctor_id} onChange={handleChange} className="input-field">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name} - {d.specialization}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time *</label>
                <input type="datetime-local" name="appointment_date" required value={formData.appointment_date} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                  <option value="regular">Regular</option>
                  <option value="emergency">Emergency</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <input type="text" name="reason" value={formData.reason} onChange={handleChange} className="input-field" />
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="primary">Book</Button>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default Appointments;