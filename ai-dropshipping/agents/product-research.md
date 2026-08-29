# Agent 1 — Product Research

## What it does / why

Researches candidate dropshipping products and scores them so decisions are
driven by data, not hype.

**Tools:** web search, TikTok/Meta trend signals, supplier sites (AliExpress,
CJ Dropshipping, Zendrop, etc.)

## Scoring model (1–100)

| Factor | Points |
|---|---|
| Trend direction | 20 |
| Demand signals | 20 |
| Low competition | 15 |
| Margin | 20 |
| Supplier reliability | 15 |
| "Wow / scroll-stop" factor | 10 |

## Prompt

> Research 5 potential dropshipping products in [niche]. For each: trend
> direction, demand signals, competition level, est. selling price, est.
> supplier cost, est. margin, and supplier reliability. Score each 1–100 with
> the breakdown. Use real, cited signals; label estimates as estimates.
> Shortlist the top 3. Output to `data/products.md`.

## Rules for this agent

- Every trend/demand claim needs a cited, real source (search result, trend
  tool, supplier listing) — never invent numbers.
- Anything not directly sourced (est. margin, est. sell price) must be
  labeled **"estimate"** inline.
- No product is a guaranteed winner. Say so if the output could be read that
  way.
- Output format: one entry per product, ending with the top-3 shortlist and
  why they beat the other two.

## Example

**In:** `niche: kitchen gadgets`

**Out:** "Portable blender — 82/100 (trending, $15 cost → $39 sell, solid
margin). *Estimates: sell price, margin.* Source: [trend/search citation]."
