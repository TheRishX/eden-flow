'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

export function Focus() {
  const [focus, setFocus] = useLocalStorage('edenflow-focus', { text: '', completed: false });
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && !focus.text) {
      setIsEditing(true);
    } else if (isClient) {
      setIsEditing(false);
      setInputValue(focus.text);
    }
  }, [focus.text, isClient]);

  const handleFocusSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setFocus({ text: inputValue.trim(), completed: false });
      setIsEditing(false);
    }
  };

  const toggleComplete = () => {
    setFocus({ ...focus, completed: !focus.completed });
  };
  
  const resetFocus = () => {
    setFocus({ text: '', completed: false });
    setInputValue('');
    setIsEditing(true);
  };

  if (!isClient) return <div className="h-32" />;

  return (
    <div className="text-white w-full max-w-lg mx-auto h-32 flex flex-col items-center justify-center">
      {isEditing ? (
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <form onSubmit={handleFocusSubmit} className="flex flex-col items-center gap-2">
            <label htmlFor="focus-input" className="text-2xl font-semibold mb-2 font-headline">What is your main focus for today?</label>
            <Input
              id="focus-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Become a Next.js wizard"
              className="text-2xl text-center bg-transparent border-0 border-b-2 border-white/50 rounded-none placeholder:text-white/50 focus-visible:ring-0 focus:border-white h-12 focus-visible:outline-none focus-visible:ring-offset-0"
              autoFocus
            />
          </form>
        </div>
      ) : (
        <div className="group flex flex-col items-center gap-4 animate-fade-in-up">
          <p className="text-lg opacity-80">TODAY'S FOCUS</p>
          <div className="flex items-center gap-3 text-2xl md:text-3xl font-semibold">
            <Checkbox
              id="focus-checkbox"
              checked={focus.completed}
              onCheckedChange={toggleComplete}
              className="w-6 h-6 rounded-full border-2 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
            />
            <label htmlFor="focus-checkbox" className={`cursor-pointer ${focus.completed ? 'line-through opacity-70' : ''}`}>
              {focus.text}
            </label>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)}>
              <Pencil className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={resetFocus}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
