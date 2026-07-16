import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, BUCKET_NAME } from '../../config/s3';
import { randomUUID } from 'crypto';
import { geminiModel } from '../../config/gemini';

const pdfParse = require('pdf-parse');

export async function generateUploadUrl(resumeId: string, fileType: string) {
    const key = `resumes/${resumeId}/${randomUUID()}.pdf`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType, // should be 'application/pdf'
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

    return { uploadUrl, key };
}

export async function extractResumeText(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const response = await s3.send(command);
  const buffer = await streamToBuffer(response.Body);

  const parsed = await pdfParse(buffer);
  return parsed.text;
}

// Helper: convert S3's stream response into a Buffer
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function tailorResume(resumeText: string, jobDescription: string) {
  const prompt = `
You are a resume assistant. Given the resume text and job description below,
suggest specific, concrete edits to better align the resume with the job —
focus on rewording bullet points to match relevant keywords and responsibilities.
Do not fabricate experience that isn't in the original resume.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return the response as JSON with this exact shape:
{
  "summary": "1-2 sentence overview of key alignment gaps",
  "suggestions": [
    { "original": "...", "suggested": "...", "reason": "..." }
  ]
}
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  // Gemini sometimes wraps JSON in markdown fences — strip if present
  const cleaned = text.replace(/```json|```/g, '').trim();

  return JSON.parse(cleaned);
}