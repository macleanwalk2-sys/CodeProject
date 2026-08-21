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
- `portal.html` — Client portal, request log (mockup, see below)

## Structure
```
index.html
services.html
about.html
contact.html
portal.html          client portal: request log
css/styles.css       all styling for the marketing pages
css/portal.css       portal only, loaded after styles.css
js/main.js           scroll reveal
assets/logo.svg      oak tree logo (header and footer)
assets/favicon.svg   browser tab icon, white tree on a green tile
assets/hill.svg      grassy hill behind the middle sections
assets/raleigh.svg   low poly Raleigh skyline illustration
```

No build step and no dependencies. Everything is hand written HTML, CSS, and a
little vanilla JS.

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

The stylesheet link carries a `?v=` number. Bump it in **all four** HTML files
whenever `styles.css` changes, so browsers pick up the new file instead of a
cached copy. Keeping the number the same across pages means navigating between
them does not re-download the stylesheet.

## Client portal
`portal.html` is the signed-in area where a client tracks the changes they've
asked for. Right now it is **a mockup**: the requests are sample data written
into the HTML and the new-request form does not save anything. It is here to
settle layout and wording before any of it is wired up.

It borrows the header, footer, buttons, form fields, and colour variables from
`styles.css`, and adds only portal-specific layout in `css/portal.css`. So the
four marketing pages are untouched, and neither side downloads the other's CSS.
`portal.css` carries its own `?v=` number, independent of the one on
`styles.css`.

Statuses are **New**, **In progress**, **Needs you**, and **Completed**. "Needs
you" is the one that matters: it marks work stalled waiting on the client for a
photo, some copy, or an approval, and it is the reason a request can sit for a
week. Those rows get an amber edge so a client can see at a glance whether
anything is on them.

To make it real, three things are needed, roughly in this order:
1. **A login**, so the page knows which client it is showing. Supabase Auth is
   the plan: it runs from client-side JS, so it works on GitHub Pages with no
   server. Sign-in is email and password.
2. **A `requests` table** in Supabase, with a row-level security policy so each
   client can only ever read and write their own rows. That policy, not the
   page, is what actually keeps clients apart: a static file cannot hide
   anything.
3. **Swapping the sample rows** for a query against that table, and pointing the
   form at an insert.

The other sidebar links (Dashboard, Completed, Website Stats, Files, Account)
are placeholders. Website Stats is the one that needs more than Supabase: it
would read Google Analytics, and the credential for that cannot sit in
browser-visible JS, so it needs a small serverless function to fetch the numbers
server-side.

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
