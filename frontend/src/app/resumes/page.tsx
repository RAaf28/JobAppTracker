'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import { api } from '../../services/api';
import { Resume } from '../../types';
import { Plus, Search, FileText, Pencil, Trash2, X, AlertCircle, Calendar, ExternalLink, Star, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function ResumesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<{ success: boolean; resumes: Resume[] }>({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await api.get('/resumes');
      return response.data;
    },
  });

  const resumes = data?.resumes || [];

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      version: '',
      fileUrl: '',
      tags: '',
      isDefault: false,
    },
  });

  const openAddModal = () => {
    reset({
      name: '',
      version: 'v1.0',
      fileUrl: '',
      tags: '',
      isDefault: resumes.length === 0, // first resume auto-defaults
    });
    setEditingResume(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (resume: Resume) => {
    reset({
      name: resume.name,
      version: resume.version,
      fileUrl: resume.fileUrl || '',
      tags: (resume.tags || []).join(', '),
      isDefault: resume.isDefault || false,
    });
    setEditingResume(resume);
    setFormError(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        tags: data.tags
          .split(',')
          .map((t: string) => t.trim().toLowerCase())
          .filter(Boolean),
      };
      if (editingResume) {
        return api.patch(`/resumes/${editingResume.id}`, payload);
      } else {
        return api.post('/resumes', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Something went wrong.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (confirm('Are you sure you want to delete this resume? Linked applications will refer to this resume as deleted.')) {
        return api.delete(`/resumes/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });

  const onSubmit = (formData: any) => {
    saveMutation.mutate(formData);
  };

  const filteredResumes = resumes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.version.toLowerCase().includes(search.toLowerCase()) ||
    (r.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  // Helper to request presigned URL and upload file directly to S3
  const handleFileUpload = async (resumeId: string, file: File) => {
    try {
      // 1. Ask backend for a presigned URL
      const response = await api.post(`/resumes/${resumeId}/upload`, {
        fileType: file.type,
      });
      const { uploadUrl, key } = response.data;

      // 2. Upload the actual file directly to S3 using that URL
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // 3. Save the returned `key` on the resume record (fileUrl field, or a new s3Key field)
      // e.g., await api.patch(`/resumes/${resumeId}`, { fileUrl: key });
      return key;
    } catch (err) {
      console.error('File upload failed:', err);
      throw err;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Resumes</h1>
            <p className="text-slate-400 mt-1">Store and track versions of your resumes for applications.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-5 w-5" />
            Add Resume
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center rounded-lg border border-[#24262f] bg-[#16181d] px-4 py-3 max-w-md">
          <Search className="h-5 w-5 text-slate-500 mr-3" />
          <input
            type="text"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            placeholder="Search by name, version, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-slate-500 text-center py-20 border border-dashed border-[#24262f] rounded-2xl bg-[#16181d]/20">
            <FileText className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-lg font-bold">No resumes found</p>
            <p className="text-sm mt-1">Upload or list your resume drafts to start tracking them.</p>
          </div>
        ) : (
          /* Bento Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className={`rounded-xl border p-6 flex flex-col justify-between transition-colors ${resume.isDefault
                  ? 'border-blue-600/50 bg-[#16181d]'
                  : 'border-[#24262f] bg-[#16181d] hover:border-slate-700'
                  }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-md font-bold text-white leading-tight">{resume.name}</h2>
                          {resume.isDefault && (
                            <Star className="h-3.5 w-3.5 fill-blue-400 text-blue-400" />
                          )}
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 bg-blue-600/10 text-blue-400 rounded">
                          {resume.version}
                        </span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(resume)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-[#24262f] hover:text-white transition-colors"
                        title="Edit Resume"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(resume.id)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        title="Delete Resume"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {resume.tags && resume.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {resume.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-[#24262f] text-slate-300"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-[#24262f] mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Added {new Date(resume.createdAt).toLocaleDateString('en-US')}</span>
                    </div>
                    {resume.fileUrl && (
                      <a
                        href={resume.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        Link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
            <div className="w-full max-w-md rounded-xl border border-[#24262f] bg-[#16181d] p-6 shadow-2xl relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 rounded-md p-1.5 text-slate-400 hover:bg-[#24262f] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-4">
                {editingResume ? 'Edit Resume Metadata' : 'Add New Resume'}
              </h2>

              {formError && (
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-500">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Resume Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Software Engineer - General"
                    {...register('name', { required: true })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Version Code *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. v1.2 or 2026-Q3"
                    {...register('version', { required: true })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. frontend, startup, remote"
                    {...register('tags')}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Used to auto-suggest this resume when the job title matches a tag.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    File URL (Google Drive, Dropbox, Notion, etc.)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. https://drive.google.com/..."
                    {...register('fileUrl')}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    className="h-4 w-4 rounded border-[#24262f] bg-[#0d0e12] accent-blue-600"
                    {...register('isDefault')}
                  />
                  <label htmlFor="isDefault" className="text-sm text-slate-300">
                    Use as default resume when no tags match
                  </label>
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
                    {saveMutation.isPending ? 'Saving...' : 'Save Resume'}
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