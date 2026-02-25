import type { Metadata } from "next";
import { Bebas_Neue, Nunito, Pacifico } from "next/font/google";
import "@/styles/globals.css";
import { FlavorProvider } from "@/context/FlavorContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import FlavorSwitcher from "@/components/FlavorSwitcher";

const bebas = Bebas_Neue({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-bebas",
});

const nunito = Nunito({
    subsets: ["latin"],
    variable: "--font-nunito",
});

const pacifico = Pacifico({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-pacifico",
});

export const metadata: Metadata = {
    title: "Nectola | Life Tastes Better with Nectola",
    description: "Official Nectola website - Premium Canadian craft soda brand. Bold flavors, real ingredients.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${bebas.variable} ${nunito.variable} ${pacifico.variable} font-body bg-bg-dark text-text-primary overflow-x-hidden`}>
                <FlavorProvider>
                    <div className="noise-overlay" />
                    <CustomCursor />
                    <FlavorSwitcher />
                    <Navbar />
                    <main className="min-h-screen">
                        {children}
                    </main>
                    <Footer />
                </FlavorProvider>
            </body>
        </html>
    );
}
