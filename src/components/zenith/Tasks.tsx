'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Todo } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ListTodo, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TasksProps {
  popover?: boolean;
}

// Simple migration function
const migrateTodos = (todos: any[]): Todo[] => {
  return todos.map(todo => {
    if (typeof todo.urgency === 'undefined' || typeof todo.importance === 'undefined') {
      return {
        ...todo,
        urgency: 'not-urgent',
        importance: 'not-important',
      };
    }
    return todo;
  });
};

export function Tasks({ popover = false }: TasksProps) {
  const [rawTodos, setRawTodos] = useLocalStorage<any[]>('edenflow-todos', []);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const migrated = migrateTodos(rawTodos);
    setTodos(migrated);
  }, [rawTodos]);
  
  const saveTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
    setRawTodos(newTodos);
  }

  const incompleteTasks = todos.filter(todo => !todo.completed).length;

  const addTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const newTask: Todo = {
        id: crypto.randomUUID(),
        text: newTodo.trim(),
        completed: false,
        urgency: 'not-urgent',
        importance: 'not-important'
      };
      saveTodos([...todos, newTask]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    saveTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };
  
  const deleteTodo = (id: string) => {
    saveTodos(todos.filter(todo => todo.id !== id));
  };
  
  const tasksContent = (
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">To-Do List</h4>
          <p className="text-sm text-muted-foreground">What do you need to get done?</p>
        </div>
        <form onSubmit={addTodo}>
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
          />
        </form>
        <ScrollArea className="h-[200px]">
          <div className="grid gap-2 pr-4">
            {todos.map(todo => (
              <div key={todo.id} className="group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`todo-header-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <label
                    htmlFor={`todo-header-${todo.id}`}
                    className={`text-sm cursor-pointer ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {todo.text}
                  </label>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteTodo(todo.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {todos.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">All clear!</p>}
          </div>
        </ScrollArea>
      </div>
  );

  if (popover) {
    return tasksContent;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
            <ListTodo className="w-4 h-4"/> 
            <span>{incompleteTasks} task(s)</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-popover text-popover-foreground mr-4">
        {tasksContent}
      </PopoverContent>
    </Popover>
  );
}
