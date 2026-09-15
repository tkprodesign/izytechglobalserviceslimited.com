'use strict';

const crypto = require('crypto');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const PUBLIC_BUCKET = process.env.CLOUDFLARE_PUBLIC_BUCKET || 'izy-public-images';
const PRIVATE_BUCKET = process.env.CLOUDFLARE_PRIVATE_BUCKET || 'izy-private-assessments';

let client;

function getClient() {
  if (!client) {
    const endpoint = process.env.CLOUDFLARE_S3_API_ENDPOINT;
    const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error('Cloudflare R2 storage is not configured on the server.');
    }
    client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return client;
}

function publicBaseUrl() {
  // Keep production uploads working if the deployment platform has not yet
  // copied the non-secret public URL setting from the project environment.
  const value = process.env.CLOUDFLARE_R2_PUBLIC_URL
    || process.env.CLOUDFLARE_PUBLIC_BASE_URL
    || 'https://pub-44d4802bd6ed4a1ab367bd588fc29f35.r2.dev';
  if (!value) throw new Error('CLOUDFLARE_R2_PUBLIC_URL is not configured on the server.');
  return value.replace(/\/+$/, '');
}

function publicUrl(key) {
  return `${publicBaseUrl()}/${String(key).replace(/^\/+/, '')}`;
}

function createKey(scope, originalName, contentType) {
  const extension = String(originalName || '').match(/\.([a-z0-9]{1,8})$/i)?.[1]?.toLowerCase()
    || ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' }[contentType] || 'bin');
  return `${scope}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
}

async function createUpload({ bucket, key, contentType, contentLength, expiresIn = 600 }) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ...(contentLength ? { ContentLength: contentLength } : {}),
  });
  return getSignedUrl(getClient(), command, { expiresIn });
}

async function createPrivateDownload(key, expiresIn = 600) {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key }),
    { expiresIn },
  );
}

function isPrivateKey(value) {
  return typeof value === 'string' && /^assessments\/[A-Za-z0-9/_-]+\.[A-Za-z0-9]+$/.test(value);
}

module.exports = {
  PUBLIC_BUCKET,
  PRIVATE_BUCKET,
  publicUrl,
  createKey,
  createUpload,
  createPrivateDownload,
  isPrivateKey,
};