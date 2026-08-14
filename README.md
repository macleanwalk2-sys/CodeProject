# Oakwood Marketing Services

Marketing website for **Oakwood Marketing Services**, helping small and mid-sized
businesses in Raleigh and the Triangle area with website development, SEO, and
custom marketing services.

**Live site:** https://macleanwalk2-sys.github.io/CodeProject/

## Pages
- `index.html` — Home
- `services.html` — Services
- `about.html` — About
- `contact.html` — Contact (demo form)

## Structure
```
index.html
services.html
about.html
contact.html
css/styles.css       all styling
js/main.js           scroll-reveal animations
assets/logo.svg      oak tree logo (header and footer)
assets/hill.svg      grassy hill behind the middle sections
assets/raleigh.svg   placeholder Raleigh skyline illustration
```

## Design
- **Colors:** white and green (`#1f7a4d`), defined as CSS variables at the top
  of `styles.css`
- **Type:** Sora for headings, Inter for body (loaded from Google Fonts)
- **Motion:** hero elements animate in on load, sections fade in on scroll, the
  oak leaves sway, and a cardinal swoops in to perch on the hero tag. All motion
  is disabled for visitors who prefer reduced motion.

## Run it
Static site, no build step. Open `index.html` directly, or serve the folder:
```
python3 -m http.server 8000
```
Then visit http://localhost:8000

## Deploying
GitHub Pages serves the `main` branch from the repository root. Any push to
`main` goes live automatically within a minute or two.

The stylesheet link carries a `?v=` number. Bump it whenever `styles.css`
changes so browsers pick up the new file instead of a cached copy.

## Still to do
- **Contact form** is a demo; it shows a success message but does not send.
  Connect a form service (Formspree, Netlify Forms) or an email handler.
- **Hero image** is an illustration. Swap `assets/raleigh.svg` for a real photo
  when one is available.
- **Contact details** (email, phone, hours) are placeholders.
- **Pricing section** has been planned but not built.
