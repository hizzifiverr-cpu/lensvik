import { NextResponse } from 'next/server';
import { destroyCloudinaryAsset } from '@/lib/cloudinary-server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cloudinary/destroy
 * Body: { "url": "https://res.cloudinary.com/.../image/upload/..." }
 *
 * Destroys a single image from the Cloudinary media library. Called by the
 * admin product form when the user removes an individual image before saving.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const url = typeof body?.url === 'string' ? body.url : null;

        if (!url) {
            return NextResponse.json({ ok: false, error: 'url is required' }, { status: 400 });
        }

        const ok = await destroyCloudinaryAsset(url);
        return NextResponse.json({ ok });
    } catch (error: any) {
        console.error('Cloudinary destroy endpoint failed:', error);
        return NextResponse.json(
            { ok: false, error: error?.message || 'Failed to delete image' },
            { status: 500 }
        );
    }
}
