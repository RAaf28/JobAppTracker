'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import { api } from '../../services/api';
import { Interview, Application } from '../../types';
import { Plus, Search, Calendar, Pencil, Trash2, X, AlertCircle, ExternalLink, Link as LinkIcon, User, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDate } from '../../lib/utils';

export default function InterviewsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all interviews
  const { data: interviewsData, isLoading: isInterviewsLoading } = useQuery<{ success: boolean; interviews: Interview[] }>({
    queryKey: ['interviews'],
    queryFn: async () => {
      const response = await api.get('/interviews');
      return response.data;
    },
  });

  // Fetch all applications (for selection in form)
  const { data: applicationsData } = useQuery<{ success: boolean; applications: Application[] }>({
    queryKey: ['applications-for-interviews'],
    queryFn: async () => {
      const response = await api.get('/applications');
      return response.data;
    },
    enabled: modalOpen, // only load when modal opens
  });

  const interviews = interviewsData?.interviews || [];
  const applications = applicationsData?.applications || [];

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      applicationId: '',
      stage: '',
      date: '',
      time: '',
      interviewer: '',
      meetingLink: '',
      notes: '',
      outcome: 'Pending',
    },
  });

  const openAddModal = () => {
    reset({
      applicationId: '',
      stage: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      interviewer: '',
      meetingLink: '',
      notes: '',
      outcome: 'Pending',
    });
    setEditingInterview(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (interview: Interview) => {
    // Dates from Prisma are ISO strings, convert to YYYY-MM-DD
    const isoDate = interview.date ? new Date(interview.date).toISOString().split('T')[0] : '';
    reset({
      applicationId: interview.applicationId,
      stage: interview.stage,
      date: isoDate,
      time: interview.time || '',
      interviewer: interview.interviewer || '',
      meetingLink: interview.meetingLink || '',
      notes: interview.notes || '',
      outcome: interview.outcome || 'Pending',
    });
    setEditingInterview(interview);
    setFormError(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingInterview) {
        return api.patch(`/interviews/${editingInterview.id}`, data);
      } else {
        return api.post('/interviews', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Something went wrong.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (confirm('Are you sure you want to delete this interview schedule?')) {
        return api.delete(`/interviews/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const onSubmit = (formData: any) => {
    saveMutation.mutate(formData);
  };

  const filteredInterviews = interviews.filter((i) => {
    const searchString = search.toLowerCase();
    const position = i.application?.position?.toLowerCase() || '';
    const company = i.application?.company?.name?.toLowerCase() || '';
    const stage = i.stage.toLowerCase();
    return position.includes(searchString) || company.includes(searchString) || stage.includes(searchString);
  });

  const getOutcomeColor = (outcome?: string | null) => {
    switch (outcome) {
      case 'Passed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Failed':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Pending':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Interviews</h1>
            <p className="text-slate-400 mt-1">Schedule and monitor interview progression.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-5 w-5" />
            Schedule Interview
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center rounded-lg border border-[#24262f] bg-[#16181d] px-4 py-3 max-w-md">
          <Search className="h-5 w-5 text-slate-500 mr-3" />
          <input
            type="text"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            placeholder="Search by company, position or stage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isInterviewsLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-slate-500 text-center py-20 border border-dashed border-[#24262f] rounded-2xl bg-[#16181d]/20">
            <Calendar className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-lg font-bold">No interviews scheduled</p>
            <p className="text-sm mt-1">Schedule your next technical or behavioral round to start tracking.</p>
          </div>
        ) : (
          /* Bento Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-xl border border-[#24262f] bg-[#16181d] p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                        {interview.stage}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-1 leading-tight">
                        {interview.application?.position}
                      </h2>
                      <p className="text-sm text-slate-400">{interview.application?.company?.name}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(interview)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-[#24262f] hover:text-white transition-colors"
                        title="Edit Interview"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(interview.id)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        title="Delete Interview"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Schedule date details */}
                  <div className="flex flex-col gap-2 py-3 border-y border-[#24262f] text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>
                        {formatDate(interview.date)} {interview.time && `@ ${interview.time}`}
                      </span>
                    </div>

                    {interview.interviewer && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span>Interviewer: {interview.interviewer}</span>
                      </div>
                    )}
                  </div>

                  {/* Outcome Tag & Meeting Link */}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold border rounded-full ${getOutcomeColor(interview.outcome)}`}>
                      {interview.outcome || 'Pending'}
                    </span>

                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        Join Room <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {interview.notes && (
                  <div className="mt-4 border-t border-[#24262f] pt-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> Notes
                    </p>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {interview.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
            <div className="w-full max-w-lg rounded-xl border border-[#24262f] bg-[#16181d] p-6 shadow-2xl relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 rounded-md p-1.5 text-slate-400 hover:bg-[#24262f] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-4">
                {editingInterview ? 'Edit Interview Details' : 'Schedule New Interview'}
              </h2>

              {formError && (
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-500">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Select Application */}
                {!editingInterview ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Select Application *
                    </label>
                    <select
                      required
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                      {...register('applicationId', { required: true })}
                    >
                      <option value="">Choose an active application...</option>
                      {applications.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.position} - {app.company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Application
                    </span>
                    <p className="text-sm text-slate-300 font-bold bg-[#0d0e12] rounded-lg border border-[#24262f] px-4 py-2">
                      {editingInterview.application?.position} at {editingInterview.application?.company?.name}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Stage / Round Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. Technical Interview"
                      {...register('stage', { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Interviewer Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. Sarah Connor"
                      {...register('interviewer')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      {...register('date', { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. 10:00 AM EST"
                      {...register('time')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Meeting Link URL
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. https://zoom.us/j/..."
                      {...register('meetingLink')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Outcome Status
                    </label>
                    <select
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      {...register('outcome')}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Notes / Preparation Checklists
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Topics to study, questions to ask, key points..."
                    {...register('notes')}
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-[#24262f] pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-[#24262f] px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-[#24262f] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saveMutation.isPending ? 'Saving...' : 'Save Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
