import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  MessageSquare, 
  Save, 
  Building2, 
  LayoutDashboard, 
  MapPin, 
  GraduationCap, 
  Search, 
  Filter, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FolderSync,
  Layers,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard({ user }) {
  const [schemes, setSchemes] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schemes'); // 'schemes' | 'new_scheme' | 'users' | 'messages'

  // Manage Schemes Separation: 'TN' | 'CENTRAL' | 'ALL'
  const [providerTab, setProviderTab] = useState('TN');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialForm = {
    scheme_name: '', 
    provider: 'Tamil Nadu Government', 
    target_role: 'Student', 
    category_required: 'All', 
    gender_required: 'All', 
    income_limit: 9999999, 
    education_required: 'All', 
    state: 'Tamil Nadu', 
    description: '', 
    official_link: '',
    benefits: '', 
    important_conditions: '', 
    required_documents: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const fetchSchemes = async () => {
    try {
      const res = await fetch('/api/admin/schemes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setSchemes(data.schemes || []);
    } catch (err) { 
      console.error(err);
      toast.error('Failed to load schemes');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) { console.error(err); }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/contacts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    Promise.all([fetchSchemes(), fetchUsers(), fetchContacts()]).then(() => setLoading(false));
  }, []);

  const handleDelete = async (id, schemeName) => {
    if (window.confirm(`Are you sure you want to delete "${schemeName}"?`)) {
      try {
        const res = await fetch(`/api/admin/schemes/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          toast.success(`Deleted "${schemeName}"`);
          fetchSchemes();
        } else {
          toast.error('Failed to delete scheme');
        }
      } catch (err) {
        toast.error('Network error deleting scheme');
      }
    }
  };

  const handleEditClick = (scheme) => {
    setFormData({
      ...initialForm,
      ...scheme
    });
    setEditingId(scheme.id);
    setActiveTab('new_scheme');
  };

  const handleAddNewSchemeClick = (providerType) => {
    setEditingId(null);
    setFormData({
      ...initialForm,
      provider: providerType === 'CENTRAL' ? 'Central Government' : 'Tamil Nadu Government',
      state: providerType === 'CENTRAL' ? 'All India' : 'Tamil Nadu'
    });
    setActiveTab('new_scheme');
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    const isEdit = !!editingId;
    const url = isEdit ? `/api/admin/schemes/${editingId}` : '/api/admin/schemes';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(isEdit ? 'Scheme updated successfully!' : 'Scheme created successfully!');
        setFormData(initialForm);
        setEditingId(null);
        fetchSchemes();
        setActiveTab('schemes');
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error saving scheme');
    }
  };

  // Separate Schemes by Provider
  const tnSchemes = useMemo(() => {
    return schemes.filter(s => (s.provider || '').toLowerCase().includes('tamil nadu'));
  }, [schemes]);

  const centralSchemes = useMemo(() => {
    return schemes.filter(s => (s.provider || '').toLowerCase().includes('central'));
  }, [schemes]);

  // Filtered schemes based on Provider Tab, Role, and Search Query
  const displayedSchemes = useMemo(() => {
    let list = schemes;
    if (providerTab === 'TN') {
      list = tnSchemes;
    } else if (providerTab === 'CENTRAL') {
      list = centralSchemes;
    }

    if (roleFilter !== 'ALL') {
      list = list.filter(s => s.target_role === roleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        (s.scheme_name || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.target_role || '').toLowerCase().includes(q) ||
        (s.benefits || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [schemes, tnSchemes, centralSchemes, providerTab, roleFilter, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 font-semibold">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Portal Administration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Management Panel</h1>
          <p className="text-slate-500 text-sm mt-1">
            Separate, view, and manage Tamil Nadu Government and Central Government schemes with full administrative control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddNewSchemeClick('TN')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Tamil Nadu Scheme
          </button>
          <button
            onClick={() => handleAddNewSchemeClick('CENTRAL')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Central Scheme
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div 
          onClick={() => { setActiveTab('schemes'); setProviderTab('TN'); }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'schemes' && providerTab === 'TN'
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg border-amber-600 ring-2 ring-amber-400'
              : 'bg-white hover:border-amber-300 border-slate-200 text-slate-800 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Tamil Nadu Schemes</span>
            <span className="text-lg">🏛️</span>
          </div>
          <div className="text-3xl font-black mb-1">{tnSchemes.length}</div>
          <p className={`text-xs ${activeTab === 'schemes' && providerTab === 'TN' ? 'text-amber-100' : 'text-slate-500'}`}>
            State Government Schemes & Scholarships
          </p>
        </div>

        <div 
          onClick={() => { setActiveTab('schemes'); setProviderTab('CENTRAL'); }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'schemes' && providerTab === 'CENTRAL'
              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg border-blue-700 ring-2 ring-blue-400'
              : 'bg-white hover:border-blue-300 border-slate-200 text-slate-800 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Central Schemes</span>
            <span className="text-lg">🇮🇳</span>
          </div>
          <div className="text-3xl font-black mb-1">{centralSchemes.length}</div>
          <p className={`text-xs ${activeTab === 'schemes' && providerTab === 'CENTRAL' ? 'text-blue-100' : 'text-slate-500'}`}>
            Nationwide Central Schemes & Scholarships
          </p>
        </div>

        <div 
          onClick={() => { setActiveTab('schemes'); setProviderTab('ALL'); }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'schemes' && providerTab === 'ALL'
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg border-slate-900 ring-2 ring-slate-400'
              : 'bg-white hover:border-slate-400 border-slate-200 text-slate-800 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Total Combined</span>
            <span className="text-lg">📑</span>
          </div>
          <div className="text-3xl font-black mb-1">{schemes.length}</div>
          <p className={`text-xs ${activeTab === 'schemes' && providerTab === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
            Total Database Schemes Active
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('users')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-gradient-to-br from-purple-600 to-indigo-800 text-white shadow-lg border-purple-700 ring-2 ring-purple-400'
              : 'bg-white hover:border-purple-300 border-slate-200 text-slate-800 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Registered Citizens</span>
            <span className="text-lg">👥</span>
          </div>
          <div className="text-3xl font-black mb-1">{users.length}</div>
          <p className={`text-xs ${activeTab === 'users' ? 'text-purple-100' : 'text-slate-500'}`}>
            Beneficiary User Accounts
          </p>
        </div>
      </div>

      {/* PRIMARY NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-2">
        <button 
          className={`px-4 py-2.5 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'schemes' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          onClick={() => setActiveTab('schemes')}
        >
          📋 Manage Schemes ({schemes.length})
        </button>
        <button 
          className={`px-4 py-2.5 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'new_scheme' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          onClick={() => { setActiveTab('new_scheme'); setEditingId(null); }}
        >
          <Plus className="w-4 h-4 inline mr-1" />
          {editingId ? 'Edit Scheme' : 'Add New Scheme'}
        </button>
        <button 
          className={`px-4 py-2.5 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'users' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="w-4 h-4 inline mr-1" />
          Registered Users ({users.length})
        </button>
        <button 
          className={`px-4 py-2.5 font-bold text-sm rounded-xl transition-all ${
            activeTab === 'messages' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          onClick={() => setActiveTab('messages')}
        >
          <MessageSquare className="w-4 h-4 inline mr-1" />
          User Inquiries ({contacts.length})
        </button>
      </div>

      {/* TAB CONTENT: MANAGE SCHEMES WITH SEPARATION */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          
          {/* PROVIDER SEPARATION HEADER & CONTROLS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* SEPARATE PROVIDER TABS */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Provider Category:
                </label>
                <div className="flex flex-wrap sm:inline-flex p-1 bg-slate-100 rounded-xl gap-1 max-w-full">
                  <button
                    type="button"
                    onClick={() => setProviderTab('TN')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all ${
                      providerTab === 'TN'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>🏛️ Tamil Nadu Government</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${providerTab === 'TN' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {tnSchemes.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProviderTab('CENTRAL')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all ${
                      providerTab === 'CENTRAL'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>🇮🇳 Central Government</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${providerTab === 'CENTRAL' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {centralSchemes.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProviderTab('ALL')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all ${
                      providerTab === 'ALL'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>📑 All Schemes</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${providerTab === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {schemes.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* SEARCH & ROLE FILTER */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Role Filter */}
                <div className="w-full sm:w-48">
                  <select
                    className="input-field text-xs sm:text-sm py-2 bg-slate-50 border-slate-200 rounded-xl"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="ALL">All Roles ({displayedSchemes.length})</option>
                    <option value="Student">Student</option>
                    <option value="Women">Women</option>
                    <option value="Disabled">Disabled</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                    <option value="Worker">Worker</option>
                    <option value="Child / Minor">Child / Minor</option>
                    <option value="Entrepreneur / Self-Employed">Entrepreneur</option>
                    <option value="Low-Income Family">Low-Income Family</option>
                    <option value="Widow / Single Parent">Widow / Single Parent</option>
                  </select>
                </div>

                {/* Search input */}
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by scheme name..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Current View Banner Description */}
            <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              providerTab === 'TN' 
                ? 'bg-amber-50 border-amber-200 text-amber-900' 
                : providerTab === 'CENTRAL' 
                  ? 'bg-blue-50 border-blue-200 text-blue-900' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {providerTab === 'TN' ? '🏛️' : providerTab === 'CENTRAL' ? '🇮🇳' : '📋'}
                </span>
                <span>
                  Showing {providerTab === 'TN' ? 'Tamil Nadu Government Schemes Only' : providerTab === 'CENTRAL' ? 'Central Government Schemes Only' : 'All Mixed Schemes'}:
                  {' '}<strong className="underline">{displayedSchemes.length} schemes found</strong>
                  {roleFilter !== 'ALL' && ` in role: ${roleFilter}`}
                </span>
              </div>

              {providerTab !== 'ALL' && (
                <button
                  onClick={() => setProviderTab('ALL')}
                  className="text-xs text-blue-700 hover:underline font-bold"
                >
                  View All Schemes →
                </button>
              )}
            </div>
          </div>

          {/* SCHEMES TABLE */}
          <div className="card bg-white p-6 shadow-sm border border-slate-200 overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">#</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Scheme Details</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Provider & State</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Target Role</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Gender & Income</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {displayedSchemes.length > 0 ? displayedSchemes.map((s, index) => {
                    const isTN = (s.provider || '').toLowerCase().includes('tamil nadu');
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Row Number */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs font-bold text-slate-400">
                          {index + 1}
                        </td>

                        {/* Scheme Name & Link */}
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900 max-w-sm">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                            <span>{s.scheme_name}</span>
                            {s.official_link && (
                              <a 
                                href={s.official_link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-500 hover:text-blue-700 inline"
                                title="Visit official government link"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
                            {s.description || s.benefits}
                          </p>
                        </td>

                        {/* Provider Badge */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold ${
                              isTN 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {isTN ? '🏛️ Tamil Nadu' : '🇮🇳 Central Govt'}
                            </span>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {s.state || 'All India'}
                            </div>
                          </div>
                        </td>

                        {/* Target Role */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {s.target_role}
                          </span>
                        </td>

                        {/* Gender & Income limit */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs">
                          <div className="space-y-1">
                            {s.gender_required === 'Male' && (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                                👦 Male Only
                              </span>
                            )}
                            {s.gender_required === 'Female' && (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-pink-100 text-pink-800 border border-pink-200">
                                👧 Female Only
                              </span>
                            )}
                            {(!s.gender_required || s.gender_required === 'All') && (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                                👥 All Genders
                              </span>
                            )}
                            <div className="text-[11px] text-slate-500 font-medium">
                              Limit: {s.income_limit === 9999999 ? 'No limit' : `≤ ₹${Number(s.income_limit).toLocaleString()}`}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-center text-sm">
                          <div className="inline-flex items-center gap-2">
                            <button 
                              onClick={() => handleEditClick(s)} 
                              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                              title="Edit Scheme Details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(s.id, s.scheme_name)} 
                              className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                              title="Delete Scheme"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-sm">
                        No schemes match the selected provider and filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ADD / EDIT SCHEME FORM */}
      {activeTab === 'new_scheme' && (
        <div className="bg-white border text-left border-slate-200 rounded-2xl max-w-4xl mx-auto shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Scheme Details' : 'Add New Government Scheme'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure accurate Provider and Role assignment for the automated eligibility engine.
              </p>
            </div>
            <div className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
              {editingId ? 'Updating' : 'New Entry'}
            </div>
          </div>

          <form onSubmit={handleSaveScheme} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Scheme Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Scheme Name <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  className="input-field shadow-sm bg-white" 
                  placeholder="e.g. Tamil Pudhalvan Scheme" 
                  value={formData.scheme_name} 
                  onChange={e => setFormData({ ...formData, scheme_name: e.target.value })} 
                />
              </div>

              {/* Provider Selection (Crucial separation) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Provider <span className="text-red-500">*</span>
                </label>
                <select 
                  required 
                  className="input-field shadow-sm bg-white font-bold text-blue-900" 
                  value={formData.provider} 
                  onChange={e => {
                    const prov = e.target.value;
                    setFormData({ 
                      ...formData, 
                      provider: prov,
                      state: prov === 'Central Government' ? 'All India' : 'Tamil Nadu'
                    });
                  }}
                >
                  <option value="Tamil Nadu Government">🏛️ Tamil Nadu Government</option>
                  <option value="Central Government">🇮🇳 Central Government</option>
                </select>
              </div>

              {/* Target Role */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Target Role <span className="text-red-500">*</span>
                </label>
                <select 
                  required 
                  className="input-field shadow-sm bg-white" 
                  value={formData.target_role} 
                  onChange={e => setFormData({ ...formData, target_role: e.target.value })}
                >
                  <option value="Student">Student</option>
                  <option value="Women">Women</option>
                  <option value="Disabled">Disabled</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Senior Citizen">Senior Citizen</option>
                  <option value="Worker">Worker</option>
                  <option value="Child / Minor">Child / Minor</option>
                  <option value="Entrepreneur / Self-Employed">Entrepreneur / Self-Employed</option>
                  <option value="Low-Income Family">Low-Income Family</option>
                  <option value="Widow / Single Parent">Widow / Single Parent</option>
                  <option value="All">All Roles</option>
                </select>
              </div>

              {/* Gender Required */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Gender Required <span className="text-red-500">*</span>
                </label>
                <select 
                  required 
                  className="input-field shadow-sm bg-white" 
                  value={formData.gender_required} 
                  onChange={e => setFormData({ ...formData, gender_required: e.target.value })}
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male Only</option>
                  <option value="Female">Female Only</option>
                </select>
              </div>

              {/* Social Category Required */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Social Category / Caste Required
                </label>
                <select 
                  required 
                  className="input-field shadow-sm bg-white" 
                  value={formData.category_required} 
                  onChange={e => setFormData({ ...formData, category_required: e.target.value })}
                >
                  <option value="All">All Categories</option>
                  <option value="SC">SC / ST Only</option>
                  <option value="BC">BC / MBC / DNC</option>
                  <option value="OBC">OBC</option>
                  <option value="General">General</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              {/* Income Limit */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Annual Income Limit (₹)
                </label>
                <input 
                  type="number"
                  required 
                  className="input-field shadow-sm bg-white" 
                  placeholder="9999999 for no limit" 
                  value={formData.income_limit} 
                  onChange={e => setFormData({ ...formData, income_limit: Number(e.target.value) })} 
                />
              </div>

              {/* Education Required */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Education Level Required
                </label>
                <select 
                  required 
                  className="input-field shadow-sm bg-white" 
                  value={formData.education_required} 
                  onChange={e => setFormData({ ...formData, education_required: e.target.value })}
                >
                  <option value="All">All / Not Specified</option>
                  <option value="School">School Level</option>
                  <option value="Undergraduate">Undergraduate / College</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Diploma">Diploma / ITI</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  State Eligibility
                </label>
                <select 
                  required 
                  className="input-field shadow-sm bg-white" 
                  value={formData.state} 
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="All India">All India</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                </select>
              </div>

              {/* Benefits */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Financial Assistance & Benefits
                </label>
                <input 
                  type="text" 
                  className="input-field shadow-sm bg-white" 
                  placeholder="e.g. ₹1,000 per month deposited directly into bank account..." 
                  value={formData.benefits || ''} 
                  onChange={e => setFormData({ ...formData, benefits: e.target.value })} 
                />
              </div>

              {/* Important Conditions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Important Conditions (separated by | )
                </label>
                <input 
                  type="text" 
                  className="input-field shadow-sm bg-white" 
                  placeholder="e.g. Role: Student | Male Candidate | Studied 6th to 12th in TN Govt Schools" 
                  value={formData.important_conditions || ''} 
                  onChange={e => setFormData({ ...formData, important_conditions: e.target.value })} 
                />
              </div>

              {/* Required Documents */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Required Documents (separated by | )
                </label>
                <input 
                  type="text" 
                  className="input-field shadow-sm bg-white" 
                  placeholder="e.g. Aadhaar Card | Bonafide Certificate | Mark Sheet | Bank Passbook" 
                  value={formData.required_documents || ''} 
                  onChange={e => setFormData({ ...formData, required_documents: e.target.value })} 
                />
              </div>

              {/* Official Link */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Official Government Application Link <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="url" 
                  className="input-field shadow-sm bg-white" 
                  placeholder="https://..." 
                  value={formData.official_link} 
                  onChange={e => setFormData({ ...formData, official_link: e.target.value })} 
                />
              </div>

              {/* Full Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  required 
                  className="input-field shadow-sm bg-white" 
                  rows={4} 
                  placeholder="Describe the scheme objective and eligibility guidelines..." 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setActiveTab('schemes')} 
                className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <Save className="w-4 h-4" /> 
                {editingId ? 'Update Scheme' : 'Save Scheme'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: USERS */}
      {activeTab === 'users' && (
        <div className="card bg-white p-6 shadow-sm border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Registered Citizen Accounts ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">#</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">State</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Income</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400 font-bold">{i + 1}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{u.name}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500">{u.email}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                        {u.role || 'Unspecified'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">{u.state || 'N/A'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-emerald-700">
                      ₹{Number(u.income || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="card bg-white p-6 shadow-sm border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">User Contact Inquiries ({contacts.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Citizen</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-600 uppercase">Inquiry Message</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {contacts.length > 0 ? contacts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{c.name}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500">{c.email}</td>
                    <td className="px-5 py-4 text-sm text-slate-700 max-w-md">{c.message}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No customer inquiries received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
