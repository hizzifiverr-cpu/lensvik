import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return NextResponse.json({ message: 'URL required' }, { status: 400 });
    }

    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        return new Response(blob, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/png',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ message: 'Failed to fetch image' }, { status: 500 });
    }
}
