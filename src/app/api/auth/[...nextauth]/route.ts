import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // 1. Find the user in the database
        const user = await prisma.user.findFirst({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // 2. Compare the hashed password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // 3. Return the user data we want to store in the session
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // e.g., 'ASSET_OWNER'
          accountStatus: user.accountStatus, // e.g., 'PENDING' or 'ACTIVE'
        };
      }
    })
  ],
  callbacks: {
    // 4. Attach custom data to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accountStatus = user.accountStatus;
      }
      return token;
    },
    // 5. Pass that token data to the frontend session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accountStatus = token.accountStatus as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/owner/login", // Redirects unauthenticated users to our custom login page
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours until they need to login again
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
