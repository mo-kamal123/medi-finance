import DailyEntriesPage from "../pages/daily-entries";
import NewDailyEntryPage from "../pages/new-daily-entry";

export const entriesRoutes = [
  { path: '/entries', element: <DailyEntriesPage /> },
  { path: '/entries/new', element: <NewDailyEntryPage /> },
];
