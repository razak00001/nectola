"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFlavor } from "@/context/FlavorContext";
import { motion } from "framer-motion";

const Navbar = () => {
    const pathname = usePathname();
    const { currentFlavor } = useFlavor();

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Find Us", href: "/find-us" },
        { name: "Events", href: "/events" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 glass py-4 px-6 md:px-12 flex justify-between items-center">
            <Link href="/" className="font-display text-4xl tracking-tighter flavor-transition" style={{ color: 'var(--accent)' }}>
                NECTOLA
            </Link>

            <div className="hidden md:flex gap-8 items-center">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`font-body font-bold uppercase tracking-widest text-sm relative group`}
                    >
                        <span className={pathname === link.href ? "text-bg-dark" : "text-text-primary group-hover:text-text-muted transition-colors"}>
                            {link.name}
                        </span>
                        {pathname === link.href && (
                            <motion.div
                                layoutId="nav-active"
                                className="absolute inset-x-[-12px] inset-y-[-6px] -z-10 rounded-full"
                                style={{ backgroundColor: 'var(--accent)' }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </Link>
                ))}
            </div>

            {/* Mobile Menu Placeholder */}
            <button className="md:hidden text-text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </nav>
    );
};

export default Navbar;
