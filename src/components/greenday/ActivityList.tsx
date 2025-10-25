'use client';

import type { Activity } from '@/lib/types';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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

export function ActivityList({ activities, setActivities, onToggle, onDelete, onEdit }: ActivityListProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(activities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setActivities(items);
  };
  
  if (!isClient) return null;

  if (activities.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-muted-foreground/20 rounded-lg">
        <p className="text-muted-foreground">Your schedule is empty.</p>
        <p className="text-sm text-muted-foreground/70">Add an activity to get started!</p>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="activities">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {activities.map((activity, index) => (
              <Draggable key={activity.id} draggableId={activity.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg bg-card border transition-all",
                      activity.completed && "bg-card/50 text-muted-foreground",
                      snapshot.isDragging && "shadow-lg scale-105"
                    )}
                  >
                    <div {...provided.dragHandleProps} className="cursor-grab">
                      <GripVertical className="w-5 h-5 text-muted-foreground/50" />
                    </div>
                    <Checkbox 
                      id={`activity-${activity.id}`}
                      checked={activity.completed} 
                      onCheckedChange={() => onToggle(activity.id)} 
                      className="w-5 h-5"
                    />
                    <div className="flex-grow cursor-pointer" onClick={() => onEdit(activity)}>
                      <p 
                        className={cn("font-medium", activity.completed && "line-through")}
                      >
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
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
