---
title: "Mapping a million files in 30 seconds — in 60 MB of RAM"
date: 2026-06-04
tag: macOS
summary: Building SpaceLens's treemap engine — and the four tricks that took it from a 2 GB memory blow-up to a fast, lazy, honest disk map.
cover: /projects/spacelens/explorer.png
links:
  - { label: GitHub, url: https://github.com/bhaweshverma50/spacelens }
---

[SpaceLens](https://github.com/bhaweshverma50/spacelens) renders your whole disk
as a squarified treemap — every folder a tile, bigger tile = more space, click to
drill in. The feature sounds like a rendering problem. It isn't. The rendering is
a few hundred lines of SwiftUI `Canvas`. The real problem is that a developer's
Mac has **millions of files**, and the obvious data structure for "a treemap of
the disk" melts your RAM before you draw a single tile.

![Drilling into the SpaceLens treemap](/projects/spacelens/explorer-drilldown.gif "root → Downloads → one project, live")

Here's what the first working version looked like, and the four tricks that got
it production-grade.

## The naive version: one node per file

Version one did the obvious thing: walk the disk, build a `FileNode` per file,
hang children off parents, sum sizes bottom-up. On my machine — ~4.3 million
files — that tree cost **about 2 GB of memory**. A `URL` here, a `String` there,
an array per directory, times a few million.

The fix wasn't a cleverer node layout. It was admitting the treemap **never needs
the whole tree at once**. You look at one level, maybe three, at a time. What it
*does* need globally is just one number per folder: its total size.

## Trick 1: index sizes, not structure

So the walk now produces a flat dictionary — folder path → total bytes — and
nothing else. No nodes, no parents, no per-file anything:

```swift
/// Significant folder path → total allocated bytes.
final class SizeIndex: @unchecked Sendable {
    var sizes: [String: Int64] = [:]

    func size(of url: URL) -> Int64 {
        if let cached = sizes[url.standardizedFileURL.path] { return cached }
        return FileTreeBuilder.quickSize(url)   // small folder → walk it now, it's cheap
    }
}
```

The subtlety is the word *significant*. A dev disk has **millions of folders**
(`node_modules` nesting is fractal), so even path-string keys for all of them is
gigabytes again. SpaceLens only caches folders ≥ 8 MB:

```swift
// Only cache SIGNIFICANT folders; small ones are sized on demand (cheap) to keep
// the index a few MB instead of gigabytes on a disk with millions of folders.
if total >= cacheFloor { index.sizes[url.standardizedFileURL.path] = total }
```

That's the whole trade: anything big enough to ever be *visible* in the treemap
is precomputed; anything below the visual noise floor gets a `quickSize()` walk
on demand — which is fast *precisely because* the folder is small. The index for
a 430 GB disk lands in the tens of megabytes, and the walk takes ~30 seconds.

## Trick 2: materialize one level, lazily

With sizes global and cheap, the tree itself can be radically lazy. Drilling
into a folder materializes **only its immediate children**: subfolder sizes come
from the index (instant), file sizes from a single directory read. Anything
smaller than ~0.2% of the level's total collapses into one synthetic
*"N small items"* tile, so a folder with 40,000 tiny files becomes ~30 tiles
instead of 40,000.

A nice side effect: `children == nil` now *means* "not loaded yet", which makes
the lazy-loading state machine self-describing. (It also produced my favorite
bug — an init that defaulted folders to `children = []`, which reads as
"loaded, empty", and silently rendered a blank map. One-line fix, hours of
staring.)

## Trick 3: colors that survive a relaunch

Treemaps live and die by color. Files get colored by type, but folders dominate
the canvas — and a folder needs the **same hue every time you see it**, in every
session, or the map feels random.

The trap: Swift's `String.hashValue` is *seeded per process*. Hash a folder name
today and tomorrow, you get different numbers — by design, for HashDoS
resistance. So every launch would reshuffle every folder's color. The fix is an
explicitly stable hash; FNV-1a is four lines:

```swift
/// FNV-1a — stable across launches (String.hashValue is seeded per-process,
/// which would reshuffle every folder's color on each run).
static func fnv1a(_ s: String) -> UInt64 {
    var h: UInt64 = 0xcbf2_9ce4_8422_2325
    for b in s.utf8 { h = (h ^ UInt64(b)) &* 0x0000_0100_0000_01b3 }
    return h
}

static func color(forName name: String) -> Color {
    colors[Int(fnv1a(name) % UInt64(colors.count))]
}
```

Hashing the *name* rather than the path is deliberate: every `node_modules` on
your disk gets the same hue, which turns the palette into a legend you learn
without noticing.

## Trick 4: the memory leak that wasn't

After shipping the lazy engine I watched the process sit at **1.5 GB RSS** after
a walk and nearly started hunting a leak. `vmmap` told a different story:

```
Physical footprint:         61.7M
Physical footprint (peak):  1.2G
```

The app was *holding* 62 MB. RSS keeps counting freed-but-unreclaimed malloc
pages after a big transient allocation spike — macOS just hasn't bothered taking
them back yet, because nobody's under memory pressure. If your in-app memory
gauge reads `resident_size`, it will gaslight you forever. Report what Xcode's
gauge reports instead:

```swift
var info = task_vm_info_data_t()
var count = mach_msg_type_number_t(MemoryLayout<task_vm_info_data_t>.size) / 4
let result = withUnsafeMutablePointer(to: &info) {
    $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
        task_info(mach_task_self_, task_flavor_t(TASK_VM_INFO), $0, &count)
    }
}
let footprint = Int64(info.phys_footprint)   // not info.resident_size
```

Two "memory still shows gigabytes" bug reports evaporated with that one change.

## Bonus: stream results so cancel isn't a punishment

One more pattern worth stealing. The full category scanner tracks the top-1000
largest files per category in min-heaps while it walks. Originally those heaps
only surfaced when a scan **completed** — cancel at 90% and the UI had nothing.
Now every throttled progress tick carries a sorted snapshot of the heaps, so the
file lists fill in live *during* the scan, and an interrupted scan persists real
data instead of an empty shell. Cheap (≤1000 entries × 6 categories, once per
second), and it converts "cancel" from data loss into a checkpoint.

---

The meta-lesson across all four: the expensive thing was never the algorithm —
squarified treemaps are a solved 1999 problem. It was deciding **what not to
keep**: not the tree, not the small folders, not the per-process hash, not the
phantom RSS. SpaceLens is open source if you want to read the real thing:
[github.com/bhaweshverma50/spacelens](https://github.com/bhaweshverma50/spacelens).
