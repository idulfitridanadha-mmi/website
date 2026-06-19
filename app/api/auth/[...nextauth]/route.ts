import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          // Cari user di database Supabase
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });

          // Kalau user nggak ketemu
          if (!user) return null;

          // Cocokin password yang diketik sama password hash di database
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) return null;

          // Kalau sukses, balikin data ini ke session
          return {
            id: user.id,
            name: user.nama,
            username: user.username,
            role: user.role
          };
        } catch (error) {
          console.error("[NextAuth] Fatal error in authorize callback:", error);
          throw new Error("DatabaseConnectionError");
        }
      }
    })
  ],
  callbacks: {
    // Simpan data tambahan (kayak role dan username) ke dalam token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
      }
      return token;
    },
    // Oper data dari token ke session biar bisa dibaca di frontend
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login', // Nanti kita bikin UI halamannya
  }
});

export { handler as GET, handler as POST };