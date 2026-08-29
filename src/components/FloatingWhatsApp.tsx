"use client";

import { useState, useEffect, useRef } from "react";

export default function FloatingWhatsApp() {
  const whatsappUrl = "https://wa.me/2349065000860?text=Hello%20YUSDAAM%20AUTOS%2C%20I%20am%20interested%20in%20becoming%20a%20vehicle%20owner%20under%20your%20hire%20purchase%20administration%20system.%20Please%20assist%20me%20with%20details.";

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, hasMoved: false });

  // Initialize position to bottom right once window is mounted
  useEffect(() => {
    const savedPos = localStorage.getItem("yusdaam_whatsapp_pos");
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        const btnSize = 64;
        const maxX = window.innerWidth - btnSize - 16;
        const maxY = window.innerHeight - btnSize - 16;
        const clampedX = Math.max(16, Math.min(parsed.x, maxX));
        const clampedY = Math.max(16, Math.min(parsed.y, maxY));
        setPosition({ x: clampedX, y: clampedY });
        return;
      } catch (e) {
        // Fallback to default
      }
    }

    const defaultX = window.innerWidth - 64 - 24;
    const defaultY = window.innerHeight - 64 - 24;
    setPosition({ x: Math.max(16, defaultX), y: Math.max(16, defaultY) });
  }, []);

  // Handle window resizing to keep the button within bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const btnSize = 64;
        const maxX = window.innerWidth - btnSize - 16;
        const maxY = window.innerHeight - btnSize - 16;
        return {
          x: Math.max(16, Math.min(prev.x, maxX)),
          y: Math.max(16, Math.min(prev.y, maxY)),
        };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!position) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
      hasMoved: false,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !position) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    // Detect if user has dragged more than 5px to distinguish drag from click
    if (!dragRef.current.hasMoved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
      dragRef.current.hasMoved = true;
    }

    if (dragRef.current.hasMoved) {
      const btnSize = 64;
      const maxX = window.innerWidth - btnSize - 12;
      const maxY = window.innerHeight - btnSize - 12;

      const newX = Math.max(12, Math.min(dragRef.current.initialPosX + deltaX, maxX));
      const newY = Math.max(12, Math.min(dragRef.current.initialPosY + deltaY, maxY));

      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (err) {}

    // Save final position to localStorage
    if (position && dragRef.current.hasMoved) {
      try {
        localStorage.setItem("yusdaam_whatsapp_pos", JSON.stringify(position));
      } catch (err) {}
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If the button was dragged, prevent navigation
    if (dragRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!position) return null;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: "none",
        zIndex: 9999,
      }}
      className={`group select-none ${
        isDragging ? "cursor-grabbing scale-105" : "cursor-grab hover:scale-105"
      } transition-transform duration-100`}
    >
      {/* Tooltip that shows on desktop hover */}
      {!isDragging && (
        <div className="hidden sm:block absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-[#0a1224]/95 border border-emerald-500/30 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl">
          Chat with us <span className="text-gray-400 font-normal">(Drag to reposition)</span>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        draggable={false}
        className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.45)] transition-colors duration-200"
      >
        {/* Pulsing ring animation */}
        {!isDragging && (
          <span className="absolute inset-0 w-full h-full rounded-full border-2 border-[#25D366] animate-ping opacity-25 pointer-events-none" />
        )}

        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-white pointer-events-none"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
}
