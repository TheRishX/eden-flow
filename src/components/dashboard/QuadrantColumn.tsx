'use client';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Todo } from '@/lib/types';
import { quadrantConfigs, type QuadrantId } from './EisenhowerMatrix';
import { TaskItem } from './TaskItem';

interface QuadrantColumnProps {
  quadrantId: QuadrantId;
  tasks: Todo[];
  onTaskClick: (task: Todo) => void;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export const QuadrantColumn = ({
  quadrantId,
  tasks,
  onTaskClick,
  onToggle,
  onDelete,
}: QuadrantColumnProps) => {
  const tasksIds = useMemo(() => {
    return tasks.map(task => task.id);
  }, [tasks]);

  const { setNodeRef } = useSortable({
    id: quadrantId,
    data: {
      type: 'Quadrant',
      tasks,
    },
  });

  const config = quadrantConfigs[quadrantId];

  return (
    <Card ref={setNodeRef} className={cn('flex flex-col', config.className)}>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="h-full p-2 space-y-2 rounded-b-lg">
          <SortableContext items={tasksIds}>
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskClick={onTaskClick}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};
