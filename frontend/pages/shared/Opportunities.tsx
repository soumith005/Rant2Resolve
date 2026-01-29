
import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, MapPin, Calendar, DollarSign, ChevronDown, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Opportunity, ApplicationStatus } from '../../types';
import { opportunityAPI, applicationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ApplicationForm from '../../components/common/ApplicationForm';

// Default Sample Opportunities (Fallback Data)
const DEFAULT_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'sample-1',
    title: 'Software Engineer Intern',
    company: 'TechCorp Solutions',
    type: 'INTERNSHIP',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'San Francisco, CA',
    mode: 'On-Campus',
    stipend: '$25/hr',
    description: 'Join our engineering team for a 12-week summer internship. You\'ll work on real-world projects building scalable web applications using modern tech stacks. Mentorship from senior engineers included.',
    skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git'],
    eligibility: 'Currently enrolled in a BS/CS or related field. Minimum GPA 3.0. Strong problem-solving skills required.',
    duration: '12 weeks (Summer)',
    applyUrl: '#',
    isInternal: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Data Analyst - Graduate Role',
    company: 'AnalytiX Corp',
    type: 'FULL-TIME',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'New York, NY',
    mode: 'Hybrid',
    stipend: '$70,000 - $85,000/year',
    description: 'We\'re looking for a Data Analyst to join our analytics team. You\'ll work with large datasets, create dashboards, and provide actionable insights for business decisions. Experience with Python, SQL, and data visualization tools is essential.',
    skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'],
    eligibility: 'Bachelor\'s degree in related field (Statistics, Economics, Computer Science, or Math). Knowledge of SQL and Python required.',
    duration: 'Full-Time',
    applyUrl: 'https://example.com/apply-data-analyst',
    isInternal: false,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Research Assistant - AI Lab',
    company: 'University AI Research Center',
    type: 'RESEARCH',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Cambridge, MA',
    mode: 'On-Campus',
    stipend: '$18/hr',
    description: 'Assist faculty members in cutting-edge AI and machine learning research. Responsibilities include literature review, coding implementations, running experiments, and data analysis. Excellent opportunity to contribute to published research.',
    skills: ['Python', 'Machine Learning', 'PyTorch', 'Research', 'Data Analysis'],
    eligibility: 'Currently enrolled graduate or advanced undergraduate student. Background in ML/AI preferred. Strong programming fundamentals required.',
    duration: '6-12 months (flexible)',
    applyUrl: '#',
    isInternal: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const Opportunities: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<Record<string, { hasApplied: boolean; status?: ApplicationStatus }>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadOpportunities();
  }, [refreshTrigger]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await opportunityAPI.getAll();
      
      // Use default opportunities if backend returns empty array
      const opportunitiesToDisplay = data && data.length > 0 ? data : DEFAULT_OPPORTUNITIES;
      
      setOpportunities(opportunitiesToDisplay);
      setError(null);

      // Check application status for each opportunity
      if (user?.role === 'STUDENT') {
        const statusMap: Record<string, any> = {};
        for (const opp of opportunitiesToDisplay) {
          try {
            const status = await applicationAPI.checkApplicationStatus(opp.id);
            statusMap[opp.id] = status;
          } catch {
            // If API fails for status check, just skip it
            statusMap[opp.id] = { hasApplied: false };
          }
        }
        setApplicationStatus(statusMap);
      }
    } catch (err: any) {
      // If API call fails entirely, use default opportunities
      setOpportunities(DEFAULT_OPPORTUNITIES);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleApplyClick = (opportunity: Opportunity) => {
    if (opportunity.isInternal) {
      setSelectedOpportunity(opportunity);
      setShowApplicationForm(true);
    } else {
      // External apply - redirect to external link
      if (opportunity.applyUrl) {
        window.open(opportunity.applyUrl, '_blank');
      }
    }
  };

  const handleApplicationSuccess = () => {
    // Refresh application statuses
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8 py-2">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Career & Research Opportunities</h1>
        <p className="text-lg text-slate-600">Discover exclusive openings for students and graduates</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-600 mt-4">Loading opportunities...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {opportunities.map((opp, idx) => {
            const isExpanded = expandedId === opp.id;
            const appStatus = applicationStatus[opp.id];
            const hasApplied = appStatus?.hasApplied;
            
            return (
              <div
                key={opp.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? 'border-indigo-400 shadow-2xl shadow-indigo-200/50' 
                    : 'border-slate-200 shadow-md hover:shadow-xl hover:border-indigo-300'
                }`}
              >
                {/* Header / Summary */}
                <div
                  onClick={() => toggleExpand(opp.id)}
                  className="p-7 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-transparent transition-all"
                >
                  <div className="flex gap-6 flex-1 min-w-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <Building2 className="text-indigo-600" size={36} />
                    </div>
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900">{opp.title}</h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap ${
                          opp.type === 'FULL-TIME' ? 'bg-emerald-100 text-emerald-700' : 
                          opp.type === 'INTERNSHIP' ? 'bg-blue-100 text-blue-700' : 
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {opp.type}
                        </span>
                        {hasApplied && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                            <CheckCircle size={14} />
                            Applied
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600">
                        <div className="flex items-center gap-2 font-medium">
                          <Building2 size={17} className="text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{opp.company}</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          <MapPin size={17} className="text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{opp.location}</span>
                        </div>
                        {opp.stipend && (
                          <div className="flex items-center gap-2 font-medium text-emerald-600">
                            <DollarSign size={17} className="flex-shrink-0" />
                            <span className="whitespace-nowrap">{opp.stipend}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 border-t md:border-t-0 pt-5 md:pt-0 w-full md:w-auto">
                    <div className="text-center hidden sm:block shrink-0">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">Apply Before</p>
                      <div className="flex items-center gap-2 text-slate-800 font-semibold whitespace-nowrap">
                        <Calendar size={16} className="text-indigo-500" />
                        {new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleExpand(opp.id)}
                      className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap ${
                        isExpanded
                          ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow-indigo-50'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                      }`}
                    >
                      {isExpanded ? '↥ Hide Details' : 'View Details'}
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expandable Details */}
                <div className={`overflow-hidden transition-all duration-300 ease-out ${
                  isExpanded ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="border-t border-slate-100 px-7 py-8 space-y-8 bg-gradient-to-b from-slate-50/50 to-white">
                    
                    {/* Description */}
                    <div className="animate-fade-in">
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Briefcase size={22} className="text-indigo-600" />
                        About This Opportunity
                      </h4>
                      <p className="text-slate-700 leading-relaxed text-base">{opp.description}</p>
                    </div>

                    {/* Duration & Mode */}
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                        <h5 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2 text-indigo-600">
                          <Clock size={18} className="text-indigo-600" />
                          Duration
                        </h5>
                        <p className="text-slate-700 font-medium text-base">{opp.duration}</p>
                      </div>
                      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                        <h5 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2 text-indigo-600">
                          <MapPin size={18} className="text-indigo-600" />
                          Work Mode
                        </h5>
                        <p className="text-slate-700 font-medium text-base">{opp.mode}</p>
                      </div>
                    </div>

                    {/* Eligibility */}
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CheckCircle size={22} className="text-emerald-600" />
                        Eligibility Criteria
                      </h4>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                        <p className="text-slate-700 leading-relaxed text-base">{opp.eligibility}</p>
                      </div>
                    </div>

                    {/* Required Skills */}
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Required Skills</h4>
                      <div className="flex flex-wrap gap-3">
                        {opp.skills?.map(skill => (
                          <span
                            key={skill}
                            className="bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-full text-sm font-semibold border border-indigo-200 hover:bg-indigo-200 transition-colors shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Apply Section */}
                    <div className="pt-6 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Action</p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {user?.role === 'STUDENT' ? (
                          hasApplied ? (
                            <div className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-sm">
                              <CheckCircle size={22} className="text-green-600" />
                              <div className="text-left">
                                <p className="text-sm font-bold">Applied</p>
                                <p className="text-xs text-green-600 font-medium">Status: {appStatus?.status || 'PENDING'}</p>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleApplyClick(opp)}
                              className={`flex-1 px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 text-center group ${
                                opp.isInternal
                                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-200'
                                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-200'
                              }`}
                            >
                              <span className="text-lg">→</span>
                              Apply Now
                              <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          )
                        ) : (
                          <div className="flex-1 text-center bg-slate-50 border border-slate-200 text-slate-600 py-4 rounded-xl font-medium">
                            <p>Sign in as a student to apply</p>
                          </div>
                        )}
                        <button
                          onClick={() => toggleExpand(opp.id)}
                          className="px-8 py-4 border-2 border-indigo-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all hover:border-indigo-300"
                        >
                          ↧ Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showApplicationForm && selectedOpportunity && (
        <ApplicationForm
          opportunityId={selectedOpportunity.id}
          opportunityTitle={selectedOpportunity.title}
          onClose={() => {
            setShowApplicationForm(false);
            setSelectedOpportunity(null);
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default Opportunities;
