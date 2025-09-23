# 方案：将数据存储迁移到浏览器 LocalStorage

本文档旨在评估并详细说明将应用数据从当前的 React Context 内存存储迁移到浏览器 `localStorage` 的技术方案。

## 1. 需求评估

根据您的要求，我们对 `localStorage` 方案进行了评估：

*   **✅ 兼容桌面和移动平台**: `localStorage` 是一个成熟的 Web 标准，被所有现代桌面和移动浏览器支持。数据可以在同一浏览器的不同标签页之间共享。
*   **✅ 具有可扩展性**: 数据将以 JSON 格式进行序列化和存储。这种格式非常灵活，未来为任务（Task）或博客（Blog）实体添加新的属性（如 `priority`, `tags` 等）将非常容易，只需更新 TypeScript 的类型定义和相关 UI 即可，核心存储逻辑无需改动。
*   **✅ 图片/大文件处理**: 您提出的图床方案是最佳实践。`localStorage` 容量有限（通常为 5-10MB），不适合直接存储 Base64 编码的图片。
    *   **修正方案**: 我们将在博客创建流程中，集成图片上传到图床的功能。在 `localStorage` 中，我们将只存储图床返回的图片 URL，而不是图片文件本身。这大大降低了本地存储的压力，并能利用 CDN 加快图片加载。
*   **✅ 可迁移性**: 此方案具有良好的可迁移性。当未来决定迁移到 Firebase Firestore 等云数据库时，我们可以轻松编写一个迁移脚本：该脚本在用户首次访问时运行，检查 `localStorage` 中是否存在旧数据，如果存在，则将其读取、转换并批量上传到新的云数据库中，然后清除 `localStorage` 的数据。

**评估结论**: `localStorage` 方案完全满足您当前的需求，它解决了数据持久化的问题，同时为未来的扩展和迁移提供了清晰的路径。

---

## 2. 技术实施步骤

为了实现这一迁移，我们将对 `src/context/AppContext.tsx` 文件进行核心改造，并调整相关组件。

### 步骤 1: 创建自定义 Hook (`useLocalStorage`)

我们将创建一个可复用的 React Hook，名为 `useLocalStorage`。这个 Hook 将封装与 `localStorage` 交互的所有逻辑，包括：

*   在组件首次加载时，从 `localStorage` 读取指定 `key` 的数据。
*   如果 `localStorage` 中没有数据，则使用提供的初始值。
*   返回一个类似于 `useState` 的接口，包含当前的状态值和一个更新状态的函数。
*   每当状态值更新时，自动将其序列化为 JSON 并保存回 `localStorage`。
*   处理浏览器环境的差异（例如，在 Next.js 服务端渲染(SSR)期间 `window` 对象不存在）。

### 步骤 2: 改造 `AppContext.tsx`

我们将使用 `useLocalStorage` Hook 来替换 `AppContext.tsx` 中的 `useState`。

*   **改造前**:
    ```tsx
    const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
    const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>(initialBlogPosts);
    ```

*   **改造后**:
    ```tsx
    const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
    const [blogPosts, setBlogPosts] = useLocalStorage<BlogPost[]>('blogPosts', initialBlogPosts);
    ```

### 步骤 3: 实现博客图片上传至图床

在 `src/app/(main)/blog/new/page.tsx` 文件中，我们将修改图片处理逻辑：

1.  当用户选择一张图片后，应用将不再把它转为 Base64 Data URI。
2.  而是调用一个新函数，该函数会向您提供的图床 API (`https://img.scdn.io/api.php`) 发送一个 `POST` 请求，请求体中包含图片文件。
3.  请求成功后，图床 API 会返回一个包含图片 URL 的 JSON 响应。
4.  我们将解析这个响应，提取出图片 URL，并将其保存在博客文章对象中。

### 步骤 4: 更新组件数据消费方式

所有消费 `useAppContext` 的组件（如 `TodayPage`, `BlogPage` 等）无需做任何更改。因为我们保持了 Context 提供的接口 (`tasks`, `addTask`, `blogPosts`, `addBlogPost` 等)不变，底层的存储机制对这些组件是透明的。这是良好封装带来的好处。

---

在您审阅并批准此方案后，我将立即开始实施这些修改。