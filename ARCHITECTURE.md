# Shekhinah App — Architecture & Product Documentation

Shekhinah is a cross-platform app for **West Highland Church** community groups. It helps a household gathering move through a meeting and keep **prayer requests** visible and shareable.

The product purpose is:

1. **Keep prayer requests** — capture, organize, and display motives of prayer (world, local, and inner/community).
2. **Organize house meetings** — guide a small-group gathering through Welcome, Worship, Witness, and Pray Room.

This document describes the product, the current technical architecture, and what is still local/in-memory versus intended as durable group data.

---

## 1. Product overview

### 1.1 Who it is for

- **House-group hosts** running a meeting on a phone, tablet, TV (Fire Stick), or browser.
- **Group members** sharing spoken prayer needs during Witness.
- **The room** during Pray Room, where requests scroll like a teleprompter so the group can pray together.

### 1.2 Meeting flow

A house meeting is a linear liturgy. Home is the agenda; each item is a dedicated screen.

```
Home (agenda)
  ├── Welcome     Ice-breaking / first-time orientation
  ├── Worship     Shared worship video
  ├── Witness     Speak a need → transcribe → extract a prayer request
  └── Pray Room   Display requests by scope, with a live teleprompter
```

Church motto shown on Home: *“To make the Word of God fully known and the people of God fully mature.”*

### 1.3 Prayer request model

Requests are grouped by **scope** (how wide the prayer is):

| Scope | Screen label | Intent |
| --- | --- | --- |
| `worldview` | World View | Mission, nations, global church |
| `localview` | Local View | City, region, local church and civic life |
| `innerview` | Inner View | People in the group (health, work, family) |

Each request currently has:

- `text` — the motive of prayer
- `person` — who asked
- `scope` — worldview / localview / innerview (not always set on every mock item)

Witness extraction also produces a richer shape that is **not yet persisted** into Pray Room:

```ts
{
  extracted_text: string;
  need: string;
  prayer_request: string;
}
```

---

## 2. Current status

The UI and meeting flow exist. **There is no backend, no database, and no user accounts.**

| Capability | Status |
| --- | --- |
| Meeting agenda and four gathering screens | Implemented |
| Worship video (YouTube native / Vimeo web) | Implemented |
| Voice capture → Whisper transcription → GPT extraction | Implemented (needs `config/apiConfig`) |
| Pray Room boards + teleprompter | Implemented with **hardcoded** sample data |
| Save a Witness request into Pray Room | Not implemented |
| Edit / complete / archive requests | Not implemented |
| Multiple houses, hosts, or recurring meetings | Not implemented |
| Auth, sync, or multi-device shared state | Not implemented |

Treat the app today as a **client-only prototype** of the house-meeting liturgy, with AI-assisted capture and a display-oriented prayer room.

---

## 3. Technology stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Runtime | Expo SDK 53 | File-based routing via `expo-router` |
| UI | React 19 + React Native 0.79 | New Architecture enabled |
| Language | TypeScript (strict) | Path alias `@/*` → project root |
| Navigation | Expo Router 5 / React Navigation 7 | Root `Stack` + `(tabs)` `Tabs` |
| Animation | `react-native-reanimated` | Parallax headers, teleprompter scroll |
| Audio | `expo-av` | Witness recording |
| Video | `react-native-youtube-iframe`, Vimeo iframe | Platform-split in Worship |
| AI | OpenAI Whisper + GPT-4 | Called directly from the client |
| Native Android | Prebuilt `android/` | Package `com.anonymous.shekhinahApp` |
| JS engine | Hermes | `hermesEnabled=true` |

Entry point: `expo-router/entry` (`package.json` → `"main"`).

Deep link scheme: `shekhinahapp://`.

---

## 4. High-level architecture

The app is a **single Expo client**. Screens hold their own state. External systems are reached over HTTPS from the device.

```
┌─────────────────────────────────────────────────────────────┐
│                     Shekhinah client                         │
│  Expo Router  ·  React Native  ·  TypeScript                 │
│                                                              │
│  Home ──► Welcome │ Worship │ Witness │ Pray Room            │
│                         │         │           │              │
│                         │         │           └── in-memory  │
│                         │         │               mock data  │
│                         │         └── expo-av recording      │
│                         └── YouTube / Vimeo player           │
└────────────┬─────────────────────┬───────────────────────────┘
             │                     │
             ▼                     ▼
      YouTube / Vimeo        OpenAI API
      (worship media)        Whisper  →  transcript
                             GPT-4    →  prayer JSON
```

There is no application server in this repo. OpenAI credentials are expected in a **gitignored** module (`config/`), imported as `@/config/apiConfig`.

---

## 5. Repository layout

```
shekhinahApp/
├── app/                      # Routes (Expo Router)
│   ├── _layout.tsx           # Root stack, fonts, theme
│   ├── +not-found.tsx
│   ├── welcome.tsx
│   ├── worship.tsx
│   ├── witness.tsx
│   ├── pray-room.tsx
│   └── (tabs)/
│       ├── _layout.tsx       # Tab bar (Home, Explore)
│       ├── index.tsx         # Home / meeting agenda
│       └── explore.tsx       # Expo starter leftover
├── components/               # Shared UI
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── ParallaxScrollView.tsx
│   ├── HelloWave.tsx
│   ├── Collapsible.tsx
│   ├── ExternalLink.tsx
│   ├── HapticTab.tsx
│   └── ui/                   # Tab bar + SF-style icons
├── hooks/
│   ├── useColorScheme.ts
│   ├── useThemeColor.ts
│   └── useFullScreen.ts      # Hide Android nav / status bar
├── constants/
│   └── Colors.ts
├── assets/images/            # Icon, splash, West Highland logo
├── android/                  # Native project (prebuild)
├── config/                   # Secrets (gitignored) — API_CONFIG
├── app.json                  # Expo config, Android TV, splash
├── package.json
└── ARCHITECTURE.md           # This file
```

Alias: import `@/hooks/useColorScheme` instead of relative paths.

---

## 6. Navigation

### 6.1 Trees

```
Root Stack  (app/_layout.tsx)
├── (tabs)                  header hidden
│   ├── index               Home
│   └── explore             Explore (template)
├── welcome                 stack screen (file route)
├── worship
├── witness
├── pray-room
└── +not-found
```

`app/_layout.tsx` only registers `(tabs)` and `+not-found`. Expo Router still mounts `welcome`, `worship`, `witness`, and `pray-room` as sibling stack routes because they live under `app/`.

Home navigates with `router.push('/welcome' | '/worship' | '/witness' | '/pray-room')`. Welcome and Worship call `router.back()`. Witness and Pray Room do not expose a back control in the current UI.

### 6.2 Tabs

`(tabs)` still includes the Expo **Explore** starter screen. It is not part of the house-meeting product.

---

## 7. Screens

### 7.1 Home — `app/(tabs)/index.tsx`

Landing agenda for the gathering.

- Branding: West Highland logo + church name and motto.
- Four tappable steps: Welcome, Worship, Witness, Pray Room.
- Layout: `ParallaxScrollView` + themed text.

### 7.2 Welcome — `app/welcome.tsx`

Ice-breaking / first-visit copy: heart of the church, what to expect, connect. Static content, no data.

### 7.3 Worship — `app/worship.tsx`

Shared worship video, split by platform:

| Platform | Player | Source |
| --- | --- | --- |
| Web | Vimeo `<iframe>` | `VIMEO_VIDEO_ID` + hash |
| iOS / Android | `react-native-youtube-iframe` | `YOUTUBE_VIDEO_ID` |

Behavior: autoplay after ready, loading and error UI, manual play on Android, overlay pause. Video IDs are constants in the file.

### 7.4 Witness — `app/witness.tsx`

Capture a spoken need and turn it into a structured prayer request.

```
Request mic permission
        │
        ▼
  expo-av HIGH_QUALITY recording
        │
        ▼
  POST audio → OpenAI Whisper (`whisper-1`, verbose_json)
        │
        ▼
  POST transcript → GPT-4 with a JSON extraction prompt
        │
        ▼
  Show transcript + { extracted_text, need, prayer_request }
```

State is local to the screen (`isRecording`, `fullTranscript`, `prayerRequest`). Nothing is written to Pray Room or disk.

Requires `@/config/apiConfig` → `OPENAI_API_KEY`. That folder is listed in `.gitignore`.

### 7.5 Pray Room — `app/pray-room.tsx`

Display-oriented prayer wall for the room (including TV).

- Three panels from in-file `requestData`: World, Local, Inner. Each has a title, scripture, icon, and request table (`Request` / `Requested By`).
- **Teleprompter** on World View: the current request scrolls horizontally; play / pause / prev / next; active row is highlighted.
- Full-screen layout with safe-area inset on the teleprompter bar.

This is the current “source of truth” for motives of prayer, but the data is static sample content.

### 7.6 Explore / 404

- `app/(tabs)/explore.tsx` — Expo template docs. Not product.
- `app/+not-found.tsx` — fallback with link home.

---

## 8. Shared UI and theming

| Piece | Role |
| --- | --- |
| `ThemedText` / `ThemedView` | Light/dark text and surfaces via `useThemeColor` |
| `ParallaxScrollView` | Animated header used on Home, Explore, Witness |
| `Colors` | Tint `#0a7ea4`; screens also use `#A1CEDC` / `#1D3D47` |
| `useColorScheme` | System appearance |
| `useFullScreen` | Hide Android navigation bar and status bar (not wired on every screen) |
| `HapticTab` / `IconSymbol` | Tab bar |

Root layout loads `SpaceMono` and wraps the tree in React Navigation `ThemeProvider`.

---

## 9. Data and configuration

### 9.1 Persistence

None. Pray Room data is a constant. Witness results live in React state until the screen unmounts.

### 9.2 Secrets

```
config/          # gitignored
  apiConfig.ts   # expected: export const API_CONFIG = { OPENAI_API_KEY }
```

Do not commit keys. Prefer env-based config before any production build.

### 9.3 Expo / native config (`app.json`)

- App name / slug: `shekhinahApp`
- Portrait; Android edge-to-edge; hidden navigation bar
- `expo-build-properties`: Android `tv: true`, compile/target SDK 34
- Plugins: `expo-router`, `expo-splash-screen`, `expo-audio`
- Typed routes experiment enabled

### 9.4 Permissions (Android)

Declared in `android/app/src/main/AndroidManifest.xml`: `INTERNET`, `RECORD_AUDIO`, storage, `MODIFY_AUDIO_SETTINGS`, vibrate. Needed for Witness and media.

---

## 10. Platform targets

| Target | How to run | Notes |
| --- | --- | --- |
| Expo Go / dev client | `npx expo start` | Primary development path |
| Android | `npm run android` | Native project present |
| iOS | `npm run ios` | Tablet supported in config |
| Web | `npm run web` | Metro static export; Worship uses Vimeo |
| Amazon Fire Stick | ADB + Expo Go (see README) | Android TV flag is on |

README Fire Stick notes: `adb devices` → `adb tcpip 5555` → `adb connect 192.168.x.x:5555`, then open Expo Go on the device.

Pray Room (teleprompter + large type) is the screen most suited to a TV in the living room.

---

## 11. External integrations

### 11.1 OpenAI (Witness)

| Call | Model | Purpose |
| --- | --- | --- |
| `POST /v1/audio/transcriptions` | `whisper-1` | Speech → text |
| `POST /v1/chat/completions` | `gpt-4` | Text → prayer JSON |

The API key is sent from the device. That is acceptable only for local experiments. A production design should proxy these calls through a backend.

### 11.2 Video (Worship)

- YouTube video id `youaORF2SK4` (native).
- Vimeo id `1093813765` (web).

Playback depends on network and platform player policies (autoplay, fullscreen).

---

## 12. Build and develop

```bash
npm install
npx expo start          # QR / Expo Go
npm run android         # native Android
npm run ios
npm run web
npm run lint
```

`npm run reset-project` moves starter code to `app-example` and blanks `app/`. Do not run it unless you intend to throw away current routes.

Lint: ESLint + `eslint-config-expo`.

---

## 13. Design constraints and gaps

These are the main architectural limits of the current tree:

1. **No durable prayer store** — Witness and Pray Room are disconnected; sample requests reset on every launch.
2. **No house / meeting entity** — there is no model for “this home, this week, these people.”
3. **Client-held OpenAI key** — must not ship in a store build.
4. **Explore tab and Expo template components** still sit beside product screens.
5. **Inconsistent chrome** — some screens have back + themed layout; Pray Room and Witness do not match that pattern.
6. **Unknown stack screens** — meeting routes are not declared on the root `Stack`, so headers/options are not centralized.
7. **Voice packages** — `@react-native-voice/voice` and `react-native-voice` are dependencies but Witness uses `expo-av` + Whisper, not on-device speech recognition.

A natural next architecture, when the product outgrows the prototype:

```
House (community group)
  └── Meeting (date, host, agenda)
        ├── Welcome / Worship session metadata
        └── PrayerRequest[]  (scope, text, person, status, source)
              ▲
              └── Witness extraction upserts here
                    ▲
                    └── Pray Room reads live list
```

That would need a backend (or at least local persistence + optional sync) and a secrets proxy for OpenAI.

---

## 14. Suggested reading order

1. `app/(tabs)/index.tsx` — agenda and product entry.
2. `app/witness.tsx` — capture pipeline.
3. `app/pray-room.tsx` — prayer display model.
4. `app/worship.tsx` — platform media split.
5. `app/_layout.tsx` and `app/(tabs)/_layout.tsx` — navigation shell.
6. `app.json` — platform and TV configuration.
