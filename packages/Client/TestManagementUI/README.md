# QualityManager — Test Management UI

This package contains the high-fidelity, interactive React single-page frontend client for the **QualityManager** platform. It compiles via **Vite**, utilizes **Tailwind CSS** for modern visual layouts, and incorporates **Lucide Icons** for vector imagery.

---

## 1. Technical Stack

* **Core:** [React 19](https://react.dev/)
* **Build Engine:** [Vite v6](https://vite.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **REST client:** [Axios](https://axios-http.com/)
* **Testing & Spec Runner:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 2. Directory Structure

The frontend is organized cleanly into modular, isolated domain scopes:

```
src/
├── __tests__/                  # Spec-Driven Development (SDD) Test Suites
│   ├── App.spec.jsx             # Core router and async layout specs
│   └── Login.spec.jsx           # Form auth specs
├── components/                  # Global presentation components
│   ├── Sidebar.jsx              # App navigation
│   ├── Header.jsx               # Project & Release selectors, user menu
│   └── DashboardCard.jsx        # Visual metrics card
├── pages/                       # Route views
│   ├── Dashboard.jsx            # Main app overview
│   ├── TestSuiteList.jsx        # Test suites listing
│   ├── DefectList.jsx           # Defect listing
│   ├── TestRunList.jsx          # Test execution runs listing
│   ├── UserManagement.jsx       # User administration
│   ├── LogViewer.jsx            # Real-time Loki log console
│   └── Login.jsx                # Secure login screen
├── App.css                      # Global styles
├── App.jsx                      # Central router & state manager
├── index.css                    # Tailwind configurations
├── setupTests.js                # Global testing helper config
└── main.jsx                     # Entry React DOM mount point
```

---

## 3. Development Commands

Execute all scripts from the `packages/Client/TestManagementUI` directory:

### Run Locally (Dev Server)
Start the hot-reloading development server:
```bash
npm run dev
```
By default, the server runs at `http://localhost:5173`. Axios requests destined for `/api` are automatically proxied to the Nginx gateway at port `80` (configured in `vite.config.js`).

### Build for Production
Bundle and optimize frontend assets for deployment:
```bash
npm run build
```

---

## 4. Spec-Driven Development (SDD)

We leverage **Vitest** and **React Testing Library** for behavioral Spec-Driven Development. This guarantees that code additions are validated directly against mock API contracts without needing an active backend container running.

### Command Reference

| Command | Action |
| :--- | :--- |
| `npm test` | Runs the test suites once (great for CI/CD checks). |
| `npm run test:watch` | Starts Vitest in watch mode. Re-runs specs instantly on save. |
| `npm run test:ui` | Opens Vitest’s beautiful **interactive visual dashboard** in your browser! |

### SDD Writing Best Practices

1. **Test Behavior, Not Implementation:** Query elements by accessibility roles (e.g., `screen.getByRole('button', { name: /Sign In/i })`) or display values, matching real user interactions.
2. **Defensive API Mocking:** Mock Axios REST responses using `axios.get = vi.fn().mockResolvedValueOnce({ data: ... })` to verify that UI components safely render and adapt to varying JSON structures.
3. **Asynchronous Resolution:** Wrap elements that appear after network or timer delays inside `await waitFor(() => { expect(...) })`.
