'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseProvider, initializeFirebase } from '@/firebase';

const { firebaseApp, firestore, auth } = initializeFirebase();

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Domain verification - prevent running on cloned/scraped versions
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Allow all netlify.app and vercel.app subdomains, localhost, and specific custom domains
      const isAllowedDomain = 
        hostname.includes('netlify.app') ||
        hostname.includes('vercel.app') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === 'partsmanager-pro.com'; // Add custom domain if you have one
      
      if (!isAllowedDomain && process.env.NODE_ENV === 'production') {
        // Redirect to official site if running on unauthorized domain
        console.warn(`Unauthorized domain detected: ${hostname}. Redirecting to official site.`);
        window.location.href = 'https://partsmanager-pro.netlify.app';
        return;
      }
    }

    // Disable right-click context menu
    const disableContextMenu = (e: MouseEvent) => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    };

    // Disable keyboard shortcuts for developer tools
    const disableDevTools = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV === 'production') {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C')
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('keydown', disableDevTools);

    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', disableDevTools);
    };
  }, []);

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </FirebaseProvider>
  );
}
