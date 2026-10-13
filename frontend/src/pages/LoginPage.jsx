import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const navigate = useNavigate();

  // Ensure fields are completely blank on mount or when switching between User and Admin
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, [isAdminLogin]);

  const handleToggleLoginType = () => {
    setIsAdminLogin(!isAdminLogin);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isAdminLogin ? '/api/admin/login' : '/api/auth/login';
    const payload = isAdminLogin ? { username: email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate(isAdminLogin ? '/admin' : '/profile');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to your {isAdminLogin ? 'Admin' : 'User'} account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin} autoComplete="off">
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">{error}</div>}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isAdminLogin ? 'Username' : 'Email address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={isAdminLogin ? "text" : "email"}
                  name={isAdminLogin ? "portal_admin_user" : "portal_user_email"}
                  id={isAdminLogin ? "portal_admin_user" : "portal_user_email"}
                  autoComplete="off"
                  required
                  className="input-field pl-10 block w-full sm:text-sm border-slate-300 rounded-md"
                  placeholder={isAdminLogin ? "Enter admin username" : "Enter your email address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="portal_user_pass"
                  id="portal_user_pass"
                  autoComplete="new-password"
                  required
                  className="input-field pl-10 block w-full sm:text-sm border-slate-300 rounded-md"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Sign In
            </button>
          </div>
        </form>
        
        <div className="flex flex-col items-center gap-3">
          <button 
            type="button" 
            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            onClick={handleToggleLoginType}
          >
            {isAdminLogin ? 'Switch to User Login' : 'Admin Login'}
          </button>
          {!isAdminLogin && (
            <p className="text-sm text-slate-600">
              Don't have an account? <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">Sign up</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
