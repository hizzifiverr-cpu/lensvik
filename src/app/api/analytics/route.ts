import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        await dbConnect();

        // Get total counts
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        // Calculate total revenue
        const orders = await Order.find({ status: { $ne: 'Cancelled' } });
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

        // Get recent orders
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .allowDiskUse(true)
            .limit(5);

        // Status breakdown
        const statusBreakdown = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        return NextResponse.json({
            stats: {
                totalRevenue,
                totalOrders,
                totalProducts,
                activeCustomers: 0 // Will implement Customer model later
            },
            recentOrders,
            statusBreakdown
        });
    } catch (error: any) {
        console.error('Analytics fetch failed:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
