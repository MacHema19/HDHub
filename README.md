<<<<<<< HEAD
# HDS Consultancy Website

Static, mobile-responsive website inspired by the supplied light and dark design references.

## Tech choice

I used vanilla JavaScript + normal CSS instead of React/Tailwind for this first version because:
- no build step is needed;
- it is easy to upload to normal hosting, cPanel, Netlify, Vercel, GitHub Pages, or any VPS;
- the code still follows an OOP-style component structure in `js/app.js`;
- services are stored separately in `data.json`.

React/Tailwind is better later if you want a larger production app with routing, CMS, admin dashboard, login, or complex booking integration.

## Run locally

Because the services are loaded from `data.json`, open the folder through a local server:

```bash
cd hds-consultancy-website
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Files

- `index.html` — main page shell
- `css/styles.css` — light/dark theme and responsive design
- `js/app.js` — OOP components and rendering logic
- `data.json` — business info, services, portfolio, case studies, careers and booking content
- `assets/hema-avatar.png` — hero/avatar image

## Booking note

The current booking UI is a frontend design. For real Google Calendar availability, connect Google Appointment Schedule, Calendly, or a backend integration using Google Calendar API.
=======
# HDHub
>>>>>>> 09142ec6c3fc7a613253773ae6e4932e5c1085b9
