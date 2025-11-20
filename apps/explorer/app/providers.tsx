"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CampProvider } from "@campnetwork/origin/react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <CampProvider
        clientId="fce77d7a-8085-47ca-adff-306a933e76aa"
        redirectUri="http://localhost:3000"
      >
        {children}
      </CampProvider>
    </QueryClientProvider>
  );
}