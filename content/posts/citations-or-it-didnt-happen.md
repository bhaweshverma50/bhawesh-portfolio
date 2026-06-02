---
title: "Citations or it didn't happen: grounding RAG answers"
date: 2026-06-02
tag: Systems
summary: A retrieval pipeline that can't point at its sources is just a confident guess.
cover: /posts/citations-cover.svg
links:
  - { label: LinkedIn, url: https://linkedin.com/in/bhaweshverma50 }
---

Most RAG demos answer fluently and cite nothing. That's fine for a demo and
dangerous in production: a fluent answer with no provenance is indistinguishable
from a hallucination until it costs you.

## The shape that works

Three moves turn a chatbot into something you can audit:

1. **Chunk with identity.** Every chunk carries a stable id, a source URI, and a
   span offset — not just text.
2. **Retrieve, then bind.** The generation step receives chunks *and* must emit
   inline markers that map back to those ids.
3. **Verify before you ship the token.** A lightweight pass drops any claim whose
   marker doesn't resolve to retrieved context.

![Retrieval to citation flow](/posts/citations-flow.svg "retrieve → bind → verify")

## Binding answers to sources

The trick is making the model's output structurally checkable:

```ts
type Cited = { text: string; sources: string[] };

function verify(answer: Cited[], retrieved: Set<string>): Cited[] {
  return answer.filter((claim) =>
    claim.sources.length > 0 && claim.sources.every((s) => retrieved.has(s)),
  );
}
```

If a sentence can't name a retrieved chunk, it doesn't get to be in the answer.
Boring, strict, and it's the difference between a toy and a tool.

> Provenance isn't a feature you add later. It's the data model you start with.
