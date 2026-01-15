import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";

// Admin Pages
import LoginPage from "./pages/admin/Login";
import DashboardPage from "./pages/admin/DashboardNew";
import PagesPage from "./pages/admin/Pages";
import PostsPage from "./pages/admin/Posts";
import WidgetsPage from "./pages/admin/Widgets";
import SettingsPage from "./pages/admin/Settings";
import AuditLogsPage from "./pages/admin/AuditLogs";

function App() {
  return (
    <div className="App">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1A1A1C',
            color: '#fff',
            border: '1px solid #333'
          }
        }}
      />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/pages" 
              element={
                <ProtectedRoute>
                  <PagesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/posts" 
              element={
                <ProtectedRoute>
                  <PostsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/widgets" 
              element={
                <ProtectedRoute>
                  <WidgetsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/audit-logs" 
              element={
                <ProtectedRoute>
                  <AuditLogsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect /admin to dashboard */}
            <Route path="/admin" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
