import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import PublicDoctors from './pages/public/Doctors';
import Contact from './pages/public/Contact';
import Departments from './pages/public/Departments';
import AppointmentBooking from './pages/public/AppointmentBooking';
import PatientPortal from './pages/public/PatientPortal';
import Blog from './pages/public/Blog';
import FAQ from './pages/public/FAQ';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import Approvals from './pages/admin/Approvals';
import AdminPatients from './pages/admin/Patients';
import AdminDoctors from './pages/admin/Doctors';
import AdminAppointments from './pages/admin/Appointments';
import AdminBilling from './pages/admin/Billing';
import AdminReports from './pages/admin/Reports';
import AdminProfile from './pages/admin/Profile';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import Patients from './pages/receptionist/Patients';
import PatientView from './pages/receptionist/PatientView';
import AddPatient from './pages/receptionist/AddPatient';
import Doctors from './pages/receptionist/Doctors';
import AddDoctor from './pages/receptionist/AddDoctor';
import Appointments from './pages/receptionist/Appointments';
import Billing from './pages/receptionist/Billing';
import Reports from './pages/receptionist/Reports';
import Profile from './pages/receptionist/Profile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import MyPatients from './pages/doctor/MyPatients';
import DoctorAppointments from './pages/doctor/Appointments';
import MedicalRecords from './pages/doctor/MedicalRecords';
import Prescriptions from './pages/doctor/Prescriptions';
import Laboratory from './pages/doctor/Laboratory';
import Diagnosis from './pages/doctor/Diagnosis';
import DoctorProfile from './pages/doctor/Profile';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MedicalHistory from './pages/patient/MedicalHistory';
import PatientPrescriptions from './pages/patient/Prescriptions';
import LabResults from './pages/patient/LabResults';
import Bills from './pages/patient/Bills';
import PatientProfile from './pages/patient/Profile';

import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            {/* ==================== PUBLIC ROUTES ==================== */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/doctors" element={<PublicDoctors />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/book-appointment" element={<AppointmentBooking />} />
            <Route path="/patient-portal" element={<PatientPortal />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/faq" element={<FAQ />} />
            
            {/* ==================== AUTH ROUTES ==================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* ==================== ADMIN ROUTES ==================== */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="approvals" element={<Approvals />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="billing" element={<AdminBilling />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
            
            {/* ==================== RECEPTIONIST ROUTES ==================== */}
            <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['admin', 'receptionist']} />}>
              <Route path="dashboard" element={<ReceptionistDashboard />} />
              <Route path="patients" element={<Patients />} />
              <Route path="patients/:id" element={<PatientView />} />
              <Route path="patients/add" element={<AddPatient />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="doctors/add" element={<AddDoctor />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="billing" element={<Billing />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* ==================== DOCTOR ROUTES ==================== */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['admin', 'doctor']} />}>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="my-patients" element={<MyPatients />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="medical-records" element={<MedicalRecords />} />
              <Route path="prescriptions" element={<Prescriptions />} />
              <Route path="laboratory" element={<Laboratory />} />
              <Route path="diagnosis" element={<Diagnosis />} />
              <Route path="profile" element={<DoctorProfile />} />
            </Route>

            {/* ==================== PATIENT ROUTES ==================== */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['admin', 'patient']} />}>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="book-appointment" element={<BookAppointment />} />
              <Route path="my-appointments" element={<MyAppointments />} />
              <Route path="medical-history" element={<MedicalHistory />} />
              <Route path="prescriptions" element={<PatientPrescriptions />} />
              <Route path="lab-results" element={<LabResults />} />
              <Route path="bills" element={<Bills />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            {/* ==================== 404 NOT FOUND ==================== */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;