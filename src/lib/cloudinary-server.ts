import { v2 as cloudinary } from 'cloudinary';

/**
 * Server-only Cloudinary helpers for destroying (deleting) media assets from
 * the Cloudinary media library.
 *
 * IMPORTANT: import this file ONLY in Server Components / API routes. It uses
 * the Cloudinary API secret, which must never be exposed to the browser.
 */

function getCloudinary() {
    // Lazy-configure once (cloudinary.config() is idempotent)
    if (!cloudinary.config().cloud_name) {
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    return cloudinary;
}

/** Returns true when the given URL points to a Cloudinary-hosted image. */
export function isCloudinaryUrl(url?: string): boolean {
    if (!url) return false;
    try {
        const u = new URL(url);
        return u.hostname.endsWith('cloudinary.com') && url.includes('/image/upload/');
    } catch {
        return false;
    }
}

/**
 * Extracts a Cloudinary public_id from an image URL.
 *
 * Handles the default format produced by this app's uploads:
 *   https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{public_id}.{ext}
 */
export function getPublicIdFromUrl(url: string): string | null {
    if (!isCloudinaryUrl(url)) return null;
    try {
        const u = new URL(url);
        const path = u.pathname; // e.g. /cloud/image/upload/v1612345678/products/abc123.jpg
        const uploadMarker = '/image/upload/';
        const uploadIdx = path.indexOf(uploadMarker);
        if (uploadIdx === -1) return null;

        let rest = path.slice(uploadIdx + uploadMarker.length); // v1612345678/products/abc123.jpg
        const segments = rest.split('/');

        // Strip the leading version segment (v1234567890)
        if (segments.length && /^v\d+$/.test(segments[0])) segments.shift();

        rest = segments.join('/');
        // Strip the file extension
        rest = rest.replace(/\.[a-z0-9]+$/i, '');

        return rest || null;
    } catch {
        return null;
    }
}

/** Destroys a single Cloudinary asset referenced by a URL. Returns success. */
export async function destroyCloudinaryAsset(url?: string): Promise<boolean> {
    if (!url || !isCloudinaryUrl(url)) return false;
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return false;

    try {
        const res = await getCloudinary().uploader.destroy(publicId);
        return res?.result === 'ok' || res?.result === 'not found';
    } catch (error) {
        console.error('Cloudinary destroy failed:', error);
        return false;
    }
}

/** Destroys all Cloudinary assets referenced by a list of URLs. Returns how many were deleted. */
export async function destroyCloudinaryAssets(urls: Array<string | undefined> = []): Promise<number> {
    const publicIds = Array.from(
        new Set(
            (urls || [])
                .map(url => (url ? getPublicIdFromUrl(url) : null))
                .filter((id): id is string => Boolean(id))
        )
    );

    if (publicIds.length === 0) return 0;

    try {
        const res = await getCloudinary().api.delete_resources(publicIds);
        const deleted = res?.deleted;
        return deleted ? Object.keys(deleted).length : 0;
    } catch (error) {
        console.error('Cloudinary bulk destroy failed:', error);
        return 0;
    }
}
