// ============================================
// SIMPLIFIED App.jsx - Main Application Entry
// ============================================
// This file sets up the main structure of our React app
// Think of it as the "blueprint" of our entire application

// Import toast notifications UI
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Import tooltip provider for hover tooltips
import { TooltipProvider } from "@/components/ui/tooltip";

// Import React Query - helps manage data fetching
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import React Router - handles navigation between pages
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import our page components
import Index from "./pages/Index";
import TokensPage from "./pages/TokensPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Import authentication context - manages user login state
import { AuthProvider } from "./contexts/AuthContext";

// Import protected route component - blocks unauthorized access
import ProtectedRoute from "./components/ProtectedRoute";

// ============================================
// STEP 1: Create a QueryClient
// ============================================
// React Query helps us fetch and cache data from APIs
// This client will be used by all components that need data fetching
const queryClient = new QueryClient();

// ============================================
// STEP 2: Main App Component
// ============================================
// This is the root component of our entire application
// Everything starts from here!
const App = () => {
  return (
    // Wrap everything with QueryClientProvider for data fetching
    <QueryClientProvider client={queryClient}>
      
      {/* AuthProvider: Manages user authentication state (logged in or not) */}
      <AuthProvider>
        
        {/* TooltipProvider: Enables hover tooltips throughout the app */}
        <TooltipProvider>
          
          {/* Toaster: Shows toast notifications (pop-up messages) */}
          <Toaster />
          <Sonner />
          
          {/* BrowserRouter: Enables navigation between pages */}
          <BrowserRouter>
            
            {/* Routes: Define all available pages/routes in our app */}
            <Routes>
              {/* Public routes - anyone can access */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/tokens" element={<TokensPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              
              {/* Protected routes - only logged in users can access */}
              {/* We wrap these with ProtectedRoute component */}
              <Route 
                path="/appointments" 
                element={
                  <ProtectedRoute>
                    <AppointmentsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 route - shown when no page matches */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
          </BrowserRouter>
          
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Export App so it can be used in main.jsx
export default App;

/* 
   HOW THIS FILE WORKS (Simple Explanation):
   
   1. QueryClientProvider - Helps with fetching data from APIs
   2. AuthProvider - Keeps track of whether user is logged in
   3. TooltipProvider - Enables tooltips (those little popup hints)
   4. BrowserRouter - Handles URL changes and navigation
   5. Routes - Defines which component shows for which URL
   
   Think of it like a Russian nesting doll:
   QueryClientProvider
      └── AuthProvider
            └── TooltipProvider
                  └── BrowserRouter
                        └── Routes
                              └── Page Components
*/

