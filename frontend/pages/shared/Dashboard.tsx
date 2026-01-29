
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle2, Clock, MessageSquare, TrendingUp, ThumbsUp, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { issueAPI, dashboardAPI } from '../../services/api';

interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  avgResponseTime: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const statsResponse = await dashboardAPI.getStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch recent issues
      const issuesResponse = await issueAPI.getAll();
      if (issuesResponse.success) {
        const formatted = issuesResponse.data
          .map((i: any) => ({
            id: i._id || i.id,
            title: i.title,
            status: i.status || 'OPEN',
            category: i.category,
            student: i.studentName,
            reactions: i.reactions || 0,
            createdAt: new Date(i.createdAt).toLocaleString()
          }))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5); // Get top 5 recent

        setRecentIssues(formatted);
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: isAdmin ? 'Total Issues' : 'My Issues', 
      value: stats?.totalIssues ?? '-',
      icon: MessageSquare, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Pending', 
      value: stats?.pendingIssues ?? '-',
      icon: Clock, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
    { 
      label: 'Resolved', 
      value: stats?.resolvedIssues ?? '-',
      icon: CheckCircle2, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Avg. Response', 
      value: stats?.avgResponseTime ?? '-',
      icon: TrendingUp, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
  ];

  const chartData = [
    { name: 'Mon', count: 4 },
    { name: 'Tue', count: 7 },
    { name: 'Wed', count: 5 },
    { name: 'Thu', count: 12 },
    { name: 'Fri', count: 8 },
    { name: 'Sat', count: 2 },
    { name: 'Sun', count: 1 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-700 animate-spin" />
        <p className="text-slate-600 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Hello, {user?.name}!</h1>
          <p className="text-slate-600">
            {isAdmin 
              ? 'Monitor all student issues and activity across the system.' 
              : 'Track your issues and get support from the team.'}
          </p>
        </div>
        {!isAdmin && (
          <Link to="/raise-issue" className="bg-blue-700 text-white px-6 py-2.5 rounded font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-200">
            Report New Issue
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="text-sm text-red-600 hover:text-red-800 font-semibold mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-blue-900">Issue Volume (This Week)</h2>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1e40af" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#1e40af" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded border border-blue-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-blue-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-blue-900">Recent Activity</h2>
              <Link to="/my-issues" className="text-sm font-bold text-blue-700 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentIssues.length > 0 ? (
                recentIssues.map((issue) => (
                  <div key={issue.id} className="p-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {issue.student?.[0] || 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-900">{issue.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-600">{issue.student || 'Unknown'}</span>
                          <span className="w-1 h-1 bg-blue-200 rounded-full"></span>
                          <div className="flex items-center gap-1 text-xs text-blue-700 font-bold">
                            <ThumbsUp size={12}/> {issue.reactions}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        issue.status === 'RESOLVED' 
                          ? 'bg-green-100 text-green-700' 
                          : issue.status === 'IN_PROGRESS'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>No issues found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded border border-blue-200 shadow-sm">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Latest Announcements</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4 p-3 rounded hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 line-clamp-1">Campus Connectivity Update</p>
                  <p className="text-xs text-slate-600 line-clamp-2">Upgrading network drivers in the main auditorium today.</p>
                  <span className="text-[10px] text-blue-700 font-bold mt-1 block uppercase">Just Now</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/announcements" className="w-full mt-6 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 rounded transition-colors block text-center">
            View All Announcements
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
