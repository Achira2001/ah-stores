import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";

// User Schema Dynamic Import or Simple Validation
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize function section in NextAuth route.ts:
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null;

  await connectToDatabase();
  const user = await User.findOne({ email: credentials.email });

  // Account ekak nathnam error ekak throw karagannawam
  if (!user) {
    throw new Error("No account found with this email. Please Sign Up first!");
  }

  if (user.password !== credentials.password) {
    throw new Error("Incorrect Password!");
  }

  return { id: user._id.toString(), name: user.name, email: user.email };
},
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          (session.user as any).id = dbUser._id.toString();
          (session.user as any).role = dbUser.role || "user";
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "ah_essentials_super_secret_key_123",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };