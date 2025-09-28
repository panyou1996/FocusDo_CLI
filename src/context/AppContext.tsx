
'use client';

import * as React from 'react';
import type { Task, JournalPost, Author, TaskList } from '@/lib/types';
import { tasks as initialTasks, journalPosts as initialJournalPosts, lists as initialLists } from '@/lib/data';
import { usePersistentState } from '@/hooks/usePersistentState';

const UI_SIZES = [10, 12, 14, 16, 18]; // Corresponds to XS, S, M, L, XL
type CardStyle = 'default' | 'flat' | 'bordered' | 'glass';

interface AppContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  journalPosts: JournalPost[];
  addJournalPost: (post: JournalPost) => void;
  deleteJournalPost: (postId: string) => void;
  currentUser: Author;
  setCurrentUser: (user: Author) => void;
  lists: TaskList[];
  addList: (list: TaskList) => void;
  uiSize: number;
  setUiSize: (size: number) => void;
  cardStyle: CardStyle;
  setCardStyle: (style: CardStyle) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

const defaultUser: Author = {
  name: 'New User',
  avatarUrl: 'https://api.dicebear.com/8.x/adventurer/svg?seed=DefaultUser',
};


export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = usePersistentState<Task[]>('tasks', initialTasks);
  const [journalPosts, setJournalPosts] = usePersistentState<JournalPost[]>('journalPosts', initialJournalPosts);
  const [lists, setLists] = usePersistentState<TaskList[]>('lists', initialLists);
  const [currentUser, setCurrentUser] = usePersistentState<Author>('currentUser', defaultUser);
  const [uiSize, setUiSize] = usePersistentState<number>('ui-size', 2); // Default to M (14px in new scale)
  const [cardStyle, setCardStyle] = usePersistentState<CardStyle>('card-style', 'glass');

  const [isLoaded, setIsLoaded] = React.useState(false); // New state

  // New useEffect to set isLoaded to true after initial load
  React.useEffect(() => {
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    const newSize = UI_SIZES[uiSize] || 14;
    root.style.fontSize = `${newSize}px`;
  }, [uiSize]);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('card-style-default', 'card-style-flat', 'card-style-bordered', 'card-style-glass');
    root.classList.add(`card-style-${cardStyle}`);
  }, [cardStyle]);


  const addTask = React.useCallback((task: Task) => {
    const newTask = {
        ...task,
        myDaySetDate: task.isMyDay ? new Date().toISOString() : undefined,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  }, [setTasks]);

  const updateTask = React.useCallback((taskId: string, updatedTask: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const wasMyDay = task.isMyDay;
          const isMyDay = updatedTask.isMyDay;
          const finalTask = { ...task, ...updatedTask };

          // If isMyDay is being set to true from false or undefined
          if (isMyDay && !wasMyDay) {
            finalTask.myDaySetDate = new Date().toISOString();
          }
          return finalTask;
        }
        return task;
      })
    );
  }, [setTasks]);

  const deleteTask = React.useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, [setTasks]);

  const addJournalPost = React.useCallback((post: JournalPost) => {
    setJournalPosts(prevPosts => [post, ...prevPosts]);
  }, [setJournalPosts]);

  const deleteJournalPost = React.useCallback((postId: string) => {
    setJournalPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, [setJournalPosts]);
  
  const addList = React.useCallback((list: TaskList) => {
    setLists(prevLists => [...prevLists, list]);
  }, [setLists]);

  // Ensure that if localStorage had a "null" value, it gets updated to the default user.
  React.useEffect(() => {
    if (currentUser === null) {
      setCurrentUser(defaultUser);
    }
  }, [currentUser, setCurrentUser]);
  
  const appContextValue = React.useMemo(() => ({
    tasks,
    setTasks: setTasks as (tasks: Task[]) => void, // Provide a way to set the whole array
    addTask,
    updateTask,
    deleteTask,
    journalPosts,
    addJournalPost,
    deleteJournalPost,
    currentUser: currentUser || defaultUser, // Always provide a valid user object
    setCurrentUser,
    lists,
    addList,
    uiSize,
    setUiSize,
    cardStyle,
    setCardStyle,
  }), [tasks, setTasks, addTask, updateTask, deleteTask, journalPosts, addJournalPost, deleteJournalPost, currentUser, setCurrentUser, lists, addList, uiSize, setUiSize, cardStyle, setCardStyle]);


  return (
    <AppContext.Provider value={appContextValue}>
      {isLoaded ? children : null} {/* Only render children after hydration */}
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
