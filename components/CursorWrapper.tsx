'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the WebGL SplashCursor to bypass Server-Side Rendering (SSR) issues
const SplashCursor = dynamic(() => import('./SplashCursor'), {
  ssr: false,
  loading: () => null, // Renders nothing during server-side build/hydration
});

export default function CursorWrapper() {
  return <SplashCursor />;
}
