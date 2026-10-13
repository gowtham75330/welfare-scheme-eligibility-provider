import { Link, useLocation } from 'react-router-dom';
import { 
  BuildingLibraryIcon, 
  AcademicCapIcon, 
  BriefcaseIcon, 
  ArrowRightIcon, 
  UserGroupIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Handle ?scrollTo=contact from navbar on other pages
    const params = new URLSearchParams(location.search);
    if (params.get('scrollTo') === 'contact') {
      setTimeout(() => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [location.search]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Your message has been received!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        toast.error('Unable to send message at this time.');
      }
    } catch (err) {
      toast.error('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-50 font-sans">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-36 overflow-hidden px-4 md:px-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-8">
          <div className="w-full md:w-3/5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldCheckIcon className="w-4 h-4" /> Official Portal
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight md:leading-tight mb-6">
              Claim Your Rightful <br className="hidden md:block"/>
              <span className="text-blue-600">Government Benefits</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
              A unified platform to discover, check eligibility, and apply for Central and State Government schemes instantly. Built for the citizens of India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/register" className="inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-sm shadow-blue-600/20">
                Check Your Eligibility <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <a
                href="#contact"
                onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors cursor-pointer"
              >
                Contact Support
              </a>
            </div>
          </div>

          <div className="w-full md:w-2/5 flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-3 scale-105"></div>
              <div className="relative bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <DocumentCheckIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Quick Check</h3>
                <p className="text-slate-500 mb-6 text-sm">Find exactly what you are eligible for in under 2 minutes by filling out a simple profile.</p>
                <div className="space-y-4">
                  <div className="h-2.5 bg-slate-100 rounded-full w-full"></div>
                  <div className="h-2.5 bg-slate-100 rounded-full w-5/6"></div>
                  <div className="h-2.5 bg-slate-100 rounded-full w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section id="features" className="py-20 bg-white px-4 md:px-8 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Dedicated Support for Every Citizen</h2>
            <p className="text-lg text-slate-500">We continuously fetch the latest schemes across various demographics to ensure no one is left behind.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[
              { title: 'Students', desc: 'Pre & Post Matric Scholarships, higher education fee concessions & technical grants.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { title: 'Women', desc: 'Maternity financial assistance, basic income guarantee, and micro-credit.', color: 'text-pink-600', bg: 'bg-pink-50' },
              { title: 'Disabled', desc: 'Monthly maintenance pensions, assistive aids, ADIP devices, and technical scholarships.', color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'Farmers', desc: 'PM-KISAN ₹6,000/yr support, free agricultural power, KCC crop loans, and security schemes.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Unemployed', desc: 'MGNREGA 100-day wage guarantee, unemployment allowances, and PMEGP enterprise subsidies.', color: 'text-amber-600', bg: 'bg-amber-50' },
              { title: 'Senior Citizens', desc: 'National IGNOAPS & state old age pensions (60+ yrs), PMVVY returns, and free health aids.', color: 'text-orange-600', bg: 'bg-orange-50' },
              { title: 'Workers', desc: 'e-Shram accidental insurance cover, BOCW welfare, and PM-SYM monthly pensions.', color: 'text-cyan-600', bg: 'bg-cyan-50' },
              { title: 'Child / Minor', desc: 'Sukanya Samriddhi high-interest fund, CM Girl Child Protection, and Anganwadi nutrition.', color: 'text-rose-600', bg: 'bg-rose-50' },
              { title: 'Entrepreneurs', desc: 'MUDRA collateral-free loans up to ₹10 Lakh, PM SVANidhi street vendor credit & NEEDS.', color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Low-Income Families', desc: 'PMGKAY free monthly food rations, Ayushman Bharat ₹5 Lakh health cover & PMAY housing.', color: 'text-teal-600', bg: 'bg-teal-50' },
              { title: 'Widow / Single Parents', desc: 'Destitute widow monthly pensions, remarriage grants & dependent child educational aid.', color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map((feature, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-slate-200 transition-all duration-200">
                <div className={`w-10 h-10 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-4 font-bold text-sm group-hover:scale-105 transition-transform`}>
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-slate-900 text-white px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
              <p className="text-slate-400 text-lg">A simple three-step process to secure the benefits you are entitled to without any bureaucratic hassle.</p>
            </div>
            <Link to="/register" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Get Started <ChevronRightIcon className="w-4 h-4 mt-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="text-7xl font-bold text-white/5 absolute -top-8 -left-2 z-0">01</div>
              <div className="relative z-10 pt-6">
                <div className="w-12 h-1 bg-blue-500 mb-6 rounded-full"></div>
                <h4 className="text-2xl font-bold mb-3">Create Profile</h4>
                <p className="text-slate-400">Fill in your basic details securely. We only ask for information strictly required to calculate your eligibility across nationwide schemes.</p>
              </div>
            </div>
            <div className="relative">
              <div className="text-7xl font-bold text-white/5 absolute -top-8 -left-2 z-0">02</div>
              <div className="relative z-10 pt-6">
                <div className="w-12 h-1 bg-emerald-500 mb-6 rounded-full"></div>
                <h4 className="text-2xl font-bold mb-3">System Match</h4>
                <p className="text-slate-400">Our engine cross-references your profile against thousands of Central and State rules to generate a personalized list of guarantees.</p>
              </div>
            </div>
            <div className="relative">
              <div className="text-7xl font-bold text-white/5 absolute -top-8 -left-2 z-0">03</div>
              <div className="relative z-10 pt-6">
                <div className="w-12 h-1 bg-purple-500 mb-6 rounded-full"></div>
                <h4 className="text-2xl font-bold mb-3">Apply Direct</h4>
                <p className="text-slate-400">Click to visit the official application portal for your matched schemes with all your prerequisite documents ready.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-50 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Need Assistance?</h2>
              <p className="text-slate-500">Our support desk is readily available to help you navigate through the platform.</p>
            </div>
            
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-slate-50 hover:bg-white focus:bg-white" 
                    placeholder="Enter your name" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-slate-50 hover:bg-white focus:bg-white" 
                    placeholder="Enter your email address" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Message</label>
                <textarea 
                  required 
                  rows="4" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-slate-50 hover:bg-white focus:bg-white resize-none" 
                  placeholder="How can we assist you today?" 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
