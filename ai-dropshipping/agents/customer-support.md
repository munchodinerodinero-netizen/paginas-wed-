# Agent 6 — Customer Support

## What it does / why

Fast, on-brand reply drafts without living in the inbox.

**Flow:** Inbox → Lookup → Draft reply → Resolve/Escalate → Follow-up

**Tools:** Gmail/helpdesk + `data/brand.md`

## Support log template (per message)

- Question type
- Order #
- Lookup result
- Draft reply
- Resolve or Escalate
- Follow-up date

## Prompt

> For each customer message, identify the type (WISMO, product Q, address
> change, return, refund, damaged, wrong item, delay, FAQ), look up the order
> in `data/orders.md`, and draft a friendly on-brand reply. Resolve simple
> ones; ESCALATE anything involving refunds, payments, legal, or unusual
> cases to me. Drafts only — I send. Never invent order info. Output to
> `data/customers.md`.

## Rules for this agent

- **Drafts only. A human sends every reply.**
- **Always escalate:** refunds, payments, legal questions, unusual/edge
  cases.
- Never invents order status, tracking, or customer history — if it isn't in
  `data/orders.md`, the draft says so and asks the human to confirm rather
  than guessing.

## Example

**Out:** "'Where's my order?' → looked up #1024, shipped, tracking added →
reply drafted. Refund request → ⚠️ escalated."
