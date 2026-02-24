"use client";

import Link from "next/link";
import { useFlavor } from "@/context/FlavorContext";

const Footer = () => {
    const { currentFlavor } = useFlavor();

    return (
        <footer className="bg-[#080808] border-t border-white/5 py-16 px-6 md:px-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-6">
                    <Link href="/" className="font-display text-4xl tracking-tighter" style={{ color: 'var(--accent)' }}>
                        NECTOLA
                    </Link>
                    <p className="text-text-muted font-body max-w-xs">
                        Bold flavors. Real ingredients. Canadian pride. 🍁
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-white text-lg font-bold mb-2">QUICK LINKS</h4>
                    <Link href="/" className="text-text-muted hover:text-[var(--accent)] transition-colors">Home</Link>
                    <Link href="/about" className="text-text-muted hover:text-[var(--accent)] transition-colors">About</Link>
                    <Link href="/find-us" className="text-text-muted hover:text-[var(--accent)] transition-colors">Find Us</Link>
                    <Link href="/events" className="text-text-muted hover:text-[var(--accent)] transition-colors">Events</Link>
                    <Link href="/contact" className="text-text-muted hover:text-[var(--accent)] transition-colors">Contact</Link>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-white text-lg font-bold mb-2">SOCIAL</h4>
                    <div className="flex gap-4">
                        {['Instagram', 'TikTok', 'Facebook', 'X'].map((social) => (
                            <a
                                key={social}
                                href="#"
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all transform hover:-translate-y-1"
                            >
                                <span className="sr-only">{social}</span>
                                {/* SVG icons would go here */}
                                <div className="w-4 h-4 bg-white/20 rounded-sm" />
                            </a>
                        ))}
                    </div>
                    <p className="text-text-muted text-sm mt-4">
                        hello@nectola.com
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-text-muted text-sm">
                <p>© 2025 Nectola. All rights reserved. 🍁 Made in Canada.</p>
                <p className="italic">Returnable 10¢ Refund in Québec</p>
            </div>
        </footer>
    );
};

export default Footer;
