# Shiddat ⟵ RaagaX Merge Status

This build merges fixes/features from the "RaagaX" update into the Shiddat
codebase, keeping Shiddat's branding, DB, and (where they differ) UI design.

## ✅ Done
- All branding (names, package IDs, logos, icons, splash, banner) restored to Shiddat.
- DB/config kept as Shiddat's own (Supabase project ref & keys, domains, capacitor/manifest).
- `shiddat-sync-server`: merged the device-visibility security fix (devices no longer
  leak across accounts via the `127.0.0` / `unknown` subnet loophole).
- Release download system: kept Shiddat's own proxy-based approach (`/releases/[filename]`
  route + `releaseAssets.ts`) since it was already more advanced than RaagaX's direct
  GitHub redirect approach.
- Google/OAuth onboarding flow (`OnboardingAuthModal.tsx`, `auth/callback` route): kept,
  since RaagaX doesn't have this at all.
- `next.config.mjs`: kept Shiddat's newer approach (comment explains old GitHub redirect
  was intentionally removed in favor of the proxy route).
- New feature — App Update Engine (`src/lib/update/AppUpdateEngine.ts`): fully wired into
  a rebuilt `AppUpdateModal.tsx` (progress bar, haptics, engine-driven state).
- New feature — Update badge (`TopRightUpdateBadge.tsx`): wired into `Header.tsx`.
- New feature — Friends Live / social layer (`FriendActivityEngine.ts`, `BlendEngine.ts`,
  `HapticEngine.ts`): wired into `Sidebar.tsx` (add friend by Blend tag, live activity list),
  using Shiddat's existing design tokens/styling.
- All purely internal/logic files (no UI) were taken from RaagaX as-is, since they don't
  conflict with "keep Shiddat's design": `JamSessionManager.ts`, `usePlayerStore.ts`,
  `AudioPlayerController.tsx` (controller logic), `DownloadStorage.ts`, `useUpdateStore.ts`,
  `useDownloadStore.ts`, `BlendEngine.ts`, `FriendActivityEngine.ts`, API routes, build/deploy
  scripts, `package.json` (node engine bumped to >=22 per RaagaX).

## 🔲 Not yet wired (still on Shiddat's old behavior — planned next)
The "Friends / Social" feature (`FriendActivityEngine` + `BlendEngine`) is fully wired into
`Sidebar.tsx` only. RaagaX also wires it into these screens, which still need the same
treatment (insert the feature into Shiddat's existing layout/design, same pattern as Sidebar):
- `src/components/layout/RightQueuePanel.tsx` — adds a "Friends" sub-tab next to "Up Next"
  inside the queue panel (~100+ lines: state, effects, tab switch UI, friend activity list).
- `src/components/views/LibraryView.tsx` — adds a friends/following section (~large file,
  needs the `friendsActivity` + `BlendResult` wiring around the existing library UI).
- `src/components/views/HomeView.tsx` — surfaces friend activity on the home screen.

Also not yet wired: **"Sing Mode"** (lyrics feature using the `Mic2` icon) referenced in
RaagaX's `MobileMiniPlayer.tsx` and `LyricsPanel.tsx` ("Raaga Sing Mode" → should become
"Shiddat Sing Mode"). Needs the same design-preserving wiring approach.

To continue: diff each file against
`/RaagaX-main/<same path>` (rebranded raaga→shiddat), locate the new feature's state/effects/
JSX block (same pattern used for Sidebar.tsx in this pass), and insert it into Shiddat's
existing layout using Shiddat's CSS variables (`--bg-surface`, `--text-primary`, etc.) which
already match between both codebases.
