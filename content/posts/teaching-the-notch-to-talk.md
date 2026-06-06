---
title: "Teaching the notch to talk: now-playing for any app on macOS"
date: 2026-06-06
tag: macOS
summary: How Perch shows live now-playing from any app (Spotify, a YouTube tab, anything) by getting past the entitlement Apple bolted onto the private MediaRemote framework. Plus the AppleScript bug that fails by compiling.
cover: /projects/perch/media.png
links:
  - { label: GitHub, url: https://github.com/bhaweshverma50/perch }
---

[Perch](https://github.com/bhaweshverma50/perch) is a Dynamic-Island for the
MacBook notch. The feature that makes it feel alive is the smallest one: when
audio plays, album art and an EQ slide out to flank the notch, with the track
title marqueeing underneath, no hover, no click.

![Perch's now-playing island](/projects/perch/media.png "The expanded media island: artwork, transport, and a drag-to-seek scrubber")

The catch is the word *audio*. Not "Spotify". Not "Music". **Whatever is making
sound**: a YouTube tab in Safari, a podcast in Overcast, a video in IINA. Getting
there meant going through three doors macOS would rather keep shut. This is the
story of the now-playing pipe.

## Door 1: AppleScript, and a bug that compiles

The obvious path is AppleScript, the only *public* way to ask another app what
it's playing:

```applescript
tell application "Spotify"
    set st to "0"
    if player state is playing then set st to "1"
    return st & "|" & name of current track & "|" & artist of current track
end tell
```

This cost me an hour. It compiles. It runs by hand. From `NSAppleScript` it
returned `nil`, silently, every time, and my unit tests stayed green because they
only tested the *parser*, not the script.

The culprit is `st`. In AppleScript, `st` is a reserved token: the ordinal
suffix in `1st`. A variable named `st` is a syntax error, but `NSAppleScript`
doesn't throw it at you; it just hands back `nil`. Rename it to `playFlag` and the
whole thing springs to life. **A bug that hides by looking like success is the
worst kind**, and "it works in the Script Editor" is not the same as "it works
through the API."

AppleScript got the wings working, but only for Spotify and Music, and every
2-second poll blocked the main actor with a synchronous Apple Event (later moved
to an `osascript` subprocess). It was a demo, not a product. A YouTube tab showed
nothing.

## Door 2: the framework Apple took away

macOS *does* have a single source of truth for now-playing: the private
**MediaRemote** framework, the thing that powers the Now Playing widget in Control
Center. It knows about every app, because every app feeds it.

It used to be a free-for-all. Then in macOS 15.4 Apple added an entitlement check
in `mediaremoted`: callers without the right entitlement get denied. Every notch
app and menu-bar scrobbler that leaned on it broke overnight.

You can't grant yourself a private Apple entitlement. So the question becomes:
*who already has it?*

## Door 3: borrowing perl's identity

This is the trick, and it's beautiful. The answer is
[`ungive/mediaremote-adapter`](https://github.com/ungive/mediaremote-adapter):

`/usr/bin/perl` (the perl shipped with macOS) is a **platform binary**. The
window server reports its bundle identifier as `com.apple.perl`, and processes
whose bundle id starts with `com.apple.` are waved through MediaRemote's
entitlement check. Perl is allowed in the room because of its surname.

So the adapter is a tiny Objective-C framework that calls the private API, loaded
*by perl* via `DynaLoader`:

```
/usr/bin/perl mediaremote-adapter.pl MediaRemoteAdapter.framework stream
```

`stream` is the magic verb. Instead of polling, it subscribes and prints JSON
lines to stdout: a full snapshot first, then diffs as things change:

```json
{"type":"data","diff":false,"payload":{"title":"Udd Gaye","artist":"Ritviz",
  "playing":true,"elapsedTime":19.2,"duration":180.0,"artworkData":"...base64..."}}
{"type":"data","diff":true,"payload":{"playing":false}}
```

Push, not poll. Any app. Artwork inline as base64, no scraping a CDN. Elapsed and
duration in every frame, so the scrubber gets a live position for free. Perch
spawns this once at launch and parses the lines off-main:

```swift
pipe.fileHandleForReading.readabilityHandler = { handle in
    self.queue.async { self.consume(handle.availableData) }
}
```

Full payloads *replace* the state (an empty one means "nothing playing"); diffs
*overlay* it, and a JSON `null` in a diff means "this key was removed", which has
to delete the key rather than poison a later cast. The whole merge is a pure
function with unit tests, because the one thing you can't easily reproduce on
demand is "Spotify changed tracks while paused mid-drag".

## The part the demo doesn't show: cleaning up

A long-lived child process is a liability. The first version leaked: quit Perch,
and the perl stream kept running, orphaned, forever. I wired
`applicationWillTerminate` to call `stop()`, and it *still* leaked.

The reason is a race I'd written on purpose. `stop()` dispatched its
`terminate()` onto a serial queue, asynchronously: clean, tidy, and exactly
wrong at exit, because the app's process tears down before the queued block ever
runs:

```swift
func stop() {
    queue.sync {          // sync, not async — the only caller is app exit,
        stopped = true    // and an async hop loses the race to process death
        process?.terminate()
    }
}
```

One word, `sync`, is the difference between a clean quit and an orphan you find
in Activity Monitor three days later. I verified it the only way that counts:
launch, count one stream; quit, count zero.

## Stream-first, AppleScript-fallback

The private route can vanish in any macOS release. So Perch probes once at launch
(the adapter ships a self-test that exits 0 when it's entitled). If it passes, the
stream is the source of truth and AppleScript polling is switched off entirely. If
it fails (now, or after some future tightening) it falls back to the
Spotify/Music bridge from Door 1. The same `MediaBridge` surface feeds the SwiftUI
wings either way; the views never know which door they came through.

That's the through-line of the whole app, actually. A notch companion lives in
places macOS reserves for itself: the menu-bar strip, the lock screen, other
apps' media. The job isn't to fight the OS; it's to find the seam where a public
API, an entitled platform binary, or two honest lines of AppKit get you in
without breaking anything. The notch learned to talk. It just needed to borrow
perl's voice.
