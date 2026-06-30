import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { normalizePhone } from "@/lib/phone";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        phone: { label: "Số điện thoại", type: "tel" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const phone = credentials?.phone as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!phone || !password) return null;

        const normalizedPhone = normalizePhone(phone);
        if (!normalizedPhone) return null;

        await connectDB();
        const user = await User.findOne({ phone: normalizedPhone });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as { phone?: string }).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; phone?: string }).id = token.id as string;
        (session.user as { id?: string; phone?: string }).phone = token.phone as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
