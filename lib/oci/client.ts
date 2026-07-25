import { S3Client } from '@aws-sdk/client-s3';

let _ociClient: S3Client | null = null;
export function getOciClient(): S3Client {
  if (!_ociClient) {
    _ociClient = new S3Client({
      region: process.env.OCI_STORAGE_REGION || 'us-ashburn-1',
      endpoint: process.env.OCI_STORAGE_ENDPOINT || '',
      credentials: {
        accessKeyId: process.env.OCI_STORAGE_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.OCI_STORAGE_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });
  }
  return _ociClient;
}

export const OCI_BUCKET = process.env.OCI_STORAGE_BUCKET_NAME || '';
export const OCI_PUBLIC_URL = process.env.OCI_STORAGE_PUBLIC_URL || '';
