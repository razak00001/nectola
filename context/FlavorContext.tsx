"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Flavor = 'necto' | 'cream' | 'ginger' | 'pineapple';

interface FlavorConfig {
    color: string;
    rgb: string;
    darkColor: string;
}

const FLAVOR_COLORS: Record<Flavor, FlavorConfig> = {
    necto: {
        color: '#e8111a',
        rgb: '232, 17, 26',
        darkColor: '#80090e',
    },
    cream: {
        color: '#2ec72e',
        rgb: '46, 199, 46',
        darkColor: '#1a751a',
    },
    ginger: {
        color: '#d44b00',
        rgb: '212, 75, 0',
        darkColor: '#7a2b00',
    },
    pineapple: {
        color: '#f5c800',
        rgb: '245, 200, 0',
        darkColor: '#8f7500',
    },
};

interface FlavorContextType {
    currentFlavor: Flavor;
    setFlavor: (flavor: Flavor) => void;
    config: FlavorConfig;
}

const FlavorContext = createContext<FlavorContextType | undefined>(undefined);

export const FlavorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentFlavor, setCurrentFlavor] = useState<Flavor>('necto');

    useEffect(() => {
        const config = FLAVOR_COLORS[currentFlavor];
        document.documentElement.style.setProperty('--accent', config.color);
        document.documentElement.style.setProperty('--accent-rgb', config.rgb);
    }, [currentFlavor]);

    return (
        <FlavorContext.Provider value={{
            currentFlavor,
            setFlavor: setCurrentFlavor,
            config: FLAVOR_COLORS[currentFlavor]
        }}>
            {children}
        </FlavorContext.Provider>
    );
};

export const useFlavor = () => {
    const context = useContext(FlavorContext);
    if (!context) throw new Error('useFlavor must be used within a FlavorProvider');
    return context;
};
