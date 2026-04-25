import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";

// We instantiate Prisma here to avoid multiple connections during dev
const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login", // We will build this custom login page later
  },
  providers: [
    // This is a placeholder for standard email/password login.
    // We can swap this to Magic Links (EmailProvider) later if preferred.
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "investor@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // We will implement the actual bcrypt password check here later
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        // Bypassing real password check for the initial setup phase
        return user;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Pushing the custom role (ADMIN/INVESTOR) to the token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};
