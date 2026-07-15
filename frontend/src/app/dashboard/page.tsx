'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import { api } from '../../services/api';
import { DashboardData } from '../../types';
import { formatDate } from '../../lib/utils';
import {
  Briefcase,
  Calendar,
  Award,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] flex-col justify-center items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-400 text-sm font-medium">Loading your analytics...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center text-rose-500">
          <p className="font-semibold">Error loading dashboard stats</p>
          <p className="text-sm mt-1">Please make sure your database connection is active.</p>
        </div>
      </Layout>
    );
  }

  const { stats, upcomingInterviews, charts } = data;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time metrics and pipeline analysis of your job search.</p>
        </div>

        {/* Bento Grid - Step 1: Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {/* Card 1 */}
          <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Apps</span>
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{stats.totalApplications}</span>
              <span className="text-xs text-slate-500 block mt-1">All time applications</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Interviews</span>
              <Calendar className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{stats.interviews}</span>
              <span className="text-xs text-slate-500 block mt-1">Total interviews lined up</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Offers</span>
              <Award className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{stats.offers}</span>
              <span className="text-xs text-slate-500 block mt-1">Secured job offers</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Rejections</span>
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{stats.rejections}</span>
              <span className="text-xs text-slate-500 block mt-1">Applications rejected</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Response Rate</span>
              <UserCheck className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{stats.responseRate}%</span>
              <span className="text-xs text-slate-500 block mt-1">Applications callback</span>
            </div>
          </div>

          {/* Card 6 */}
          <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">This Month</span>
              <TrendingUp className="h-5 w-5 text-teal-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{stats.appsThisMonth}</span>
              <span className="text-xs text-slate-500 block mt-1">Applied this month</span>
            </div>
          </div>
        </div>

        {/* Bento Grid - Step 2: Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications Timeline (Chart) */}
          <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-6 lg:col-span-2 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Application Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Track your application volume month by month</p>
            </div>
            <div className="h-[280px] w-full mt-2">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.appsByMonth} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '13px' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" name="Applications" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Upcoming Interviews</h2>
              <p className="text-xs text-slate-500 mt-0.5">Prepare for your upcoming scheduled rounds</p>
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[280px]">
              {upcomingInterviews.length === 0 ? (
                <div className="flex h-full flex-col justify-center items-center text-slate-500 text-center py-10">
                  <Calendar className="h-8 w-8 opacity-20 mb-2" />
                  <p className="text-sm">No interviews scheduled</p>
                  <p className="text-xs mt-1">Keep applying to get callbacks!</p>
                </div>
              ) : (
                upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="rounded-lg border border-[#24262f] bg-[#0d0e12] p-4 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-blue-500">{interview.stage}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatDate(interview.date)} {interview.time && `@ ${interview.time}`}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {interview.application.position}
                    </h3>
                    <p className="text-xs text-slate-400">{interview.application.company.name}</p>
                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 mt-2 transition-colors"
                      >
                        Join Meeting <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bento Grid - Step 3: Breakdown Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications by Status */}
          <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Pipeline Status</h2>
              <p className="text-xs text-slate-500 mt-0.5">Breakdown of applications across stages</p>
            </div>
            <div className="h-[240px] w-full flex items-center justify-between gap-4">
              {mounted && charts.appsByStatus.length > 0 && (
                <>
                  <div className="h-full w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts.appsByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="count"
                          nameKey="status"
                        >
                          {charts.appsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff', fontSize: '13px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 w-1/2 overflow-y-auto max-h-[220px]">
                    {charts.appsByStatus.map((item, index) => (
                      <div key={item.status} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-xs text-slate-300 font-medium truncate w-[100px]">{item.status}</span>
                        <span className="text-xs text-slate-500 font-semibold ml-auto">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {mounted && charts.appsByStatus.length === 0 && (
                <div className="flex w-full h-full flex-col justify-center items-center text-slate-500 py-10">
                  <p className="text-sm">No status data to show</p>
                </div>
              )}
            </div>
          </div>

          {/* Applications by Company */}
          <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Top Target Companies</h2>
              <p className="text-xs text-slate-500 mt-0.5">Companies you applied to the most</p>
            </div>
            <div className="h-[240px] w-full mt-2">
              {mounted && charts.appsByCompany.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={charts.appsByCompany}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis dataKey="company" type="category" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontSize: '13px' }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {mounted && charts.appsByCompany.length === 0 && (
                <div className="flex w-full h-full flex-col justify-center items-center text-slate-500 py-10">
                  <p className="text-sm">No company data to show</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
