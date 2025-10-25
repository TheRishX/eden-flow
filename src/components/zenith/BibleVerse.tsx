'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

type BibleVerseResponse = {
  reference: string;
  text: string;
};

export function BibleVerse() {
    const [verseInfo, setVerseInfo] = useState<BibleVerseResponse | null>(null);
    const [isPending, startTransition] = useTransition();

    const fetchVerse = useCallback(() => {
        startTransition(async () => {
            try {
                const response = await fetch('https://bible-api.com/?random=verse');
                if (!response.ok) {
                    throw new Error('Failed to fetch verse');
                }
                const data = await response.json();
                setVerseInfo({
                    reference: data.reference,
                    text: data.text.trim(),
                });
            } catch (error) {
                console.error('Error fetching Bible verse:', error);
                setVerseInfo(null);
            }
        });
    }, []);

    useEffect(() => {
        fetchVerse(); // Fetch on initial render

        const interval = setInterval(() => {
            fetchVerse();
        }, 15 * 60 * 1000); // 15 minutes

        return () => clearInterval(interval); // Cleanup on unmount
    }, [fetchVerse]);

    return (
        <div className="relative mt-8 text-white w-full max-w-2xl mx-auto min-h-[10rem] flex items-center justify-center group">
            {isPending && !verseInfo ? (
                 <div className="flex flex-col items-center gap-4 w-full">
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="h-6 w-2/3 bg-white/10" />
                    <Skeleton className="h-4 w-1/3 mt-2 bg-white/10" />
                </div>
            ) : verseInfo ? (
                <div className="text-center animate-fade-in-up">
                    <blockquote className="font-verse text-2xl italic">
                        “{verseInfo.text}”
                    </blockquote>
                    <p className="mt-4 text-lg font-verse font-bold opacity-90">{verseInfo.reference}</p>
                </div>
            ) : (
                <p className="opacity-70">Could not load verse.</p>
            )}
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={fetchVerse} 
                className="absolute top-1/2 -right-4 -translate-y-1/2 h-8 w-8 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isPending}
            >
                <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
            </Button>
        </div>
    );
}
