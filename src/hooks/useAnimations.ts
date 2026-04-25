"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Hook 1: The Premium Text Reveal
// Use this for any headline or subheading you want to stagger in smoothly.
export const useGsapTextReveal = (delay: number = 0) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    // Select all elements with the 'reveal-text' class inside this container
    const targets = gsap.utils.toArray(containerRef.current.querySelectorAll('.reveal-text'));
    
    gsap.fromTo(
      targets,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power4.out",
        stagger: 0.1, // This creates the beautiful domino effect
        delay: delay,
      }
    );
  }, { scope: containerRef });

  return containerRef;
};

// Hook 2: The Vehicle/Element Entrance
// Use this to make elements "drive" or slide into place powerfully.
export const useGsapEntrance = (direction: 'left' | 'right' | 'bottom' | 'top' = 'bottom', delay: number = 0) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!elementRef.current) return;

    const xOffset = direction === 'left' ? -100 : direction === 'right' ? 100 : 0;
    const yOffset = direction === 'top' ? -100 : direction === 'bottom' ? 100 : 0;

    gsap.fromTo(
      elementRef.current,
      { x: xOffset, y: yOffset, opacity: 0, scale: 0.95 },
      {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "expo.out",
        delay: delay,
      }
    );
  }, { scope: elementRef });

  return elementRef;
};
