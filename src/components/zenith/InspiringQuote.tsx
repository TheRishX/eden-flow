'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { generateInspiringQuote } from '@/ai/flows/generate-inspiring-quote';

type Quote = {
  shouldShowQuote: boolean;
  quote: string;
};

export function InspiringQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchQuote = useCallback(() => {
    startTransition(async () => {
      const result = await generateInspiringQuote({ userFocus: 'achieving goals and life' });
      setQuote(result);
    });
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Inspiring Quote</h4>
        <p className="text-sm text-muted-foreground">A little motivation for your day.</p>
      </div>
      <div className="relative mt-2 w-full min-h-[6rem] flex items-center justify-center group rounded-md border p-4">
        {isPending && !quote ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : quote?.shouldShowQuote ? (
          <blockquote className="text-center animate-fade-in-up">
            <p className="italic">“{quote.quote}”</p>
          </blockquote>
        ) : (
          <p className="opacity-70">Could not load a quote.</p>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchQuote}
          className="absolute top-1 right-1 h-7 w-7 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={isPending}
        >
          <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
