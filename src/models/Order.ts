import mongoose, { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
    _id: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    items: [{
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        variant: {
            color: String,
            size: String,
            lensType: String
        },
        prescription: {
            measurements: {
                od_sph: String, od_cyl: String, od_axis: String, od_add: String,
                os_sph: String, os_cyl: String, os_axis: String, os_add: String,
                pd: String
            },
            lensCategory: { name: String, price: Number },
            lensType: { name: String, price: Number }
        }
    }],
    totalAmount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Lens Processing', 'Ready to Ship', 'Shipped', 'Delivered', 'Returned', 'Cancelled'],
        default: 'Pending' 
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: 'Pending' },
    trackingNumber: String,
    notes: String
}, { timestamps: true });

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default models.Order || model('Order', OrderSchema);
