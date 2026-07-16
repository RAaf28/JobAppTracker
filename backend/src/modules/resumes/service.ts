import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, BUCKET_NAME } from '../../config/s3';
import { randomUUID } from 'crypto';

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