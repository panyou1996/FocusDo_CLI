# FocusDo - Accelerated 1-Day Refinement Plan 🚀

## 🎯 **Primary Goal for Today**
Fix all critical bugs and implement foundational strategic improvements within a single 8-hour workday. This plan is aggressive and prioritizes stability, scalability, and immediate user experience wins.

---

## 🗓️ **Today's Schedule (8 Hours)**

### **Morning Session (4 Hours): Critical Bug Fixes & Core Stability**

#### **Task 1: Fix Dark Mode & Refactor State Management (2 hours)**
*   **Problem:** Dark Mode is broken, and `AppContext` is at risk of becoming bloated.
*   **Solution:**
    1.  **Install Zustand:** Introduce a lightweight state manager to handle feature-specific states.
    2.  **Create `useThemeStore`:** Create a dedicated Zustand store for theme management (light, dark, system).
    3.  **Refactor `ThemeProvider`:** Replace the theme logic in `AppContext` with the new `useThemeStore`.
    4.  **Fix the Toggle:** Connect the theme-switching UI in the settings page to the new store, ensuring state is correctly updated and persisted.
*   **Rationale:** This tackles a critical bug and a strategic suggestion simultaneously. It immediately improves state management scalability.

#### **Task 2: Fix TaskCard Animation Bug (1.5 hours)**
*   **Problem:** The `TaskCard` component has an animation "bounce" or "jank" when expanding.
*   **Solution:**
    1.  **Isolate the Component:** Analyze `src/components/tasks/TaskCard.tsx`.
    2.  **Apply `framer-motion` Fix:** The issue is likely animating `height: "auto"`. The fix involves wrapping the content and using `initial`, `animate`, and `exit` props correctly, possibly animating `max-height` instead of `height`.
*   **Rationale:** A highly visible UI glitch that impacts the user's perception of quality.

#### **Task 3: Add Basic Inbox Calendar Indicators (0.5 hours)**
*   **Problem:** The Inbox calendar doesn't show which days have tasks.
*   **Solution:**
    1.  **Modify Calendar Component:** Locate the calendar used on the Inbox page.
    2.  **Render Simple Dots:** Fetch task data and render a simple, theme-colored dot beneath any date that contains one or more tasks.
*   **Rationale:** Addresses a key UX gap. We will defer advanced features like different colors for now to save time.

---

### **Afternoon Session (4 Hours): Strategic Implementation & Future-Proofing**

#### **Task 4: Upgrade Data Persistence & Add Versioning (1.5 hours)**
*   **Problem:** `localStorage` is not ideal for mobile, and there's no data versioning.
*   **Solution:**
    1.  **Create `usePersistentState` Hook:** Develop a new custom hook that abstracts storage logic.
    2.  **Implement Fallback:** The hook will use the Capacitor Preferences API if available, otherwise falling back to `localStorage` for web development.
    3.  **Introduce Data Versioning:** In the logic where data is saved, wrap the data object in a parent object that includes a version number, e.g., `{ version: 1, data: { ... } }`.
    4.  **Replace `useLocalStorage`:** Swap out the existing `useLocalStorage` hook with the new, more robust `usePersistentState` hook.
*   **Rationale:** This makes the application more robust and mobile-ready, and it implements the critical data versioning suggestion with minimal effort.

#### **Task 5: Establish Unit Testing Foundation (1.5 hours)**
*   **Problem:** New, complex logic for AI and scheduling lacks test coverage.
*   **Solution:**
    1.  **Install & Configure Jest:** Set up Jest and React Testing Library for the project if they don't exist.
    2.  **Write a Sample Test:** Create a test file for a simple, existing utility function in `src/lib/utils.ts` to prove the test runner works.
    3.  **Create Placeholder Test Files:** Create `taskScheduler.test.ts` and `nlpParser.test.ts` with boilerplate test setups.
*   **Rationale:** This establishes the testing infrastructure and pattern, making it easy to add tests for new features in the future without the overhead of setup.

#### **Task 6: Documentation & Code Cleanup (1 hour)**
*   **Problem:** No formal documentation for the design system or coding patterns.
*   **Solution:**
    1.  **Create `DESIGN_SYSTEM.md`:** Create the file and add the color, typography, and shadow definitions from the original `updatePlan.md`.
    2.  **Code Cleanup:** Address any linting errors or warnings that arose during the day's work.
    3.  **Review & Merge:** Ensure all changes are clean and ready.

---

## 🏆 **Success Criteria for Today**
- Dark Mode is fully functional and uses Zustand for state.
- The TaskCard animation is smooth, with no visual glitches.
- Dots appear on the Inbox calendar for days with tasks.
- Data is now saved with a version number via a new persistence hook.
- The project has a working test runner with at least one passing test.
- The `DESIGN_SYSTEM.md` file is created with initial content.
