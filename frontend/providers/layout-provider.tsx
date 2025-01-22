'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { ThemeProvider } from './theme-provider';
import { WebSocketProvider } from './socket-provider';
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();


export default function LayoutProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    const [token, setToken] = useState<string | null>(null);
    const searchParams = useSearchParams();
  
    useEffect(() => {
      const accessToken = Cookies.get('token');
      if (accessToken !== token) {
        setToken(accessToken);
      }
    }, [searchParams, token]);
  


  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
      {token ? <WebSocketProvider>{children}</WebSocketProvider> : children}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ThemeProvider>
  );
};