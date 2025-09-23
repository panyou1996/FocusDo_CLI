
'use client';

import * as React from 'react';
import type { Task, BlogPost } from '@/lib/types';
import { tasks as initialTasks, blogPosts as initialBlogPosts } from '@/lib/data';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  blogPosts: BlogPost[];
  addBlogPost: (post: BlogPost) => void;
}

const TaskContext = React.createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>(initialBlogPosts);

  const addTask = (task: Task) => {
    setTasks(prevTasks => [task, ...prevTasks]);
  };

  const updateTask = (taskId: string, updatedTask: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const addBlogPost = (post: BlogPost) => {
    setBlogPosts(prevPosts => [post, ...prevPosts]);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, blogPosts, addBlogPost }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = React.useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
