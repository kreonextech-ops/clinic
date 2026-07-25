import { S3Client } from '@aws-sdk/client-s3';

export const ociClient = new S3Client({
  region: process.env.OCI_STORAGE_REGION!,
  endpoint: process.env.OCI_STORAGE_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.OCI_STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.OCI_STORAGE_SECRET_ACCESS_KEY!,
  },
  // OCI S3 compatibility layer requires path-style addressing
  forcePathStyle: true,
});

export const OCI_BUCKET = process.env.OCI_STORAGE_BUCKET_NAME!;
export const OCI_PUBLIC_URL = process.env.OCI_STORAGE_PUBLIC_URL!;
