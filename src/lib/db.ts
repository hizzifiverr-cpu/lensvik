import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        if (mongoose.connection.readyState === 1) {
            return cached.conn;
        }
        // Stale or disconnected connection - reset cache
        cached.conn = null;
        cached.promise = null;
    }

    const uri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'development' ? 'mongodb://localhost:27017/lensvik' : '');
    
    if (!uri) {
        const errMsg = 'MONGODB_URI environment variable is missing. Please set MONGODB_URI in Vercel project environment variables.';
        console.error(`❌ ${errMsg}`);
        throw new Error(errMsg);
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 8000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
            console.log("MongoDB Connected Successfully");
            return mongooseInstance;
        }).catch(err => {
            console.error("❌ MongoDB Connection Error:", err.message);
            cached.promise = null;
            cached.conn = null;
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        cached.conn = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;

