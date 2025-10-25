'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { Textarea } from '@/components/ui/textarea';

export function Scratchpad() {
  const [notes, setNotes] = useLocalStorage('edenflow-scratchpad', '');

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Scratchpad</h4>
        <p className="text-sm text-muted-foreground">Jot down quick notes.</p>
      </div>
      <Textarea
        placeholder="Your notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-[200px] resize-none"
      />
    </div>
  );
}
