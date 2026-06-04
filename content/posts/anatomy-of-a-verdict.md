---
title: "Anatomy of a verdict: scoring app ideas 0–100 with five agents and a scraper"
date: 2026-06-04
tag: AI Systems
summary: How Validatyr turns "is this app idea any good?" into a number you can argue with — grounded in scraped reviews, not model vibes.
cover: /projects/validatyr/flow.png
links:
  - { label: GitHub, url: https://github.com/bhaweshverma50/validatyr }
---

Ask an LLM "is my app idea good?" and it will tell you yes. Enthusiastically. Every
time. That's not validation, that's a mirror.

[Validatyr](https://github.com/bhaweshverma50/validatyr) is my attempt at the opposite:
an app that answers with a **0–100 Opportunity Score** it can defend. I typed *"an app
that dials in your home espresso: snap a photo of the shot, get grind size and dose
corrections using computer vision"* into it while writing this post. Ninety seconds
later: **80/100**, with the advice to go iOS-first because prosumer baristas over-index
on iPhone. Here's the machinery behind that number.

![Idea in, agents working, verdict out](/projects/validatyr/flow.png "The pipeline, live on iOS")

## Grounding before generating

The core design rule: **no agent is allowed to opine until something real has been
scraped.** Before any scoring happens, the backend pulls:

- **Competitor app reviews** — top Play Store + App Store results for the idea's
  category, scraped via `google-play-scraper` and Apple's RSS/iTunes endpoints.
- **Community signal** — Reddit's JSON API, HN via Algolia, ProductHunt GraphQL,
  Twitter/X through Nitter, Dev.to, Lemmy, Google News RSS, Lobsters. Nine sources,
  each a different bias, which is the point.

That corpus — not the model's training data — is what the downstream agents reason
over. It's why the report can say *"users report connectivity failures with the Jura
Z10"* with a source attached, instead of "users value reliability."

![Every claim cites its source](/projects/validatyr/report.png "Loves and hates, each point cited to App Store reviews or Reddit")

## Five agents, one number

The pipeline is a relay, not a committee. Each Gemini agent has a narrow job and a
**Pydantic schema it must satisfy** (structured JSON output — a malformed response is a
retry, not a parse adventure):

1. **Discovery** — find the competitors worth scraping
2. **Community Scanner** — mine the nine sources for demand signals
3. **Researcher** — distill reviews + community noise into loves/hates with citations
4. **Product Manager** — build a Day-1 MVP roadmap that targets the biggest pains
5. **Business Analyst** — score seven dimensions and assemble pricing, TAM/SAM/SOM, GTM

The final number is deliberately boring math, not another LLM call:

```python
weights = {
    "pain_severity": 0.25,
    "market_gap": 0.20,
    "mvp_feasibility": 0.15,
    "competition_density": 0.15,
    "monetization_potential": 0.10,
    "community_demand": 0.10,
    "startup_saturation": 0.05,
}
opportunity_score = round(sum(
    getattr(breakdown, dim) * w for dim, w in weights.items()
))
```

Keeping the aggregation in plain Python means the weighting is **inspectable and
arguable** — you can disagree with `pain_severity: 0.25` in a code review, which is
exactly the kind of argument a scoring product should invite. Letting the model
self-aggregate would bury that decision inside a temperature.

## The pipeline outlives the phone

A 90-second pipeline on mobile means someone will lock their phone mid-run. Validations
are **server-side jobs**: the app streams progress over SSE, and if the stream drops,
it falls back to polling the job. Close the app entirely and the job keeps running —
History pins it with a pulsing indicator, and FCM pushes the verdict when it lands
("*'…home espresso' scored 80/100*").

The unglamorous details that made this reliable:

- SSE with an **automatic poll fallback** — mobile radios kill long connections;
  treating the stream as an optimization, not a requirement, removed a whole class of
  "stuck at 60%" bugs.
- **Scale-to-zero friendly scheduling** — recurring research runs use Cloud Scheduler
  hitting Cloud Run, because an in-process APScheduler dies with the instance it
  lives in.

## What the number is actually for

An 80 doesn't mean "build it." It means: the pain is real (85), the market has a gap
(80), and an MVP is feasible (75) — *according to evidence you can click through*. The
score's job is to force a ranking between your ideas and to surface the receipts. The
deciding stays human.

The app itself is Flutter with an unapologetically neo-brutalist UI — and the whole
thing is open source: [github.com/bhaweshverma50/validatyr](https://github.com/bhaweshverma50/validatyr).
