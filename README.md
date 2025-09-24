
# TaskFlow: Your AI-Powered Productivity Hub

TaskFlow is a modern, feature-rich productivity application designed to help you organize your tasks, manage your life, and share your insights. It leverages the power of AI to provide smart features, all wrapped in a beautifully designed, customizable, and responsive user interface.

## ✨ Core Features

- **Advanced Task Management**: Create, edit, and delete tasks with detailed attributes including due dates, start times, duration, subtasks, and importance levels.
- **Categorization with Lists**: Organize tasks and blog posts into customizable lists, each with a unique name, color, and icon for easy identification.
- **AI-Powered Features**:
    - **Smart Scheduling**: An AI tool suggests the best time to complete a task based on your habits and calendar (Genkit flow integration).
    - **Task Prioritization**: An AI agent analyzes your tasks and intelligently marks them as important, providing reasoning for its decisions (Genkit flow integration).
    - **Generative Avatars**: Create unique SVG profile avatars from a text prompt using generative AI.
- **Integrated Blog**: A fully-featured blog platform to write, publish, and manage your articles. Includes cover image uploads, content categorization, and a clean reading experience.
- **Powerful Filtering & Sorting**: Both tasks and blog posts can be dynamically filtered by category and searched. They can also be sorted by various criteria (e.g., due date, creation time, importance), with your preferences saved locally.
- **Calendar View**: Visualize your tasks on a monthly calendar, with indicators for days that have scheduled tasks.
- **Persistent Local Storage**: All your data (tasks, blogs, user profile, and preferences) is saved directly in your browser's `localStorage`, ensuring your data persists between sessions.
- **Highly Customizable UI**:
    - **Theme Engine**: Choose from a dozen pre-defined color themes.
    - **Dark/Light Mode**: Seamlessly switch between light and dark modes.
    - **UI Sizing**: Adjust the global UI size across 5 different levels (XS to XL) for your preferred information density.
- **Responsive Design**: A mobile-first interface that provides a great user experience on all screen sizes.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Toolkit**: [Google Genkit](https://firebase.google.com/docs/genkit) with the Gemini model
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS Variables for theming
- **State Management**: React Context API combined with a custom `useLocalStorage` hook for persistence
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## 🏁 Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies**:
    This project uses `npm` as the package manager.
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the root of the project by copying the example file.
    ```bash
    cp .env.example .env
    ```
    You will need to add your Google AI API key inside the new `.env` file for the Genkit features to work.
    
4.  **Run the development server**:
    The application runs on `http://localhost:9002`.
    ```bash
    npm run dev
    ```

5.  **Run the Genkit development server**:
    In a separate terminal, start the Genkit server to enable the AI flows.
    ```bash
    npm run genkit:dev
    ```

Now you can open `http://localhost:9002` in your browser to see the application.

## 📂 Project Structure

Here is an overview of the key directories and files in the project:

```
/
├── src
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── (auth)/         # Auth-related pages (Login, Register)
│   │   ├── (main)/         # Main application pages after login
│   │   ├── globals.css     # Global styles and Tailwind directives
│   │   └── layout.tsx      # Root layout of the application
│   │
│   ├── ai/                 # All Genkit AI-related code
│   │   ├── flows/          # Genkit flows for AI features
│   │   └── genkit.ts       # Genkit initialization and configuration
│   │
│   ├── components/         # Reusable React components
│   │   ├── blog/           # Components specific to the Blog feature
│   │   ├── layout/         # Layout components (e.g., BottomNavBar)
│   │   ├── tasks/          # Components specific to the Task feature
│   │   └── ui/             # Generic UI components from ShadCN
│   │
│   ├── context/            # Global React Context providers
│   │   └── AppContext.tsx  # Main context for state management
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── useLocalStorage.ts # Hook for persisting state
│   │
│   ├── lib/                # Shared utilities, types, and data
│   │   ├── data.ts         # Initial/default data for the app
│   │   ├── icon-utils.ts   # Centralized icon helper function
│   │   ├── themes.ts       # Color theme definitions
│   │   └── types.ts        # TypeScript type definitions
│   │
└── tailwind.config.ts      # Tailwind CSS configuration
```
