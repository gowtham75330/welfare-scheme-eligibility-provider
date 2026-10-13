import { useState, useEffect } from 'react';
import { ExternalLink, Trash2, ClipboardList, FileText, Banknote, BookmarkCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const getValidUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

export default function SavedSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedSchemes = async () => {
    try {
      const res = await fetch('/api/schemes/saved', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSchemes(data.schemes || []);
      }
    } catch (error) {
      console.error('Error fetching saved schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSchemes();
  }, []);

  const handleUnsave = async (schemeId) => {
    try {
      const res = await fetch(`/api/schemes/saved/${schemeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        setSchemes(schemes.filter(s => s.id !== schemeId));
        toast.success('Removed from saved bookmarks');
      }
    } catch (error) {
      toast.error('Network error removing scheme');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-24">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading your saved schemes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookmarkCheck className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Saved Welfare Schemes</h1>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm">
            Quick access to your bookmarked Central and Tamil Nadu government schemes with official application links and required documents.
          </p>
        </div>

        <Link
          to="/schemes"
          className="btn-primary self-start sm:self-auto text-xs sm:text-sm py-2 px-4 shadow-sm"
        >
          View All Eligible Schemes <ArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>

      {schemes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-lg mx-auto p-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Saved Schemes Yet</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            When you view your eligible schemes, click the bookmark icon on any scheme card to save it here for fast reference.
          </p>
          <Link to="/schemes" className="btn-primary text-sm px-6 py-2.5">
            Browse Eligible Schemes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {schemes.map((scheme) => {
            const schemeDocs = scheme.required_documents 
              ? scheme.required_documents.split('|').map(d => d.trim()).filter(Boolean)
              : [];

            return (
              <div 
                key={scheme.saved_id || scheme.id} 
                className="card p-5 sm:p-6 flex flex-col border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all rounded-2xl bg-white"
              >
                <div className="flex-1">
                  {/* Badges and Remove Button */}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200/60">
                        {scheme.provider}
                      </span>
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                        Role: {scheme.target_role}
                      </span>
                      {scheme.state && scheme.state !== 'All India' && (
                        <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
                          {scheme.state}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleUnsave(scheme.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {scheme.scheme_name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-slate-600 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                    {scheme.description}
                  </p>

                  {/* Benefits */}
                  {scheme.benefits && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                          Financial Assistance
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-950 leading-snug">
                        {scheme.benefits}
                      </p>
                    </div>
                  )}

                  {/* Scheme-Specific Required Documents */}
                  {schemeDocs.length > 0 && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                      <div className="flex items-center gap-1.5 mb-2">
                        <ClipboardList className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                          Required Documents to Apply
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {schemeDocs.map((doc, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-950 font-medium"
                          >
                            <FileText className="w-3 h-3 text-amber-600 shrink-0" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Footer with Apply Link */}
                <div className="pt-3 border-t border-slate-100 mt-auto flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-500">
                    Saved in your portal
                  </span>
                  <a 
                    href={getValidUrl(scheme.official_link)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Apply on Official Portal <ExternalLink className="w-3.5 h-3.5" />
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
