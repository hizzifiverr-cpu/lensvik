/**
 * Builds an auto-optimized Cloudinary URL (f_auto + q_auto + responsive width).
 * Passes through anything that isn't a Cloudinary image untouched (local /images,
 * base64 data URIs, external URLs).
 *
 * This offloads image optimization to Cloudinary's CDN and lets us serve images
 * directly instead of proxying them through Next.js's image optimizer (which was
 * timing out on large product images).
 */
export function cloudUrl(src?: string, width?: number): string {
    if (!src) return '/images/dfd.png';

    const marker = '/image/upload/';
    if (!src.includes(marker)) return src; // data URI, local path, or non-Cloudinary

    try {
        const i = src.indexOf(marker);
        const base = src.slice(0, i + marker.length); // .../cloud/image/upload/
        const rest = src.slice(i + marker.length);     // v123/... / folder/id.ext

        // Build a minimal, safe transformation set
        const parts = ['f_auto', 'q_auto'];
        if (width && width > 0) parts.push(`w_${Math.round(width)}`);
        const transforms = parts.join(',');

        return `${base}${transforms}/${rest}`;
    } catch {
        return src;
    }
}