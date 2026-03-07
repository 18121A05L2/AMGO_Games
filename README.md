# Enterprise SaaS Dashboard

A robust, production-grade SaaS dashboard built to simulate complex backend workflows entirely on the client side. This project demonstrates advanced frontend architecture, sophisticated state management, and highly polished UI/UX built with modern React.

## 🚀 Live Deployment

The application is hosted on Vercel and available to view at:
**[https://amgo-games-lac.vercel.app](https://amgo-games-lac.vercel.app)**

## 🎥 Walkthrough Video

A complete 3-minute headless browser automated walkthrough of the application features [can be viewed here](./walkthrough.webm) (or by checking the `walkthrough.webm` file in this repository).

---

## 🏗 Architecture

The application strictly follows a feature-based architectural pattern. This approach groups files by feature rather than by type, making scaling and refactoring significantly easier.

```
src/
├── app/                  # Application core setup and global providers
├── assets/               # Static assets
├── components/           # Global reusable UI (Design System: buttons, inputs, modals)
├── features/             # Feature-based modules (Domain logic)
│   ├── campaigns/        # Campaign Management Module (List, Detail Pages)
│   ├── dashboard/        # Dashboard Analytics Module
│   └── settings/         # User Settings & Profile Module
├── layouts/              # App Shell (Sidebar, Header, Main Wrapper)
├── lib/                  # Utility functions and wrappers
├── services/             # Mock Data Layer / API abstraction
│   └── mockData/         # JSON databases and seeds
└── store/                # Global Zustand stores
```

### Data Simulation Design
Because the app has a strict "Frontend Only" constraint, we implemented a sophisticated mock data layer:
- **`mockApi.ts`**: Contains the core `simulateNetworkDelay` function, which adds realistic asynchronous delays (e.g., 500ms to 1500ms) to all network interactions.
- **Probabilistic Failures**: The mock API occasionally throws deliberate errors (e.g., a 10% chance to fail when changing a campaign status) to force the UI to exercise its error boundaries and optimistic rollback logic.
- **Data Persistence**: Initial data is parsed from static JSON seeds (`campaigns.ts`). Any mutations (creates, updates, deletes) are performed in memory, meaning the application resets to its default state upon a hard browser refresh, providing a clean slate for each testing session.
- **Background Jobs**: Instead of web workers, the `JobService` relies on a pure JavaScript `setInterval` abstraction to advance jobs through `Pending` -> `Processing` -> `Complete`/`Failed` states, entirely decoupled from React's component lifecycle.

### Performance Considerations
- **Component Memoization**: Heavy components, like the main data table rows, can be wrapped in `React.memo` to prevent unnecessary re-renders when global state (like a toast notification) changes.
- **Debounced Inputs**: The search filter features a custom debounced input hook. Reacting to every keystroke to filter a list of 50+ items or trigger an API call would cause stuttering. Debouncing ensures the mock network request is only fired a few milliseconds after the user stops typing.
- **Pagination Strategy**: The data table does not render all items at once. It implements paginated slicing locally on the mock database, rendering tightly bounded DOM nodes (e.g., 10 per page) to ensure the browser paints the UI blazingly fast.
- **Optimistic UI Updates**: To perceive the application as fast, user actions (like toggling a switch) instantly update the local React state via `useCampaigns` before the simulated network call completes, creating a zero-latency experience for the user. 

---

## 🧠 State Management Strategy

The application uses a multi-tiered state management approach to ensure performance and prevent unnecessary re-renders:

1. **Global Domain State (Zustand):** 
   - Instead of Redux Toolkit, we use Zustand (`userStore`, `uiStore`) for minimal-boilerplate, context-free global state. This manages data that needs to be accessed anywhere (like user profile initials, sidebar toggle status, and toast notifications).
2. **Local Component State (React `useState` & Custom Hooks):** 
   - Feature-specific UI states (like whether a modal is open, or pagination page numbers) are kept close to where they are used. 
   - Detailed modules like `useCampaigns.ts` wrap the mock API and manage their own loading arrays and error states.
3. **Form State (React Hook Form):** 
   - Complex forms (like the Settings page and Campaign Overview Tab) bypass standard React re-renders by using uncontrolled inputs via `react-hook-form`. This tracks `isDirty` and validation states natively.

---

## 🌟 Feature Highlights

### 1. Dashboard Analytics
- A highly visual home page with KPI cards calculating total spend versus budget.
- Interactive Recharts Pie chart for visual campaign status distributions.
- Real-time "Upcoming Deadlines" sorting.

### 2. Campaign Management Module
- Fully interactive data table with component-level pagination.
- **Multi-Filter Panel**: Intersects status toggles with a debounced text search, passing queries to the simulated API.
- **Bulk Actions**: Floating action panels that appear only when items are selected.
- **Optimistic Updates**: Changing a campaign status updates the UI instantly, rolling back if the simulated API call probabilistically fails.

### 3. Campaign Detail UX
- **Overview Tab**: Utilizes `useForm` dirty state tracking to flash an "Unsaved Changes" warning ribbon if you try to leave without saving.
- **Assets Tab**: Advanced Drag and Drop simulation. Files are processed with simulated, smooth 0-100% progress bars before completing.
- **Performance Tab**: Interactive SVG charting using Recharts with built-in empty states and loading skeletons.

### 4. Background Job Simulation Engine
- Background polling abstraction built entirely without web workers. A job progresses via simulated intervals from `Pending` -> `Processing` -> `Complete`/`Failed`.

---

## 🛠 Technology Stack
- **Framework:** React + Vite (Lean and blazing fast compared to Next.js for a purely client-side SPA)
- **Language:** TypeScript (Strict Mode enabled for robust scale)
- **Styling:** Tailwind CSS v4 + Vanilla CSS Variables Design System 
- **Icons:** Lucide React
- **Forms & Validation:** React Hook Form + Zod
- **Data Visualization:** Recharts

---

## 💻 Running Locally

1. Install dependencies
```bash
npm install
```

2. Start the Vite dev server
```bash
npm run dev
```

3. Build for production (TypeScript compile + Vite build)
```bash
npm run build
```

---

## ⚖️ Trade-offs & Considerations
- **Memory vs LocalStorage:** Data modifications persist only in memory. Refreshing resets the database to the 54 mock campaigns. A real application might synchronize with `localStorage` or `IndexedDB`, but memory was chosen to ensure a clean, reproducible state for each demonstration.
- **Routing Depth:** The routing tree was kept relatively flat. Nested `<Outlet/>` routing is used for the main App Shell, but not aggressively deep-nested for campaign details to maintain simplicity.
