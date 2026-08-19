import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        await dbConnect();
        const url = new URL(request.url);
        const limitParam = url.searchParams.get('limit');
        const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 500) : 0;

        const query = Order.find({}).sort({ createdAt: -1 }).allowDiskUse(true).lean();
        if (limit > 0) query.limit(limit);

        const orders = await query;
        return NextResponse.json(orders);
    } catch (error: any) {
        console.error('Failed to fetch orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        
        const id = body._id || `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        
        const newOrder = new Order({
            ...body,
            _id: id
        });

        await newOrder.save();
        return NextResponse.json(newOrder, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create order:', error);
        return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
    }
}
