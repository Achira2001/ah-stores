"use client";

import { SessionProvider } from "nextauth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}