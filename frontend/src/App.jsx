import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProfileForm from './pages/ProfileForm';
import SchemeResults from './pages/SchemeResults';
import AdminDashboard from './pages/AdminDashboard';
import SavedSchemes from './pages/SavedSchemes';
import LearnMore from './pages/LearnMore';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for token
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Toaster position="top-center" />
        <Navbar user={user} setUser={setUser} />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/login" element={!user ? <LoginPage setUser={setUser} /> : <Navigate to="/profile" />} />
            <Route path="/register" element={!user ? <RegisterPage setUser={setUser} /> : <Navigate to="/profile" />} />
            
            {/* User Protected Routes */}
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <ProfileForm user={user} setUser={setUser} /> : <Navigate to="/login" />} />
            <Route path="/schemes" element={user ? <SchemeResults user={user} /> : <Navigate to="/login" />} />
            <Route path="/saved-schemes" element={user ? <SavedSchemes /> : <Navigate to="/login" />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/" />} />
          </Routes>
        </main>
        
        <footer className="bg-slate-900 py-6 text-center text-slate-400 text-sm mt-auto">
          <p>&copy; 2026 All India Scholarship & Government Scheme Portal</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
