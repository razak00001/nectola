"use client";

import React from 'react';
import Image from 'next/image';

export const Bottle = ({ id, name }: { id: string, name: string }) => {
    return (
        <div className={`relative w-full h-full drop-shadow-2xl overflow-visible rounded-3xl transition-all duration-500`}>
            <Image
                src={`/bottles/${id}.png`}
                alt={name}
                fill
                className={`object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] ${id === 'ginger' ? 'mix-blend-multiply scale-110' : ''}`}
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
                unoptimized={true}
            />
        </div>
    );
};
