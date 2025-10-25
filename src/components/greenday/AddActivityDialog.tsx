'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Activity } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useEffect }from 'react';
import { format, add, parse } from 'date-fns';

interface AddActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddActivity: (activity: Omit<Activity, 'id' | 'completed' | 'userId' | 'createdAt'>) => void;
  activity: Activity | null;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
}).refine(data => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});


export function AddActivityDialog({ isOpen, onOpenChange, onAddActivity, activity }: AddActivityDialogProps) {
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (activity) {
        // Editing existing activity
        form.reset({
          title: activity.title,
          startTime: activity.startTime,
          endTime: activity.endTime,
        });
      } else {
        // Adding new activity
        const now = new Date();
        const thirtyMinutesFromNow = add(now, { minutes: 30 });
        
        form.reset({
          title: '',
          startTime: format(now, 'HH:mm'),
          endTime: format(thirtyMinutesFromNow, 'HH:mm'),
        });
      }
    }
  }, [isOpen, activity, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddActivity(values);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activity ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
          <DialogDescription>
            {activity ? 'Update the details for your activity.' : 'What do you want to accomplish today?'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Morning workout" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">{activity ? 'Save Changes' : 'Add Activity'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
