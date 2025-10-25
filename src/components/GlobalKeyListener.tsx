'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * A client component that listens for the 'Escape' key press
 * and navigates the user back to the homepage, unless an input field is focused.
 */
export function GlobalKeyListener() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      // Do not navigate if the user is typing in an input, textarea, or contenteditable element
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === 'Escape') {
        // Prevent default browser behavior for the Escape key (e.g., exiting fullscreen)
        event.preventDefault();
        // Navigate to the homepage
        router.push('/');
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]); // Re-run effect if router instance changes

  // This component renders nothing
  return null;
}
