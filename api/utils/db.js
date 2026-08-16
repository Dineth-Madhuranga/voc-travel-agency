import mongoose from 'mongoose';

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI environment variable is not set.');
    cached.promise = mongoose.connect(uri, { bufferCommands: false }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const inquirySchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['booking', 'contact'], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: null },
    package_name: { type: String, default: null },
    arrival_date: { type: String, default: null },
    travelers: { type: Number, default: null },
    message: { type: String, default: null },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

export const Inquiry =
  mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
