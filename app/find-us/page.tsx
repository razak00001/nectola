"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useFlavor } from "@/context/FlavorContext";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Bottle } from "@/components/Bottle";

const FindUs = () => {
    const { config } = useFlavor();
    const [search, setSearch] = useState("");
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async (query = "") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/stores?q=${query}`);
            const data = await res.json();
            setStores(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStores(search);
    };

    return (
        <div className="pt-32 pb-24">
            <section className="container mx-auto px-6 md:px-12 mb-16 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-6xl md:text-8xl mb-6 font-display"
                >
                    FIND NECTOLA <br />
                    <span style={{ color: 'var(--accent)' }}>NEAR YOU</span>
                </motion.h1>
                <p className="text-text-muted text-xl max-w-2xl mx-auto mb-10">
                    Craving a Nectola? Use the map to find a store nearby.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Enter your city or postal code"
                        className="flex-1 w-full bg-bg-card border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-[var(--accent)] transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="btn-premium px-10 w-full sm:w-auto text-white flex justify-center items-center"
                    >
                        SEARCH
                    </button>
                </form>
            </section>

            {/* Map Stub */}
            <section className="container mx-auto px-6 md:px-12 mb-20">
                <div className="relative h-[450px] w-full rounded-3xl overflow-hidden glass border border-white/5">
                    <div className="absolute inset-0 bg-[#111] flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-[var(--accent)] animate-spin-slow" />
                        <p className="font-display text-2xl tracking-widest text-text-muted">INTERACTIVE MAP LOADING...</p>
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{ background: `radial-gradient(circle at center, var(--accent) 0%, transparent 70%)` }}
                        />
                    </div>
                </div>
            </section>

            {/* Results Grid */}
            <section className="container mx-auto px-6 md:px-12 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-48 rounded-2xl bg-bg-card animate-pulse" />
                        ))
                    ) : stores.length > 0 ? (
                        stores.map((store) => (
                            <motion.div
                                key={store.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -8 }}
                                className="bg-bg-card border border-white/5 p-8 rounded-3xl group transition-all hover:bg-white/[0.02]"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[var(--accent)] text-xl">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex gap-1">
                                        {store.flavors.map((f: string) => (
                                            <div key={f} className="w-2 h-2 rounded-full" style={{ backgroundColor: `var(--flavor-${f})` }} />
                                        ))}
                                    </div>
                                </div>
                                <h3 className="text-2xl mb-2 group-hover:text-[var(--accent)] transition-colors">{store.name}</h3>
                                <p className="text-text-muted font-light mb-1">{store.address}</p>
                                <p className="text-text-muted font-bold text-sm tracking-widest">{store.city}, {store.province}</p>

                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <span className="text-[10px] items-center gap-2 flex uppercase tracking-widest font-bold text-[var(--accent)]">
                                        <span className="w-2 h-2 rounded-full bg-current pulse" />
                                        All 4 Flavors Available
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-bg-card rounded-3xl border border-dashed border-white/5">
                            <p className="text-text-muted text-xl uppercase tracking-widest">No stores found in this area. <br /> Try another search!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Wholesale Banner */}
            <section className="container mx-auto px-4 md:px-12">
                <div className="relative glass p-8 sm:p-12 md:p-20 rounded-[2rem] sm:rounded-[3rem] overflow-hidden">
                    <div
                        className="absolute inset-0 -z-10 opacity-10"
                        style={{ background: `linear-gradient(45deg, var(--accent) 0%, transparent 100%)` }}
                    />
                    <div className="max-w-2xl">
                        <h2 className="text-3xl sm:text-5xl md:text-7xl mb-6 font-display uppercase tracking-tight">WANT TO CARRY <br /> NECTOLA?</h2>
                        <p className="text-text-muted text-lg mb-10 leading-relaxed">
                            Bring the buzz to your customers. World-class branding, premium glass bottles, and flavors that keep them coming back. Join the Nectola family today.
                        </p>
                        <Link href="/contact?subject=Wholesale+Inquiry" className="btn-premium inline-block text-white">
                            WHOLESALE INQUIRIES
                        </Link>
                    </div>

                    {/* Shelf Image Placeholder */}
                    <div className="hidden lg:block absolute right-0 top-0 w-[40%] h-[120%] bg-white/[0.02] border-l border-white/10 overflow-hidden transform -translate-y-[10%]">
                        <div className="h-full flex items-center justify-center p-12 pr-16 relative">
                            {/* Decorative background circle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-white/5 bg-white/[0.01]" />

                            <div className="grid grid-cols-2 gap-x-12 gap-y-16 relative z-10 w-full h-full max-h-[80%] max-w-[80%] items-center justify-items-center">
                                {[
                                    { id: 'necto', name: 'Necto Soda' },
                                    { id: 'cream', name: 'Cream Soda' },
                                    { id: 'ginger', name: 'Ginger Beer' },
                                    { id: 'pineapple', name: 'Pineapple Soda' }
                                ].map((flavor, i) => (
                                    <div
                                        key={flavor.id}
                                        className={`w-full h-full min-h-[160px] relative transition-all duration-700 hover:scale-110 hover:-translate-y-4 cursor-pointer filter drop-shadow-2xl ${i % 2 === 0 ? 'translate-y-8' : '-translate-y-8'}`}
                                    >
                                        <div className="absolute inset-0 scale-[1.5] opacity-0 hover:opacity-100 transition-opacity pointer-events-none" style={{ background: `radial-gradient(circle, var(--flavor-${flavor.id}) 0%, transparent 70%)`, filter: 'blur(30px)' }} />
                                        <Bottle id={flavor.id} name={flavor.name} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FindUs;
