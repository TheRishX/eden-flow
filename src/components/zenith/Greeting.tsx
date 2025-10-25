'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';

export function Greeting() {
  const [name, setName] = useLocalStorage('edenflow-username', '');
  const [isEditing, setIsEditing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && !name) setIsEditing(true);
  }, [name, isClient]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('name-input') as HTMLInputElement;
    if (input.value.trim()) {
      setName(input.value.trim());
      setIsEditing(false);
    }
  };

  if (!isClient) return <div className="h-10 mt-1" />;

  return (
    <div className="h-10 mt-1">
      {isEditing ? (
        <form onSubmit={handleNameSubmit} className="flex items-center justify-center gap-2">
          <Input
            id="name-input"
            type="text"
            defaultValue={name}
            placeholder="What should I call you?"
            className="text-2xl font-semibold text-center bg-white/10 border-white/20 h-12 w-80 placeholder:text-white/50"
            autoFocus
          />
        </form>
      ) : (
        <div 
          className="group flex items-center justify-center gap-3 cursor-pointer" 
          onClick={() => setIsEditing(true)}
        >
          <h2 className="text-xl font-medium text-white/90">
            {greeting}, {name}.
          </h2>
          <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-70 transition-opacity" />
        </div>
      )}
    </div>
  );
}
