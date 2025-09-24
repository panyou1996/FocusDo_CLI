
import type { Task, TaskList, BlogPost } from '@/lib/types';

export const lists: TaskList[] = [
  { id: 'work', name: 'Work', color: 'rgb(0, 122, 255)', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal', color: 'rgb(255, 149, 0)', icon: 'User' },
  { id: 'study', name: 'Study', color: 'rgb(52, 199, 89)', icon: 'Book' },
];

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Finalize Q3 report',
    listId: 'work',
    isCompleted: false,
    startTime: '10:00',
    dueDate: '2025-09-26',
    duration: 60,
    isImportant: true,
    isMyDay: true,
    subtasks: [
      { id: 'sub1-1', title: 'Review data', isCompleted: true },
      { id: 'sub1-2', title: 'Write summary', isCompleted: false },
    ]
  },
  {
    id: '2',
    title: 'Buy groceries',
    listId: 'personal',
    isCompleted: false,
    startTime: '17:00',
    isImportant: false,
    isMyDay: true,
  },
  {
    id: '3',
    title: 'Read chapter 5 of Next.js book',
    listId: 'study',
    isCompleted: true,
    isImportant: false,
  },
  {
    id: '4',
    title: 'Team meeting',
    listId: 'work',
    isCompleted: false,
    startTime: '14:00',
    duration: 30,
    isImportant: true,
    isMyDay: true,
  },
  {
    id: '5',
    title: 'Call the dentist',
    listId: 'personal',
    isCompleted: false,
    isImportant: true,
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'mastering-productivity-in-the-digital-age',
    title: 'Mastering Productivity in the Digital Age',
    excerpt: 'Discover the secrets to staying focused and achieving your goals in a world full of distractions. Here are five actionable tips you can implement today.',
    coverImage: 'placeholder_blog_1',
    author: {
      name: 'Jane Doe',
      avatarUrl: 'placeholder_avatar_1',
    },
    date: '8/16/2023',
    readingTime: 5,
    content: `
<p>In today's fast-paced digital world, mastering productivity is more than a skill—it's a necessity for personal and professional success. The constant influx of notifications, emails, and social media updates can easily derail our focus, leaving us feeling overwhelmed and unproductive. However, with the right strategies, it's possible to reclaim control over your time and attention.</p>
<img src="https://picsum.photos/seed/blog_detail_1/600/400" alt="A person working at a clean desk" data-ai-hint="clean desk" />
<p>One of the most effective methods is the Pomodoro Technique. This time management method uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks. Each interval is known as a pomodoro, from the Italian word for 'tomato', after the tomato-shaped kitchen timer that creator Francesco Cirillo used as a university student.</p>
<h2>Key Principles</h2>
<ul>
  <li><strong>Single-tasking:</strong> Focus on one task at a time. Multitasking is a myth that divides your attention and reduces the quality of your work.</li>
  <li><strong>Time blocking:</strong> Allocate specific blocks of time in your calendar for important tasks. This creates a commitment and protects your focus time.</li>
  <li><strong>Digital Detox:</strong> Schedule regular periods away from your screens. This helps to reduce mental fatigue and improve overall well-being.</li>
</ul>
<p>By implementing these simple yet powerful techniques, you can transform your workflow, reduce stress, and achieve a greater sense of accomplishment each day. Start small, be consistent, and watch your productivity soar.</p>
`
  },
  {
    id: '2',
    slug: 'the-art-of-digital-minimalism',
    title: 'The Art of Digital Minimalism',
    excerpt: 'Learn how decluttering your digital life can lead to more clarity, focus, and intentionality. A guide to curating your digital space for a better life.',
    coverImage: 'placeholder_blog_2',
    author: {
      name: 'John Smith',
      avatarUrl: 'placeholder_avatar_2',
    },
    date: '9/5/2023',
    readingTime: 3,
    content: '<p>Content for the blog post about digital minimalism...</p>'
  },
];
