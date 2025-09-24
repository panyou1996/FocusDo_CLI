
'use client';

import * as React from 'react';
import type { Task, BlogPost, Author } from '@/lib/types';
import { tasks as initialTasks, blogPosts as initialBlogPosts } from '@/lib/data';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from 'next-themes';
import { themes } from '@/lib/themes';

interface AppContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  blogPosts: BlogPost[];
  addBlogPost: (post: BlogPost) => void;
  currentUser: Author | null;
  setCurrentUser: (user: Author | null) => void;
  theme: string;
  setTheme: (theme: string) => void;
  mode: string | undefined;
  setMode: (mode: 'light' | 'dark') => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
  const [blogPosts, setBlogPosts] = useLocalStorage<BlogPost[]>('blogPosts', initialBlogPosts);
  const [currentUser, setCurrentUser] = useLocalStorage<Author | null>('currentUser', null);
  const { theme: mode, setTheme: setMode } = useTheme();
  const [colorTheme, setColorTheme] = useLocalStorage<string>('color-theme', 'Default');

  React.useEffect(() => {
    const root = window.document.documentElement;
    const selectedTheme = themes.find(t => t.name === colorTheme) || themes[0];
    
    root.classList.remove(...themes.map(t => `theme-${t.name.toLowerCase()}`));
    root.classList.add(`theme-${selectedTheme.name.toLowerCase()}`);

    const cssVars = mode === 'dark' ? selectedTheme.cssVars.dark : selectedTheme.cssVars.light;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

  }, [colorTheme, mode]);


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
    <AppContext.Provider value={{ tasks, addTask, updateTask, deleteTask, blogPosts, addBlogPost, currentUser, setCurrentUser, theme: colorTheme, setTheme: setColorTheme, mode, setMode: setMode as (mode: 'light' | 'dark') => void }}>
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
