'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Todo } from '@/lib/types';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Todo;
  onTaskClick?: (task: Todo) => void;
  onToggle?: (taskId: string) => void;
  isOverlay?: boolean;
}

export const TaskItem = ({
  task,
  onTaskClick,
  onToggle,
  isOverlay,
}: TaskItemProps) => {
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

  const variants = cva('p-3 rounded-lg bg-card shadow-sm border mb-2 flex items-start gap-3', {
    variants: {
      dragging: {
        over: 'ring-2 opacity-30 ring-primary',
        overlay: 'ring-2 ring-primary',
      },
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
          variants({
            dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
          }),
      )}
    >
      <Checkbox
        id={`task-check-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggle?.(task.id)}
        className="mt-1"
      />
      <div onClick={() => onTaskClick?.(task)} className="flex-grow cursor-pointer">
        <label
          htmlFor={`task-check-${task.id}`}
          className={cn(
            'text-sm font-medium',
            task.completed ? 'line-through text-muted-foreground' : ''
          )}
        >
          {task.text}
        </label>
        {task.dueDate && (
          <p className="mt-1 text-xs text-muted-foreground">
            Due: {format(new Date(task.dueDate), 'MMM dd')}
          </p>
        )}
      </div>
    </div>
  );
};
