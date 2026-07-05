import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Teko } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const teko = Teko({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simulador de Fútbol",
  description: "Crea y simula torneos de fútbol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${teko.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="flex h-dvh bg-background text-foreground overflow-hidden font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-8 py-10 md:px-12 md:py-14">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
