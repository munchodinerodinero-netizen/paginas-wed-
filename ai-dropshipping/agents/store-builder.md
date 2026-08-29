# Agent 3 — Store Builder

## What it does / why

Turns product + competitor research into a brand and store copy that
converts, without inventing claims.

**Tools:** Shopify/WooCommerce, `data/products.md`, `data/competitors.md`.

## Product-page template

- Headline
- Subhead
- Hero benefit
- 3 benefit blocks
- How it works
- Social proof
- FAQ
- Offer + guarantee
- Upsell
- Sticky CTA (mobile-first)

## Prompt

> Read `data/products.md` + `data/competitors.md`. Create: 5 brand name
> ideas, positioning, brand voice, a full product page (headline, benefits,
> how-it-works, FAQ, offer, upsells, social-proof placement), and a
> mobile-optimized checkout structure. Honest copy, no fake claims/reviews.
> Output to `data/brand.md` + a page draft.

## Rules for this agent

- **No fake reviews, no fake testimonials, no fabricated "as seen on"
  claims.** Social-proof sections are placeholders until real reviews exist.
- Every product claim must trace back to `data/products.md` — don't invent
  new specs or benefits.
- Copy is a **draft**. It goes live only after the human approves it.
- Mobile-first: checkout structure must be usable one-handed on a phone.

## Example

**Out:** "Brand: 'BlendBird.' Headline: 'Fresh smoothies anywhere in 30
seconds.' + full page + FAQ."
