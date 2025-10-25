'use client';

import { BrainCircuit, X, Wind, CloudRain } from 'lucide-react';
import { Button } from '../ui/button';
import { Pomodoro } from './Pomodoro';
import Image from 'next/image';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { useEffect, useState, useTransition, useRef } from 'react';
import { generateInspiringQuote } from '@/ai/flows/generate-inspiring-quote';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Quote = {
  shouldShowQuote: boolean;
  quote: string;
};

interface FocusModeProps {
  onExit: () => void;
  bgImage: ImagePlaceholder;
}

const AMBIENT_SOUNDS = {
    rain: '/sounds/rain.mp3',
    wind: '/sounds/wind.mp3',
};

type AmbientSound = keyof typeof AMBIENT_SOUNDS;

export function FocusMode({ onExit, bgImage }: FocusModeProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeSound, setActiveSound] = useState<AmbientSound | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const result = await generateInspiringQuote({ userFocus: 'achieving goals and life' });
      setQuote(result);
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (activeSound) {
          if (!audioRef.current) {
            audioRef.current = new Audio();
          }
          audioRef.current.src = AMBIENT_SOUNDS[activeSound];
          audioRef.current.loop = true;
          audioRef.current.play().catch(error => console.error("Audio play failed:", error));
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
    }
    // Cleanup on unmount
    return () => {
        if(audioRef.current) {
            audioRef.current.pause();
        }
    }
  }, [activeSound]);

  const toggleSound = (sound: AmbientSound) => {
    setActiveSound(prev => prev === sound ? null : sound);
  }

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden text-white font-body bg-background animate-fade-in z-50">
      {bgImage && (
        <Image
          key={bgImage.id}
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover -z-20 transition-all duration-1000 ease-in-out"
          priority
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/60 -z-10" />

      <div className="relative z-10 w-full h-full flex flex-col p-6 sm:p-8">
        <header className="flex items-start justify-between animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className='flex items-center gap-2'>
                <BrainCircuit className="w-6 h-6" />
                <h1 className="text-xl font-bold">Focus Mode</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={onExit} className="hover:bg-white/10">
                <X className="w-6 h-6" />
                <span className="sr-only">Exit Focus Mode</span>
            </Button>
        </header>

        <div className="flex-grow flex items-center justify-center">
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <Pomodoro isLarge />
            </div>
        </div>

        <footer className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '300ms' }}>
             <div className="min-h-[3rem] flex items-center justify-start w-full">
                 <TooltipProvider>
                  <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => toggleSound('rain')} className={`hover:bg-white/10 rounded-full ${activeSound === 'rain' ? 'bg-white/20' : ''}`}>
                              <CloudRain />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-black/70 text-white border-white/10">
                          <p>Rain sound</p>
                        </TooltipContent>
                      </Tooltip>
                       <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => toggleSound('wind')} className={`hover:bg-white/10 rounded-full ${activeSound === 'wind' ? 'bg-white/20' : ''}`}>
                              <Wind />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-black/70 text-white border-white/10">
                          <p>Wind sound</p>
                        </TooltipContent>
                      </Tooltip>
                  </div>
                </TooltipProvider>
            </div>
            <div className="min-h-[3rem] flex items-center justify-center w-full max-w-3xl mx-auto">
                {isPending && <p className="opacity-70">Finding inspiration...</p>}
                {quote?.shouldShowQuote && (
                <blockquote className="text-center">
                    <p className="text-lg italic">"{quote.quote}"</p>
                </blockquote>
                )}
            </div>
             <div className="min-h-[3rem] flex items-center justify-end w-full">
                 {/*  Empty div for spacing */}
            </div>
        </footer>
      </div>
    </div>
  );
}
