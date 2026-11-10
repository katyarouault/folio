# Folio

Turn your handwritten world into a digital home. Folio lets you scan or upload pages,
clean them up, draw, make lists, and organize everything into folders and tags.

## Two versions, one codebase

| File | What it is |
| --- | --- |
| `index.html` | **App Store version.** Loads `vendor/supabase.js`, so accounts, notes and photos live in Supabase, and sign-up / password reset use emailed 6-digit codes. Packaged into the iPhone app with Capacitor. |
| `folio.html` | **claude.ai version.** Published as a private claude.ai artifact; uses claude.ai storage and has the AI features. |
| `app.js`, `styles.css`, `assets/` | Shared app code, styles and images. |
| `supabase-setup.sql` | One-time database setup (tables, privacy rules, photo bucket, delete-account function). Run in Supabase → SQL Editor. |
| `capacitor.config.json`, `package.json`, `setup-ios.sh` | iPhone app build. |

## Run it locally

```sh
python3 -m http.server 5173
```

Then open http://localhost:5173/index.html (App Store version) or http://localhost:5173/folio.html.

## Build the iPhone app

Needs Xcode (license accepted) and Node.js LTS.

```sh
sh setup-ios.sh
```

This copies the app into `www/`, creates or updates the Xcode project in `ios/`, adds the camera and
photo permission messages, and opens Xcode.

## Keys

`app.js` contains the Supabase project URL and **publishable** key. Both are meant to ship inside the
app; the database's Row Level Security rules keep each person's data private. Never commit the
Supabase secret / service_role key or the Gmail app password.

## Support

folionotes.help@gmail.com
