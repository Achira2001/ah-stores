import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // API routes are handled separately
      if (pathname.startsWith("/api")) {
        return true
      }

      const publicRoutes = [
        "/",
        "/products",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
      ]

      const isPublicRoute =
        publicRoutes.some((route) => pathname === route) ||
        pathname.startsWith("/products/")

      if (isPublicRoute) {
        return true
      }

      const isAdminRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin")

      const isCustomerAuthRoute =
        pathname.startsWith("/cart") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/orders")

      if (isAdminRoute || isCustomerAuthRoute) {
        return isLoggedIn
      }

      return true
    },
  },

  providers: [],
} satisfies NextAuthConfig