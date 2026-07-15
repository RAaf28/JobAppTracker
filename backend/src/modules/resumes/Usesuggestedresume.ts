import { Resume } from '@prisma/client';

/**
 * Suggests the best-matching resume for a given job title/company,
 * based on tag overlap. Falls back to the resume marked isDefault.
 *
 * Usage in the "Add Application" form:
 *   const suggested = suggestResume(resumes, jobTitle);
 *   // pre-fill the resume field with suggested?.id
 */
export function suggestResume(resumes: Resume[], jobTitle: string, company?: string): Resume | undefined {
    const haystack = `${jobTitle} ${company ?? ''}`.toLowerCase();

    const match = resumes.find((r) =>
        (r.tags || []).some((tag) => haystack.includes(tag.toLowerCase()))
    );

    return match ?? resumes.find((r) => r.isDefault) ?? resumes[0];
}