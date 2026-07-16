import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, BUCKET_NAME } from '../../config/s3';
import { randomUUID } from 'crypto';

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