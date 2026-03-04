# Enterprise SaaS Dashboard

A robust, production-grade SaaS dashboard built to simulate complex backend workflows entirely on the client side.

## Architecture & Technology
- **Framework:** React + Vite (Lean and blazing fast)
- **Language:** TypeScript (Strict Mode for robust scale)
- **Styling:** Tailwind CSS + Vanilla CSS Variables Design System (Extremely customizable)
- **State Management:** Zustand (Low boilerplate, context-free global state)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod (Performant validation)
- **Data Visualization:** Recharts

## Feature Highlights
1. **Mock Services Layer:**
   - Abstracted logic (`mockApi.ts` and `campaignService.ts`) handles artificial network delays (latency) and probabilistic failure rates to properly test error boundaries and optimistic UI handling.
2. **Campaign Management:**
   - Sortable table, multi-select bulk actions, debounced search filters.
   - **Optimistic Updates:** Changing a campaign status updates the UI instantly, rolling back if the simulated API call fails.
3. **Job Simulation Engine:**
   - Background polling abstraction. A job progresses via intervals from `Pending` -> `Processing` -> `Complete`/`Failed`.
4. **Detail Page UX:**
   - Unsaved changes browser prompt on the Overview tab using `useForm` dirty state.
   - Advanced Drag and Drop simulation with per-file progress arrays.
   - Interactive SVG charting using Recharts with built-in empty states and loading skeletons.

## Running Locally

1. Install dependencies
```bash
npm install
```

2. Start the dev server
```bash
npm run dev
```

3. Build for production
```bash
npm run build
```

## Trade-offs & Considerations
- **Mock Data State:** Data persists in memory. Refreshing resets the database to the 54 mock campaigns. A real app might synchronize with `localStorage` or `IndexedDB`, but memory was chosen for consistency in a purely frontend assessment.
- **Routing:** Nested routing strategy was kept flat for the `/campaigns` endpoint due to module simplicity, but the `features/` directory architecture supports deep nesting.
# AMGO_Games
