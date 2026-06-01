# Zia ♥ Dan — A Long-Distance Countdown

A gorgeous Next.js countdown that runs in your browser. Two countdowns in one:

- **Reunion countdown** — the exact moment the distance closes.
- **Flyby window** — a date range when she *might* fly down, with a live
  progress bar and aircraft marker.

## Features

- Glassmorphism + aurora gradients, animated digit transitions, floating hearts.
- Cross-fading background image carousel — paste any image URL (airplanes,
  skylines, the two of you).
- `/admin` page to change everything live (dates, names, messages, images,
  password). Includes its own live preview countdown.
- All settings are stored in the browser's `localStorage`, so no server is
  required.

## Run it

```sh
npm install
npm run dev
```

Open <http://localhost:3000>.

## Admin

Go to <http://localhost:3000/admin>. Default password: **`ziadan`** (change it
on the Security card).

## Deploy

Any Next.js host works (Vercel, Netlify, your own server):

```sh
npm run build
npm run start
```

For Vercel: push to a repo and import — zero config.

## Notes

- Settings live in the browser only. If you want both of you to see the same
  countdown, host it once and share the URL — anyone who opens it will use
  the *server-default* dates until they change them locally. (Hard-code the
  defaults in `lib/config.ts` if you want them shared by all visitors.)
- The "Admin" link in the top-right of the home page goes to `/admin`.
