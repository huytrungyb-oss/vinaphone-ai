import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { normalizePhone } from "@/lib/phone";

export async function POST(req: Request) {
  try {
    const { name, phone, password } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ phone: normalizedPhone });
    if (existing) {
      return NextResponse.json({ error: "Số điện thoại đã được sử dụng" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone: normalizedPhone,
      passwordHash,
    });

    return NextResponse.json({ id: user._id.toString(), name: user.name, phone: user.phone });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json({ error: "Đã có lỗi xảy ra, vui lòng thử lại" }, { status: 500 });
  }
}
