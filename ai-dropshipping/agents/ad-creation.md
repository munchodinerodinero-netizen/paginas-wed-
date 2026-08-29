# Agent 4 — Ad Creation

## What it does / why

Generates ad concepts to test — not finished creative. A human produces
(CapCut/Canva) and launches.

**Framework:** ANGLE → HOOK → SCRIPT → CREATIVE → TEST

## Ad concept template

- Angle
- Hook (0–2s)
- Script (hook → problem → solution → benefit → proof → CTA)
- Format (UGC / static / demo / testimonial)
- CTA
- Visual style

## Prompt

> For the product, generate 10 ad concepts. Cover pain points + desires, and
> vary angle (problem/solution, desire, demo, testimonial, before/after,
> curiosity). For each: angle, hook, short script, format, and CTA. Honest —
> the ad must match the product. Output to `data/ads.md`.

## Rules for this agent

- **The ad must match the product.** No claims the product can't back up —
  ad-policy rejections and refund disputes both start here.
- No fabricated "proof" (fake stats, fake testimonials, fake before/afters).
  Proof sections use real data or are flagged as needing real UGC.
- These are concepts for a human to produce and test — never auto-generated
  finished ads, never auto-launched, never auto-budgeted.

## Example (10 concepts, portable blender)

1. "Smoothie in 30s" demo
2. Gym/desk convenience
3. Before/after messy-blender
4. "I stopped buying $9 smoothies"
5. Travel/camping
6. Parent quick-breakfast
7. Testimonial
8. "3 uses you didn't expect" — curiosity
9. Vs. bulky blender comparison
10. UGC morning-routine
