import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    comparePrice: Number,
    sku: String,
    barcode: String,
    gender: { type: String, default: 'Unisex' },
    material: String,
    shape: String,
    rim: String,
    status: { type: String, default: 'Draft' },
    collectionName: String,
    category: { type: String, required: true },
    description: String,
    images: [String],
    referenceImage: String,
    videoUrl: String,
    videoData: String,
    tags: [String],
    measurements: {
        pdMin: Number,
        pdMax: Number,
        lensWidth: Number,
        frameHeight: Number,
        bridgeWidth: Number,
        templeLength: Number
    },
    variants: [{
        color: String,
        size: String,
        lensType: String,
        price: Number,
        sku: String,
        stock: { type: Number, default: 100 }
    }],
    options: {
        prescriptionCompatible: Boolean,
        blueLightFilter: Boolean,
        virtualTryOn: Boolean,
        lensCustomization: Boolean
    },
    seo: {
        metaTitle: String,
        metaDesc: String
    },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 }
}, { timestamps: true });

ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ category: 1, status: 1 });

// Check if model exists before defining to avoid OverwriteModelError in Next.js hot-reloading
export default models.Product || model('Product', ProductSchema);
