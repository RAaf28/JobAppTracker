'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import { api } from '../../services/api';
import { Company } from '../../types';
import { Plus, Search, Building, Pencil, Trash2, X, AlertCircle, Globe, MapPin, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<{ success: boolean; companies: Company[] }>({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data;
    },
  });

  const companies = data?.companies || [];

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      industry: '',
      website: '',
      location: '',
      size: '',
      notes: '',
    },
  });

  const openAddModal = () => {
    reset({
      name: '',
      industry: '',
      website: '',
      location: '',
      size: '',
      notes: '',
    });
    setEditingCompany(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    reset({
      name: company.name,
      industry: company.industry || '',
      website: company.website || '',
      location: company.location || '',
      size: company.size || '',
      notes: company.notes || '',
    });
    setEditingCompany(company);
    setFormError(null);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingCompany) {
        return api.patch(`/companies/${editingCompany.id}`, data);
      } else {
        return api.post('/companies', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Something went wrong.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (confirm('Are you sure you want to delete this company? This will delete all linked applications.')) {
        return api.delete(`/companies/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const onSubmit = (formData: any) => {
    saveMutation.mutate(formData);
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Companies</h1>
            <p className="text-slate-400 mt-1">Manage profiles of companies you are applying to.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-5 w-5" />
            Add Company
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center rounded-lg border border-[#24262f] bg-[#16181d] px-4 py-3 max-w-md">
          <Search className="h-5 w-5 text-slate-500 mr-3" />
          <input
            type="text"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            placeholder="Search by company name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-slate-500 text-center py-20 border border-dashed border-[#24262f] rounded-2xl bg-[#16181d]/20">
            <Building className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-lg font-bold">No companies found</p>
            <p className="text-sm mt-1">Add a company to begin linking applications.</p>
          </div>
        ) : (
          /* Bento Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="rounded-xl border border-[#24262f] bg-[#16181d] p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                        <Building className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white leading-tight">{company.name}</h2>
                        {company.industry && (
                          <span className="text-xs text-slate-400 block mt-0.5">{company.industry}</span>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(company)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-[#24262f] hover:text-white transition-colors"
                        title="Edit Company"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(company.id)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 py-3 border-y border-[#24262f] text-xs text-slate-400">
                    {company.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        <a
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-400 truncate max-w-[120px]"
                        >
                          {company.website.replace(/https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    )}
                    {company.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[120px]">{company.location}</span>
                      </div>
                    )}
                    {company.size && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{company.size} employees</span>
                      </div>
                    )}
                  </div>
                </div>

                {company.notes && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Notes</p>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-3 leading-relaxed whitespace-pre-line">{company.notes}</p>
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
                {editingCompany ? 'Edit Company Profile' : 'Add New Company'}
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
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Google"
                    {...register('name', { required: true })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. Technology"
                      {...register('industry')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. google.com"
                      {...register('website')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Office Location
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. Mountain View, CA"
                      {...register('location')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Company Size
                    </label>
                    <select
                      className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                      {...register('size')}
                    >
                      <option value="">Select size...</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Interview quirks, benefits info, values..."
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
                    {saveMutation.isPending ? 'Saving...' : 'Save Company'}
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
