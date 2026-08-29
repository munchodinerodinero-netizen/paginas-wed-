# CLAUDE.md — AI Dropshipping System (Orchestrator)

> **Isolation notice:** This folder is a standalone project, separate from LYON
> (the web-agency business documented in the repo root `CLAUDE.md` and `Harvey/`).
> Nothing in here reads, writes, or references LYON's data. Do not merge the two.

## What this is

One product goes in. A full store system comes out.

`PRODUCTS → COMPETITORS → STORE → ADS → ORDERS → SUPPORT`

Six agents, one shared data layer. Each agent reads/writes only the files in
`data/` — no repetition, one source of truth.

## ⚠️ Read this first

This system helps you **research and build faster**. It does **not** promise
profits, revenue, or "winning" products. Most products don't win — that's
normal. The AI drafts and recommends; **a human must approve** before any ad
spend, refund, payment, or supplier order. Platform rules, supplier terms,
taxes, consumer-protection laws, and ad policies vary by location and
platform — verify your own. Nothing here is legal, financial, or tax advice.

## ABSOLUTE RULES

1. **Never promise profits, revenue, or winning products.** Results vary; most
   products don't win.
2. **Draft and recommend only.** No agent takes an irreversible or
   money-moving action on its own.
3. **Never spend ad money, place supplier orders, make payments, or issue
   refunds without explicit human approval.** Prepare them; a human executes.
4. **Never invent product data, reviews, metrics, or order info.** Use real,
   cited data. Label estimates as estimates.
5. **Escalate to the human:** refunds, payments, legal questions, and
   unusual/edge cases.
6. **Remind the human:** platform rules, supplier terms, taxes, consumer law,
   and ad policies vary by region and are their responsibility, not the AI's.
7. **Keys stay in `.env`, out of git.** No auto-spend or auto-refund keys ever
   go in `.env` — see `.env.example`.

## Folder structure

```
ai-dropshipping/
├── CLAUDE.md          ← this file
├── .env.example        ← key placeholders (copy to .env, never commit .env)
├── data/
│   ├── products.md      ← product database + scores
│   ├── suppliers.md     ← supplier database
│   ├── brand.md          ← brand brief + product page draft
│   ├── competitors.md   ← competitor research
│   ├── orders.md         ← order tracker
│   ├── customers.md     ← support log
│   └── ads.md            ← ad concepts
└── agents/
    ├── product-research.md
    ├── competitor-research.md
    ├── store-builder.md
    ├── ad-creation.md
    ├── order-operations.md
    └── customer-support.md
```

## The workflow

| # | Agent | Reads | Writes | Human checkpoint |
|---|---|---|---|---|
| 1 | Product Research | web/trend signals | `data/products.md` | Pick the product to pursue |
| 2 | Competitor Research | `data/products.md` | `data/competitors.md` | None — informs next step |
| 3 | Store Builder | `data/products.md`, `data/competitors.md` | `data/brand.md` | Approve copy before publishing |
| 4 | Ad Creation | `data/brand.md`, `data/competitors.md` | `data/ads.md` | Approve concepts before producing/launching |
| 5 | Order Operations | `data/orders.md` | `data/orders.md` | Approve every supplier order + payment |
| 6 | Customer Support | `data/orders.md`, `data/brand.md` | `data/customers.md` | Approve/send every draft; escalations go to human |

## How to run one product through the whole system

1. Give the Product Research agent a niche (see `agents/product-research.md`).
   It scores 5 candidates and shortlists the top 3 into `data/products.md`.
2. Pick one shortlisted product. Hand it to Competitor Research
   (`agents/competitor-research.md`) → gaps land in `data/competitors.md`.
3. Hand both files to Store Builder (`agents/store-builder.md`) → brand +
   product page draft lands in `data/brand.md`. **You approve the copy.**
4. Hand the brand brief to Ad Creation (`agents/ad-creation.md`) → 10 concepts
   land in `data/ads.md`. **You approve + produce + launch.**
5. Once the store is live and orders come in, Order Operations
   (`agents/order-operations.md`) tracks them in `data/orders.md`, flagging
   errors. **You approve every supplier order/payment.**
6. Customer Support (`agents/customer-support.md`) drafts replies from
   `data/orders.md` + `data/brand.md` into `data/customers.md`. **You send
   them; refunds/payments/legal/unusual cases are escalated to you.**

## Human approval checkpoints (non-negotiable)

- [ ] You launch ads + set budgets/targeting — AI never spends.
- [ ] You approve placing supplier orders + any payment.
- [ ] You approve refunds + returns.
- [ ] You approve store copy + ads before they go live.
- [ ] You confirm platform, supplier, tax, consumer-law + ad rules for your
      region.

## Error handling

- Stuck order / no tracking → flag + follow up with supplier.
- Out of stock → pause the product, notify affected customers.
- Address mismatch → hold + confirm with customer.
- Supplier delay → proactively message the customer.
- Payment issue → escalate to human, never auto-charge.

## Troubleshooting

- Product won't sell? Most don't — kill fast, test the next. Check the ad,
  then the offer, then the product.
- Good clicks, no sales? Fix the product page/offer.
- Chargebacks/complaints? Shipping too slow — set honest delivery
  expectations.
- Supplier unreliable? Switch suppliers; vet with a test order first.
- Ads rejected? Check the platform's ad policies for your claims.
