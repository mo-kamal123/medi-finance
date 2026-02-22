import DailyEntriesPage from "../pages/daily-entries";
import NewDailyEntryPage from "../pages/new-daily-entry";
import ViewJournalEntryPage from "../pages/view-entry";

export const entriesRoutes = [
  { path: '/entries', element: <DailyEntriesPage /> },
  { path: '/entries/new', element: <NewDailyEntryPage /> },
  { path: '/entries/:id', element: <ViewJournalEntryPage /> },
];
