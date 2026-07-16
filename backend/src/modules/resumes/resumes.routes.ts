import { Router } from 'express';
import {
  getResumes,
  createResume,
  updateResume,
  deleteResume,
} from './resumes.controller';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createResumeSchema, updateResumeSchema, tailorResumeSchema } from './resumes.validation';
import { generateUploadUrl, extractResumeText, tailorResume } from './service';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../types';
import { env } from '../../config/env';

const router = Router();

router.use(auth);

router.get('/', getResumes);
router.post('/', validate(createResumeSchema), createResume);
router.patch('/:id', validate(updateResumeSchema), updateResume);
router.delete('/:id', deleteResume);

router.post('/:id/upload', async (req: AuthRequest, res, next) => {
  try {
    const { fileType } = req.body;
    const { id } = req.params;
    const userId = req.user!.id;

    if (fileType !== 'application/pdf') {
      return res.status(422).json({
        success: false,
        message: 'Only PDF files are supported.',
        errors: { fileType: ['Must be application/pdf'] },
      });
    }

    // Verify resume exists and belongs to the authenticated user (prevents IDOR)
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized',
      });
    }

    const { uploadUrl, key } = await generateUploadUrl(id, fileType);
    const fileUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    
    return res.status(200).json({
      success: true,
      uploadUrl,
      key,
      fileUrl,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/extract-text', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify resume exists and belongs to the authenticated user (prevents IDOR)
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized',
      });
    }

    if (!resume.fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Resume does not have an uploaded file.',
      });
    }

    let s3Key: string;
    try {
      const urlObj = new URL(resume.fileUrl);
      s3Key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
      if (!urlObj.hostname.includes('.amazonaws.com')) {
        throw new Error('Not an S3 URL');
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is not stored in S3 (unsupported format or link).',
      });
    }

    const text = await extractResumeText(s3Key);

    return res.status(200).json({
      success: true,
      text,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/tailor', validate(tailorResumeSchema), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { jobDescription } = req.body;
    const userId = req.user!.id;

    // Verify resume exists and belongs to the authenticated user (prevents IDOR)
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or unauthorized',
      });
    }

    if (!resume.fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Resume does not have an uploaded file.',
      });
    }

    let s3Key: string;
    try {
      const urlObj = new URL(resume.fileUrl);
      s3Key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
      if (!urlObj.hostname.includes('.amazonaws.com')) {
        throw new Error('Not an S3 URL');
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is not stored in S3 (unsupported format or link).',
      });
    }

    const resumeText = await extractResumeText(s3Key);
    const tailored = await tailorResume(resumeText, jobDescription);

    return res.status(200).json({
      success: true,
      data: tailored,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
