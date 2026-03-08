"use client";

import { motion } from "framer-motion";
import { useFlavor } from "@/context/FlavorContext";
import Image from "next/image";
import Link from "next/link";
import { Bottle } from "@/components/Bottle";
import { Droplet } from "lucide-react";

const FLAVORS = [
    { id: 'necto', name: 'Necto Soda', color: '#e8111a', darkColor: '#80090e' },
    { id: 'cream', name: 'Cream Soda', color: '#2ec72e', darkColor: '#1a751a' },
    { id: 'ginger', name: 'Ginger Beer', color: '#d44b00', darkColor: '#7a2b00' },
    { id: 'pineapple', name: 'Pineapple Soda', color: '#f5c800', darkColor: '#8f7500' },
];

export default function Home() {
    const { currentFlavor, setFlavor } = useFlavor();

    return (
        <div className="relative overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center pt-24 pb-48">
                {/* Background Animation */}
                <div className="absolute inset-0 -z-10 bg-[#0a0a0a]">
                    <div
                        className="absolute inset-0 opacity-40 transition-all duration-1000"
                        style={{
                            background: `radial-gradient(circle at center, var(--accent) 0%, transparent 70%)`,
                            filter: 'blur(100px)'
                        }}
                    />
                    {/* Animated Rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[var(--accent)] rounded-full opacity-10 animate-ring-expand" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[var(--accent)] rounded-full opacity-10 animate-ring-expand delay-1000" />
                </div>

                {/* Bubbles */}
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: Math.random() * 40 + 10,
                                height: Math.random() * 40 + 10,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                backgroundColor: 'var(--accent)',
                                opacity: 0.1,
                            }}
                            animate={{
                                y: [0, -100, 0],
                                x: [0, Math.random() * 50 - 25, 0],
                                opacity: [0.1, 0.3, 0.1],
                            }}
                            transition={{
                                duration: Math.random() * 10 + 5,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                    ))}
                </div>

                {/* Hero Content */}
                <div className="container mx-auto px-6 text-center space-y-6 relative z-10 flex-grow flex flex-col justify-center pb-32 md:pb-48">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-body text-[var(--accent)] tracking-[0.3em] font-bold text-sm uppercase flex items-center justify-center gap-2"
                    >
                        <Droplet className="w-4 h-4" /> Crafted in Canada · Since Day One
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center"
                    >
                        <div className="brand-logo w-[300px] h-[100px] sm:w-[500px] sm:h-[150px] md:w-[800px] md:h-[250px]" />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-text-muted tracking-[0.5em] text-sm sm:text-lg uppercase font-light"
                    >
                        Life Tastes Better with Nectola
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="pt-8"
                    >
                        <Link href="/find-us" className="btn-premium flavor-transition text-white text-lg">
                            Find a Store Near You
                        </Link>
                    </motion.div>
                </div>

                {/* Product Showcase - Bottles */}
                <div className="absolute -bottom-16 left-0 w-full px-4 sm:px-6 flex justify-center items-end gap-2 md:gap-12 pb-8 overflow-visible z-20">
                    {FLAVORS.map((flavor, index) => (
                        <motion.div
                            key={flavor.id}
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="group cursor-pointer flex flex-col items-center"
                            onClick={() => setFlavor(flavor.id as any)}
                        >
                            <div
                                className={`relative w-20 h-60 sm:w-28 sm:h-[21rem] md:w-36 md:h-[26rem] transition-all duration-500 transform group-hover:-translate-y-8 ${currentFlavor === flavor.id ? 'scale-110 -translate-y-6 z-20' : 'scale-90 opacity-40 hover:opacity-100 z-10'}`}
                            >
                                <Bottle id={flavor.id} name={flavor.name} />
                            </div>
                            <span className={`mt-6 font-display text-sm sm:text-lg tracking-widest uppercase transition-colors whitespace-nowrap ${currentFlavor === flavor.id ? 'text-white' : 'text-text-muted'}`}>
                                {flavor.name}
                            </span>
                        </motion.div>
                    ))}
                </div>

            </section>
        </div>
    );
}
