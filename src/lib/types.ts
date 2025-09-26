
import type { ElementType } from "react";

export type Task = {
  id: string;
  title: string;
  listId: string;
  isCompleted: boolean;
  startTime?: string;
  dueDate?: string;
  duration?: number; // in minutes
  isImportant: boolean;
  isMyDay?: boolean;
  myDaySetDate?: string; // ISO date string when the task was added to My Day
  isFixed?: boolean;
  subtasks?: Subtask[];
  description?: string;
  createdAt: string;
};

export type Subtask = {
  id:string;
  title: string;
  isCompleted: boolean;
};

export type TaskList = {
  id: string;
  name: string;
  color: string; // hex or rgb string
  icon: string | ElementType;
};

export type Author = {
  name: string;
  avatarUrl: string;
};

export type JournalPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  author: Author;
  date: string;
  readingTime: number; // in minutes
  content: string;
  listId: string;
};
