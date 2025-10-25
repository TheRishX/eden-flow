'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition } from 'react';
import { suggestTasks } from '@/ai/flows/suggest-tasks';
import { Wand2, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface AISuggestionsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddActivity: (title: string) => void;
}

const formSchema = z.object({
  goal: z.string().min(3, 'Please describe your goal in a bit more detail.'),
});

export function AISuggestionsDialog({ isOpen, onOpenChange, onAddActivity }: AISuggestionsDialogProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setSuggestions([]);
    startTransition(async () => {
      const result = await suggestTasks({ goal: values.goal });
      setSuggestions(result.suggestions);
    });
  };

  const handleAddActivity = (suggestion: string) => {
    onAddActivity(suggestion);
    // Optional: close dialog after adding
    // onOpenChange(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-primary" />
            AI Task Suggester
          </DialogTitle>
          <DialogDescription>
            Tell the AI your high-level goal, and it will break it down into actionable tasks for you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your goal?</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Learn to play guitar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Suggestions
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 space-y-3 max-h-60 overflow-y-auto">
          {isPending && (
             <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          )}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Suggestions</h4>
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50">
                  <p className="text-sm">{s}</p>
                  <Button size="sm" variant="ghost" onClick={() => handleAddActivity(s)}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
