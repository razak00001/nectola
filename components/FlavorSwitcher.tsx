"use client";

import { useFlavor } from "@/context/FlavorContext";
import { motion } from "framer-motion";

const SIDE_FLAVORS = [
    { id: 'necto', color: '#e8111a', name: 'Necto Red' },
    { id: 'cream', color: '#2ec72e', name: 'Cream Green' },
    { id: 'ginger', color: '#d44b00', name: 'Ginger Orange' },
    { id: 'pineapple', color: '#f5c800', name: 'Pineapple gold' },
];

const FlavorSwitcher = () => {
    const { currentFlavor, setFlavor } = useFlavor();

    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[40] hidden md:flex flex-col gap-4">
            {SIDE_FLAVORS.map((f) => (
                <button
                    key={f.id}
                    onClick={() => setFlavor(f.id as any)}
                    className="group relative flex items-center justify-end"
                >
                    <span className="mr-4 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                        {f.name}
                    </span>
                    <div
                        className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${currentFlavor === f.id ? 'scale-150 border-white' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        style={{ backgroundColor: f.color }}
                    />
                </button>
            ))}
        </div>
    );
};

export default FlavorSwitcher;
