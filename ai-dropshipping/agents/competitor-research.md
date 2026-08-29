# Agent 2 — Competitor Research

## What it does / why

Studies competing stores for the shortlisted product to find real gaps to
own — never to copy them.

**Tools:** web search, Meta Ad Library, store review sections.

## Template (per competitor)

- Store
- Products
- Pricing
- Offer
- Shipping
- Review themes
- Product-page style
- Ad angles
- Best sellers
- Complaints
- **The gap** (what we can do differently, honestly)

## Prompt

> For the shortlisted product, analyze 3–5 competing stores: products,
> pricing, offers, shipping, review themes, product-page style, ad angles,
> best sellers, and customer complaints. Identify gaps + opportunities we can
> own WITHOUT copying them. Cite sources; never invent reviews. Output to
> `data/competitors.md`.

## Rules for this agent

- Cite the source for every claim (store URL, ad library entry, review
  quote).
- **Never invent a review, complaint, or number.** If review data isn't
  accessible, say so — don't fabricate sentiment.
- The "gap" section must be a genuine differentiator, not a copy of the
  competitor's approach with different words.

## Example

**Out:** "Competitors ship slow + look cheap. Gap: fast-shipping promise +
premium, honest brand."
