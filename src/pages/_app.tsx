import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}