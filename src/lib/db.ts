import dns from "node:dns";
import mongoose from "mongoose";

// Một số ISP/mạng nội bộ (vd: VNPT, Viettel) khiến Node.js không tra cứu được
// DNS SRV record của MongoDB Atlas (mongodb+srv://) dù hệ điều hành tra được bình thường.
// Ép Node dùng DNS công cộng để tránh lỗi "querySrv ECONNREFUSED".
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

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

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
