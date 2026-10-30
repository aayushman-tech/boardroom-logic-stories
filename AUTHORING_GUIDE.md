# AUTHORING GUIDE (paste this to your AI writer, or follow it yourself)

You are writing a new story for **Boardroom Logic**, a free interactive business reasoning game.
Your output is ONE JSON file, valid against `schema/story.schema.json`, that must pass `npm run validate`.
Read `STORY_FORMAT.md` for exact field names; this guide explains *how to write a good story*.

---

## 1. What the game is

  negotiator... you decide per story). Things **arrive** on screen: an email, a phone call, a memo,
  a chart, a news alert, a visitor, a contract. The player reads, looks at the data, and picks one of
  several options. The story branches — and their **logical reasoning** is scored: arithmetic done right,
  trade-offs recognised, evidence separated from assumption, cause and effect respected, fallacies avoided.

Target: **every story is playable in 30+ minutes** with genuine engagement and meaningful dilemmas.
Outcomes must be **deterministic** - reasoning decides, not luck.

## 2. Hard content rules

- Realistic, plausible business situations. Numbers that **actually add up** (calculate them, check them,
  make wrong options wrong for specific arithmetic reasons).
- Fictional companies and people only. No real companies, brands, humans, or trademarks.
  Avoid even thinly disguised real cases ("You are CEO of a fruit company under an FTC probe...").
  Generic names like "HarboLine Freight", "Nord Pine Labs" are fine.
- No harmful content: no slurs, sexual content, graphic violence, extremism, real-world political
  partisanship, or gambling promotion. Business-against-business (and business-vs-bureaucracy) conflict is good;
  people-vs-people harm is not.
- Never lecture. The player learns by *choosing and seeing consequences*, not by being told they are wrong.
  The `why` field exists precisely so quality judgments are shown once, in the debrief, not mid-story.
- Difficulty mix across stories (easy / medium / hard) and topic mix across the catalogue:
  finance, marketing, operations, hiring, negotiation, strategy, pricing, product, compliance, M&A.
  No two consecutive stories should share the same dominant topic.

## 3. Style

- Business thriller tone. Present tense, concise scene prose. The arrival (email/call/memo) is often where
  the scene's voice lives - an anxious CFO email, a legalistic memo, a sharp one-liner from an ops manager.
- Give characters names, roles, and (in role descriptions) a compact human texture: `"Maya Rao", "CFO",
  "probably the smartest person in the building, and knows it"`.
- End scenes with tension or an open question wherever it fits - the story is a cliffhanger chain,
  but resolutions must follow logically from decisions made.
- Every scene: the player should be able to *reason* their way to a defensible best option, but the wrong
  options must look tempting - motivated by plausible-but-flawed logic (ignoring base rates, sunk cost,
  survivorship bias, anchoring on a confident speaker, confusing correlation with causation,
  ignoring second-order effects, fixed pie assumption, etc).
- Choice text: player actions, imperative, <= ~25 words. Feedback: consequences only, neutral tone, never
  "good choice!" or "bad choice!".

## 4. Planning a branching: spine + branches

Branching stories must be both long enough and well-connected. Structure it like this:

```
s001 ── s002 ── s003 ── s004 ── ... ── s018 ── ... ── s030 ── s031 ── s032-ending
          │        │                   │
          └─ a ── [branch: rejoin at s005]         (2-4 scene branches that rejoin the spine)
```

- A **spine** is the shortest path a careful player might walk. 32+ scenes minimum, 20+ of them decision
  scenes, 3,600+ words on-screen text ON THE SHORTEST PATH (the validator computes this literally - if the
  shortest route has short scenes, the story fails).
- Plan 2-4 side **branches** that rejoin the spine (2-3 scenes each). Branches can skip ahead: if the player
  took a risky path, let them re-enter the spine **later**, with their earlier decision visible as a flag
  (characters remember, options appear/hide via `requireFlags`/`hideIfFlags`).
- Branches are where the story's texture lives: a phone call to the chairman at midnight, a working session
  with a skeptical engineer, a side
  negotiation. They also let the story react to the player's logic.
- Every choice in a decision scene must have a **distinct next** (or at least distinct consequences) -
  two buttons that lead to the same scene with the same effects are a wasted decision.
- End: at least 3 endings (triumph, solid, mixed, failure kinds). A "failure" ending should often be a stat
  fail (`failBelow` triggering `failScene`) - e.g. cash runs out, reputation hits zero.
- Put the scene count and word count in your notes, then **check: shortest path = ?** Use the validator's
  report to confirm, not your gut.

### Longest path logic

The gentlest successful walk (s001→...→s032, always the first option) is a 32-scene, 3600-word, 20-decision journey,
so write fuller scenes on the spine. Branches that require more (and are more interesting) earn more word budget,
so the long path might take 40+ minutes and reward mastery. Make the spine scenes genuinely *writable*:
each carries ~120-200 words of text; on the shortest route every scene still counts.

## 5. Numbers that add up

If options differ by effects, the differences should have visible, checkable causes:

- Exhibits (tables, charts), arrival text, or narration can carry the data the reasoning depends on.
- Never show a chart where the labels contradict the body text.
- Wrong options should be wrong because a player who did the arithmetic or read the evidence carefully could
  compute / prove why. The `why` text of the good option and the `why` on bad options (also you may add `logic`
  to bad options with negative quality!) should cite the *specific evidence*.

## 6. Endings kind guidance

- **triumph**: the player's reasoning chain was mostly correct AND the consequences are visible (company
  survives, trust built, etc). Do not require perfection; require *logical play*.
- **solid**: good judgement, one or two points of weakness, decent outcome.
- **mixed**: some reasoning was shallow or short-sighted; the company limps or splits.
- **failure**: cash runs out, board removes the player, the deal dies, or a catastrophic misread
  (a `failScene` triggering is a natural way to get here).
An ending must be earned; it's a consequence of decisions, not of a hidden dice roll.

## 7. Checklist before you present your story

1. Valid against `schema/story.schema.json` (no additional fields, types right).
2. `id` matches the filename stem and manifest entry; `publishDate` `YYYY-MM-DD`.
3. Every scene reachable from `startScene` (check with the validator's unreachable-scene report).
4. Shortest start→ending path >= 32 scenes, >= 20 decision scenes, >= 3600 words. The validator's report
  shows estimatedMinutes - aim 32+. If below 30, the story is not valid for publication.
5. Every non-ending scene, on EVERY flag-truth-value combination, still has >= 1 visible choice.
6. >= 60% of decision scenes contain a choice with `logic.quality` + non-empty `why` (and ideally mark
   the tempting-but-wrong options too - negative `quality` with `why`).
7. 3+ endings; at least one `failure` and one `triumph`.
8. Numbers in exhibits/arrival/narration consistent; math checked.
9. All fictional entities; no real brands/persons; no harmful or partisan content.
10. `currentEstimatedMinutes >= 30` for the manifest; `debriefTakeaways` 3-6 strings, each a lesson.

If any item fails, the validator will name it. Fix and validate again - don't hand-wave disagreement with
the validator; align your length with its definition.

## 8. Workflow (as the author)

1. Write the JSON to a **staging file** anywhere, e.g. `~/new-story.json`.
2. Commit-side test: `npm run add-story -- ~/new-story.json` fixes everything (validates, hashes, updates
   `index.json` sorted newest-first).
3. The GitHub Action on the repo validates all stories on push. Your story becomes visible to the app as
   soon as `index.json` lands on `main` at the raw.githubusercontent URL the app reads.
4. Never push half-written stories to `main` - the app picks up whatever is on `main` and will surface
   publish-date-eligible, hash-matching, valid stories only. An invalid file is ignored by players but
   still triggers a red CI.

## 9. Vocabulary of the format (quick reference)

Scene: `chapter? title arrival exhibits? narration addNotes? choices? ending?`
Arrival: `type from? subject? body icon?`
Choice: `id text requireFlags? hideIfFlags? requireStats? effects? setFlags? clearFlags? logic? feedback next`
- Conditions: `requireFlags` all-set, `hideIfFlags` any-set, `requireStats.<stat>` one of `gte | lte | gt | lt`
- Effects: numeric deltas per stat id; `setFlags`/`clearFlags` change state
- `logic.quality`: -2..2; `logic.skill`: reasoning skill; `logic.why` debrief-visible explanation
- `feedback`: immediate consequence text (no quality hints!)
- `next`: scene id
Ending: `kind = triumph|solid|mixed|failure`, `title`, `summary`
Stat: `id label start min? max? format = currency|number|percent|rating failBelow? failScene?`

## 10. Example skeleton

```json
{
  "schemaVersion": 1,
  "id": "2030-01-01-my-new-story",
  "title": "...",
  "subtitle": "...",
  "publishDate": "2030-01-01",
  "difficulty": "medium",
  "tags": ["strategy", "pricing"],
  "reasoningSkills": ["opportunity cost", "base rates"],
  "premise": ["...", "..."],
  "characters": [{ "id": "vesna", "name": "Vesna Marin", "role": "COO", "emoji": "🧑‍💻" }],
  "stats": [
    { "id": "cash", "label": "Cash", "start": 50000, "min": 0, "max": null, "format": "currency",
      "failBelow": 0, "failScene": "fail_cash" }
  ],
  "startScene": "s001",
  "scenes": {
    "s001": {
      "chapter": "Day 1",
      "title": "...",
      "arrival": { "type": "email", "from": "vesna", "subject": "...", "body": "..." },
      "narration": "...",
      "exhibits": [{ "type": "kpi", "items": [{ "label": "Churn", "value": "4%" }] }],
      "choices": [
        { "id": "a", "text": "...", "effects": { "cash": -5000 }, "setFlags": ["did_a"],
          "logic": { "quality": 2, "skill": "opportunity cost", "why": "..." },
          "feedback": "...", "next": "s002" },
        { "id": "b", "text": "...", "logic": { "quality": -2, "skill": "sunk cost fallacy", "why": "..." },
          "feedback": "...", "next": "s003" }
      ],
      "ending": null
    }
  },
  "debriefTakeaways": ["...", "...", "..."]
}
```
