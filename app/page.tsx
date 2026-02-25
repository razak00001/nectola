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

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="font-display text-[6rem] sm:text-[8rem] md:text-[14rem] leading-none tracking-tighter"
                    >
                        NECT<span style={{ color: 'var(--accent)' }} className="flavor-transition">O</span>LA
                    </motion.h1>

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

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-text-muted">Scroll</span>
                    <div className="w-px h-12 bg-gradient-to-b from-[var(--accent)] to-transparent" />
                </div>
            </section >

            {/* Flavor Grid Section */}
            < section className="py-24 px-6 md:px-12 bg-[#080808]" >
                <div className="container mx-auto">
                    <div className="flex flex-col items-center text-center mb-16">
                        <p className="font-body text-[var(--accent)] tracking-[0.3em] font-bold text-xs uppercase mb-2">Our Lineup</p>
                        <h2 className="text-6xl md:text-8xl">THE FLAVORS</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {FLAVORS.map((flavor) => (
                            <motion.div
                                key={flavor.id}
                                whileHover={{ scale: 1.03 }}
                                className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer bg-bg-card border border-white/5"
                                onClick={() => setFlavor(flavor.id as any)}
                            >
                                <div
                                    className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
                                    style={{ background: `radial-gradient(circle at top right, ${flavor.color}, transparent)` }}
                                />
                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <span className="font-display text-2xl tracking-tighter">{flavor.name}</span>
                                        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: flavor.color }} />
                                    </div>
                                    <div className="relative h-56 w-full flex justify-center items-end">
                                        <div className="w-20 h-56 transform group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-500 origin-bottom">
                                            <Bottle id={flavor.id} name={flavor.name} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >
        </div >
    );
}
