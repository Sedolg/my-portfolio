# Portfolio — Gustian Ladi Abdul Jabar

Static personal portfolio site. No build step, no dependencies.

```
index.html       Page content (all sections)
css/styles.css   Styles, light/dark theme tokens
js/main.js       Theme toggle, mobile nav, scroll spy, reveal, copy email
favicon.svg      Site icon
```

## Preview locally

Open `index.html` in a browser, or serve the folder:

```sh
python -m http.server 8000   # then visit http://localhost:8000
```

## Optional: "Download CV" button

Put a PDF named `cv.pdf` in the project root. The Download CV buttons appear
automatically once the site is served over HTTP(S) and the file exists.

## Deploy

- **GitHub Pages:** push to GitHub → Settings → Pages → deploy from `main` / root.
- **Netlify / Vercel / Cloudflare Pages:** import the repo; no build command; publish directory is the root.
