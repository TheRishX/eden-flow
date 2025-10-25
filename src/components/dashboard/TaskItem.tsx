'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import React, { useMemo } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Todo, Tag } from '@/lib/types';
import { format } from 'date-fns';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface TaskItemProps {
  task: Todo;
  onTaskClick?: (task: Todo) => void;
  onToggle?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  isOverlay?: boolean;
}

export const TaskItem = ({
  task,
  onTaskClick,
  onToggle,
  onDelete,
  isOverlay,
}: TaskItemProps) => {
  const [allTags] = useLocalStorage<Tag[]>('edenflow-tags', []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  
  const isOverdue = useMemo(() => {
    if (task.completed || !task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':').map(Number);
      dueDate.setHours(hours, minutes, 0, 0);
    } else {
      // If no time is set, consider it due at the end of the day
      dueDate.setHours(23, 59, 59, 999);
    }
    
    return now > dueDate;
  }, [task.dueDate, task.dueTime, task.completed]);


  const variants = cva('p-3 rounded-lg bg-card shadow-sm border mb-2 flex items-start gap-3 group', {
    variants: {
      dragging: {
        over: 'ring-2 opacity-30 ring-primary',
        overlay: 'ring-2 ring-primary',
      },
      state: {
          overdue: 'border-destructive bg-destructive/10',
      }
    },
  });

  const taskTags = useMemo(() => {
    return (task.tagIds || []).map(tagId => allTags.find(t => t.id === tagId)).filter(Boolean) as Tag[];
  }, [task.tagIds, allTags]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
          variants({
            dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
            state: isOverdue ? 'overdue' : undefined,
          }),
      )}
    >
      <Checkbox
        id={`task-check-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggle?.(task.id)}
        onClick={(e) => e.stopPropagation()}
        className="mt-1"
      />
      <div onClick={() => onTaskClick?.(task)} className="flex-grow cursor-pointer space-y-2">
        <label
          htmlFor={`task-check-${task.id}`}
          className={cn(
            'text-sm font-medium leading-tight',
            task.completed ? 'line-through text-muted-foreground' : ''
          )}
        >
          {task.text}
        </label>
        
        <div className="flex flex-wrap items-center gap-1">
          {taskTags.map(tag => (
            <div key={tag.id} className={cn("px-1.5 py-0.5 text-xs rounded-full")} style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
              {tag.text}
            </div>
          ))}
        </div>

        {task.dueDate && (
          <p className={cn(
              "mt-1 text-xs text-muted-foreground",
              isOverdue && "font-semibold text-destructive"
            )}
          >
            Due: {format(new Date(task.dueDate), 'MMM dd')} {task.dueTime && `at ${task.dueTime}`}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
            e.stopPropagation();
            onDelete?.(task.id);
        }}
        className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete task</span>
      </Button>
    </div>
  );
};
