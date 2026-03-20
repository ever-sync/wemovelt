# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Mobile builds

This project is configured with Capacitor and already includes native projects for Android and iOS.

Commands:

```sh
npm install
npm run build
npm run cap:sync
```

Platform-specific sync:

```sh
npm run cap:android
npm run cap:ios
```

Regenerate native icons and splash screens:

```sh
npm run assets:mobile
```

Open the native projects:

```sh
npx cap open android
npx cap open ios
```

Notes:

- Android builds require Android Studio
- iOS builds and App Store submission require macOS with Xcode
- Update the `appId` in `capacitor.config.ts` before publishing to the stores so it matches your final bundle identifier

## Push notifications

The PWA push flow now uses a browser subscription table plus a Supabase edge function.

Required configuration:

- `VITE_SUPABASE_URL` in the web app environment
- `VITE_SUPABASE_PUBLISHABLE_KEY` in the web app environment
- `VITE_VAPID_PUBLIC_KEY` in the web app environment
- `SERVICE_ROLE_KEY` in the `push-notifications` edge function secrets
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` in the edge function secrets

Generate a VAPID keypair with:

```sh
npm run push:vapid
```

Then place the values here:

- `VITE_SUPABASE_URL` -> frontend `.env`
- `VITE_SUPABASE_PUBLISHABLE_KEY` -> frontend `.env`
- `VITE_VAPID_PUBLIC_KEY` -> frontend `.env`
- `VAPID_PUBLIC_KEY` -> Supabase Edge Function secrets
- `VAPID_PRIVATE_KEY` -> Supabase Edge Function secrets
- `VAPID_SUBJECT` -> Supabase Edge Function secrets
- `SERVICE_ROLE_KEY` -> Supabase Edge Function secrets

Supabase does not allow secret names that start with `SUPABASE_` in that screen, so use `SERVICE_ROLE_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`.

The database migration `supabase/migrations/20260320124000_push_notifications.sql` creates:

- `public.push_subscriptions`
- `public.system_settings`
- the trigger that forwards each inserted notification to the edge function

For local PWA testing, use:

```sh
npm run build
npm run preview
```

The push UI is only active in the production PWA build, not in `npm run dev`.

## Google Play release

This project already uses:

- `applicationId`: `br.academias.wemovelt`
- `targetSdkVersion`: `36`
- Android App Bundle friendly build output

Prepare release signing:

```sh
copy android\keystore.properties.example android\keystore.properties
```

Then fill `android/keystore.properties` with your upload key data, or provide the same values using environment variables:

- `ANDROID_KEYSTORE_PATH`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Optional release version overrides:

- `WEMOVELT_VERSION_CODE`
- `WEMOVELT_VERSION_NAME`

Build the Play Store bundle:

```sh
npm run android:bundle:release
```

The release script tries to auto-detect:

- Android Studio JBR/JDK
- Android SDK in `%LOCALAPPDATA%\\Android\\Sdk`
- Release signing config from `android/keystore.properties` or the `ANDROID_KEY*` environment variables

Expected artifact:

```sh
android\app\build\outputs\bundle\release\app-release.aab
```

Before upload, make sure the Play Console listing is ready for:

- App access
- Data safety
- Content rating
- Privacy policy URL
- Camera and location permission disclosures
