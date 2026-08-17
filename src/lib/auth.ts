import NextAuth from "next-auth"
import { ZodError } from "zod"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"

import { authConfig } from "@/auth.config"
import connectDB from "./mongodb"
import User from "@/models/User"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      authorize: async (credentials) => {
        try {
          await connectDB()

          const email = credentials?.email as string
          const password = credentials?.password as string

          if (!email || !password) {
            return null
          }

          const user = await User.findOne({ email }).select("+password")

          if (!user) {
            throw new Error("Invalid email or password")
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before logging in")
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Invalid email or password")
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }
        } catch (error) {
          if (error instanceof ZodError) {
            return null
          }

          throw error
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB()

        if (!user.email) {
          return false
        }

        let existingUser = await User.findOne({
          email: user.email,
        })

        if (!existingUser) {
          existingUser = await User.create({
            name: user.name || "Google User",
            email: user.email,
            image: user.image,
            role: "customer",
            isVerified: true,
            password: await bcrypt.hash(
              Math.random().toString(36).slice(-8),
              12
            ),
          })
        } else if (existingUser.role === "admin") {
          return "/login?error=Admin%20accounts%20cannot%20use%20Google%20login"
        }

        await User.findOneAndUpdate(
          { email: user.email },
          {
            name: user.name,
            image: user.image,
          }
        )

        // Always use MongoDB User ID
        user.id = existingUser._id.toString()
        user.role = existingUser.role
      }

      return true
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      if (trigger === "update" && session) {
        token.name = session.name
        token.image = session.image
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }

      return session
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
})