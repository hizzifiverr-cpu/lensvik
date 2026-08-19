import { compressImage } from '@/lib/compressImage';

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1';

interface SignResponse {
    cloud_name: string;
    api_key: string;
    timestamp: number;
    folder?: string;
    signature: string;
    upload_preset?: string;
}

/**
 * Upload a File directly to Cloudinary using a server-generated signature.
 *
 * Returns the resulting `secure_url` string, or `null` if Cloudinary is not
 * configured (the caller can then fall back to the legacy base64 approach).
 */
export async function uploadImageToCloudinary(file: File): Promise<string | null> {
    // Fetch a signed upload payload from our server (never exposes the API secret)
    let signRes: Response;
    try {
        signRes = await fetch('/api/cloudinary/sign', { cache: 'no-store' });
    } catch {
        return null;
    }

    if (!signRes.ok) return null;

    let sign: SignResponse;
    try {
        sign = await signRes.json();
    } catch {
        return null;
    }

    // Build the multipart form that Cloudinary expects for a signed upload
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sign.api_key);
    form.append('timestamp', String(sign.timestamp));
    form.append('signature', sign.signature);
    if (sign.folder) form.append('folder', sign.folder);
    if (sign.upload_preset) form.append('upload_preset', sign.upload_preset);

    const uploadRes = await fetch(`${CLOUDINARY_UPLOAD_URL}/${sign.cloud_name}/auto/upload`, {
        method: 'POST',
        body: form,
    });

    if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        console.error('Cloudinary upload failed:', err);
        return null;
    }

    const data = await uploadRes.json();
    return (data && data.secure_url) || null;
}

/**
 * Best-effort helper used by the product forms: uploads a File to Cloudinary
 * and returns the URL. If Cloudinary is unavailable, it falls back to the
 * existing compress-to-base64-data-URI behaviour so the app keeps working
 * without a Cloudinary account.
 */
export async function uploadProductImage(
    file: File,
    fallback: 'data-uri' | 'object-url' = 'data-uri'
): Promise<string | null> {
    const url = await uploadImageToCloudinary(file);
    if (url) return url;

    // Fallback path (Cloudinary not configured)
    if (fallback === 'data-uri') {
        const base64 = await readAsDataURL(file);
        if (!base64) return null;
        return compressImage(base64);
    }
    return null;
}

function readAsDataURL(file: File): Promise<string | null> {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

/**
 * Request the server to delete a single image from the Cloudinary media
 * library. Called when the user removes an individual image in the product
 * form. No-op (and non-fatal) when the URL is not Cloudinary-hosted.
 */
export async function destroyImageFromCloudinary(url?: string): Promise<void> {
    // Skip base64 data URIs and non-Cloudinary URLs
    if (!url || !url.includes('/image/upload/')) return;

    try {
        await fetch('/api/cloudinary/destroy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });
    } catch (error) {
        console.error('Failed to remove Cloudinary image:', error);
    }
}
