'use client';

import React from 'react';

export function AmbientBackground() {
  return (
    <div className="bg-canvas-container fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic blurred cosmic nebula circles */}
      <div className="cosmic-nebula absolute w-[130vw] h-[130vh] -top-[15vh] -left-[15vw] filter blur-[70px] pointer-events-none" />

      {/* Twinkling starfield overlay */}
      <div className="starfield absolute inset-0 opacity-60 pointer-events-none" />
    </div>
  );
}
