"use client";

import { useEffect, useState } from "react";
import { useFlavor } from "@/context/FlavorContext";

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const { currentFlavor } = useFlavor();

    useEffect(() => {
        const updatePosition = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const updateHoverState = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            setIsHovering(
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') !== null ||
                target.closest('button') !== null
            );
        };

        window.addEventListener("mousemove", updatePosition);
        window.addEventListener("mouseover", updateHoverState);

        return () => {
            window.removeEventListener("mousemove", updatePosition);
            window.removeEventListener("mouseover", updateHoverState);
        };
    }, []);

    return (
        <>
            <div
                className="custom-cursor hidden lg:block"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
                    borderColor: 'var(--accent)'
                }}
            />
            <div
                className="custom-cursor-dot hidden lg:block"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    backgroundColor: 'var(--accent)'
                }}
            />
        </>
    );
};

export default CustomCursor;
