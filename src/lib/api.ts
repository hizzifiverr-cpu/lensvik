

export interface Product {
    _id: string;
    name: string;
    price: number;
    comparePrice?: number;
    originalPrice?: number;
    size?: string;
    rating?: number;
    image: string;
    images?: string[];
    referenceImage?: string;
    videoUrl?: string;
    videoData?: string;
    vtoImage?: string;
    category: string;
    subcategory?: string;
    frameType?: string;
    description?: string;
    gender?: string;
    material?: string;
    shape?: string;
    rim?: string;
    status?: string;
    collectionName?: string;
    tags?: string[];
    sku?: string;
    barcode?: string;
    stock?: number;
    variants?: Array<{
        color?: string;
        size?: string;
        lensType?: string;
        price?: number;
        stock?: number;
    }>;
    measurements?: {
        lensWidth?: number;
        bridgeWidth?: number;
        templeLength?: number;
        pdMin?: number;
        pdMax?: number;
        frameHeight?: number;
    };
    options?: {
        prescriptionCompatible?: boolean;
        blueLightFilter?: boolean;
        virtualTryOn?: boolean;
        lensCustomization?: boolean;
    };
    seo?: {
        metaTitle?: string;
        metaDesc?: string;
    };
}

/** Normalize a raw product object so both `image` and `images` are always resolved */
function normalizeProduct(data: any): Product {
    // Backward compat: if API returns the full images[] array, use it; otherwise use already-resolved `image`
    const images: string[] = data.images && data.images.length > 0 ? data.images : [];
    const image = data.image || images[1] || images[0] || '/images/dfd.png';
    const vtoImage = data.vtoImage || images[0] || images[1] || '/images/dfd.png';
    return {
        ...data,
        image,
        vtoImage,
        images: data.images || [], // preserve images only if present (detail view), empty for list view
        // Map comparePrice → originalPrice for backward compat with ProductCard
        originalPrice: data.originalPrice ?? data.comparePrice ?? undefined,
    };
}

const API_BASE_URL = '/api';

export const getProducts = async (status = 'Active', limit?: number, category?: string, filters?: {
    material?: string[];
    shape?: string[];
    rim?: string[];
    size?: string[];
    gender?: string[];
    coating?: string[];
    feature?: string[];
}): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    if (category) params.append('category', category);
    
    if (filters) {
        if (filters.material?.length) params.append('material', filters.material.join(','));
        if (filters.shape?.length) params.append('shape', filters.shape.join(','));
        if (filters.rim?.length) params.append('rim', filters.rim.join(','));
        if (filters.size?.length) params.append('size', filters.size.join(','));
        if (filters.gender?.length) params.append('gender', filters.gender.join(','));
        if (filters.coating?.length) params.append('coating', filters.coating.join(','));
        if (filters.feature?.length) params.append('feature', filters.feature.join(','));
    }
    
    // Using native fetch for better Next.js caching and smaller bundle
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
        next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!response.ok) return [];
    const raw = await response.json();
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeProduct);
};

export const getProductById = async (id: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        next: { revalidate: 60 }
    });
    if (!response.ok) throw new Error('Product not found');
    const data = await response.json();
    return normalizeProduct(data);
};
