import type { Timestamp } from 'firebase/firestore';

export type Subtask = {
  id: string;
  text: string;
  completed: boolean;
};

export type Tag = {
  id: string;
  text: string;
  color: string;
};

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  urgency?: 'urgent' | 'not-urgent';
  importance?: 'important' | 'not-important';
  dueDate?: string; // ISO string for date
  dueTime?: string; // "HH:mm" format for time
  notes?: string;
  subtasks?: Subtask[];
  tagIds?: string[];
};

export type Activity = {
  id: string;
  userId: string;
  title: string;
  startTime: string; // "HH:mm" format
  endTime: string;   // "HH:mm" format
  completed: boolean;
  createdAt: Timestamp;
};
