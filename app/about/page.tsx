"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useFlavor } from "@/context/FlavorContext";
import CountUp from "@/components/CountUp";
import Image from "next/image";

const STATS = [
    { label: "Bold Flavors", value: 4, suffix: "" },
    { label: "Canadian Made", value: 100, suffix: "%" },
    { label: "Glass Bottle", value: 355, suffix: "ml" },
    { label: "Good Times", value: 999, suffix: "∞", isInfinity: true },
];

export default function About() {
    const { setFlavor } = useFlavor();
    const storyRef = useRef(null);
    const isStoryInView = useInView(storyRef, { once: true });

    const FLAVOR_SHOWCASE = [
        { id: 'necto' as const, name: 'Necto Soda', color: '#e8111a', tag: 'The Flagship' },
        { id: 'cream' as const, name: 'Cream Soda', color: '#2ec72e', tag: 'Smooth & Sweet' },
        { id: 'ginger' as const, name: 'Ginger Beer', color: '#d44b00', tag: 'Spicy Kick' },
        { id: 'pineapple' as const, name: 'Pineapple Soda', color: '#f5c800', tag: 'Tropical Vibe' },
    ];

    return (
        <div className="pt-32 pb-24">
            {/* Story Section */}
            <section ref={storyRef} className="container mx-auto px-6 md:px-12 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isStoryInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <p className="font-body text-[var(--accent)] tracking-[0.3em] font-bold text-sm uppercase">Our Story</p>
                        <h1 className="text-6xl md:text-8xl leading-none">
                            FROM A LOVE OF <br />
                            <span style={{ color: 'var(--accent)' }}>REAL FLAVOR</span>
                        </h1>
                        <p className="text-xl text-text-muted leading-relaxed font-light">
                            Nectola started with a simple belief: life's too short for boring drinks. We wanted to create sodas that actually taste like something — <span className="text-white font-bold">bold, refreshing</span>, and made with real ingredients. Inspired by classic soda fountain flavors and a passion for bringing people together, we crafted four distinct tastes that spark joy in every sip. Proudly Canadian 🍁.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isStoryInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 1 }}
                        className="relative h-[500px] rounded-3xl overflow-hidden glass border border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                        <div className="flex items-center justify-center h-full">
                            <div className="w-24 h-48 border border-white/10 glass rounded-full opacity-20" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-bg-card py-20 border-y border-white/5 mb-32">
                <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat, i) => (
                        <div key={i} className="text-center space-y-2 border-r last:border-0 border-white/10">
                            <div className="text-5xl md:text-7xl font-display text-[var(--accent)] flavor-transition">
                                {stat.isInfinity ? "∞" : <CountUp end={stat.value} duration={2} />}
                                {stat.suffix}
                            </div>
                            <p className="text-text-muted uppercase tracking-widest text-xs font-bold">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Showcase Grid */}
            <section className="container mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <h2 className="text-6xl md:text-8xl mb-4">MEET THE FAMILY</h2>
                    <p className="text-text-muted tracking-widest uppercase">Four flavors. Endless possibilities.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {FLAVOR_SHOWCASE.map((f, i) => (
                        <motion.div
                            key={f.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setFlavor(f.id)}
                            className="relative h-[450px] rounded-3xl overflow-hidden cursor-pointer group"
                            style={{ background: `linear-gradient(135deg, #111, ${f.color}11)` }}
                        >
                            <div className="absolute inset-0 border border-white/5 group-hover:border-[var(--accent)]/30 transition-colors rounded-3xl" />
                            <div className="p-12 h-full flex flex-col justify-between relative z-10">
                                <div>
                                    <span className="inline-block px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 mb-4" style={{ color: f.color }}>
                                        ● {f.id}
                                    </span>
                                    <h3 className="text-6xl md:text-8xl leading-none">{f.name.split(' ')[0]} <br /> {f.name.split(' ')[1]}</h3>
                                </div>
                                <div className="flex items-center gap-4 text-text-muted group-hover:text-white transition-colors">
                                    <span className="text-sm font-body uppercase tracking-[0.3em]">View Details</span>
                                    <div className="w-12 h-px bg-current" />
                                </div>
                            </div>
                            {/* Bottle Shadow Mock */}
                            <div
                                className="absolute right-[-10%] bottom-[-10%] w-[300px] h-[300px] blur-[100px] opacity-20 transition-opacity group-hover:opacity-40"
                                style={{ backgroundColor: f.color }}
                            />
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
