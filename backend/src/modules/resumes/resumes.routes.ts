import { Router } from 'express';
import {
  getResumes,
  createResume,
  updateResume,
  deleteResume,
} from './resumes.controller';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createResumeSchema, updateResumeSchema } from './resumes.validation';
import { generateUploadUrl } from './service';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../types';

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
    
    return res.status(200).json({
      success: true,
      uploadUrl,
      key,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
