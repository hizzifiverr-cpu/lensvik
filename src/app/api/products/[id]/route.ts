import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await context.params;

        // Use findOneAndDelete since _id is a custom string, not ObjectId
        const deletedProduct = await Product.findOneAndDelete({ _id: id });

        if (!deletedProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete product:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await context.params;
        let body = await request.json();

        // Handle dot-notation updates (e.g. { "variants.0.stock": 15 }) from inventory page
        const isDotNotation = Object.keys(body).some(k => k.includes('.'));
        
        if (!isDotNotation) {
            // Full product update from edit form
            // images[0] = try-on image, images[1] = thumbnail
            if (Array.isArray(body.images) && body.images.length > 0) {
                body.image = body.images[1] || body.images[0];
                body.vtoImage = body.images[0] || body.images[1];
            }
        }

        const updateOp = isDotNotation ? { $set: body } : { $set: body };

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id },
            updateOp,
            { new: true }
        );

        if (!updatedProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error('Failed to update product:', error);
        return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await context.params;

        const product = await Product.findOne({ _id: id });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('Failed to fetch product:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
    }
}
