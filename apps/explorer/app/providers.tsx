"use client";

import { useState, useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CampProvider } from "@campnetwork/origin/react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [redirectUri, setRedirectUri] = useState("https://fusion-plum-beta.vercel.app");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectUri(window.location.origin);
    }
    setMounted(true);
  }, []);

  // Don't render CampProvider until mounted to avoid SSR issues with window.ethereum
  if (!mounted) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CampProvider
        clientId="fce77d7a-8085-47ca-adff-306a933e76aa"
        redirectUri={redirectUri}
      >
        {children}
      </CampProvider>
    </QueryClientProvider>
  );
}