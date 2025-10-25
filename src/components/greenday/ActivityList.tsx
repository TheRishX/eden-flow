'use client';

import type { Activity } from '@/lib/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ActivityListProps {
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (activity: Activity) => void;
}

function SortableActivityItem({ activity, onToggle, onDelete, onEdit }: { activity: Activity, onToggle: (id: string) => void, onDelete: (id: string) => void, onEdit: (activity: Activity) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg bg-card border transition-all",
        activity.completed && "bg-card/50 text-muted-foreground",
        isDragging && "shadow-lg scale-105"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab touch-none">
        <GripVertical className="w-5 h-5 text-muted-foreground/50" />
      </div>
      <Checkbox
        id={`activity-${activity.id}`}
        checked={activity.completed}
        onCheckedChange={() => onToggle(activity.id)}
        className="w-5 h-5"
      />
      <div className="flex-grow cursor-pointer" onClick={() => onEdit(activity)}>
        <p className={cn("font-medium", activity.completed && "line-through")}>
          {activity.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {activity.startTime} - {activity.endTime}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onDelete(activity.id)} className="text-muted-foreground hover:text-destructive">
        <Trash2 className="w-5 h-5" />
      </Button>
    </div>
  );
}

export function ActivityList({ activities, setActivities, onToggle, onDelete, onEdit }: ActivityListProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activities.findIndex((a) => a.id === active.id);
      const newIndex = activities.findIndex((a) => a.id === over.id);
      setActivities(arrayMove(activities, oldIndex, newIndex));
    }
  };

  if (!isClient) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-muted-foreground/20 rounded-lg">
        <p className="text-muted-foreground">Loading activities...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-muted-foreground/20 rounded-lg">
        <p className="text-muted-foreground">Your schedule is empty.</p>
        <p className="text-sm text-muted-foreground/70">Add an activity to get started!</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={activities} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {activities.map((activity) => (
            <SortableActivityItem
              key={activity.id}
              activity={activity}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
