import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ExternalLink, 
  Banknote, 
  MapPin, 
  CheckCircle, 
  CheckCircle2,
  Bookmark, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  RefreshCw,
  Edit3,
  Share2,
  FileText,
  ClipboardList,
  Printer,
  Search,
  CheckSquare,
  Square,
  Clock,
  Send,
  SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

const getValidUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

export default function SchemeResults({ user }) {
  const [schemes, setSchemes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filters
  const [filterQuery, setFilterQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL'); // 'ALL' | 'TN' | 'CENTRAL'
  
  // Bookmarks
  const [savedIds, setSavedIds] = useState(new Set());

  // Extra Feature 1: Document Checklist state per scheme { [schemeId]: string[] }
  const [checkedDocs, setCheckedDocs] = useState(() => {
    try {
      const stored = localStorage.getItem('scheme_checked_docs');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Extra Feature 2: Application status state per scheme { [schemeId]: string }
  const [appStatus, setAppStatus] = useState(() => {
    try {
      const stored = localStorage.getItem('scheme_application_status');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const fetchEligibleSchemes = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/schemes/eligible', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSchemes(data.schemes || []);
        setUserInfo(data.user || null);
        setTotalAvailable(data.totalAvailable || 0);
        if (data.message && (!data.schemes || data.schemes.length === 0)) {
          setErrorMsg(data.message);
        }
      } else {
        setErrorMsg(data.message || 'Unable to compute eligibility at this moment.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to backend server. Please verify the API is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedSchemes = async () => {
    try {
      const res = await fetch('/api/schemes/saved', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const ids = new Set((data.schemes || []).map(s => s.id));
        setSavedIds(ids);
      }
    } catch (e) {}
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.applications && Array.isArray(data.applications)) {
          setAppStatus(prev => {
            const remoteMap = { ...prev };
            data.applications.forEach(a => {
              remoteMap[a.scheme_id] = a.status;
            });
            return remoteMap;
          });
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchEligibleSchemes();
    fetchSavedSchemes();
    fetchApplications();
  }, []);

  // Save checked documents to localStorage
  const handleToggleDocument = (schemeId, docName) => {
    setCheckedDocs(prev => {
      const currentList = prev[schemeId] || [];
      const isAlreadyChecked = currentList.includes(docName);
      const updatedList = isAlreadyChecked 
        ? currentList.filter(d => d !== docName)
        : [...currentList, docName];

      const nextState = { ...prev, [schemeId]: updatedList };
      try {
        localStorage.setItem('scheme_checked_docs', JSON.stringify(nextState));
      } catch (e) {}
      
      if (!isAlreadyChecked) {
        toast.success(`Marked as ready: ${docName.length > 25 ? docName.substring(0, 25) + '...' : docName}`, {
          duration: 2000,
          position: 'bottom-center'
        });
      }
      return nextState;
    });
  };

  // Change Application Status
  const handleStatusChange = async (schemeId, newStatus) => {
    setAppStatus(prev => {
      const next = { ...prev, [schemeId]: newStatus };
      try {
        localStorage.setItem('scheme_application_status', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await fetch('/api/applications/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ scheme_id: schemeId, status: newStatus })
      });
      toast.success(`Status updated to "${newStatus}"`, { duration: 1800 });
    } catch (e) {
      toast.success(`Status updated to "${newStatus}" (locally)`, { duration: 1800 });
    }
  };

  const handleSaveScheme = async (schemeId) => {
    const isSaved = savedIds.has(schemeId);
    try {
      if (isSaved) {
        const res = await fetch(`/api/schemes/saved/${schemeId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          toast.success('Scheme removed from saved bookmarks');
          setSavedIds(prev => {
            const next = new Set(prev);
            next.delete(schemeId);
            return next;
          });
        }
      } else {
        const res = await fetch('/api/schemes/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ scheme_id: schemeId })
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Scheme bookmarked successfully!');
          setSavedIds(prev => new Set(prev).add(schemeId));
        } else {
          toast.error(data.message || 'Could not save scheme');
        }
      }
    } catch (err) {
      toast.error('Network error saving scheme');
    }
  };

  const handleShare = (scheme) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${scheme.scheme_name}\nBenefits: ${scheme.benefits}\nApply here: ${scheme.official_link}`);
      toast.success('Scheme details copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter schemes based on search query and State filter
  const filteredSchemes = schemes.filter(s => {
    // 1. Search Query
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      const match = s.scheme_name?.toLowerCase().includes(q) ||
                    s.provider?.toLowerCase().includes(q) ||
                    s.description?.toLowerCase().includes(q) ||
                    s.benefits?.toLowerCase().includes(q) ||
                    s.required_documents?.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. State Filter
    if (stateFilter === 'TN') {
      return (s.state || '').toLowerCase().includes('tamil');
    }
    if (stateFilter === 'CENTRAL') {
      return (s.state || '').toLowerCase().includes('all') || (s.provider || '').toLowerCase().includes('central');
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-4">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <h3 className="text-xl font-bold text-slate-800">Verifying Scheme Eligibility...</h3>
        <p className="text-slate-500 text-sm mt-1 text-center max-w-md">
          Cross-matching your profile against Tamil Nadu and Central Government statutory welfare rules
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 w-full">
      
      {/* Top Banner / Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-7 md:p-8 mb-8 shadow-xl border border-indigo-900/50">
        
        {/* Step Progress Bar (Mobile Responsive) */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold text-xs">✓</div>
            <span className="text-xs font-semibold text-emerald-400 whitespace-nowrap">Role Selected</span>
          </div>
          <div className="flex-1 h-0.5 bg-emerald-500/60 mx-1"></div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold text-xs">✓</div>
            <span className="text-xs font-semibold text-emerald-400 whitespace-nowrap">Details Filled</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/30 mx-1"></div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-blue-900 font-extrabold text-xs shadow">3</div>
            <span className="text-xs font-bold text-white whitespace-nowrap">Eligible Schemes</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Tamil Nadu & Central Government Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Eligible Welfare Schemes & Scholarships
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Based on your verified credentials, you satisfy 100% of the statutory eligibility criteria for the following official schemes.
            </p>

            {userInfo && (
              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium">
                <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  Role: <strong className="text-white capitalize">{userInfo.role}</strong>
                </span>
                {userInfo.gender && (
                  <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                    Gender: <strong className="text-white capitalize">{userInfo.gender}</strong>
                  </span>
                )}
                <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  State: <strong className="text-white">{userInfo.state}</strong>
                </span>
                <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  Category: <strong className="text-white">{userInfo.category}</strong>
                </span>
                <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  Income: <strong className="text-emerald-400">₹{Number(userInfo.income || 0).toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Action buttons on header */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 no-print">
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl border border-white/15 text-xs sm:text-sm font-semibold transition-colors"
              title="Print schemes summary with required documents"
            >
              <Printer className="w-4 h-4" /> Print Checklist
            </button>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl border border-white/15 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Edit3 className="w-4 h-4" /> Edit Role
            </Link>
            <button
              onClick={fetchEligibleSchemes}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm shadow-blue-500/30"
            >
              <RefreshCw className="w-4 h-4" /> Re-Check
            </button>
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        {/* Count & Status */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
          <Award className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Showing <strong className="text-slate-900 font-bold">{filteredSchemes.length}</strong> eligible schemes 
            {stateFilter !== 'ALL' && <span className="text-blue-600 font-semibold"> ({stateFilter === 'TN' ? 'Tamil Nadu' : 'Central'})</span>}
            {' '}out of <span className="text-slate-500">{totalAvailable}</span> total schemes in database
          </span>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* State Scope Selector */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStateFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                stateFilter === 'ALL' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Schemes
            </button>
            <button
              type="button"
              onClick={() => setStateFilter('TN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                stateFilter === 'TN' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tamil Nadu Only
            </button>
            <button
              type="button"
              onClick={() => setStateFilter('CENTRAL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                stateFilter === 'CENTRAL' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Central / All India
            </button>
          </div>

          {/* Search Query */}
          <div className="relative min-w-[200px] sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search scheme name or document..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* NO SCHEMES MATCHED STATE */}
      {filteredSchemes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm max-w-2xl mx-auto">
          <div className="mx-auto w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Matching Schemes Found</h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            {errorMsg || 'No welfare schemes in the current database match your selected filter criteria. Try changing the State filter or updating your role details.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {stateFilter !== 'ALL' && (
              <button
                onClick={() => setStateFilter('ALL')}
                className="btn-secondary text-xs sm:text-sm px-4 py-2"
              >
                Reset Filter to All Schemes
              </button>
            )}
            <Link
              to="/profile"
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              Update Profile Information <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* SCHEME CARDS GRID */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme) => {
            const isBookmarked = savedIds.has(scheme.id);
            const schemeDocs = scheme.required_documents 
              ? scheme.required_documents.split('|').map(d => d.trim()).filter(Boolean)
              : [];
            
            const currentChecked = checkedDocs[scheme.id] || [];
            const readyCount = currentChecked.length;
            const totalDocsCount = schemeDocs.length;
            const allDocsReady = totalDocsCount > 0 && readyCount === totalDocsCount;
            const currentStatus = appStatus[scheme.id] || 'Not Applied';

            return (
              <div 
                key={scheme.id} 
                className="card flex flex-col bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-200 rounded-2xl overflow-hidden group"
              >
                <div className="p-5 sm:p-7 flex-1 flex flex-col">
                  
                  {/* Badges, Application Status, and Save */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200/60">
                        {scheme.provider}
                      </span>
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                        Role: {scheme.target_role}
                      </span>
                      {scheme.state && scheme.state !== 'All India' ? (
                        <span className="inline-flex items-center rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
                          {scheme.state} Only
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                          All India
                        </span>
                      )}
                      {scheme.gender_required === 'Male' && (
                        <span className="inline-flex items-center rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 border border-sky-200">
                          Male Students Only
                        </span>
                      )}
                      {scheme.gender_required === 'Female' && (
                        <span className="inline-flex items-center rounded-lg bg-pink-50 px-2.5 py-1 text-xs font-bold text-pink-700 border border-pink-200">
                          Female Only
                        </span>
                      )}
                      {scheme.gender_required === 'All' && (
                        <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                          All Genders
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 no-print">
                      <button
                        onClick={() => handleShare(scheme)}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Share scheme details"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSaveScheme(scheme.id)} 
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                          isBookmarked 
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                        }`} 
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark this scheme'}
                      >
                        <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Scheme Name */}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                    {scheme.scheme_name}
                  </h3>

                  {/* Short Description */}
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {scheme.description}
                  </p>

                  {/* BENEFITS SECTION */}
                  <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                        Benefits & Financial Assistance
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-snug">
                      {scheme.benefits || 'Financial grant & subsidy as per government norms.'}
                    </p>
                  </div>

                  {/* WHY THE USER IS ELIGIBLE SECTION */}
                  <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Why You Are Confirmed Eligible
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {(scheme.eligibility_reasons || []).map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* REQUIRED DOCUMENTS SECTION (Interactive Checklist) */}
                  {schemeDocs.length > 0 && (
                    <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-amber-700 shrink-0" />
                          <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-800">
                            Required Documents to Apply
                          </span>
                        </div>
                        {/* Document Readiness Counter */}
                        <div className="text-[11px] font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-full inline-block self-start sm:self-auto">
                          {readyCount} of {totalDocsCount} Prepared
                        </div>
                      </div>

                      {/* Mini Readiness Progress Bar */}
                      <div className="w-full bg-amber-200/60 rounded-full h-1.5 mb-3 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${allDocsReady ? 'bg-emerald-500' : 'bg-amber-600'}`}
                          style={{ width: `${totalDocsCount > 0 ? (readyCount / totalDocsCount) * 100 : 0}%` }}
                        ></div>
                      </div>

                      {/* Document Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {schemeDocs.map((doc, i) => {
                          const isChecked = currentChecked.includes(doc);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleToggleDocument(scheme.id, doc)}
                              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                                isChecked 
                                  ? 'bg-emerald-600 border-emerald-600 text-white font-semibold shadow-xs' 
                                  : 'bg-white border-amber-200 hover:border-amber-400 text-amber-950 font-medium'
                              }`}
                              title={isChecked ? 'Click to uncheck' : 'Click to mark as prepared/collected'}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-3.5 h-3.5 text-white shrink-0" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              )}
                              <span>{doc}</span>
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-[11px] text-amber-700 mt-2.5 italic">
                        Tip: Click any document to check it off as you collect it for your application.
                      </p>
                    </div>
                  )}

                  {/* Application Status Tracker */}
                  <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 no-print">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Application Status:
                    </span>
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(scheme.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none transition-colors ${
                        currentStatus === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : currentStatus === 'Applied Online'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : currentStatus === 'Documents Prepared'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="Not Applied">⚪ Not Applied</option>
                      <option value="Documents Prepared">🟡 Documents Prepared</option>
                      <option value="Applied Online">🔵 Applied Online</option>
                      <option value="Approved">🟢 Approved / Benefit Received</option>
                    </select>
                  </div>

                </div>
                
                {/* Card Footer with Verified Badge and Official Link */}
                <div className="px-5 sm:px-7 py-3.5 sm:py-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Eligible for Application</span>
                  </span>

                  <a 
                    href={getValidUrl(scheme.official_link)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm transition-all text-center"
                  >
                    Official Application Portal <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
