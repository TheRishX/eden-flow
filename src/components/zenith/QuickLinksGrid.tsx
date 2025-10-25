'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';

type QuickLink = {
  id: string;
  name: string;
  url: string;
};

export const defaultLinks: QuickLink[] = [
    { id: '1', name: 'Chat GPT', url: 'https://chat.openai.com' },
    { id: '2', name: 'Twitter/X', url: 'https://x.com' },
    { id: '3', name: 'YouTube', url: 'https://youtube.com' },
    { id: '4', name: 'Spotify', url: 'https://spotify.com' },
    { id: '5', name: 'Dribbble', url: 'https://dribbble.com' },
    { id: '6', name: 'Discord', url: 'https://discord.com' },
    { id: '7', name: 'Deezer', url: 'https://deezer.com' },
    { id: '8', name: 'Gmail', url: 'https://mail.google.com' },
    { id: '9', name: 'GitHub', url: 'https://github.com' },
    { id: '10', name: 'LinkedIn', url: 'https://linkedin.com' },
];

export function QuickLinksGrid() {
  const [links] = useLocalStorage<QuickLink[]>('edenflow-quicklinks-grid', defaultLinks);

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-5 gap-4 w-full max-w-xl">
      {links.map(link => (
        <a 
          key={link.id} 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group flex flex-col items-center justify-center gap-2 p-3 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-colors duration-200"
        >
          <img 
            src={`https://www.google.com/s2/favicons?domain=${link.url}&sz=32`} 
            alt="" 
            width={32} 
            height={32} 
            className="rounded-md" 
          />
          <span className="text-xs text-white/80 truncate">{link.name}</span>
        </a>
      ))}
    </div>
  );
}
