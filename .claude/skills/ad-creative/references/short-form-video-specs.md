# Short-Form Vertical Video — Production Spec & Creator Formats

The platform-craft layer beneath any 9:16 video for TikTok, Reels, or Shorts — the constraints that decide whether a good idea survives contact with the feed — plus three creator/UGC format recipes that consistently perform for growth content.

Part 1 (the spec) applies to **every** vertical video this skill produces — the iMessage reveals in [imessage-video-ads.md](imessage-video-ads.md), the motion ads in [motion-video-ads.md](motion-video-ads.md), and the creator formats below. Part 2 is the format library.

---

## Part 1 — The Vertical Video Spec

### Canvas
- **1080×1920 (9:16), 30fps, MP4.** Footage of any resolution/orientation is center-cropped to fill (`object-fit: cover`) — mixed source resolutions are fine.

### Safe zones (the single most-missed constraint)
Platform UI covers the frame edges — the action rail, caption stack, music button, and account row all sit *on top of* your video. Text or key visuals in those bands get covered. Keep everything inside the **cross-platform safe band** — the worst case of TikTok and IG Reels margins on a 1080×1920 canvas:

| Edge | Keep clear | Why |
|---|---|---|
| **Top** | 220px | TikTok tabs + IG account row |
| **Bottom** | 500px | Caption / music / CTA stack (both platforms) |
| **Left** | 180px | Symmetry with right |
| **Right** | 180px | Action rail (like/comment/share/music) |

**Result: a 720×1200 centered text band, from y=220 to y=1420.** Compose all captions and load-bearing visuals inside it. Preview against a safe-zone overlay before a big push. (These numbers drift with app updates — re-verify occasionally; they're a well-sourced worst-case, not a permanent law.)

### Caption style (classic TikTok)
White fill, black outline, **no background pill** — the native look that reads as organic, not as an ad:

```css
color: #fff;
font-family: "TikTok Sans", sans-serif;  /* or a close variable sans; embed it, don't assume it's installed */
font-weight: 700;
paint-order: stroke fill;                  /* stroke behind fill — keeps glyphs crisp */
-webkit-text-stroke: 8px #000;
text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
```

- **Captions are static** — no entrance/exit transitions. A caption is at full visibility on the first frame of its window, and its window matches its video segment exactly (same start, same end). Animated captions read as "made by a brand."
- **Auto-size to fit the band.** Start at ~58px and shrink in ~2px steps until the text fits the safe band (fit box ~1150px tall), floor ~26px. Never overflow the band, never clip mid-glyph. Long wall-of-text hooks are a *supported* input, not a failure case — they just shrink. Re-measure after the font actually loads (`document.fonts.ready`) so sizing uses the real face, not a fallback.

### Audio defaults (and the organic-vs-baked decision)
- **Mute clip audio by default; let one music track carry the sound.** Per-clip audio is opt-in (e.g., keep a creator's voice at full, mute B-roll).
- **Fade music out over the final ~0.8s** — a hard cut to silence reads as broken.
- **The organic call:** for organic TikTok/Reels, often post **without baked-in music** and attach the trending sound *in-app* — the platform's algorithm rewards native/trending audio, and an in-app sound is discoverable/attachable by others. **Bake the music in** for paid ads and anywhere you can't attach a native sound (some cross-posting, some platforms). This one decision meaningfully affects organic reach.

### Determinism (if you generate programmatically)
Renders must be reproducible: no clocks (`Date.now()`), no `Math.random()`, no network fetches at render time. Same inputs → same MP4, every time. (Applies whether you're on Remotion, HyperFrames, or an ffmpeg pipeline — see the `video` skill for framework choice.)

---

## Part 2 — Creator Format Library

Three UGC-driven short-form formats that reliably perform for growth. Each is a *structure*, not a script — feed it your own footage and hook. All obey Part 1.

### Format 1 — Reaction + Demo (hard cut)
**Shape:** creator reaction clip with a hook caption → **hard cut** to an app/product demo screen recording. ~9–12s total.

```
[ reaction · ~3s · hook caption ] → [ demo · full length · optional payoff caption ]
```

- **When:** you have (or can get) a genuine-feeling creator reaction and a crisp demo. The workhorse UGC format for apps/tools.
- **The hook caption** rides the reaction segment and does all the selling — it's the ad. Write it as the reaction's inner monologue ("i was about to hit it and this app talked me out of it"), not a product claim.
- **The hard cut is the mechanic** — no transition. Reaction earns attention, cut delivers the payoff. Optional second caption on the demo lands the result ("12/12 cravings resisted").
- Sourcing: real UGC reactions are the input bottleneck; the format is only as good as the reaction's authenticity.

### Format 2 — "No Yapping" Split-Screen Tutorial
**Shape:** silent, fast tutorial. Fullscreen intro → **50/50 split** (typing/action on one half, live result on the other), step captions at the seam. The "…but no yapping" promise = pure value, no talking.

```
[ intro · fullscreen · hook ] → [ split: input | output · ordered step captions at the seam ]
```

- **When:** a how-to where *showing* beats *narrating* — setup flows, prompt walkthroughs, tool tutorials. The silence is the selling point (people watch muted; "no yapping" filters for high-intent).
- **Captions carry the steps** — ordered, static, one per beat, placed at the split seam so both halves stay visible. Auto-size per Part 1.
- No voiceover; music-only (see the organic-sound note). Pace tight — dead air kills retention.

### Format 3 — Greenscreen Reaction
**Shape:** one video plays fullscreen; the creator is **cut out of their background** (greenscreen/segmentation) and composited on top — reacting to or narrating over the underlying content. Optionally start centered, then shrink/drag into a corner so the underlying video takes over.

```
[ fullscreen video (e.g. a screen recording / another post) + creator cutout overlay · optional hook text ]
```

- **When:** reacting to a competitor's post, a trend, a screen recording, or your own product — the TikTok-native "let me react to this" format. Reads as commentary, which the algorithm and audience treat as organic.
- **Both soundtracks can coexist** (underlying video + creator), unlike the mute-by-default rule — the reaction voice is the point here.
- The corner-drag move (creator starts big to establish presence, then shrinks to let the content breathe) is the signature beat.

---

*Vertical-video spec (safe-zone band, caption recipe, auto-sizing, organic-vs-baked audio) and the three creator formats are distilled from Daniel Hangan's `reelclaw-templates` (built on HeyGen's HyperFrames; TikTok Sans redistributed under SIL OFL 1.1) — patterns credited, no code vendored. Safe-zone numbers are a cross-platform worst case; re-verify against current app UI. For framework/tooling choices to actually render these, see the `video` skill.*
