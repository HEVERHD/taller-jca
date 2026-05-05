import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jhan Carlos Arias | Latonería y Pintura",
  description: "Sistema de gestión para Taller Jhan Carlos Arias",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Taller JCA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Captura beforeinstallprompt ANTES de que React hidrate */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.__pwaPrompt=null;
        window.addEventListener('beforeinstallprompt',function(e){
          e.preventDefault();
          window.__pwaPrompt=e;
          window.dispatchEvent(new Event('pwa-prompt-ready'));
        });
      `}} />
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
          <InstallPrompt />
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
