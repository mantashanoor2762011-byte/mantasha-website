# Mantasha Noor — 3D Portfolio (Next.js)

## Chalane ka tareeqa (How to run)

1. Node.js 20.9 ya us se naya version install hona chahiye. Check karein: `node -v`
2. Is folder mein terminal kholein aur ye do commands chalayein:

```bash
npm install
npm run dev
```

3. Browser mein kholein: http://localhost:3000

Production build ke liye:

```bash
npm run build
npm start
```

## Vercel par deploy

Folder ko GitHub par push karein, phir Vercel mein "New Project" se import kar dein. Koi setting badalne ki zaroorat nahi.

## Files kahan hain

- `lib/data.js` — Projects, services, social links, email aur chapter statements. Text badalna ho to yahin badlein.
- `components/Portfolio.jsx` — Page ka poora markup (JSX)
- `lib/experience.js` — 3D particles, animations, smooth scroll, cursor
- `app/globals.css` — Saari styling. Colors `:root` mein hain (`--gold` = main blue, `--gold-l` = light blue)
- `app/layout.js` — Page title, fonts, meta
