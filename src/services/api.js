import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

// User
export const getMe = () => api.get('/users/me');

// Doctors
export const getDoctors           = (specialty) => api.get('/doctors', { params: specialty ? { specialty } : {} });
export const getDoctorById        = (id)         => api.get(`/doctors/${id}`);
export const getMyDoctorProfile   = ()           => api.get('/doctors/profile/me');
export const updateDoctorProfile  = (data)       => api.put('/doctors/profile/me', data);
export const uploadDoctorAvatar   = (formData)   => api.post('/doctors/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteDoctorAvatar   = ()           => api.delete('/doctors/profile/avatar');

// Appointments
export const getAppointments      = ()                 => api.get('/appointments');
export const getAvailableSlots    = (docId, date)      => api.get(`/appointments/doctor/${docId}/available`, { params: { date } });
export const createAppointment    = (data)             => api.post('/appointments', data);
export const updateAppointment    = (id, status)       => api.patch(`/appointments/${id}/status`, { status });
export const rescheduleAppointment= (id, data)         => api.put(`/appointments/${id}/reschedule`, data);
export const cancelAppointment    = (id)               => api.delete(`/appointments/${id}`);

// Specialties
export const getSpecialties       = ()     => api.get('/specialties');
export const createSpecialty      = (data) => api.post('/specialties', data);
export const deleteSpecialty      = (id)   => api.delete(`/specialties/${id}`);

// Medical Records
export const addMedicalRecord     = (appointmentId, data) => api.post(`/medical-records/appointment/${appointmentId}`, data);
export const getMedicalRecord     = (appointmentId)       => api.get(`/medical-records/appointment/${appointmentId}`);

// Admin
export const getAllAppointments   = ()            => api.get('/admin/appointments');
export const getAllUsers           = ()            => api.get('/admin/users');
export const createUser           = (data)        => api.post('/admin/users', data);
export const updateUser           = (id, data)    => api.put(`/admin/users/${id}`, data);
export const deleteUser           = (id)          => api.delete(`/admin/users/${id}`);
export const updateUserRole       = (id, role)    => api.patch(`/admin/users/${id}/role`, { role });
export const getReports           = ()            => api.get('/admin/reports');

export default api;
