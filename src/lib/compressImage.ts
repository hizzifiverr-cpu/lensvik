/**
 * Compress a base64 data URI image to a smaller size
 * to avoid Vercel's 4.5MB serverless function body limit.
 * Targets ~200KB per image max.
 */
export function compressImage(base64Src: string, maxWidth = 1400, quality = 0.92): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ratio = Math.min(maxWidth / img.width, 1);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(base64Src);
                return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/webp', quality);
            resolve(compressed);
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = base64Src;
    });
}