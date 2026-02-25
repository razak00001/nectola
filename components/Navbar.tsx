"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFlavor } from "@/context/FlavorContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Droplet } from "lucide-react";

const Navbar = () => {
    const pathname = usePathname();
    const { currentFlavor } = useFlavor();
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Find Us", href: "/find-us" },
        { name: "Events", href: "/events" },
        { name: "Contact", href: "/contact" },
    ];

    const menuVariants = {
        closed: {
            opacity: 0,
            x: "100%",
            transition: {
                type: "spring" as const,
                stiffness: 400,
                damping: 40,
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        },
        opened: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring" as const,
                stiffness: 200,
                damping: 25,
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        closed: { opacity: 0, x: 50 },
        opened: { opacity: 1, x: 0 }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 glass py-5 px-6 md:px-12 flex justify-between items-center transition-all duration-500 min-h-[5rem]">
                <Link href="/" className="font-display text-4xl tracking-tighter flavor-transition relative z-50" style={{ color: 'var(--accent)' }}>
                    NECTOLA
                </Link>

                {/* Desktop Menu */}
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

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden z-[70] p-2 focus:outline-none transition-colors duration-300 text-text-primary"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Menu"
                >
                    <Menu size={32} />
                </button>
            </nav>

            {/* Mobile Menu Backdrop & Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                            transition={{ duration: 0.3 }}
                        />

                        {/* Drawer */}
                        <motion.div
                            variants={menuVariants}
                            initial="closed"
                            animate="opened"
                            exit="closed"
                            className="fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-sm bg-bg-dark/95 backdrop-blur-3xl md:hidden flex flex-col z-[100] overflow-hidden shadow-2xl border-l border-white/10"
                        >
                            {/* Drawer Header with Close Button */}
                            <div className="flex justify-between items-center py-5 px-6 min-h-[5rem] relative z-20 w-full border-b border-white/5">
                                <span className="font-display tracking-tighter text-3xl" style={{ color: 'var(--accent)' }}>NECTOLA</span>
                                <button
                                    className="p-2 text-white focus:outline-none hover:rotate-90 transition-transform duration-300"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close Menu"
                                >
                                    <X size={32} />
                                </button>
                            </div>

                            {/* Decorative Background Element */}
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none"
                                style={{
                                    background: `radial-gradient(circle at center, var(--accent) 0%, transparent 70%)`,
                                    filter: 'blur(120px)'
                                }}
                            />

                            <div className="flex flex-col h-full pt-10 pb-12 px-10 relative z-10 overflow-y-auto w-full items-start">
                                {/* Brand Tagline */}
                                <motion.p
                                    variants={itemVariants}
                                    className="text-[var(--accent)] font-bold tracking-[0.4em] uppercase text-[10px] mb-12 opacity-80 flex items-center justify-center gap-2"
                                >
                                    <Droplet className="w-3 h-3" /> Crafted in Canada
                                </motion.p>

                                <div className="flex flex-col gap-8 w-full">
                                    {navLinks.map((link) => (
                                        <motion.div key={link.href} variants={itemVariants}>
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsOpen(false)}
                                                className="group flex items-baseline gap-4 w-full"
                                            >
                                                <span
                                                    className={`text-4xl sm:text-5xl font-display tracking-tight uppercase transition-all duration-300 ${pathname === link.href ? "text-[var(--accent)] pl-4" : "text-text-primary group-hover:pl-4"}`}
                                                >
                                                    {link.name}
                                                </span>
                                                {pathname === link.href && (
                                                    <motion.div
                                                        layoutId="mobile-dot"
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: 'var(--accent)' }}
                                                    />
                                                )}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Menu Footer */}
                                <div className="mt-auto pt-10 w-full">
                                    <motion.div variants={itemVariants} className="space-y-8 w-full">
                                        <Link
                                            href="/find-us"
                                            onClick={() => setIsOpen(false)}
                                            className="btn-premium flex items-center justify-center gap-3 text-white uppercase tracking-widest text-sm py-5 shadow-2xl w-full"
                                            style={{ boxShadow: `0 0 30px var(--accent)44` }}
                                        >
                                            Find a Store <ArrowRight size={18} />
                                        </Link>

                                        <div className="flex flex-col items-center gap-2 pb-4 w-full">
                                            <p className="text-text-muted text-[9px] tracking-[0.6em] uppercase text-center opacity-50">
                                                Life Tastes Better with Nectola
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
