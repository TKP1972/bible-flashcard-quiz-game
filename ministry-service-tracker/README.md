# Ministry Service Tracker

A calendar-based field service hour tracker for Android, with monthly and
service-year goal tracking.

- **Calendar**: tap any day to log hours (and an optional note).
- **Goals**: monthly goal defaults to 50 hours, service-year goal to 600 hours.
- **Service year**: runs September 1 – August 31 by default (configurable in Settings).
- **Stats**: month-by-month breakdown for the current service year, with a
  running total against the yearly goal.
- **Settings**: adjust goals, the service-year start month, light/dark theme,
  and export/import a JSON backup of your data.
- Works fully offline — all data is stored on-device (`localStorage`), nothing
  is sent to a server.

## Run locally (web)

```bash
npm install
npm run dev
```

Open the printed local URL. To try it like an installed app, use your
browser's "Install app" / "Add to Home Screen" option — the manifest and
service worker make it installable and it works offline once loaded once.

## Build for Android

This project uses [Capacitor](https://capacitorjs.com) to wrap the web app as
a native Android app. The native `android/` project is already generated and
checked in; you only need Android Studio to build the actual APK/AAB
(building native Android binaries requires the Android SDK, which isn't
available in this environment).

1. Install [Android Studio](https://developer.android.com/studio) (this also
   installs the Android SDK).
2. From this directory:
   ```bash
   npm install
   npm run cap:sync   # builds the web app and copies it into android/
   npm run cap:open   # opens the android/ project in Android Studio
   ```
3. In Android Studio, let Gradle sync finish, then use
   **Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s)** (for a quick test
   install) or **Build ▸ Generate Signed App Bundle** (to publish / share a
   signed release build).
4. To install straight to a connected phone/emulator, just click **Run** ▶
   in Android Studio.

Whenever you change the web app (anything in `src/`), re-run
`npm run cap:sync` before rebuilding in Android Studio so the native project
picks up the changes.

### App identity

- Package name: `com.tkp1972.ministryservicetracker`
- App name: "Ministry Service Tracker"

Both can be changed in `capacitor.config.ts` (before running `npx cap sync`)
or directly in `android/app/build.gradle` and
`android/app/src/main/res/values/strings.xml`.

### Icons

The web app icons live in `public/icon-192.svg` and `public/icon-512.svg`.
The Android launcher icon is currently Capacitor's default placeholder — to
generate proper Android launcher icons from the app icon, either:

- Use Android Studio's **Image Asset** tool
  (right-click `res` ▸ New ▸ Image Asset) pointing at `public/icon-512.svg`, or
- Run `npx @capacitor/assets generate --android` with a source icon.

## Data & backups

All entries and settings are stored locally on the device. Use
**Settings ▸ Export backup** to download a JSON file, and
**Settings ▸ Import backup** to restore it (e.g. after reinstalling the app
or moving to a new phone).
