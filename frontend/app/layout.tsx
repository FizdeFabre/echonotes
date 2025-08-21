// app/layout.tsx

import "@/app/styles/globals.css";
import "@fontsource-variable/inter"; // Police principale : Inter

import type { Metadata } from "next";
import { ReactNode } from "react";
import { ThemeProvider } from "@/app/components/theme-provider";

export const metadata: Metadata = {
    title: "EchoNotes",
    description: "Une application magique d'emailing ✨ pensée pour les indépendants exigeants.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr" className="scroll-smooth">
            <body className="font-sans text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-900">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {/* Suppression des max-w-7xl, padding horizontal, etc ici */}
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}