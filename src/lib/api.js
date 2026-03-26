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
  // Make the HTTP request using fetch
  const response = await fetch(apiUrl(path), {
    // Default headers - always send JSON content type
    headers: {
      "Content-Type": "application/json",
      // Allow custom headers to override defaults
      ...(options.headers || {}),
    },
    // Spread any additional options (method, body, etc.)
    ...options,
  });

  // Try to parse the response as JSON
  // If response is empty, use empty object instead
  const data = await response.json().catch(() => ({}));

  // ============================================
  // Error Handling
  // ============================================
  // If response was not successful (status code 4xx or 5xx)
  if (!response.ok) {
    // Throw an error with the server's message or a generic one
    throw new Error(data.message || "Request failed");
  }

  // If successful, return the data
  return data;
};

/* 
   HOW TO USE THIS FILE (Examples):
   
   // GET request to fetch data
   const users = await apiRequest("/api/users");
   
   // POST request to create something
   const newUser = await apiRequest("/api/users", {
     method: "POST",
     body: JSON.stringify({ name: "John", email: "john@example.com" })
   });
   
   // PUT request to update something
   const updatedUser = await apiRequest("/api/users/1", {
     method: "PUT",
     body: JSON.stringify({ name: "John Updated" })
   });
   
   // DELETE request to remove something
   await apiRequest("/api/users/1", {
     method: "DELETE"
   });

   WHAT THIS FILE DOES:
   - Makes API calls simpler with automatic JSON handling
   - Adds Content-Type header automatically
   - Handles errors by throwing exceptions
   - Returns parsed JSON data directly
*/

