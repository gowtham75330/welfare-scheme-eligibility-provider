import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Wallet, MapPin, Briefcase, ChevronRight, CheckCircle, Award, Sparkles, Edit3 } from 'lucide-react';

export default function Dashboard({ user: propUser }) {
  const [currentUser, setCurrentUser] = useState(propUser || {});
  const [stats, setStats] = useState({ totalAvailable: 0, eligibleCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Fetch user profile
        const profRes = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData.user) {
            setCurrentUser(profData.user);
          }
        }

        // Fetch eligible count
        const schemeRes = await fetch('/api/schemes/eligible', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const schemeData = await schemeRes.json();
        if (schemeRes.ok) {
          setStats({
            totalAvailable: schemeData.totalAvailable || 0,
            eligibleCount: schemeData.schemes ? schemeData.schemes.length : 0
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const isProfileComplete = !!(currentUser.role && currentUser.state && currentUser.category);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Hello, {currentUser.name || 'Citizen'} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome to your unified scholarship & welfare benefits dashboard.
          </p>
        </div>

        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors border border-blue-200 self-start"
        >
          <Edit3 className="w-4 h-4" /> Change Role / Edit Profile
        </Link>
      </div>
      
      {!isProfileComplete && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-xl shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-amber-800">
              <strong className="font-bold">Profile Incomplete:</strong> Please complete your role and demographic information to enable accurate eligibility matching.
            </p>
            <Link to="/profile" className="text-sm font-bold text-amber-800 underline hover:text-amber-900">
              Complete Profile Now →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Profile Summary Card */}
        <div className="card p-6 lg:col-span-1 bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-800 text-white border-0 shadow-lg rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/50 mb-4">
              <h2 className="text-base font-bold text-blue-100 uppercase tracking-wider">Profile Summary</h2>
              <span className="text-xs px-2.5 py-0.5 bg-blue-500/30 rounded-full border border-blue-400/30 font-semibold">
                Verified
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg shrink-0">
                  <User className="w-4 h-4 text-blue-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-blue-200">Full Name</p>
                  <p className="font-semibold text-sm truncate">{currentUser.name || 'Not Set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg shrink-0">
                  <Briefcase className="w-4 h-4 text-blue-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-blue-200">Configured Role (1 of 11)</p>
                  <p className="font-bold text-sm text-amber-300 capitalize truncate">
                    {currentUser.role || 'Not Configured'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg shrink-0">
                  <MapPin className="w-4 h-4 text-blue-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-blue-200">State / Region</p>
                  <p className="font-semibold text-sm truncate">{currentUser.state || 'Not Set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg shrink-0">
                  <Wallet className="w-4 h-4 text-blue-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-blue-200">Annual Family Income</p>
                  <p className="font-semibold text-sm truncate">
                    {currentUser.income !== undefined && currentUser.income !== '' ? `₹${Number(currentUser.income).toLocaleString()}` : 'Not Set'}
                  </p>
                </div>
              </div>

              {currentUser.category && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg shrink-0">
                    <Sparkles className="w-4 h-4 text-blue-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-blue-200">Category / Caste</p>
                    <p className="font-semibold text-sm truncate">{currentUser.category}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-blue-500/50">
            <Link 
              to="/profile" 
              className="text-xs font-semibold text-blue-100 hover:text-white flex items-center justify-between transition-colors bg-white/10 px-3 py-2 rounded-lg"
            >
              <span>Update Profile & Role Rules</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card p-6 flex items-center justify-between border border-slate-200 rounded-2xl shadow-sm bg-white">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Schemes</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalAvailable}</p>
                <p className="text-xs text-slate-400 mt-1">Covering all 11 national roles</p>
              </div>
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                <Award className="w-7 h-7" />
              </div>
            </div>
            
            <div className="card p-6 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border border-emerald-200 rounded-2xl shadow-sm">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Your Matched Schemes</p>
                <p className="text-4xl font-black text-emerald-600 mt-1">{stats.eligibleCount}</p>
                <p className="text-xs text-emerald-700 mt-1 font-medium">100% Verified Conditions</p>
              </div>
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                <CheckCircle className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="card p-7 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Eligibility Evaluated
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Ready to Claim Your Benefits?
                </h3>
              </div>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              The eligibility engine has compared your configured role (<strong>{currentUser.role || 'Citizen'}</strong>), state, category, and criteria against official schemes. Review your personalized list of entitlements and apply on official portals.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link 
                to="/schemes" 
                className="btn-primary w-full sm:w-auto text-base px-8 py-3.5 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                View Eligible Schemes ({stats.eligibleCount})
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/saved-schemes" 
                className="btn-secondary w-full sm:w-auto text-base px-6 py-3.5 text-center"
              >
                Saved Schemes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
