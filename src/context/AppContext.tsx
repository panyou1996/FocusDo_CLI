
'use client';

import * as React from 'react';
import type { Task, BlogPost, Author, TaskList } from '@/lib/types';
import { tasks as initialTasks, blogPosts as initialBlogPosts, lists as initialLists } from '@/lib/data';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from 'next-themes';
import { themes } from '@/lib/themes';

const UI_SIZES = [14, 15, 16, 17, 18]; // Corresponds to XS, S, M, L, XL

interface AppContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  blogPosts: BlogPost[];
  addBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (postId: string) => void;
  currentUser: Author;
  setCurrentUser: (user: Author) => void;
  theme: string;
  setTheme: (theme: string) => void;
  mode: string | undefined;
  setMode: (mode: 'light' | 'dark') => void;
  lists: TaskList[];
  addList: (list: TaskList) => void;
  uiSize: number;
  setUiSize: (size: number) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

const defaultUser: Author = {
  name: 'New User',
  avatarUrl: 'https://api.dicebear.com/8.x/adventurer/svg?seed=DefaultUser',
};


export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
  const [blogPosts, setBlogPosts] = useLocalStorage<BlogPost[]>('blogPosts', initialBlogPosts);
  const [lists, setLists] = useLocalStorage<TaskList[]>('lists', initialLists);
  const [currentUser, setCurrentUser] = useLocalStorage<Author>('currentUser', defaultUser);
  const { theme: mode, setTheme: setMode } = useTheme();
  const [colorTheme, setColorTheme] = useLocalStorage<string>('color-theme', 'Default');
  const [uiSize, setUiSize] = useLocalStorage<number>('ui-size', 2); // Default to M (16px)

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

  React.useEffect(() => {
    const root = window.document.documentElement;
    const newSize = UI_SIZES[uiSize] || 16;
    root.style.fontSize = `${newSize}px`;
  }, [uiSize]);


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

  const deleteBlogPost = (postId: string) => {
    setBlogPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };
  
  const addList = (list: TaskList) => {
    setLists(prevLists => [...prevLists, list]);
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
    deleteBlogPost,
    currentUser: currentUser || defaultUser, // Always provide a valid user object
    setCurrentUser,
    theme: colorTheme,
    setTheme: setColorTheme,
    mode,
    setMode: setMode as (mode: 'light' | 'dark') => void,
    lists,
    addList,
    uiSize,
    setUiSize,
  }), [tasks, blogPosts, currentUser, colorTheme, mode, setMode, lists, uiSize, setCurrentUser, setColorTheme, setUiSize]);


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
