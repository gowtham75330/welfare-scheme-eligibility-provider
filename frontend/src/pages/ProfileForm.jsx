import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Heart, 
  Accessibility, 
  Wheat, 
  Search, 
  Hourglass, 
  HardHat, 
  Baby, 
  Store, 
  Users, 
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ALL_ROLES = [
  { id: 'Student', label: 'Student', desc: 'School, college, degree & diploma scholarships', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'Women', label: 'Women', desc: 'Maternity assistance, basic income, microloans', icon: Heart, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  { id: 'Disabled', label: 'Disabled', desc: 'Special assistance, appliances & pensions', icon: Accessibility, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Farmer', label: 'Farmer', desc: 'PM-KISAN, crop credit, free power, irrigation', icon: Wheat, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Unemployed', label: 'Unemployed', desc: 'MGNREGA wage work, allowances & PMEGP loans', icon: Search, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Senior Citizen', label: 'Senior Citizen', desc: 'Old age pensions (60+ yrs) & assistive aids', icon: Hourglass, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'Worker', label: 'Worker', desc: 'e-Shram, construction welfare, accidental cover', icon: HardHat, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { id: 'Child / Minor', label: 'Child / Minor', desc: 'Sukanya Samriddhi, girl child protection, nutrition', icon: Baby, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'Entrepreneur / Self-Employed', label: 'Entrepreneur / Self-Employed', desc: 'MUDRA collateral-free loans, SVANidhi & NEEDS', icon: Store, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'Low-Income Family', label: 'Low-Income Family', desc: 'PMGKAY free rations, Ayushman health, PMAY house', icon: Users, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { id: 'Widow / Single Parent', label: 'Widow / Single Parent', desc: 'Widow pensions, remarriage aid, child care funds', icon: ShieldAlert, color: 'text-violet-600 bg-violet-50 border-violet-200' },
];

export default function ProfileForm({ user, setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: user?.role || 'Student',
    age: user?.age || '',
    gender: user?.gender || '',
    state: user?.state || 'Tamil Nadu',
    district: user?.district || '',
    category: user?.category || 'General',
    income: user?.income !== undefined ? user?.income : '',
    
    // Role-specific fields
    education_level: user?.education_level || 'Undergraduate',
    institution_type: user?.institution_type || 'Government',
    occupation: user?.occupation || '',
    employment_status: user?.employment_status || '',
    disability_percent: user?.disability_percent || '',
    disability_type: user?.disability_type || '',
    land_status: user?.land_status || 'Small (2.5 - 5 acres)',
    land_area: user?.land_area || '',
    marital_status: user?.marital_status || 'Single',
    family_size: user?.family_size || 4,
    bpl_card: user?.bpl_card || 'No',
    business_type: user?.business_type || 'Retail / Trading',
    annual_turnover: user?.annual_turnover || '',
    work_sector: user?.work_sector || 'Construction'
  });

  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['General', 'OBC', 'SC', 'ST', 'BC', 'MBC', 'EWS'];
  const educationLevels = ['School', 'College', 'Diploma', 'Undergraduate', 'Postgraduate'];
  const states = [
    'All India', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 
    'Maharashtra', 'Delhi', 'Uttar Pradesh', 'Gujarat', 'West Bengal'
  ];

  useEffect(() => {
    // Fetch latest profile on load
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.user) {
          setFormData(prev => ({ 
            ...prev, 
            ...data.user,
            role: data.user.role || prev.role || 'Student'
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleRoleSelect = (roleId) => {
    setFormData(prev => {
      const next = { ...prev, role: roleId };
      if (roleId === 'Women') {
        next.gender = 'Female';
      }
      if (roleId === 'Senior Citizen' && (!prev.age || Number(prev.age) < 60)) {
        next.age = 65;
      }
      if (roleId === 'Child / Minor' && (!prev.age || Number(prev.age) >= 18)) {
        next.age = 10;
      }
      if (roleId === 'Disabled' && (!prev.disability_percent || Number(prev.disability_percent) < 40)) {
        next.disability_percent = 50;
      }
      if (roleId === 'Widow / Single Parent' && (!prev.marital_status || prev.marital_status === 'Married')) {
        next.marital_status = 'Widow';
        next.gender = 'Female';
      }
      if (roleId === 'Unemployed') {
        next.employment_status = 'Unemployed';
      }
      return next;
    });
    setValidationError('');
  };

  const validateForm = () => {
    const age = Number(formData.age);
    const role = formData.role;

    if (!role) {
      return 'Please select a primary role / identity.';
    }

    if (formData.income === '' || Number(formData.income) < 0) {
      return 'Please provide a valid Annual Family Income in ₹.';
    }

    if (role === 'Senior Citizen') {
      if (!formData.age || age < 60) {
        return 'Senior Citizen schemes require applicant age to be 60 years or above.';
      }
    }

    if (role === 'Child / Minor') {
      if (!formData.age || age >= 18) {
        return 'Child / Minor schemes require age to be under 18 years.';
      }
    }

    if (role === 'Disabled') {
      const dis = Number(formData.disability_percent);
      if (!formData.disability_percent || dis < 40 || dis > 100) {
        return 'Government disability welfare schemes require certified disability of at least 40% (up to 100%).';
      }
    }

    if (role === 'Women') {
      if (formData.gender && formData.gender !== 'Female') {
        return 'Women welfare schemes are designated for Female applicants.';
      }
    }

    if (role === 'Widow / Single Parent') {
      if (formData.marital_status === 'Married') {
        return 'Widow & Single Parent schemes are for Widows, Single Parents, or Divorced/Deserted individuals.';
      }
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setValidationError(error);
      toast.error(error);
      return;
    }

    setLoading(true);
    setValidationError('');

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile saved! Checking eligibility...');
        if (setUser && data.user) {
          setUser({ ...user, ...data.user });
          localStorage.setItem('user', JSON.stringify({ ...user, ...data.user }));
        }
        setTimeout(() => navigate('/schemes'), 600);
      } else {
        setValidationError(data.message || 'Update failed');
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      setValidationError('Network error. Is the backend server running?');
      toast.error('Network connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full">
      <div className="card shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 border-b border-slate-100 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white">
          {/* Step Progress Bar */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-blue-700 font-extrabold text-xs shadow">1</div>
              <span className="text-xs font-bold text-white">Role Selection</span>
            </div>
            <div className="flex-1 h-0.5 bg-white/30 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-blue-700 font-extrabold text-xs shadow">2</div>
              <span className="text-xs font-bold text-white">Your Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-white/30 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/30 text-white/80 font-extrabold text-xs">3</div>
              <span className="text-xs font-semibold text-white/70">Eligible Schemes</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold">Role Selection & Profile</h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Select your identity from the 11 national citizen roles and fill in your details.
            The eligibility engine will match you against Central and State welfare schemes.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {validationError && (
            <div className="p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Eligibility Verification Notice</p>
                <p>{validationError}</p>
              </div>
            </div>
          )}

          {/* Section 1: Role Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">1. Select Your Primary Role / Identity</h2>
                <p className="text-xs text-slate-500">Choose the role that describes your profile to unlock specific eligibility rules.</p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                11 Roles Supported
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = formData.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${r.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                          {r.label}
                        </p>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: General Demographics */}
          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-1">2. Basic Demographics & Location</h2>
            <p className="text-xs text-slate-500 mb-4">Required to match Central and State level criteria.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Age (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  min="0"
                  max="120"
                  className="input-field"
                  placeholder={formData.role === 'Senior Citizen' ? 'e.g. 65' : formData.role === 'Child / Minor' ? 'e.g. 10' : 'e.g. 22'}
                  value={formData.age}
                  onChange={handleChange}
                />
                {formData.role === 'Senior Citizen' && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Senior citizen schemes require age ≥ 60
                  </p>
                )}
                {formData.role === 'Child / Minor' && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Minor child schemes require age &lt; 18
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  required
                  className="input-field"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {formData.role === 'Women' && (
                  <p className="text-xs text-pink-600 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Gender must be Female for Women schemes
                  </p>
                )}
                {formData.role === 'Student' && formData.gender === 'Male' && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 font-medium">
                    <Info className="w-3 h-3 shrink-0" /> Evaluates Tamil Pudhalvan Scheme (₹1,000/mo) & all-gender scholarships
                  </p>
                )}
                {formData.role === 'Student' && formData.gender === 'Female' && (
                  <p className="text-xs text-pink-600 mt-1 flex items-center gap-1 font-medium">
                    <Info className="w-3 h-3 shrink-0" /> Evaluates Pudhumai Penn Scheme (₹1,000/mo), AICTE Pragati & all-gender scholarships
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  State of Residence <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  required
                  className="input-field"
                  value={formData.state}
                  onChange={handleChange}
                >
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  District / City
                </label>
                <input
                  type="text"
                  name="district"
                  className="input-field"
                  placeholder="e.g. Chennai, Madurai, Coimbatore"
                  value={formData.district}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Social Category / Caste <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  required
                  className="input-field"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Annual Family Income (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="income"
                  required
                  min="0"
                  className="input-field font-medium text-slate-900"
                  placeholder="e.g. 150000"
                  value={formData.income}
                  onChange={handleChange}
                />
                <p className="text-xs text-slate-400 mt-1">Total household income from all sources.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Role-Specific Section */}
          <div className="pt-6 border-t border-slate-100 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-blue-600 text-white rounded-md text-xs font-bold uppercase">
                {formData.role} Details
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                3. Role-Specific Eligibility Criteria
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              These inputs are evaluated by the eligibility engine against specific scheme conditions for <strong>{formData.role}</strong>.
            </p>

            {/* STUDENT */}
            {formData.role === 'Student' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Current Education Level <span className="text-red-500">*</span>
                  </label>
                  <select name="education_level" className="input-field" value={formData.education_level} onChange={handleChange}>
                    {educationLevels.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Institution Type
                  </label>
                  <select name="institution_type" className="input-field" value={formData.institution_type} onChange={handleChange}>
                    <option value="Government">Government / Aided</option>
                    <option value="Private">Private Recognized</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    First Graduate in Family?
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="First Graduate">Yes, First Graduate</option>
                    <option value="Not First Graduate">No</option>
                  </select>
                </div>
              </div>
            )}

            {/* WOMEN */}
            {formData.role === 'Women' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Marital Status
                  </label>
                  <select name="marital_status" className="input-field" value={formData.marital_status} onChange={handleChange}>
                    <option value="Married">Married</option>
                    <option value="Single">Single / Unmarried</option>
                    <option value="Widow">Widow</option>
                    <option value="Divorced">Divorced / Deserted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Woman Head of Household?
                  </label>
                  <select name="employment_status" className="input-field" value={formData.employment_status} onChange={handleChange}>
                    <option value="Yes">Yes, Woman Head of Family</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Seeking Maternity Benefits?
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="Pregnant/Lactating">Yes (Pregnant / Lactating Mother)</option>
                    <option value="General">No (General Women Schemes)</option>
                  </select>
                </div>
              </div>
            )}

            {/* DISABLED */}
            {formData.role === 'Disabled' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Disability Percentage (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="disability_percent"
                    min="40"
                    max="100"
                    required
                    className="input-field font-bold text-purple-700"
                    placeholder="e.g. 40, 60, 80"
                    value={formData.disability_percent}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-purple-600 mt-1">Official Benchmark Disability is ≥ 40%.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Type of Disability
                  </label>
                  <select name="disability_type" className="input-field" value={formData.disability_type} onChange={handleChange}>
                    <option value="Locomotor / Physical">Locomotor / Orthopedic Impairment</option>
                    <option value="Visual Impairment">Visual Impairment / Low Vision</option>
                    <option value="Hearing & Speech">Hearing & Speech Impairment</option>
                    <option value="Intellectual / Neuro">Intellectual / Developmental Disability</option>
                    <option value="Multiple Disabilities">Multiple Disabilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Holds Valid UDID Card?
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="UDID Verified">Yes, UDID Card Holder</option>
                    <option value="Medical Certificate">Hospital Medical Certificate</option>
                    <option value="Pending">Applied / Pending</option>
                  </select>
                </div>
              </div>
            )}

            {/* FARMER */}
            {formData.role === 'Farmer' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Land Ownership Status <span className="text-red-500">*</span>
                  </label>
                  <select name="land_status" className="input-field" value={formData.land_status} onChange={handleChange}>
                    <option value="Small (2.5 - 5 acres)">Small Farmer (2.5 – 5 Acres)</option>
                    <option value="Marginal (< 2.5 acres)">Marginal Farmer (&lt; 2.5 Acres)</option>
                    <option value="Large (> 5 acres)">Large Farmer (&gt; 5 Acres)</option>
                    <option value="Landless / Tenant">Landless Agricultural Cultivator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Cultivable Land Area (in Acres) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="land_area"
                    min="0"
                    max="1000"
                    className="input-field"
                    placeholder="e.g. 2.5"
                    value={formData.land_area}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-emerald-600 mt-1">Small/marginal farmer schemes typically require ≤ 5 acres.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Has Agricultural Power Connection?
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="Power Connection Active">Yes, Authorized Pump Connection</option>
                    <option value="No Power Connection">No / Solar / Rainfed</option>
                  </select>
                </div>
              </div>
            )}

            {/* UNEMPLOYED */}
            {formData.role === 'Unemployed' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Employment Status
                  </label>
                  <select name="employment_status" className="input-field" value={formData.employment_status || 'Unemployed'} onChange={handleChange}>
                    <option value="Unemployed">Actively Seeking Job (Unemployed)</option>
                    <option value="Job Seeker">Recent Graduate / Job Seeker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Registered with Employment Exchange?
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="Registered 5+ Years">Yes, Registered for Over 5 Years</option>
                    <option value="Registered < 5 Years">Yes, Registered under 5 Years</option>
                    <option value="Not Registered">Not Registered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Highest Qualification
                  </label>
                  <select name="education_level" className="input-field" value={formData.education_level} onChange={handleChange}>
                    {educationLevels.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* SENIOR CITIZEN */}
            {formData.role === 'Senior Citizen' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Pension Status
                  </label>
                  <select name="employment_status" className="input-field" value={formData.employment_status} onChange={handleChange}>
                    <option value="No Existing Pension">No Existing Pension (Seeking OAP)</option>
                    <option value="Existing Pension">Already Receiving Pension</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    BPL / Low Income Card?
                  </label>
                  <select name="bpl_card" className="input-field" value={formData.bpl_card} onChange={handleChange}>
                    <option value="Yes">Yes, Holds BPL / PHH Card</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Requires Assisted Living Devices?
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="Assisted Aids Required">Yes (Wheelchair, Hearing Aid, Spectacles)</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>
            )}

            {/* WORKER */}
            {formData.role === 'Worker' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Work Sector <span className="text-red-500">*</span>
                  </label>
                  <select name="work_sector" className="input-field" value={formData.work_sector} onChange={handleChange}>
                    <option value="Construction">Building & Construction Labour</option>
                    <option value="Unorganized">General Unorganized Sector</option>
                    <option value="Domestic">Domestic Worker / Housekeeper</option>
                    <option value="Transport">Auto / Taxi / Commercial Driver</option>
                    <option value="Agriculture Labour">Agricultural Wage Labour</option>
                    <option value="Factory">Factory / Handloom / Beedi Worker</option>
                    <option value="Gig Worker">Delivery Partner / Gig Worker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Registered with e-Shram or Welfare Board?
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="e-Shram Registered">e-Shram Card Holder</option>
                    <option value="State Welfare Board">State Labour Welfare Board Member</option>
                    <option value="Unregistered">Not Yet Registered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Monthly Wage (₹)
                  </label>
                  <input
                    type="number"
                    name="annual_turnover"
                    className="input-field"
                    placeholder="e.g. 12000"
                    value={formData.annual_turnover}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-slate-400 mt-1">PM-SYM pension requires monthly income ≤ ₹15,000.</p>
                </div>
              </div>
            )}

            {/* CHILD / MINOR */}
            {formData.role === 'Child / Minor' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Guardian / Parental Status
                  </label>
                  <select name="marital_status" className="input-field" value={formData.marital_status} onChange={handleChange}>
                    <option value="Both Parents">Living with Parents</option>
                    <option value="Single Mother">Single Mother / Single Father</option>
                    <option value="COVID Orphan">Lost Parents during COVID (PM CARES)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Schooling Status
                  </label>
                  <select name="education_level" className="input-field" value={formData.education_level} onChange={handleChange}>
                    <option value="School">School Enrolled (Classes 1–12)</option>
                    <option value="Anganwadi">Anganwadi / Pre-School (0–6 Yrs)</option>
                    <option value="None">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Only Girl Child in Family?
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="Girl Child Family">Yes, Only 1 or 2 Daughters</option>
                    <option value="General">No</option>
                  </select>
                </div>
              </div>
            )}

            {/* ENTREPRENEUR / SELF-EMPLOYED */}
            {formData.role === 'Entrepreneur / Self-Employed' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Business / Enterprise Sector
                  </label>
                  <select name="business_type" className="input-field" value={formData.business_type} onChange={handleChange}>
                    <option value="Retail / Trading">Retail Store / Trading</option>
                    <option value="Manufacturing">Manufacturing & Processing</option>
                    <option value="Services">Services / Repairs / IT</option>
                    <option value="Street Vendor / Nano">Street Vendor / Hawker / Food Cart</option>
                    <option value="Artisan / Handicraft">Artisan / Handloom / Handicrafts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Annual Turnover (₹)
                  </label>
                  <input
                    type="number"
                    name="annual_turnover"
                    className="input-field"
                    placeholder="e.g. 400000"
                    value={formData.annual_turnover}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Loan / Subsidy Requirement
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="MUDRA Loan">MUDRA Loan (&lt; ₹10 Lakh)</option>
                    <option value="Street Vendor Loan">PM SVANidhi Micro Loan (&lt; ₹50,000)</option>
                    <option value="NEEDS Subsidy">TN NEEDS 25% Capital Subsidy</option>
                    <option value="Stand-Up India">Stand-Up India (&gt; ₹10 Lakh)</option>
                  </select>
                </div>
              </div>
            )}

            {/* LOW-INCOME FAMILY */}
            {formData.role === 'Low-Income Family' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Holds BPL / PHH Ration Card? <span className="text-red-500">*</span>
                  </label>
                  <select name="bpl_card" className="input-field font-semibold text-teal-800" value={formData.bpl_card} onChange={handleChange}>
                    <option value="Yes">Yes, Antyodaya / Priority Household (PHH)</option>
                    <option value="No">No / General Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Total Family Size (Members)
                  </label>
                  <input
                    type="number"
                    name="family_size"
                    min="1"
                    max="20"
                    className="input-field"
                    placeholder="e.g. 4"
                    value={formData.family_size}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-teal-600 mt-1">PMGKAY grants 5 kg free food grains per member.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Current Housing Status
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="No Pucca House">Do NOT own permanent pucca house (PMAY eligible)</option>
                    <option value="Own Pucca House">Owns pucca house</option>
                  </select>
                </div>
              </div>
            )}

            {/* WIDOW / SINGLE PARENT */}
            {formData.role === 'Widow / Single Parent' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Marital Status <span className="text-red-500">*</span>
                  </label>
                  <select name="marital_status" className="input-field font-bold text-violet-800" value={formData.marital_status} onChange={handleChange}>
                    <option value="Widow">Widow</option>
                    <option value="Single Parent">Single Mother / Single Parent</option>
                    <option value="Divorced">Divorced / Deserted by Spouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Number of Dependent Children
                  </label>
                  <input
                    type="number"
                    name="family_size"
                    min="0"
                    max="10"
                    className="input-field"
                    placeholder="e.g. 2"
                    value={formData.family_size}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-violet-600 mt-1">Provides child educational assistance & foster maintenance.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Seeking Remarriage Assistance?
                  </label>
                  <select name="occupation" className="input-field" value={formData.occupation} onChange={handleChange}>
                    <option value="Widow Remarriage">Yes, Widow Remarriage (Dr. Dharmambal Scheme)</option>
                    <option value="Pension Only">No, Seeking Monthly Pension & Rice</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Matching against active SQLite database welfare criteria</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary w-full sm:w-auto px-6 py-3"
              >
                Back to Dashboard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                {loading ? 'Evaluating...' : (
                  <>
                    Save Profile & Check Eligibility
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
