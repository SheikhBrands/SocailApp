import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

function App() {
  useAuth();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { isDark, setTheme } = useThemeStore();

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-storage');
    if (savedTheme) {
      const { state } = JSON.parse(savedTheme);
      setTheme(state.isDark);
    }
  }, [setTheme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-2xl">SP</span>
          </div>
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading SocialPulse...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={isDark ? 'dark' : ''}>
        <Routes>
          <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
          <Route path="/" element={<Layout />}>
            <Route index element={isAuthenticated ? <Home /> : <Navigate to="/auth" />} />
            <Route path="search" element={isAuthenticated ? <div>Search Page</div> : <Navigate to="/auth" />} />
            <Route path="create" element={isAuthenticated ? <div>Create Page</div> : <Navigate to="/auth" />} />
            <Route path="activity" element={isAuthenticated ? <div>Activity Page</div> : <Navigate to="/auth" />} />
            <Route path="messages" element={isAuthenticated ? <div>Messages Page</div> : <Navigate to="/auth" />} />
            <Route path="notifications" element={isAuthenticated ? <div>Notifications Page</div> : <Navigate to="/auth" />} />
            <Route path="profile/:username" element={isAuthenticated ? <div>Profile Page</div> : <Navigate to="/auth" />} />
          </Route>
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            duration: 4000,
          }}
        />
      </div>
    </Router>
  );
}

export default App;