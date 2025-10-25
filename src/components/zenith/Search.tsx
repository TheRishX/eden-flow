'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';
import { Button } from '../ui/button';

export function Search() {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
       <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="bg-black/20 backdrop-blur-sm border-0 h-10 text-sm pl-9 pr-4 placeholder:text-white/50 focus:bg-black/30 w-full rounded-lg"
      />
    </form>
  );
}
