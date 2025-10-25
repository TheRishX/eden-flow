'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Todo, Subtask, Tag } from '@/lib/types';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  Active,
  Over,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { QuadrantColumn } from './QuadrantColumn';
import { TaskItem } from './TaskItem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Plus, Trash2, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const TAG_COLORS = [
  'bg-red-200 text-red-800', 'bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 
  'bg-yellow-200 text-yellow-800', 'bg-purple-200 text-purple-800', 'bg-pink-200 text-pink-800',
  'bg-indigo-200 text-indigo-800', 'bg-teal-200 text-teal-800'
];

const getRandomColor = () => TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

export const quadrantConfigs = {
  do: {
    id: 'do',
    title: 'Urgent & Important',
    description: 'Do these tasks first.',
    className: 'border-destructive bg-destructive/5',
    urgency: 'urgent',
    importance: 'important',
  },
  schedule: {
    id: 'schedule',
    title: 'Important, Not Urgent',
    description: 'Schedule these tasks.',
    className: 'border-primary bg-primary/5',
    urgency: 'not-urgent',
    importance: 'important',
  },
  delegate: {
    id: 'delegate',
    title: 'Urgent, Not Important',
    description: 'Delegate these if possible.',
    className: 'border-accent bg-accent/5',
    urgency: 'urgent',
    importance: 'not-important',
  },
  eliminate: {
    id: 'eliminate',
    title: 'Not Urgent, Not Important',
    description: 'Eliminate or do later.',
    className: 'border-muted-foreground/20 bg-muted/30',
    urgency: 'not-urgent',
    importance: 'not-important',
  },
};

export type QuadrantId = keyof typeof quadrantConfigs;

export const EisenhowerMatrix = ({
  todos,
  onUpdateTodos,
}: {
  todos: Todo[];
  onUpdateTodos: (todos: Todo[]) => void;
}) => {
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const todosById = useMemo(() => {
    return todos.reduce((acc, todo) => {
      acc[todo.id] = todo;
      return acc;
    }, {} as Record<string, Todo>);
  }, [todos]);

  const getQuadrant = (task: Todo): QuadrantId => {
    if (task.urgency === 'urgent' && task.importance === 'important') return 'do';
    if (task.urgency === 'not-urgent' && task.importance === 'important') return 'schedule';
    if (task.urgency === 'urgent' && task.importance === 'not-important') return 'delegate';
    return 'eliminate';
  };

  const getCategorizedTodos = (todoList: Todo[]) => {
    const categorized: Record<QuadrantId, Todo[]> = {
      do: [],
      schedule: [],
      delegate: [],
      eliminate: [],
    };
    todoList.forEach(todo => {
      const quadrant = getQuadrant(todo);
      categorized[quadrant].push(todo);
    });
    return categorized;
  };

  const categorizedTodos = getCategorizedTodos(todos);

  function findQuadrant(todoId: string): QuadrantId | undefined {
    if (!todoId) return undefined;
    for (const quadrantId in categorizedTodos) {
      if (categorizedTodos[quadrantId as QuadrantId].some(t => t.id === todoId)) {
        return quadrantId as QuadrantId;
      }
    }
    return undefined;
  }

  function handleDragStart(event: { active: Active }) {
    const todo = todosById[event.active.id as string];
    if (todo) {
      setActiveTodo(todo);
    }
  }

  function handleDragOver(event: { active: Active; over: Over | null }) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    const activeQuadrant = findQuadrant(activeId);
    const overQuadrant = isOverATask ? findQuadrant(overId) : (overId as QuadrantId);

    if (!activeQuadrant || !overQuadrant || activeQuadrant === overQuadrant) {
      return;
    }

    const activeIndex = categorizedTodos[activeQuadrant].findIndex(t => t.id === activeId);
    const overIndex = isOverATask ? categorizedTodos[overQuadrant].findIndex(t => t.id === overId) : 0;
    
    let newTodos = Array.from(todos);
    const [movedTask] = newTodos.splice(newTodos.findIndex(t => t.id === activeId), 1);
    
    const newQuadrantConfig = quadrantConfigs[overQuadrant];
    movedTask.urgency = newQuadrantConfig.urgency as 'urgent' | 'not-urgent';
    movedTask.importance = newQuadrantConfig.importance as 'important' | 'not-important';
    
    const allCategorized = getCategorizedTodos(newTodos);
    allCategorized[overQuadrant].splice(overIndex, 0, movedTask);

    onUpdateTodos(Object.values(allCategorized).flat());
  }

  function handleDragEnd(event: { active: Active; over: Over | null }) {
     const { active, over } = event;
    if (!over) {
        setActiveTodo(null);
        return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeQuadrant = findQuadrant(activeId);
    const overQuadrant = findQuadrant(overId) || overId as QuadrantId;

    if (!activeQuadrant || !overQuadrant || activeQuadrant !== overQuadrant) {
        setActiveTodo(null);
        return;
    }

    const activeIndex = categorizedTodos[activeQuadrant].findIndex(t => t.id === activeId);
    const overIndex = categorizedTodos[overQuadrant].findIndex(t => t.id === overId);
    
    if (activeIndex !== overIndex) {
        const newQuadrantTasks = arrayMove(categorizedTodos[activeQuadrant], activeIndex, overIndex);
        const newTodos = todos.filter(t => getQuadrant(t) !== activeQuadrant);
        onUpdateTodos([...newTodos, ...newQuadrantTasks]);
    }
    
    setActiveTodo(null);
  }

  const handleTaskUpdate = (updatedTask: Todo) => {
    const updatedTodos = todos.map(t => (t.id === updatedTask.id ? updatedTask : t));
    onUpdateTodos(updatedTodos);
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      onUpdateTodos(todos.filter(t => t.id !== selectedTask.id));
      setSelectedTask(null);
    }
  };

  const handleToggleTodo = (taskId: string) => {
    const updatedTodos = todos.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    onUpdateTodos(updatedTodos);
  };
  
  const taskIds = useMemo(() => todos.map(t => t.id), [todos]);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full h-full">
            <SortableContext items={taskIds}>
            {(Object.keys(quadrantConfigs) as QuadrantId[]).map(quadrantId => (
                <QuadrantColumn
                key={quadrantId}
                quadrantId={quadrantId}
                tasks={categorizedTodos[quadrantId]}
                onTaskClick={setSelectedTask}
                onToggle={handleToggleTodo}
                />
            ))}
            </SortableContext>
        </div>
        
        {typeof document !== 'undefined' && createPortal(
          <DragOverlay>
            {activeTodo && <TaskItem task={activeTodo} isOverlay />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskDetails
              task={selectedTask}
              onUpdate={handleTaskUpdate}
              onDelete={handleDeleteTask}
              onClose={() => setSelectedTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};


const TaskDetails = ({ task, onUpdate, onDelete, onClose }: { task: Todo; onUpdate: (task: Todo) => void; onDelete: () => void; onClose: () => void; }) => {
  const [localTask, setLocalTask] = useState<Todo>(task);
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleFieldChange = (field: keyof Todo, value: any) => {
    const updated = { ...localTask, [field]: value };
    setLocalTask(updated);
    onUpdate(updated);
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const sub: Subtask = { id: crypto.randomUUID(), text: newSubtask, completed: false };
      const subtasks = [...(localTask.subtasks || []), sub];
      handleFieldChange('subtasks', subtasks);
      setNewSubtask('');
    }
  }

  const toggleSubtask = (subId: string) => {
    const subtasks = (localTask.subtasks || []).map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
    handleFieldChange('subtasks', subtasks);
  }

  const deleteSubtask = (subId: string) => {
    const subtasks = (localTask.subtasks || []).filter(s => s.id !== subId);
    handleFieldChange('subtasks', subtasks);
  }
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
        e.preventDefault();
        const tagExists = localTask.tags?.some(tag => tag.text.toLowerCase() === newTag.trim().toLowerCase());
        if (!tagExists) {
            const tag: Tag = { id: crypto.randomUUID(), text: newTag.trim(), color: getRandomColor() };
            const tags = [...(localTask.tags || []), tag];
            handleFieldChange('tags', tags);
        }
        setNewTag('');
    }
  }

  const deleteTag = (tagId: string) => {
    const tags = (localTask.tags || []).filter(tag => tag.id !== tagId);
    handleFieldChange('tags', tags);
  }

  return (
    <div className="py-4 grid gap-6">
      {/* Title and Completion */}
      <div className="flex items-center gap-4">
        <Checkbox
          id="task-completed"
          checked={localTask.completed}
          onCheckedChange={(checked) => handleFieldChange('completed', Boolean(checked))}
          className="w-6 h-6"
        />
        <Input
          value={localTask.text}
          onChange={e => handleFieldChange('text', e.target.value)}
          className="text-lg font-semibold border-0 shadow-none -ml-2"
        />
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap items-center gap-2 mt-2">
            {(localTask.tags || []).map(tag => (
                <Badge key={tag.id} variant="outline" className={cn("border-0", tag.color)}>
                    {tag.text}
                    <button onClick={() => deleteTag(tag.id)} className="ml-2 rounded-full hover:bg-black/10 p-0.5">
                        <X className="w-3 h-3"/>
                    </button>
                </Badge>
            ))}
        </div>
        <Input 
            placeholder="Add a tag and press Enter..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            className="mt-2"
        />
      </div>

      {/* Due Date */}
      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !localTask.dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {localTask.dueDate ? format(new Date(localTask.dueDate), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={localTask.dueDate ? new Date(localTask.dueDate) : undefined}
              onSelect={(date) => handleFieldChange('dueDate', date?.toISOString())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add some notes..."
          value={localTask.notes || ''}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      {/* Sub-tasks */}
      <div>
        <Label>Sub-tasks</Label>
        <div className="mt-2 space-y-2">
          {(localTask.subtasks || []).map(sub => (
            <div key={sub.id} className="flex items-center gap-2 group">
              <Checkbox
                id={`subtask-${sub.id}`}
                checked={sub.completed}
                onCheckedChange={() => toggleSubtask(sub.id)}
              />
              <label htmlFor={`subtask-${sub.id}`} className={cn("text-sm", sub.completed && "line-through text-muted-foreground")}>{sub.text}</label>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100" onClick={() => deleteSubtask(sub.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Add sub-task"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask() }}
            />
            <Button onClick={handleAddSubtask}><Plus className="w-4 h-4 mr-2" /> Add</Button>
          </div>
        </div>
      </div>

      <DialogFooter className="sm:justify-between mt-4">
        <Button variant="destructive" onClick={onDelete}>Delete Task</Button>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </div>
  );
};
