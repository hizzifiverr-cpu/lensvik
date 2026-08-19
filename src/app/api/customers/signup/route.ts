import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { name, email, phone, password } = await request.json();

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        const customer = new Customer({
            name,
            email,
            phone,
            password, // In production, hash this with bcrypt
        });

        await customer.save();

        return NextResponse.json({
            customer: {
                _id: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
    }
}