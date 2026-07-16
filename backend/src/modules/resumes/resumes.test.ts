import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../index';
import { prisma } from '../../config/db';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { generateUploadUrl, extractResumeText, tailorResume } from './service';

// Mock DB client
vi.mock('../../config/db', () => {
  return {
    prisma: {
      resume: {
        findFirst: vi.fn(),
      },
    },
  };
});

// Mock S3 service helpers directly
vi.mock('./service', () => {
  return {
    generateUploadUrl: vi.fn(),
    extractResumeText: vi.fn(),
    tailorResume: vi.fn(),
  };
});

describe('Resumes Security & Text Extraction Routes', () => {
  const mockUserId = '11111111-2222-3333-4444-555555555555';
  const mockResumeId = '22222222-3333-4444-5555-666666666666';
  
  // Sign a mock token
  const token = jwt.sign(
    { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/resumes/:id/upload', () => {
    it('should return 401 if no authorization token is provided', async () => {
      const res = await request(app)
        .post(`/api/v1/resumes/${mockResumeId}/upload`)
        .send({ fileType: 'application/pdf' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No token provided');
    });

    it('should return 422 if the fileType is not application/pdf', async () => {
      const res = await request(app)
        .post(`/api/v1/resumes/${mockResumeId}/upload`)
        .set('Authorization', `Bearer ${token}`)
        .send({ fileType: 'image/png' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Only PDF files are supported');
    });

    it('should return 404 if the resume does not exist or does not belong to the user', async () => {
      vi.mocked(prisma.resume.findFirst).mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/v1/resumes/${mockResumeId}/upload`)
        .set('Authorization', `Bearer ${token}`)
        .send({ fileType: 'application/pdf' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Resume not found or unauthorized');
    });

    it('should return 200 and S3 upload URL when parameters are valid and authorized', async () => {
      vi.mocked(prisma.resume.findFirst).mockResolvedValue({
        id: mockResumeId,
        name: 'My Resume',
        version: 'v1.0',
        fileUrl: null,
        tags: [],
        isDefault: false,
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(generateUploadUrl).mockResolvedValue({
        uploadUrl: 'https://mock-s3-presigned-url.com/resumes/123/abc.pdf',
        key: `resumes/${mockResumeId}/mock-key.pdf`,
      });

      const res = await request(app)
        .post(`/api/v1/resumes/${mockResumeId}/upload`)
        .set('Authorization', `Bearer ${token}`)
        .send({ fileType: 'application/pdf' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.uploadUrl).toBe('https://mock-s3-presigned-url.com/resumes/123/abc.pdf');
      expect(res.body.key).toContain(`resumes/${mockResumeId}/`);
      expect(res.body.fileUrl).toContain(`https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/resumes/${mockResumeId}/`);
    });
  });

  describe('GET /api/v1/resumes/:id/extract-text', () => {
    it('should return 401 if no authorization token is provided', async () => {
      const res = await request(app)
        .get(`/api/v1/resumes/${mockResumeId}/extract-text`);

      expect(res.status).toBe(401);
    });

    it('should return 404 if the resume does not belong to the user', async () => {
      vi.mocked(prisma.resume.findFirst).mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/resumes/${mockResumeId}/extract-text`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Resume not found or unauthorized');
    });

    it('should return 400 if the resume has no file URL', async () => {
      vi.mocked(prisma.resume.findFirst).mockResolvedValue({
        id: mockResumeId,
        name: 'My Resume',
        version: 'v1.0',
        fileUrl: null, // no file URL
        tags: [],
        isDefault: false,
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .get(`/api/v1/resumes/${mockResumeId}/extract-text`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Resume does not have an uploaded file');
    });

    it('should return 400 if the file URL is not hosted on S3', async () => {
      vi.mocked(prisma.resume.findFirst).mockResolvedValue({
        id: mockResumeId,
        name: 'My Resume',
        version: 'v1.0',
        fileUrl: 'https://drive.google.com/some-non-s3-link', // Google Drive link
        tags: [],
        isDefault: false,
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .get(`/api/v1/resumes/${mockResumeId}/extract-text`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Resume file is not stored in S3');
    });

    it('should return 200 and extracted text if resume has a valid S3 URL', async () => {
      vi.mocked(prisma.resume.findFirst).mockResolvedValue({
        id: mockResumeId,
        name: 'My Resume',
        version: 'v1.0',
        fileUrl: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/resumes/${mockResumeId}/some-key.pdf`,
        tags: [],
        isDefault: false,
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(extractResumeText).mockResolvedValue('Extracted resume text content details.');

      const res = await request(app)
        .get(`/api/v1/resumes/${mockResumeId}/extract-text`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.text).toBe('Extracted resume text content details.');
      expect(extractResumeText).toHaveBeenCalledWith(`resumes/${mockResumeId}/some-key.pdf`);
    });
  });

  describe('POST /api/v1/resumes/:id/tailor', () => {
    it('should return 401 if no authorization token is provided', async () => {
      const res = await request(app)
        .post(`/api/v1/resumes/${mockResumeId}/tailor`)
        .send({ jobDescription: 'React developer' });

      expect(res.status).toBe(401);
    });

    it('should return 400 (Zod validation error) if job description is empty or missing', async () => {
      const res = await request(app)
        .post(`/api/v1/resumes/${mockResumeId}/tailor`)
        .set('Authorization', `Bearer ${token}`)
        .send({ jobDescription: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].field).toBe('jobDescription');
    });

    it('should return 404 if the resume does not belong to the user', async () => {
      vi.mocked(prisma.resume.findFirst).mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/v1/resumes/${mockResumeId}/tailor`)
        .set('Authorization', `Bearer ${token}`)
        .send({ jobDescription: 'React developer' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Resume not found or unauthorized');
    });

    it('should return 400 if the resume has no file URL', async () => {
      vi.mocked(prisma.resume.findFirst).mockResolvedValue({
        id: mockResumeId,
        name: 'My Resume',
        version: 'v1.0',
        fileUrl: null,
        tags: [],
        isDefault: false,
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post(`/api/v1/resumes/${mockResumeId}/tailor`)
        .set('Authorization', `Bearer ${token}`)
        .send({ jobDescription: 'React developer' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Resume does not have an uploaded file');
    });

    it('should return 200 and AI tailored suggestions if inputs are valid and authorized', async () => {
      vi.mocked(prisma.resume.findFirst).mockResolvedValue({
        id: mockResumeId,
        name: 'My Resume',
        version: 'v1.0',
        fileUrl: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/resumes/${mockResumeId}/some-key.pdf`,
        tags: [],
        isDefault: false,
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(extractResumeText).mockResolvedValue('Original resume text content.');
      const mockTailoredResult = {
        summary: 'Excellent alignment, minor keyword improvements suggested.',
        suggestions: [
          {
            original: 'Worked with JS frameworks.',
            suggested: 'Built responsive web interfaces using React and Redux.',
            reason: 'Matches the job description requirement for React/Redux experience.',
          },
        ],
      };
      vi.mocked(tailorResume).mockResolvedValue(mockTailoredResult);

      const res = await request(app)
        .post(`/api/v1/resumes/${mockResumeId}/tailor`)
        .set('Authorization', `Bearer ${token}`)
        .send({ jobDescription: 'Looking for a developer with React and Redux experience.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockTailoredResult);
      expect(extractResumeText).toHaveBeenCalledWith(`resumes/${mockResumeId}/some-key.pdf`);
      expect(tailorResume).toHaveBeenCalledWith('Original resume text content.', 'Looking for a developer with React and Redux experience.');
    });
  });
});
