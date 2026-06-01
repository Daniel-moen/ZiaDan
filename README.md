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
- Shared server-side settings and uploaded background photos so everyone sees
  the same countdown.

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

Use a Next.js host with persistent disk if you want uploaded photos to survive
updates:

```sh
npm run build
npm run start
```

Serverless hosts can run the app, but they need external image/config storage
instead of the built-in file-backed storage.

## Persistent storage

Uploaded photos and shared settings must live outside the app checkout so they
survive updates/redeploys.

By default, the app stores runtime data in:

```sh
~/.zia-dan
```

You can override this with:

```sh
ZIA_DAN_STORAGE_DIR=/path/to/persistent/zia-dan-storage
```

Keep this folder mounted/backed up across app updates. It contains:

- `config.json` — shared countdown/admin/background settings.
- `uploads/` — uploaded background image files.

If you deploy with Docker, Coolify, Railway volumes, or another persistent disk,
mount that persistent folder and set `ZIA_DAN_STORAGE_DIR` to the mounted path.
Do not use a folder inside the app release/build directory for persistent
storage.

## Notes

- File-backed storage is meant for a persistent Node server. Serverless hosts
  like Vercel do not reliably persist runtime file uploads; use object storage
  such as S3, Cloudinary, UploadThing, or a database-backed file store there.
- The "Admin" link in the top-right of the home page goes to `/admin`.
