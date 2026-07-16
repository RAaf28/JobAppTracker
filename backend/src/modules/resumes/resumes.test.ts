import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../index';
import { prisma } from '../../config/db';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

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

// Mock S3 client and presigned URL generator
vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: vi.fn(),
    PutObjectCommand: vi.fn(),
  };
});

vi.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: vi.fn().mockResolvedValue('https://mock-s3-presigned-url.com/resumes/123/abc.pdf'),
  };
});

describe('POST /api/v1/resumes/:id/upload', () => {
  const mockUserId = 'user-uuid-123';
  const mockResumeId = 'resume-uuid-456';
  
  // Sign a mock token
  const token = jwt.sign(
    { id: mockUserId, email: 'test@example.com', name: 'Test User' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    // Mock resume.findFirst to return null (not found/unauthorized)
    vi.mocked(prisma.resume.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/v1/resumes/${mockResumeId}/upload`)
      .set('Authorization', `Bearer ${token}`)
      .send({ fileType: 'application/pdf' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Resume not found or unauthorized');
    expect(prisma.resume.findFirst).toHaveBeenCalledWith({
      where: { id: mockResumeId, userId: mockUserId },
    });
  });

  it('should return 200 and S3 upload URL when parameters are valid and authorized', async () => {
    // Mock resume exists
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
      .post(`/api/v1/resumes/${mockResumeId}/upload`)
      .set('Authorization', `Bearer ${token}`)
      .send({ fileType: 'application/pdf' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.uploadUrl).toBe('https://mock-s3-presigned-url.com/resumes/123/abc.pdf');
    expect(res.body.key).toContain(`resumes/${mockResumeId}/`);
    expect(res.body.fileUrl).toContain(`https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/resumes/${mockResumeId}/`);
    expect(prisma.resume.findFirst).toHaveBeenCalledWith({
      where: { id: mockResumeId, userId: mockUserId },
    });
  });
});
