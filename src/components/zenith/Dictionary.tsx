'use client';

import { useState, useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type Definition = {
  definition: string;
  example?: string;
};

type Meaning = {
  partOfSpeech: string;
  definitions: Definition[];
};

type DictionaryResponse = {
  word: string;
  phonetic?: string;
  phonetics: { text?: string; audio?: string }[];
  meanings: Meaning[];
}[];

export function Dictionary() {
  const [word, setWord] = useState('');
  const [results, setResults] = useState<DictionaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback(() => {
    if (!word.trim()) return;

    startTransition(async () => {
      setError(null);
      setResults(null);
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) {
          throw new Error('Word not found. Please check the spelling.');
        }
        const data = await response.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch definition.');
        setResults(null);
      }
    });
  }, [word]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Dictionary</h4>
        <p className="text-sm text-muted-foreground">Define any word in English.</p>
      </div>
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <Input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="e.g., productivity"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !word.trim()}>
          <Search className="h-4 w-4" />
        </Button>
      </form>
      <ScrollArea className="h-[300px] pr-4">
        <div className="mt-2 space-y-4">
          {isPending && (
             <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive text-center py-4">{error}</p>}
          {results && (
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-2xl font-bold">{result.word}</h2>
                    <p className="text-muted-foreground">{result.phonetic}</p>
                  </div>
                  {result.meanings.map((meaning, mIndex) => (
                    <div key={mIndex} className="space-y-3">
                        <div className="flex items-center gap-4">
                           <h3 className="font-semibold italic text-primary">{meaning.partOfSpeech}</h3>
                           <Separator className="flex-1"/>
                        </div>
                      <ol className="space-y-2 list-decimal list-inside">
                        {meaning.definitions.map((def, dIndex) => (
                          <li key={dIndex}>
                            {def.definition}
                            {def.example && (
                              <p className="text-xs text-muted-foreground italic pl-4">e.g., "{def.example}"</p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
           {!isPending && !error && !results && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Search for a word to see its definition.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
