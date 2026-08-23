// Shared Supabase client for the three portal pages: login, set-password, and
// the request log. One module so they cannot drift apart, and so the session is
// read the same way on each.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './supabase-config.js';

if (SUPABASE_URL.startsWith('PASTE_')) {
  throw new Error('js/supabase-config.js still has its placeholder URL.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function currentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Every page here lives in the same folder, so a bare filename is enough and
// this keeps working if the site moves to a custom domain or a subfolder.
export const PAGES = {
  login: 'login.html',
  setPassword: 'set-password.html',
  portal: 'portal.html',
  admin: 'admin.html',
  adminStats: 'admin-stats.html'
};

// Asks the database, rather than reading anything the browser could have set.
// A client can only ever see their own row in admins, so this is false for them
// whatever they do to their session locally. It decides which portal to open,
// not what data comes back: the row level security policies do that, and they
// run on Supabase regardless of what this returns.
export async function isAdmin() {
  const { data, error } = await supabase.from('admins').select('user_id').maybeSingle();
  if (error) return false;
  return !!data;
}

export function absolute(page) {
  return new URL(page, window.location.href).href;
}
