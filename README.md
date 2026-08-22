# Oakwood Marketing Services

Marketing website for **Oakwood Marketing Services**, helping small and mid-sized
businesses in Raleigh and the Triangle area with website development, SEO, and
custom marketing services.

**Live site:** https://macleanwalk2-sys.github.io/CodeProject/

## Pages
- `index.html` — Home: hero, services preview, process, portfolio, CTA
- `services.html` — Services, full pricing (`#pricing`), portfolio
- `about.html` — Founder section, portfolio
- `contact.html` — Contact form and details
- `login.html` — Client sign in
- `set-password.html` — Where invite and password-reset links land
- `portal.html` — Client portal, request log (signed in only)

## Structure
```
index.html
services.html
about.html
contact.html
login.html           client sign in
set-password.html    invite and password-reset landing
portal.html          client portal: request log
css/styles.css       all styling for the marketing pages
css/portal.css       portal only, loaded after styles.css
js/main.js           scroll reveal
js/supabase-config.js  project URL and publishable key
js/portal-auth.js    shared Supabase client for the portal pages
assets/logo.svg      oak tree logo (header and footer)
assets/logo-white.svg  the mark in white, for green or dark grounds
assets/favicon.svg   browser tab icon, white tree on a green tile
assets/hill.svg      grassy hill behind the middle sections
assets/raleigh.svg   low poly Raleigh skyline illustration
```

No build step. The marketing pages have no dependencies at all; the portal pages
pull the Supabase library straight from a CDN as an ES module, so there is still
nothing to install or compile.

## Design
- **Colors:** white and green (`#1f7a4d`), defined as CSS variables at the top
  of `styles.css`. Change them there and they change everywhere.
- **Type:** Sora for headings, Inter for body (loaded from Google Fonts)
- **Motion:** hero elements animate in on load, sections fade in on scroll, the
  oak leaves sway, trees grow beside the closing CTA, and a cardinal swoops in
  to perch: on the hero tag on load, and on the last portfolio card when that
  section scrolls into view. The portfolio bird reuses the hero's animation
  mirrored, so the two can never drift apart. All motion is disabled for
  visitors who prefer reduced motion.

## Run it
Open `index.html` directly, or serve the folder:
```
python3 -m http.server 8000
```
Then visit http://localhost:8000

## Deploying
GitHub Pages serves the `main` branch from the repository root. Any push to
`main` goes live within a minute or two.

The stylesheet link carries a `?v=` number. Bump it in **every** HTML file
whenever `styles.css` changes, so browsers pick up the new file instead of a
cached copy. Keeping the number the same across pages means navigating between
them does not re-download the stylesheet.

## Client portal
Three pages behind a login, live and working:

- `login.html` — sign in, and "Forgot your password?"
- `set-password.html` — where invite and password-reset links land
- `portal.html` — the request log

Requests are read from and written to a `requests` table in Supabase. Sign-in is
email and password, handled by Supabase Auth.

**Accounts are invite only.** Self-registration is turned off on the Supabase
project, so the only way an account exists is if we create it, from
**Authentication → Users** in the Supabase dashboard: **Invite user** emails a
link where they set their own password, or **Create new user** sets one
directly (tick Auto Confirm, or they wait on an email that never comes).

### How it is put together
The portal pages borrow the header, buttons, form fields, and colour variables
from `styles.css`, and add only portal layout in `css/portal.css`, so the four
marketing pages are untouched and neither side downloads the other's CSS.
`portal.css` carries its own `?v=` number, independent of the one on
`styles.css`.

`js/supabase-config.js` holds the project URL and the publishable key.
`js/portal-auth.js` builds the shared client the three pages use.

Both values in the config file are **meant** to be public and are readable in
the page source. The **secret key** is the opposite and must never appear in
this repository.

### What actually keeps clients apart
Row level security on the `requests` table, not the login screen. These are
static files; anyone can fetch `portal.html` and read it. The redirect to
`login.html` is a courtesy for people who are not signed in. The policies are
what make the query return nothing without a valid session.

The table allows a signed-in client to **read** and **insert** their own rows,
and nothing else. There is deliberately no update or delete policy, so a client
cannot move their own request to Completed — we do that from the dashboard.
`user_id` defaults to `auth.uid()`, so the database stamps each row with
whoever is signed in and nobody can file a request in another client's name.

### Statuses
**New**, **In progress**, **Needs you**, **Completed**, matching a check
constraint on the column. "Needs you" is the one that matters: it marks work
stalled waiting on the client for a photo, some copy, or an approval, and it is
the reason a request can sit for a week. Those rows get an amber edge so a
client can see at a glance whether anything is on them.

### Not built yet
The other sidebar links (Dashboard, Completed, Website Stats, Files, Account)
are placeholders. Website Stats is the one that needs more than Supabase: it
would read Google Analytics, and the credential for that cannot sit in
browser-visible JS, so it needs a small serverless function to fetch the
numbers server-side.

Supabase's built-in email sender is rate limited to a handful of messages an
hour and is not meant for production. Before real client invites go out, point
it at proper SMTP under **Project Settings → Authentication → SMTP Settings**.

## Still to do
- **Contact form** needs an endpoint. Create a free form at
  [Formspree](https://formspree.io) and paste the URL it gives you into
  `data-endpoint` on the `<form>` in `contact.html`, replacing
  `PASTE_YOUR_FORMSPREE_ENDPOINT_HERE`. Until then the form stays in demo mode
  and points visitors at the email address instead of silently discarding
  messages. Nothing else needs changing.
- **Contact details** are placeholders: `hello@oakwoodmarketing.com`,
  `mac@oakwoodmarketing.com`, and the phone number on About.
- **Founder photo** is not in the repo yet. Add it as `assets/mac.jpg` and it
  appears automatically; until then a designed fallback panel shows instead.
- **Portfolio** holds three placeholder cards. Each screenshot is an inline SVG
  mockup in a fixed 8:5 frame, so a real screenshot drops in as an `<img>` with
  no layout change.
- **Custom domain** (roughly $12/yr) whenever you want to move off the
  github.io address.
