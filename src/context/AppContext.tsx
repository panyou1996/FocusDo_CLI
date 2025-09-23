
'use client';

import * as React from 'react';
import type { Task, BlogPost } from '@/lib/types';
import { tasks as initialTasks, blogPosts as initialBlogPosts } from '@/lib/data';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AppContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  blogPosts: BlogPost[];
  addBlogPost: (post: BlogPost) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
  const [blogPosts, setBlogPosts] = useLocalStorage<BlogPost[]>('blogPosts', initialBlogPosts);

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
    <AppContext.Provider value={{ tasks, addTask, updateTask, deleteTask, blogPosts, addBlogPost }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
};
