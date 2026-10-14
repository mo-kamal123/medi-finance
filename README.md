# MediConsult Finance

MediConsult Finance is a React frontend for managing accounting, financial
transactions, banking, and financial reports. It provides an Arabic,
right-to-left interface and connects to a separate backend API for authentication
and business data. This repository contains the frontend application only.

## Project overview

| Module         | Responsibilities                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard      | Welcome screen, statistics, recent activity, and quick actions.                                                                                 |
| Authentication | Login, persisted credentials, and authenticated application access.                                                                             |
| Accounting     | Chart of accounts, cost center trees, and account-to-cost-center links.                                                                         |
| Master data    | Customer and supplier lists and detail pages.                                                                                                   |
| Transactions   | Journal entries, customer/supplier and batch invoices, cash vouchers, cash transactions, and payable/receivable commercial papers.              |
| Banking        | Banks, bank accounts, transfers, cheques, and reconciliations.                                                                                  |
| Reports        | General ledger, customer/supplier statements, aging, trial balance, income statement, balance sheet, and banking reports with export workflows. |

## Technology stack

- React 19 with JavaScript and JSX.
- Vite through `rolldown-vite`, with the React SWC plugin.
- React Router for browser routing and lazy-loaded pages.
- TanStack Query for server-data queries, mutations, and caching.
- Redux Toolkit / React Redux for authentication and shared state.
- Axios for HTTP requests.
- React Hook Form and Zod for forms and validation.
- Tailwind CSS 4 and Lucide React for styling and icons.
- ESLint and Prettier for code checks and formatting.

## Local setup

Use Node.js **20.19+ on the 20.x line, or 22.12+**, and npm, matching the installed
Vite package's engine requirement. A reachable backend API and valid login
credentials are required to use the application.

1. Install dependencies from the lockfile:

   ```sh
   npm ci
   ```

2. Create or update `.env` in the repository root:

   ```dotenv
   VITE_API_URL=https://your-api.example.com/api
   ```

   Replace the example with your backend base URL. `.env` is ignored by Git.
   Vite exposes `VITE_` variables to browser code, so use a public API URL rather
   than a secret. Restart the development server after changing this value.

3. Start the development server:

   ```sh
   npm run dev
   ```

   Open the local URL printed by Vite. Unauthenticated users are redirected to
   `/auth`.

## Available commands

| Command           | Purpose                                            |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Start the development server with hot reload.      |
| `npm run build`   | Build production assets into `dist/`.              |
| `npm run preview` | Serve the production build locally after building. |
| `npm run lint`    | Run ESLint against the repository.                 |
| `npm run format`  | Format the repository with Prettier.               |

There is no `npm test` script. Existing unit tests use Node's built-in test runner:

```sh
node --test src/features/banking/banks/validation/bank.validation.test.js src/features/banking/cheques/utils/batch-invoice-summaries.test.js
```

## Project structure

```text
mediconsult-finance/
|-- public/                         Static assets served directly
|-- src/
|   |-- main.jsx                    React entry point and global providers
|   |-- index.css                   Global styles and Tailwind configuration
|   |-- app/
|   |   |-- api/                    Shared Axios instance and QueryClient
|   |   |-- assets/                 Logos, images, and bundled assets
|   |   |-- layouts/                Authentication and main application layouts
|   |   |-- routes/                 Central browser router
|   |   |-- store/                  Redux store configuration
|   |   `-- App.jsx                 Placeholder; routing starts in main.jsx
|   |-- features/
|   |   |-- accounting/             Account trees, cost centers, and linking
|   |   |-- auth/                   Login API, forms, routes, and auth state
|   |   |-- banking/                Banks, cheques, and reconciliations
|   |   |-- dashboard/              Home page and dashboard sections
|   |   |-- master-data/            Customers and suppliers
|   |   |-- reports/                Accounting, financial, and banking reports
|   |   `-- transactions/           Entries, invoices, cash, and commercial papers
|   `-- shared/
|       |-- components/             Navigation, pagination, and toast provider
|       |-- lib/                    Reusable helpers and hooks
|       |-- store/                  Shared Redux slice
|       |-- ui/                     Form controls, tables, modals, and loaders
|       `-- utils/                  Formatters, storage helpers, and sidebar data
|-- index.html                      HTML entry point with RTL layout
|-- package.json                    Dependencies and npm scripts
|-- package-lock.json               Locked dependency versions
|-- vite.config.js                  React SWC and Tailwind Vite plugins
|-- eslint.config.js                ESLint configuration
|-- .prettierrc                     Formatting configuration
|-- vercel.json                     SPA fallback rewrite for Vercel
`-- dist/                           Generated production output (Git-ignored)
```

### Feature organization

Features generally group code into `api/` (HTTP calls), `hooks/` (queries,
mutations, and feature logic), `pages/` (route screens), `components/` (feature UI),
`routes/` (route definitions), `validation/` (Zod schemas), and `utils/` (helpers).
The exact folders vary by feature. Invoice variants share forms, API calls, and
hooks under `src/features/transactions/invoices/shared/`.

### Application flow

`src/main.jsx` mounts the Redux, TanStack Query, toast, and router providers.
`src/app/routes/router.jsx` combines feature routes under authentication and main
layouts. The main layout checks authentication before rendering its sidebar,
navbar, and active page.

API modules use `src/app/api/axiosInstance.js`, which reads `VITE_API_URL` and adds
the stored token as a Bearer authorization header. Authentication state is held
in Redux and persisted in local storage. TanStack Query manages server data with
a default one-minute stale time and one retry.

## Production deployment

Set `VITE_API_URL` in the build environment and run `npm run build`. Deploy the
generated `dist/` directory to a static host. The API URL is embedded at build
time, so changing it requires a new build.

Because the application uses browser routing, the host must serve `index.html`
for application routes. `vercel.json` supplies that fallback for Vercel; configure
an equivalent fallback when using another host.
