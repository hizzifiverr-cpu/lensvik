import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        await dbConnect();
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const category = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '0');
        const query: Record<string, any> = {};

        if (status) {
            query.status = status;
        }

        if (category) {
            query.category = { $regex: new RegExp(category, 'i') };
        }

        if (url.searchParams.get('material')) {
            const materials = url.searchParams.get('material')!.split(',');
            query.material = { $in: materials };
        }

        if (url.searchParams.get('shape')) {
            const shapes = url.searchParams.get('shape')!.split(',');
            query.shape = { $in: shapes };
        }

        if (url.searchParams.get('rim')) {
            const rims = url.searchParams.get('rim')!.split(',');
            query.rim = { $in: rims };
        }

        if (url.searchParams.get('size')) {
            const sizes = url.searchParams.get('size')!.split(',');
            query.size = { $in: sizes };
        }

        if (url.searchParams.get('gender')) {
            const genders = url.searchParams.get('gender')!.split(',');
            query.gender = { $in: genders };
        }

        if (url.searchParams.get('coating')) {
            const coatings = url.searchParams.get('coating')!.split(',');
            query.tags = { $in: coatings };
        }

        if (url.searchParams.get('feature')) {
            const features = url.searchParams.get('feature')!.split(',');
            query.tags = { $in: features };
        }

        let productsQuery = Product.find(query, { referenceImage: 0, videoData: 0, images: { $slice: 2 } })
            .sort({ createdAt: -1 })
            .allowDiskUse(true)
            .lean();

        // Always enforce a reasonable limit to avoid Vercel 4.5MB response limit
        // Admin panel calls without limit get 200, frontend calls with limit use their value
        const effectiveLimit = limit > 0 ? limit : 200;
        productsQuery = productsQuery.limit(effectiveLimit) as typeof productsQuery;

        const products = await productsQuery;

        // Strip heavy data URI arrays from list responses — only send lightweight references
        const normalizedProducts = (products as any[]).map(obj => {
            const images = obj.images && obj.images.length > 0 ? obj.images : [];
            const thumbnail = obj.image || images[1] || images[0] || '/images/dfd.png';
            const vtoImg = obj.vtoImage || images[0] || images[1] || '/images/dfd.png';

            // Calculate total stock from variants if no top-level stock field
            let stock = obj.stock ?? 0;
            if (obj.variants && obj.variants.length > 0) {
                stock = obj.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
            }

            return {
                _id: obj._id?.toString() ?? obj._id,
                name: obj.name,
                price: obj.price,
                comparePrice: obj.comparePrice,
                originalPrice: obj.originalPrice ?? obj.comparePrice ?? undefined,
                image: thumbnail,
                vtoImage: vtoImg,
                category: obj.category,
                gender: obj.gender,
                material: obj.material,
                shape: obj.shape,
                rim: obj.rim,
                size: obj.size,
                description: obj.description,
                tags: obj.tags,
                status: obj.status,
                collectionName: obj.collectionName,
                rating: obj.rating,
                reviews: obj.reviews,
                measurements: obj.measurements,
                options: obj.options,
                variants: obj.variants ? obj.variants.map((v: any) => ({
                    color: v.color,
                    size: v.size,
                    lensType: v.lensType,
                    price: v.price,
                    stock: v.stock
                })) : undefined,
                seo: obj.seo,
                sku: obj.sku,
                barcode: obj.barcode,
                stock,
                createdAt: obj.createdAt,
            };
        });

        return NextResponse.json(normalizedProducts);
    } catch (error: any) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch products. Check database connection.' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        
        // Guaranteed-unique ID: timestamp + random suffix
        const id = body._id || `prod_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
        
        // Remove undefined / empty-string values to avoid Mongoose cast errors
        const clean = Object.fromEntries(
            Object.entries(body).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
        );

        if (Array.isArray(clean.images) && clean.images.length > 0) {
            clean.image = clean.images[1] || clean.images[0];
            clean.vtoImage = clean.images[0] || clean.images[1];
        }

        const newProduct = new Product({
            ...clean,
            _id: id,
            price: Number(clean.price),
        });

        await newProduct.save();
        return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create product:', error);
        return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await dbConnect();
        await Product.deleteMany({});
        return NextResponse.json({ message: 'All products deleted successfully' });
    } catch (error: any) {
        console.error('Failed to clear products:', error);
        return NextResponse.json({ error: 'Failed to clear products' }, { status: 500 });
    }
}
