// ============================================
// SIMPLIFIED api.js - API Request Helper
// ============================================
// This file contains helper functions to make HTTP requests to our backend
// Think of it as a "wrapper" around the native fetch API

// ============================================
// API_BASE_URL - The base URL for all API calls
// ============================================
// In development, this will be empty string (uses relative paths)
// In production, this would be set to something like "https://api.example.com"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// ============================================
// apiUrl(path) - Helper to create full URL
// ============================================
// Parameters:
//   - path: The API endpoint path (e.g., "/api/users")
// Returns: Full URL (e.g., "http://localhost:3000/api/users")
export const apiUrl = (path) => `${API_BASE_URL}${path}`;

// ============================================
// apiRequest(path, options) - Main API request function
// ============================================
// This is a wrapper around fetch() that handles common tasks
// Parameters:
//   - path: The API endpoint (e.g., "/api/auth/login")
//   - options: Optional settings like method, headers, body
// Returns: The JSON response data from the server
export const apiRequest = async (path, options = {}) => {
  // Build merged headers to preserve Content-Type when options.headers includes other headers
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Make the HTTP request using fetch
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  // If successful, return the data
  return data;
};

// ============================================
// Authenticated request helper
// ============================================
export const authRequest = async (path, options = {}) => {
  const token = sessionStorage.getItem('careconnect_auth_token');
  if (!token) throw new Error('No auth token found');
  
  // 🔍 DEBUG LOGGING - Log exact request details
  const requestBody = options.body;
  console.log('🚀 API Request:', {
    url: apiUrl(path),
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    bodySize: requestBody ? requestBody.length : 0,
    bodyPreview: requestBody ? requestBody.substring(0, 200) + '...' : null
  });
  
const response = await apiRequest(path, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  // Auto-logout on 401 (token expired)
  if (!response.ok && response.status === 401) {
    sessionStorage.removeItem('careconnect_auth_token');
    sessionStorage.removeItem('careconnect_auth_user');
    window.location.href = '/login';
  }
  
  console.log('📥 API Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  
  return response;
};

// Dashboard API
export const getDashboard = () => authRequest('/api/dashboard');

// Tokens API
export const getTokens = () => authRequest('/api/tokens');
export const generateToken = (data) => authRequest('/api/tokens', {
  method: 'POST',
  body: JSON.stringify(data)
});

// Appointments API
export const bookAppointment = (data) => authRequest('/api/appointments', {
  method: 'POST',
  body: JSON.stringify(data)
});

/* 
   NEW USAGE EXAMPLES:
   
   // Admin CRUD
   const users = await authRequest('/api/admin/users');
   const appt = await updateAppointment('id123', { status: 'completed' });
   await deleteToken('tokenId');
   
   // Get dashboard data (tokens, appointments, profile)
   const dashboard = await getDashboard();
   
   // Generate token
   const token = await generateToken({ patientName: 'John Doe', department: 'Cardiology' });
   
   // Book appointment
   const apt = await bookAppointment({ department: 'Cardiology', doctor: 'Dr. Anil', date: '2024-12-25', time: '10:00 AM', patientName: 'John Doe', phone: '1234567890' });
   
   // Authenticated GET (manual)
   const tokens = await authRequest('/api/tokens');
*/

// Admin API Helpers
export const createAppointment = (data) => authRequest('/api/admin/appointments', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const updateAppointment = (id, data) => authRequest(`/api/admin/appointments/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const deleteAppointment = (id) => authRequest(`/api/admin/appointments/${id}`, {
  method: 'DELETE'
});

export const createTokenAdmin = (data) => authRequest('/api/admin/tokens', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const updateTokenAdmin = (id, data) => authRequest(`/api/admin/tokens/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const deleteTokenAdmin = (id) => authRequest(`/api/admin/tokens/${id}`, {
  method: 'DELETE'
});

export const updateUserAdmin = (id, data) => authRequest(`/api/admin/users/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const deleteUserAdmin = (id) => authRequest(`/api/admin/users/${id}`, {
  method: 'DELETE'
});

