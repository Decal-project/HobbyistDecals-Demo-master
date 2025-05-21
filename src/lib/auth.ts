import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

// Define the NextAuth configuration
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", // Store session as JWT
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for signing JWT
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { email, password } = credentials;
        const result = await pool.query(
          "SELECT id, email, password_hash FROM users WHERE email = $1",
          [email]
        );
        const user = result.rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
          // Return user data to be saved in JWT
          return { id: user.id.toString(), email: user.email };
        }
        return null; // If no user or invalid password
      },
    }),
  ],
  callbacks: {
    // Callback for the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Add the user id to the token
        token.email = user.email; // Optionally add email to the token
      }
      return token;
    },
    // Callback for the session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string; // Assign the user id from token
        session.user.email = token.email as string; // Assign the email from token
      }
      return session;
    },
  },
};

// Export the NextAuth handler
export default NextAuth(authOptions);
