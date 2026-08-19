/**
 * server-api.ts
 * 
 * Server-side only data access layer.
 * Queries MongoDB directly — avoids the "relative URL" problem when
 * calling fetch() from Server Components (Node.js has no base URL).
 * 
 * Import ONLY in Server Components or API routes, never in client components.
 */
import dbConnect from './db';
import ProductModel from '@/models/Product';
import type { Product } from './api';

/** Normalize a raw Mongoose document to match the shared Product type */
function normalizeDoc(doc: any, isDetail = false): Product {
    const obj = doc.toObject ? doc.toObject() : doc;
    const rawImages: string[] = obj.images && obj.images.length > 0 ? obj.images : [];
    const image = obj.image || rawImages[1] || rawImages[0] || '/images/dfd.png';

    // Deep copy and sanitize mongo properties (like ObjectIds)
    const cleanVariants = Array.isArray(obj.variants) 
        ? obj.variants.map((v: any) => ({
            ...v,
            _id: v._id?.toString() ?? undefined
          }))
        : [];

    if (!isDetail) {
        // Strip heavy base64 fields (videoData, referenceImage) for lists to keep payloads small
        const { referenceImage, videoData, ...rest } = obj;
        return {
            ...rest,
            _id: obj._id?.toString() ?? obj._id,
            image,
            images: rawImages.slice(0, 2),
            variants: cleanVariants,
            originalPrice: obj.originalPrice ?? obj.comparePrice ?? undefined,
            createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
            updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
        };
    }

    return {
        ...obj,
        _id: obj._id?.toString() ?? obj._id,
        image,
        images: rawImages,
        variants: cleanVariants,
        originalPrice: obj.originalPrice ?? obj.comparePrice ?? undefined,
        createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
        updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
    };
}

export async function getProductsServer(
    status = 'Active',
    limit = 0,
    category?: string
): Promise<Product[]> {
    try {
        await dbConnect();
        const query: Record<string, any> = {};
        if (status) query.status = status;
        if (category) {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        let q = ProductModel.find(query, { referenceImage: 0, videoData: 0, images: { $slice: 2 } }).sort({ createdAt: -1 }).allowDiskUse(true).lean();
        if (limit > 0) q = q.limit(limit) as typeof q;
        const docs = await q;
        return (docs as any[]).map(doc => normalizeDoc(doc, false));
    } catch {
        return [];
    }
}

export async function getProductByIdServer(id: string): Promise<Product | null> {
    try {
        await dbConnect();
        const doc = await ProductModel.findOne({ _id: id }).lean();
        if (!doc) return null;
        return normalizeDoc(doc, true);
    } catch {
        return null;
    }
}
