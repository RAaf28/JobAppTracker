import { Resume } from '../types';

export function suggestResume(resumes: Resume[], jobTitle: string, company?: string): Resume | undefined {
  if (!jobTitle && !company) return undefined;
  
  const haystack = `${jobTitle} ${company ?? ''}`.toLowerCase();

  // 1. Try to find a match by tags
  const match = resumes.find((r) =>
    (r.tags || []).some((tag) => tag && haystack.includes(tag.toLowerCase()))
  );

  if (match) return match;

  // 2. Fall back to the default resume
  const defaultResume = resumes.find((r) => r.isDefault);
  if (defaultResume) return defaultResume;

  // 3. Otherwise, return undefined
  return undefined;
}
