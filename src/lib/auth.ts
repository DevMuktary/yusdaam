import { NextAuthOptions } from "next-auth";
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
        // We cast as 'any' here so NextAuth accepts our custom fields
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, 
          accountStatus: user.accountStatus, 
        } as any; 
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Cast user to any to bypass strict type checking for custom fields
        const customUser = user as any;
        token.id = customUser.id;
        token.role = customUser.role;
        token.accountStatus = customUser.accountStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Cast session.user to any to attach our custom token fields
        const customSessionUser = session.user as any;
        customSessionUser.id = token.id;
        customSessionUser.role = token.role;
        customSessionUser.accountStatus = token.accountStatus;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login", 
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, 
  },
  secret: process.env.NEXTAUTH_SECRET,
};
