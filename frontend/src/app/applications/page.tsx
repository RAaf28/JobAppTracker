'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import { api } from '../../services/api';
import { Application, Company, Resume } from '../../types';
import {
  Plus,
  Search,
  Briefcase,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  MapPin,
  DollarSign,
  Filter,
  ArrowUpDown,
  FileText,
  MessageSquare,
  Sparkles,
  Check,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDate, formatCurrency } from '../../lib/utils';
import { suggestResume } from '../../lib/useSuggestedResume';

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('recentlyApplied');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [suggestedResumeId, setSuggestedResumeId] = useState<string | null>(null);

  // S3 AI Tailoring states
  const [acceptedIndices, setAcceptedIndices] = useState<number[]>([]);
  const [tailoringError, setTailoringError] = useState<string | null>(null);

  const tailorMutation = useMutation({
    mutationFn: async ({ resumeId, jobDescription }: { resumeId: string; jobDescription: string }) => {
      setTailoringError(null);
      setAcceptedIndices([]);
      const response = await api.post(`/resumes/${resumeId}/tailor`, { jobDescription });
      return response.data.data; // { summary, suggestions: [{ original, suggested, reason }] }
    },
    onError: (err: any) => {
      console.error(err);
      setTailoringError("Couldn't generate suggestions, try again");
    }
  });

  // Fetch applications with parameters
  const { data, isLoading } = useQuery<{ success: boolean; applications: Application[] }>({
    queryKey: ['applications', statusFilter, jobTypeFilter, search, sortBy],
    queryFn: async () => {
      const response = await api.get('/applications', {
        params: {
          status: statusFilter || undefined,
          jobType: jobTypeFilter || undefined,
          search: search || undefined,
          sortBy,
        },
      });
      return response.data;
    },
  });

  // Fetch companies (for selection in form)
  const { data: companiesData } = useQuery<{ success: boolean; companies: Company[] }>({
    queryKey: ['companies-for-apps'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data;
    },
    enabled: modalOpen,
  });

  // Fetch resumes (for selection in form)
  const { data: resumesData } = useQuery<{ success: boolean; resumes: Resume[] }>({
    queryKey: ['resumes-for-apps'],
    queryFn: async () => {
      const response = await api.get('/resumes');
      return response.data;
    },
    enabled: modalOpen,
  });

  const applications = data?.applications || [];
  const companies = companiesData?.companies || [];
  const resumes = resumesData?.resumes || [];

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      companyId: '',
      position: '',
      jobType: 'Full-time',
      status: 'Applied',
      salaryMin: '',
      salaryMax: '',
      location: 'Remote',
      source: '',
      appliedDate: new Date().toISOString().split('T')[0],
      deadline: '',
      resumeId: '',
      coverLetter: '',
      notes: '',
      jobDescription: '',
      tailoringNotes: '',
    },
  });

  // Watch form values for auto-suggestion
  const watchedPosition = watch('position');
  const watchedCompanyId = watch('companyId');
  const watchedResumeId = watch('resumeId');
  const watchedJobDescription = watch('jobDescription');

  useEffect(() => {
    if (editingApplication || !modalOpen) return;

    const delayDebounce = setTimeout(() => {
      const companyName = companies.find((c) => c.id === watchedCompanyId)?.name || '';
      const suggested = suggestResume(resumes, watchedPosition || '', companyName);

      if (suggested) {
        setValue('resumeId', suggested.id);
        setSuggestedResumeId(suggested.id);
      } else {
        if (watchedResumeId === suggestedResumeId) {
          setValue('resumeId', '');
          setSuggestedResumeId(null);
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [watchedPosition, watchedCompanyId, resumes, companies, editingApplication, modalOpen, setValue, suggestedResumeId, watchedResumeId]);

  // Check if current selection is the auto-suggested one, and how it matched
  const showSuggestedIndicator = watchedResumeId === suggestedResumeId && !!suggestedResumeId;
  const selectedResume = resumes.find((r) => r.id === watchedResumeId);
  const isMatchByTags = selectedResume && (selectedResume.tags || []).some((tag) => {
    const companyName = companies.find((c) => c.id === watchedCompanyId)?.name || '';
    const haystack = `${watchedPosition || ''} ${companyName}`.toLowerCase();
    return tag && haystack.includes(tag.toLowerCase());
  });

  const openAddModal = () => {
    tailorMutation.reset();
    setAcceptedIndices([]);
    setTailoringError(null);
    reset({
      companyId: companies[0]?.id || '',
      position: '',
      jobType: 'Full-time',
      status: 'Applied',
      salaryMin: '',
      salaryMax: '',
      location: 'Remote',
      source: 'LinkedIn',
      appliedDate: new Date().toISOString().split('T')[0],
      deadline: '',
      resumeId: '',
      coverLetter: '',
      notes: '',
      jobDescription: '',
      tailoringNotes: '',
    });
    setSuggestedResumeId(null);
    setEditingApplication(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (app: Application) => {
    tailorMutation.reset();
    setAcceptedIndices([]);
    setTailoringError(null);
    const appDate = app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : '';
    const deadlineDate = app.deadline ? new Date(app.deadline).toISOString().split('T')[0] : '';

    reset({
      companyId: app.companyId,
      position: app.position,
      jobType: app.jobType,
      status: app.status,
      salaryMin: app.salaryMin !== null ? String(app.salaryMin) : '',
      salaryMax: app.salaryMax !== null ? String(app.salaryMax) : '',
      location: app.location,
      source: app.source || '',
      appliedDate: appDate,
      deadline: deadlineDate,
      resumeId: app.resumeId || '',
      coverLetter: app.coverLetter || '',
      notes: app.notes || '',
      jobDescription: app.jobDescription || '',
      tailoringNotes: app.tailoringNotes || '',
    });
    setSuggestedResumeId(null);
    setEditingApplication(app);
    setFormError(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : null,
        resumeId: data.resumeId || null,
        deadline: data.deadline || null,
      };

      if (editingApplication) {
        return api.patch(`/applications/${editingApplication.id}`, payload);
      } else {
        return api.post('/applications', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
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
      if (confirm('Are you sure you want to delete this job application?')) {
        return api.delete(`/applications/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const handleTailorResume = () => {
    if (watchedResumeId && watchedJobDescription) {
      tailorMutation.mutate({ resumeId: watchedResumeId, jobDescription: watchedJobDescription });
    }
  };

  const handleAcceptSuggestion = (idx: number, suggestions: any[]) => {
    let nextIndices = [...acceptedIndices];
    if (nextIndices.includes(idx)) {
      nextIndices = nextIndices.filter(item => item !== idx);
    } else {
      nextIndices.push(idx);
    }
    setAcceptedIndices(nextIndices);
    updateTailoringNotesField(nextIndices, suggestions);
  };

  const handleAcceptAllSuggestions = (suggestions: any[]) => {
    const nextIndices = suggestions.map((_, idx) => idx);
    setAcceptedIndices(nextIndices);
    updateTailoringNotesField(nextIndices, suggestions);
  };

  const updateTailoringNotesField = (indices: number[], suggestions: any[]) => {
    if (indices.length === 0) {
      setValue('tailoringNotes', '');
      return;
    }
    const formatted = suggestions
      .filter((_, idx) => indices.includes(idx))
      .map(s => `Original: "${s.original}"\nSuggested: "${s.suggested}"\nReason: ${s.reason}`)
      .join('\n\n---\n\n');
    setValue('tailoringNotes', formatted);
  };

  const onSubmit = (formData: any) => {
    saveMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offer':
      case 'Accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'HR Interview':
      case 'Technical Interview':
      case 'Final Interview':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Wishlist':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Withdrawn':
        return 'bg-slate-700/20 text-slate-500 border-slate-700/30';
      case 'Applied':
      case 'Online Assessment':
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
            <h1 className="text-3xl font-bold tracking-tight text-white">Applications</h1>
            <p className="text-slate-400 mt-1">Track interview pipeline and timeline progress.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-5 w-5" />
            Add Application
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#24262f] bg-[#16181d] p-4">
          <div className="flex items-center bg-[#0d0e12] border border-[#24262f] rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-slate-500 mr-2" />
            <input
              type="text"
              placeholder="Search company or position..."
              className="bg-transparent text-white focus:outline-none w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <Filter className="h-4 w-4" /> Filters
          </div>

          <select
            className="bg-[#0d0e12] border border-[#24262f] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Wishlist">Wishlist</option>
            <option value="Applied">Applied</option>
            <option value="Online Assessment">Online Assessment</option>
            <option value="HR Interview">HR Interview</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="Final Interview">Final Interview</option>
            <option value="Offer">Offer</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>

          <select
            className="bg-[#0d0e12] border border-[#24262f] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none"
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Temporary">Temporary</option>
          </select>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider ml-auto">
            <ArrowUpDown className="h-4 w-4" /> Sort By
          </div>

          <select
            className="bg-[#0d0e12] border border-[#24262f] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recentlyApplied">Recently Applied</option>
            <option value="company">Company Name</option>
            <option value="deadline">Deadline</option>
            <option value="salary">Salary Offer</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-slate-500 text-center py-20 border border-dashed border-[#24262f] rounded-2xl bg-[#16181d]/20">
            <Briefcase className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-lg font-bold">No applications found</p>
            <p className="text-sm mt-1">Select "Add Application" above to add your first job card.</p>
          </div>
        ) : (
          /* Bento Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-[#24262f] bg-[#16181d] p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase border rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-2 leading-tight">
                        {app.position}
                      </h2>
                      <span className="text-sm text-slate-400 block mt-0.5">{app.company.name}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(app)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-[#24262f] hover:text-white transition-colors"
                        title="Edit Application"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(app.id)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-col gap-2 py-3 border-y border-[#24262f] text-xs text-slate-400">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{app.location} ({app.jobType})</span>
                      </div>
                      {app.source && <span className="text-slate-500">{app.source}</span>}
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-slate-300 font-medium">
                          {app.salaryMin || app.salaryMax
                            ? `${formatCurrency(app.salaryMin)} - ${formatCurrency(app.salaryMax)}`
                            : 'Salary not listed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Applied: {formatDate(app.appliedDate)}</span>
                  </div>
                  {app.deadline && (
                    <span className="text-rose-500/80 font-medium">
                      Deadline: {formatDate(app.deadline)}
                    </span>
                  )}
                </div>

                {app.resume && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 bg-[#0d0e12] rounded-lg border border-[#24262f] px-3 py-1.5 self-start">
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    <span className="truncate max-w-[150px]">{app.resume.name}</span>
                    <span className="font-semibold text-[10px] bg-slate-800 px-1 py-0.2 rounded text-slate-300">
                      {app.resume.version}
                    </span>
                  </div>
                )}

                {app.notes && (
                  <div className="mt-4 border-t border-[#24262f] pt-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> Notes
                    </p>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed whitespace-pre-line">
                      {app.notes}
                    </p>
                  </div>
                )}

                {app.tailoringNotes && (
                  <div className="mt-3 border-t border-[#24262f] pt-3">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Tailoring Notes
                    </p>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {app.tailoringNotes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 overflow-y-auto">
            <div className="w-full max-w-xl rounded-xl border border-[#24262f] bg-[#16181d] p-6 shadow-2xl relative my-auto">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 rounded-md p-1.5 text-slate-400 hover:bg-[#24262f] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-4">
                {editingApplication ? 'Edit Job Application' : 'Track New Application'}
              </h2>

              {companies.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">No companies registered</p>
                  <p className="text-xs mt-1 mb-4">You must register at least one company before adding applications.</p>
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      window.location.href = '/companies';
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Go to Companies
                  </button>
                </div>
              ) : (
                <>
                  {formError && (
                    <div className="mb-4 flex items-start gap-3 rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-500">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Company *
                        </label>
                        <select
                          required
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          {...register('companyId', { required: true })}
                        >
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Position Title *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          placeholder="e.g. Senior Frontend Engineer"
                          {...register('position', { required: true })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Job Type *
                        </label>
                        <select
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          {...register('jobType')}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Temporary">Temporary</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Location Type / City *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          placeholder="e.g. Remote or Austin, TX"
                          {...register('location', { required: true })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Pipeline Status *
                        </label>
                        <select
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                          {...register('status')}
                        >
                          <option value="Wishlist">Wishlist</option>
                          <option value="Applied">Applied</option>
                          <option value="Online Assessment">Online Assessment</option>
                          <option value="HR Interview">HR Interview</option>
                          <option value="Technical Interview">Technical Interview</option>
                          <option value="Final Interview">Final Interview</option>
                          <option value="Offer">Offer</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Withdrawn">Withdrawn</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Source / Referral
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          placeholder="e.g. LinkedIn or Referral"
                          {...register('source')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Salary Min ($ / Year)
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          placeholder="e.g. 80000"
                          {...register('salaryMin')}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Salary Max ($ / Year)
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          placeholder="e.g. 110000"
                          {...register('salaryMax')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Applied Date *
                        </label>
                        <input
                          type="date"
                          required
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          {...register('appliedDate', { required: true })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Deadline Date
                        </label>
                        <input
                          type="date"
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          {...register('deadline')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Link Resume Version
                        </label>
                        <select
                          className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                          {...register('resumeId')}
                        >
                          <option value="">No linked resume...</option>
                          {resumes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.version})
                            </option>
                          ))}
                        </select>
                        {showSuggestedIndicator && (
                          <span className="text-[11px] text-blue-400 mt-1 block">
                            {isMatchByTags ? 'Suggested based on tags' : 'Suggested (Default)'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Cover Letter Text
                      </label>
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="Paste cover letter or notes about pitch here..."
                        {...register('coverLetter')}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        General Notes
                      </label>
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="Interview loops, HR contact names, comments..."
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
                        {saveMutation.isPending ? 'Saving...' : 'Save Application'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
