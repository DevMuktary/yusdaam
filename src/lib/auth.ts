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

        // 1. Find user in DB
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // 2. Securely verify the hash
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // 3. Return exact data needed for the JWT
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // If user logs in, populate the token with DB data
      if (user) {
        // Cast to any to bypass strict AdapterUser union type checking
        const customUser = user as any; 
        token.id = customUser.id;
        token.role = customUser.role;
        token.accountStatus = customUser.accountStatus;
      }
      return token;
    },
    async session({ session, token }) {
      // Send token data to the client-side session
      if (token && session.user) {
        // Cast to any to bypass strict DefaultSession type checking during build
        const sessionUser = session.user as any;
        sessionUser.id = token.id;
        sessionUser.role = token.role;
        sessionUser.accountStatus = token.accountStatus;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
