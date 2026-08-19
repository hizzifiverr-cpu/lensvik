import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        const customer = await Customer.findOne({ email });
        if (!customer) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // In a real app, you'd use bcrypt here. For demo, plain text comparison
        if (customer.password !== password) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        return NextResponse.json({
            customer: {
                _id: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}