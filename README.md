# Oakwood Marketing Services

A simple, modern marketing website for **Oakwood Marketing Services** — helping small and mid-sized businesses in the Raleigh–Durham (RDU) area with website development, SEO, and custom marketing services.

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
css/styles.css      → all styling (white + green theme)
assets/raleigh.svg  → placeholder Raleigh skyline image
```

## Run it
It's a static site — no build step. Just open `index.html` in a browser, or serve the folder:
```
python3 -m http.server 8000
```
Then visit http://localhost:8000

## Notes / next steps
- The **contact form** is a demo (shows a success message, doesn't send). Connect a form service (Formspree, Netlify Forms) or an email handler to go live.
- The **hero image** is a placeholder SVG — swap `assets/raleigh.svg` for a real Raleigh photo when ready.
- Update the **email, phone, and hours** on the contact page with real details.
