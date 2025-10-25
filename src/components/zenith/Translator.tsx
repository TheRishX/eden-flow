'use client';

import { useState, useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type TranslationResponse = {
  responseData: {
    translatedText: string;
  };
};

export function Translator() {
  const [text, setText] = useState('');
  const [translation, setTranslation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTranslate = useCallback(() => {
    if (!text.trim()) return;

    startTransition(async () => {
      setError(null);
      setTranslation(null);
      try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`);
        if (!response.ok) {
          throw new Error('Translation service is currently unavailable.');
        }
        const data: TranslationResponse = await response.json();
        if (data.responseData) {
          setTranslation(data.responseData.translatedText);
        } else {
          throw new Error('Could not translate the text.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch translation.');
        setTranslation(null);
      }
    });
  }, [text]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleTranslate();
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Translator</h4>
        <p className="text-sm text-muted-foreground">English to Hindi</p>
      </div>
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter English text..."
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !text.trim()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <ScrollArea className="h-[150px] pr-4">
        <div className="mt-2 space-y-4 p-4 border rounded-md min-h-[100px] flex items-center justify-center">
          {isPending && <Skeleton className="h-6 w-3/4" />}
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          {translation && (
            <p className="text-lg font-semibold text-center">{translation}</p>
          )}
           {!isPending && !error && !translation && (
            <p className="text-sm text-muted-foreground text-center">
              Translation will appear here.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
