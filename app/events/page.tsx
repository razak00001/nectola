"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useFlavor } from "@/context/FlavorContext";
import { MapPin, Search, Camera, Music, Users, Twitter } from "lucide-react";

const GALLERY_IMAGES = [
    { id: 1, size: 'large' },
    { id: 2, size: 'small' },
    { id: 3, size: 'small' },
    { id: 4, size: 'medium' },
    { id: 5, size: 'small' },
    { id: 6, size: 'small' },
];

export default function Events() {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/events")
            .then(res => res.json())
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getFlavorColor = (flavor: string) => {
        switch (flavor) {
            case 'necto': return '#e8111a';
            case 'pineapple': return '#f5c800';
            case 'cream': return '#2ec72e';
            case 'ginger': return '#d44b00';
            default: return 'var(--accent)';
        }
    };

    return (
        <div className="pt-32 pb-24">
            {/* Upcoming Events */}
            <section className="container mx-auto px-6 md:px-12 mb-32">
                <div className="mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-6xl md:text-8xl mb-4 font-display"
                    >
                        CATCH US <br />
                        <span style={{ color: 'var(--accent)' }}>OUT THERE</span>
                    </motion.h1>
                    <p className="text-text-muted tracking-widest uppercase">Come say hi and grab a cold one.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-3xl bg-bg-card border border-white/5 animate-pulse" />)}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl text-white/30 uppercase tracking-widest text-sm">
                        No upcoming events scheduled. Check back soon!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
                        {events.map((event, i) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="bg-bg-card border border-white/5 rounded-3xl overflow-hidden group relative"
                            >
                                <div className="h-2 w-full" style={{ backgroundColor: getFlavorColor(event.flavor) }} />
                                <div className="p-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-display text-5xl leading-none">{event.date.split(' ')[1]}</span>
                                            <div className="text-text-muted text-xs tracking-widest uppercase">{event.date.split(' ')[0]} {event.year}</div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--accent)]">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold font-body">{event.name}</h3>
                                        <p className="text-text-muted font-light">{event.location}</p>
                                        {event.description && <p className="text-sm text-text-muted line-clamp-2">{event.description}</p>}
                                    </div>

                                    <a href={event.more_info_url || "#"} className="inline-block text-sm font-bold uppercase tracking-widest group-hover:tracking-[0.2em] transition-all" style={{ color: getFlavorColor(event.flavor) }}>
                                        More Info →
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Gallery */}
            <section className="container mx-auto px-6 md:px-12 mb-32">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-3xl sm:text-5xl md:text-7xl mb-4 font-display">MOMENTS WE'VE SHARED</h2>
                    <p className="text-text-muted tracking-widest uppercase">A glimpse of the good times.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:grid-rows-2">
                    {GALLERY_IMAGES.map((img, i) => (
                        <motion.div
                            key={img.id}
                            layoutId={`img-${img.id}`}
                            onClick={() => setSelectedImage(img.id)}
                            className={`
                  relative rounded-3xl overflow-hidden cursor-pointer group bg-bg-card border border-white/5
                  ${img.size === 'large' ? 'col-span-2 row-span-2' : ''}
                  ${img.size === 'medium' ? 'col-span-1 row-span-1' : ''}
                `}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Search className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex items-center justify-center gap-2 h-full min-h-[200px] text-white/10 opacity-50 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all font-bold">
                                <Camera className="w-5 h-5" /> Photo {img.id}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Social Feed */}
            <section className="bg-bg-card py-24 border-y border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl sm:text-4xl md:text-6xl mb-4 font-display">JOIN THE CONVERSATION</h2>
                    <p className="text-text-muted tracking-widest uppercase mb-12">Follow us @nectoladrinks</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                <span className="text-white/5 font-display text-4xl">POST {i + 1}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <span className="font-accent text-3xl sm:text-5xl md:text-7xl block transition-colors tracking-tighter sm:tracking-normal" style={{ color: 'var(--accent)' }}>
                            #NectolaMoments
                        </span>
                        <div className="flex justify-center gap-6">
                            {[<Camera key="1" />, <Music key="2" />, <Users key="3" />, <Twitter key="4" />].map((icon, i) => (
                                <button key={i} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--accent)] transition-all hover:scale-110">
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-12"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button className="absolute top-8 right-8 text-white text-4xl">&times;</button>
                        <motion.div
                            layoutId={`img-${selectedImage}`}
                            className="w-full max-w-4xl aspect-video rounded-3xl bg-bg-card border border-white/10 flex flex-col items-center justify-center gap-4 text-[var(--accent)]"
                        >
                            <Camera className="w-12 h-12" />
                            <div className="text-4xl font-display">HD GALLERY PHOTO {selectedImage}</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
