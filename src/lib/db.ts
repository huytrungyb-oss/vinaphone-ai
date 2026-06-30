import dns from "node:dns";
import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB() {
  if (cache.conn) return cache.conn;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!cache.promise) {
    // Một số ISP/mạng nội bộ (vd: VNPT, Viettel) khiến Node.js không tra cứu được
    // DNS SRV record của MongoDB Atlas (mongodb+srv://). Thử ép dùng DNS công cộng,
    // nhưng bỏ qua an toàn nếu môi trường host (vd Hostinger) không cho phép thao tác này.
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch {
      // ignore - một số môi trường sandbox chặn việc đổi DNS server cấp tiến trình
    }

    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}
