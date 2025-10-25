'use client';

import { Button } from '@/components/ui/button';
import { Sun, PlusCircle, Wand2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface HeaderProps {
  onAddActivity: () => void;
  onAISuggestions: () => void;
}

export function Header({ onAddActivity, onAISuggestions }: HeaderProps) {
  const currentDate = format(new Date(), 'eeee, MMMM d');

  return (
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-sm">
      <div className="flex items-center justify-between h-20 border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Sun className="w-7 h-7" />
            <span>GreenDay</span>
          </div>
          <span className="hidden sm:block text-muted-foreground">{currentDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onAddActivity} aria-label="Add new activity">
            <PlusCircle className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onAISuggestions} aria-label="Get AI task suggestions">
            <Wand2 className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
