import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, Home, LifeBuoy, LayoutDashboard, Bookmark, Sparkles, LogOut, LogIn, UserCheck, ShieldCheck } from 'lucide-react';

export default function Navbar({ user, setUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleContactSupport = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/?scrollTo=contact');
    }
  };

  const handleHome = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleGetStarted = () => {
    setMobileMenuOpen(false);
    navigate(user ? '/profile' : '/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Desktop Brand */}
          <div className="flex items-center">
            <a href="/" onClick={handleHome} className="flex items-center gap-2.5 mr-6 sm:mr-8 cursor-pointer group">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-tight">
                  Scheme Portal
                </span>
                <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase hidden sm:block">
                  TN & Central Schemes
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="/"
                onClick={handleHome}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                Home
              </a>
              <a
                href="#contact"
                onClick={handleContactSupport}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                Contact Support
              </a>
              {user && user.role !== 'admin' && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/schemes"
                    className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Eligible Schemes
                  </Link>
                  <Link
                    to="/saved-schemes"
                    className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Saved
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Admin: <strong className="text-blue-900 font-bold">{user.username || user.name || 'admin'}</strong></span>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                    <span className="text-slate-400">User: </span>
                    <strong className="text-slate-800">{user.name || user.username}</strong>
                  </div>
                )}
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-200"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <button
                    onClick={handleGetStarted}
                    className="btn-primary text-xs py-2 px-4 shadow-sm shadow-blue-500/20"
                  >
                    Check Eligibility
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-xs py-1.5 px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-2"
                >
                  Login
                </Link>
                <button onClick={handleGetStarted} className="btn-primary text-sm py-2 px-4">
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                onClick={handleGetStarted}
                className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm"
              >
                Apply
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-xl animate-fadeIn">
          {user && (
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
              {user.role === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              ) : (
                <UserCheck className="w-5 h-5 text-blue-600" />
              )}
              <div className="text-xs">
                <p className="font-bold text-slate-800">
                  {user.role === 'admin' ? `Admin: ${user.username || 'admin'}` : (user.name || user.username)}
                </p>
                <p className="text-slate-500">{user.role === 'admin' ? 'Administrator' : (user.role ? `Role: ${user.role}` : 'Profile Incomplete')}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <a
              href="/"
              onClick={handleHome}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Home className="w-4 h-4 text-slate-500" />
              Home
            </a>

            <a
              href="#contact"
              onClick={handleContactSupport}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <LifeBuoy className="w-4 h-4 text-slate-500" />
              Contact Support
            </a>

            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    Admin Panel
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Sparkles className="w-4 h-4 text-slate-500" />
                      Role & Profile
                    </Link>
                    <Link
                      to="/schemes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      Eligible Schemes
                    </Link>
                    <Link
                      to="/saved-schemes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Bookmark className="w-4 h-4 text-slate-500" />
                      Saved Schemes
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      Dashboard
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Login
                </Link>
                <button
                  onClick={handleGetStarted}
                  className="w-full mt-2 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

