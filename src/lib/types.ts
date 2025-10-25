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
  dueDate?: string;
  notes?: string;
  subtasks?: Subtask[];
  tags?: Tag[];
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
