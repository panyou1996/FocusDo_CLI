
'use client';

import * as React from 'react';
import type { Task, BlogPost, Author } from '@/lib/types';
import { tasks as initialTasks, blogPosts as initialBlogPosts } from '@/lib/data';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from 'next-themes';
import { themes } from '@/lib/themes';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface AppContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  blogPosts: BlogPost[];
  addBlogPost: (post: BlogPost) => void;
  currentUser: Author;
  setCurrentUser: (user: Author) => void;
  theme: string;
  setTheme: (theme: string) => void;
  mode: string | undefined;
  setMode: (mode: 'light' | 'dark') => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

const defaultUser: Author = {
  name: 'New User',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'selectable_avatar_1')?.imageUrl || '',
};


export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
  const [blogPosts, setBlogPosts] = useLocalStorage<BlogPost[]>('blogPosts', initialBlogPosts);
  const [currentUser, setCurrentUser] = useLocalStorage<Author>('currentUser', defaultUser);
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

  // Ensure that if localStorage had a "null" value, it gets updated to the default user.
  React.useEffect(() => {
    if (currentUser === null) {
      setCurrentUser(defaultUser);
    }
  }, [currentUser, setCurrentUser]);
  
  const appContextValue = React.useMemo(() => ({
    tasks,
    addTask,
    updateTask,
    deleteTask,
    blogPosts,
    addBlogPost,
    currentUser: currentUser || defaultUser, // Always provide a valid user object
    setCurrentUser,
    theme: colorTheme,
    setTheme: setColorTheme,
    mode,
    setMode: setMode as (mode: 'light' | 'dark') => void,
  }), [tasks, blogPosts, currentUser, colorTheme, mode, setMode, setCurrentUser, setColorTheme]);


  return (
    <AppContext.Provider value={appContextValue}>
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
