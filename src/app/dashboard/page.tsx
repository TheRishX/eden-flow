'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Todo } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EisenhowerMatrix } from '@/components/dashboard/EisenhowerMatrix';

// Simple migration function to ensure all tasks have the new properties
const migrateTodos = (todos: any[]): Todo[] => {
  return todos.map(todo => {
    return {
      id: todo.id,
      text: todo.text,
      completed: todo.completed || false,
      urgency: todo.urgency || 'not-urgent',
      importance: todo.importance || 'not-important',
      dueDate: todo.dueDate,
      notes: todo.notes,
      subtasks: todo.subtasks || [],
    };
  });
};


export default function DashboardPage() {
  const [rawTodos, setRawTodos] = useLocalStorage<any[]>('edenflow-todos', []);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    const migrated = migrateTodos(rawTodos);
    setTodos(migrated);
  }, [rawTodos]);

  const updateTodos = (updatedTodos: Todo[]) => {
    setTodos(updatedTodos);
    setRawTodos(updatedTodos); // This syncs back to localStorage
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: newTaskText.trim(),
        completed: false,
        // Default to uncategorized, will appear in 'eliminate'
        urgency: 'not-urgent',
        importance: 'not-important',
        subtasks: [],
      };
      updateTodos([...todos, newTodo]);
      setNewTaskText('');
    }
  };

  return (
    <div className="bg-background h-screen text-foreground flex flex-col">
      <header className="p-4 border-b flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Kairos Dashboard</h1>
        </div>
        <form onSubmit={handleAddTask} className="flex gap-2 w-full max-w-sm">
          <Input
            placeholder="Quick add a new task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
          />
          <Button type="submit">Add Task</Button>
        </form>
      </header>
      <main className="p-4 md:p-8 flex-grow flex">
        <EisenhowerMatrix todos={todos} onUpdateTodos={updateTodos} />
      </main>
    </div>
  );
}
