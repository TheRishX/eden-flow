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
import { CalendarIcon, CheckIcon, ChevronsUpDown, Plus, Circle, Trash2, X, Pencil } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';


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
    
    let newTodos = Array.from(todos);
    const [movedTask] = newTodos.splice(newTodos.findIndex(t => t.id === activeId), 1);
    
    const newQuadrantConfig = quadrantConfigs[overQuadrant];
    movedTask.urgency = newQuadrantConfig.urgency as 'urgent' | 'not-urgent';
    movedTask.importance = newQuadrantConfig.importance as 'important' | 'not-important';
    
    const allCategorized = getCategorizedTodos(newTodos);
    const overIndex = isOverATask ? allCategorized[overQuadrant].findIndex(t => t.id === overId) : allCategorized[overQuadrant].length;
    
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

    if (activeId === overId) {
      setActiveTodo(null);
      return;
    }

    const activeQuadrant = findQuadrant(activeId);
    const overQuadrant = findQuadrant(overId) || overId as QuadrantId;

    if (!activeQuadrant || !overQuadrant || activeQuadrant !== overQuadrant) {
        // This case is handled by onDragOver for moves between columns
        setActiveTodo(null);
        return;
    }

    // This handles reordering within the same column
    const activeIndex = categorizedTodos[activeQuadrant].findIndex(t => t.id === activeId);
    const overIndex = categorizedTodos[overQuadrant].findIndex(t => t.id === overId);
    
    if (activeIndex !== overIndex) {
        const newQuadrantTasks = arrayMove(categorizedTodos[activeQuadrant], activeIndex, overIndex);
        const otherTasks = todos.filter(t => getQuadrant(t) !== activeQuadrant);
        onUpdateTodos([...otherTasks, ...newQuadrantTasks]);
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
        <TagManager
            selectedTagIds={localTask.tagIds || []}
            onTagIdsChange={(newTagIds) => handleFieldChange('tagIds', newTagIds)}
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
      
      <DialogFooter>
        <div className="w-full flex justify-between">
            <Button variant="destructive" onClick={onDelete}>Delete Task</Button>
            <Button onClick={onClose}>Close</Button>
        </div>
      </DialogFooter>
    </div>
  );
};

const TAG_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'
];

const TagManager = ({ selectedTagIds, onTagIdsChange }: { selectedTagIds: string[], onTagIdsChange: (ids: string[]) => void }) => {
    const [allTags, setAllTags] = useLocalStorage<Tag[]>('edenflow-tags', []);
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');


    const toggleTag = (tagId: string) => {
        const newTagIds = selectedTagIds.includes(tagId)
            ? selectedTagIds.filter(id => id !== tagId)
            : [...selectedTagIds, tagId];
        onTagIdsChange(newTagIds);
    };

    const createTag = (text: string) => {
        const newTag: Tag = {
            id: crypto.randomUUID(),
            text,
            color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
        };
        setAllTags(prev => [...prev, newTag]);
        toggleTag(newTag.id);
        setInputValue('');
    };

    const updateTagColor = (tagId: string, color: string) => {
        setAllTags(allTags.map(t => t.id === tagId ? { ...t, color } : t));
    };

    const selectedTags = useMemo(() => {
        return allTags.filter(tag => selectedTagIds.includes(tag.id));
    }, [allTags, selectedTagIds]);

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        <span className="truncate">
                            {selectedTags.length > 0 ? selectedTags.map(t => t.text).join(', ') : "Select tags..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command
                      filter={(value, search) => {
                        const tag = allTags.find(t => t.id === value);
                        if(tag?.text.toLowerCase().includes(search.toLowerCase())) return 1;
                        return 0;
                      }}
                    >
                        <CommandInput 
                          placeholder="Search or create tag..." 
                          value={inputValue}
                          onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandEmpty>
                              <Button variant="ghost" className="w-full justify-start" onMouseDown={() => createTag(inputValue)}>
                                  <Plus className="mr-2 h-4 w-4" /> Create "{inputValue}"
                              </Button>
                            </CommandEmpty>
                            <CommandGroup>
                                {allTags.map((tag) => (
                                    <CommandItem
                                        key={tag.id}
                                        value={tag.id}
                                        onSelect={() => {
                                          toggleTag(tag.id);
                                          setInputValue('');
                                        }}
                                        className="flex justify-between items-center group"
                                    >
                                        <div className="flex items-center">
                                            <CheckIcon
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <Circle className="mr-2 h-4 w-4" style={{ color: tag.color, fill: tag.color }} />
                                            {tag.text}
                                        </div>
                                        <Popover>
                                            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-1 border-none" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex gap-1">
                                                    {TAG_COLORS.map(color => (
                                                        <Button
                                                            key={color}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 rounded-full"
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => updateTagColor(tag.id, color)}
                                                        >
                                                          {tag.color === color && <CheckIcon className="h-4 w-4 text-white" />}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <div className="flex flex-wrap items-center gap-2 mt-2 min-h-[2rem]">
                {selectedTags.map(tag => (
                    <Badge key={tag.id} variant="outline" style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color, color: tag.color }} className="font-medium">
                        {tag.text}
                        <button onClick={() => toggleTag(tag.id)} className="ml-2 rounded-full hover:bg-black/10 p-0.5">
                            <X className="w-3 h-3"/>
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
};