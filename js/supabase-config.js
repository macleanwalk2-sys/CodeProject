// Supabase connection details for the client portal.
//
// Both values here are meant to be public: the publishable key is designed to
// ship inside browser code, and it is readable in this file by anyone who views
// the site's source. That is fine. What actually keeps one client from reading
// another's requests is the row level security policy on the requests table,
// which the database enforces no matter who is asking or how.
//
// The secret key is the opposite: it ignores those policies entirely. It must
// never appear in this file or anywhere else in this repository.

// The project's base URL. The dashboard shows this as the REST endpoint with
// /rest/v1/ on the end; the library appends its own paths, so it wants the root.
export const SUPABASE_URL = 'https://nabztpunlgalmcgxtnhm.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_imMum-evY1Zu3z-V7WWO-A_xNwSah2q';
