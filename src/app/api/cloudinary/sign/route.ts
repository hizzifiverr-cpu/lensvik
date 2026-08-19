import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/cloudinary/sign
 *
 * Returns a signed upload payload so the browser can upload a file DIRECTLY
 * to Cloudinary (https://api.cloudinary.com/v1_1/{cloud}/auto/upload).
 *
 * Why this pattern?
 *  - The Cloudinary API secret is never exposed to the browser.
 *  - Uploads stream straight from the client to Cloudinary, avoiding
 *    Vercel's 4.5MB serverless-function body limit for large images.
 *
 * The signature signs the upload parameters (timestamp, folder, etc.) with
 * the API secret. Cloudinary verifies it and returns a secure_url.
 */
export async function GET() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        return NextResponse.json(
            {
                error:
                    'Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, ' +
                    'CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your environment variables.',
            },
            { status: 500 }
        );
    }

    // A unique timestamp for this upload request (required for the signature)
    const timestamp = Math.round(new Date().getTime() / 1000);

    const folder = process.env.CLOUDINARY_FOLDER || '';
    const paramsToSign: Record<string, string> = { timestamp: String(timestamp) };
    if (folder) paramsToSign.folder = folder;

    // Sign the parameters (alphabetical order) with the API secret
    const sortedParams = Object.keys(paramsToSign)
        .sort()
        .map(key => `${key}=${paramsToSign[key]}`)
        .join('&');
    const signature = crypto
        .createHash('sha1')
        .update(`${sortedParams}${apiSecret}`)
        .digest('hex');

    return NextResponse.json({
        cloud_name: cloudName,
        api_key: apiKey,
        timestamp,
        folder: folder || undefined,
        signature,
        // Cloudinary resource type / upload preset handling
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || undefined,
    });
}
