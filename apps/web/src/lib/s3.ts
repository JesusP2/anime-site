import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  R2_ACCESS_KEY_ID,
  R2_BUCKET,
  R2_ENDPOINT,
  R2_SECRET_ACCESS_KEY,
} from "astro:env/server";

export const client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function createReadPresignedUrl(key: string) {
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }),
    { expiresIn: 3600 },
  );
  return url;
}

export async function createWritePresignedUrl(
  key: string,
  type: string,
  size: number,
) {
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: type,
      ContentLength: size,
    }),
    { expiresIn: 30 },
  );
  return url;
}

export async function createDeletePresignedUrl(key: string) {
  const url = await getSignedUrl(
    client,
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }),
    { expiresIn: 30 },
  );
  return url;
}
