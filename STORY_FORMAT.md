# Story Format (schemaVersion 1)

This is the **contract** between the Boardroom Logic app and every story file in this repository.
The app reads `index.json` from `main` branch of this repo, verifies each story's `sha256`,
validates the story against `schema/story.schema.json`, and only then offers it to the player.

Every story must be **pure JSON**. No markdown, no code fences, no trailing commas.
All story text is rendered as **plain text** by the app. Blank lines (`\n\n`) become paragraph breaks.

---

## 1. Manifest: `index.json` (repo root)

```json
{
  "schemaVersion": 1,
  "minAppVersion": "1.0.0",
  "updated": "2026-10-30T09:00:00.000Z",
  "stories": [
    {
      "id": "2026-11-01-the-cashflow-trap",
      "title": "The Cashflow Trap",
      "subtitle": "Your first week as CFO, and the money may already be gone.",
      "publishDate": "2026-11-01",
      "estimatedMinutes": 33,
      "difficulty": "medium",
      "tags": ["cash flow", "pricing"],
      "file": "stories/2026-11-01-the-cashflow-trap.json",
      "sha256": "<hex sha256 of the story file bytes>"
    }
  ]
}
```

Rules:

- `id` **should** equal the file name without extension. `file` is relative to repo root and must point into `stories/`.
- `sha256` is the lowercase hex SHA-256 of the exact story file bytes, as served by GitHub raw. The app ignores a story whose hash does not match.
- `minAppVersion` (manifest-level) is the minimum app release able to play this manifest's newest stories. A story the app can't play is hidden behind an "Update the app" message, never shown broken.
- A story is **playable** only when the player's local date (not UTC) is >= `publishDate`. Schedule stories ahead freely.
- "Today's Story" = the playable story with the **newest `publishDate` that the player has not completed**. If every playable story is completed, Today's Story falls back to the newest playable one.
- All playable stories also appear in the **Archive** list.
- Never edit a published story's bytes casually: changing the file without recomputing `sha256` makes the app reject it. Always re-run `npm run add-story -- stories/<file>.json` (it re-hashes and updates the manifest) or update the hash by hand.
- Keep `updated` current (ISO-8601). Add stories with `npm run add-story`, which maintains the manifest for you.

## 2. Story file: `stories/<id>.json`

```json
{
  "schemaVersion": 1,
  "id": "2026-11-01-the-cashflow-trap",
  "title": "The Cashflow Trap",
  "subtitle": "Your first week as CFO, and the money may already be gone.",
  "publishDate": "2026-11-01",
  "difficulty": "medium",
  "tags": ["cash flow", "pricing"],
  "reasoningSkills": ["opportunity cost", "sunk cost fallacy", "evidence vs assumption"],
  "premise": ["Paragraph 1 - who the player is...", "Paragraph 2 - the situation...", "Paragraph 3 - the goal and the stakes..."],
  "characters": [
    { "id": "maya", "name": "Maya Rao", "role": "CFO, your predecessor's protégé", "emoji": "👩‍💼" }
  ],
  "stats": [
    { "id": "cash", "label": "Cash", "start": 50000, "min": 0, "max": null, "format": "currency",
      "failBelow": 0, "failScene": "fail_cash" },
    { "id": "reputation", "label": "Reputation", "start": 50, "min": 0, "max": 100, "format": "number" }
  ],
  "startScene": "s001",
  "scenes": { "s001": { "..." : "see section 3" } },
  "debriefTakeaways": [
    "A discount that wins volume you cannot deliver is not a win.",
    "Trust compounds faster than cash - spend both carefully."
  ]
}
```

Key points:

- `premise` is an array of 2-4 paragraph strings shown on the intro screen. Tell the player who they are and what winning means.
- `stats` appear in the HUD. `format` is one of `currency | number | percent | rating`.
  - `min`/`max` clamp (use `null` for open ends). `start` is the initial value.
  - `failBelow` + `failScene` are optional: the moment a stat change drops the value below `failBelow`, the story jumps to that fail scene immediately (unless the scene you are in is an ending).
- `debriefTakeaways`: 3-6 general lessons shown at the end. Speak about business reasoning, not this story's specifics.
- `id` must equal the story filename stem and the manifest entry.
- Dates everywhere are `YYYY-MM-DD`.

## 3. Scene object

A scene = one "arrival" (something lands on the player's desk / screen) + narration + optional data exhibits + choices (or an ending).

```json
{
  "chapter": "Day 1 – Monday",
  "title": "A Troubling Email",
  "arrival": {
    "type": "email",
    "from": "maya",
    "subject": "Numbers before the board call",
    "body": "First paragraph.\n\nSecond paragraph.",
    "icon": "✉️"
  },
  "exhibits": [
    { "type": "table", "title": "Quarterly margins", "columns": ["Item", "Q1", "Q2"],
      "rows": [["Sales", "100", "120"], ["Gross margin", "34", "28"]] },
    { "type": "bar_chart", "title": "Shipments by region", "unit": "$k",
      "data": [{ "label": "West", "value": 10 }, { "label": "East", "value": 7 }] },
    { "type": "line_chart", "title": "Monthly churn", "unit": "%",
      "data": [{ "label": "Jan", "value": 3 }, { "label": "Feb", "value": 3.5 }] },
    { "type": "kpi", "title": "Dashboard", "items": [{ "label": "Churn", "value": "4%", "delta": "+1%" }] }
  ],
  "narration": "Story text after the arrival. The player reads this to decide.",
  "addNotes": ["Fact added to the player's Case File when this scene is entered."],
  "choices": [
    {
      "id": "a",
      "text": "Option text the player sees on the big button.",
      "requireFlags": ["board_call_scheduled"],
      "hideIfFlags": ["quit_job"],
      "requireStats": { "cash": { "gte": 1000 } },
      "effects": { "cash": -5000, "reputation": 5 },
      "setFlags": ["took_loan"],
      "clearFlags": [],
      "logic": { "quality": 2, "skill": "opportunity cost",
                 "why": "Only shown in the final debrief - explain the reasoning quality." },
      "feedback": "1-2 sentence immediate consequence shown right after choosing (must NOT hint at quality).",
      "next": "s002"
    }
  ],
  "ending": null
}
```

- `arrival.type` is one of `email | memo | phone_call | chart | news_alert | visitor | chat_message | contract | report`.
  The app renders each type with its own visual (email client UI, phone call UI, letter, news ticker, visitor card...).
- `arrival.from` is either a `characters[].id` or free text. `subject` optional. `icon` optional override emoji.
- `exhibits` are optional data the player must reason about (max 4 per scene). `table` needs `columns`+`rows`,
  `bar_chart`/`line_chart` need `data` (+ optional `unit`), `kpi` needs `items`.
- Pure narrative scenes may have **one** choice with text like `"Continue"` and no `logic`.
- `ending`: `null` on normal scenes (or omitted). On ending scenes set it and omit `choices` entirely:
  `{ "kind": "triumph|solid|mixed|failure", "title": "...", "summary": "..." }`

### Choice semantics

- Conditions: `requireFlags` (ALL must be set), `hideIfFlags` (ANY set hides the option), `requireStats`
  (per-stat condition object with exactly one of `gte | lte | gt | lt`). If a non-ending scene has fewer than
  2 visible choices, add more, don't hide everything.
- `effects` apply after selection: numeric deltas per stat, clamped to `min`/`max`.
- `setFlags`/`clearFlags` mutate story state. Flags are strings (lowercase-with-dashes ids).
- `feedback` is the immediate consequence text shown on the choice confirmation. It must **not** reveal or hint at `logic.quality`.
- `logic.quality` is an integer from **-2 to +2** (-2 flawed / tempting-but-wrong, 0 sloppily defensible, +2 excellent).
  Include `skill` (reasoning skill exercised) and a `why` (30-500 chars) that only appears in the debrief.
- `next` must point to another scene id. No randomness anywhere: the same play leads to the same ending
  for the same choices.

### Fail scenes

If any stat falls below its `failBelow` threshold after applying effects, the story jumps to that stat's `failScene`
instead of `next`. Fail scenes are normal scenes - they are reachable in the graph and usually end the story
(give them an `ending` with kind `"failure"` or a last-chance choice). If a fail scene is itself reached while
another stat is still failing, that is fine; go to `next`/ending normally.

## 4. Scoring

- **Logic Score (0-100)** = 100 × average of `(quality + 2) / 4` across every choice the player made that has `logic`.
  Choices without `logic` don't count.
- Ranks: 0-19 Intern · 20-39 Analyst · 40-59 Manager · 60-74 Director · 75-89 VP · 90-100 CEO.
- Player's completed story is marked, and the **best** Logic Score per story is stored.

## 5. Length rules (enforced by `npm run validate`)

A story is valid for publication only if ALL hold:

1. Every scene is reachable from `startScene` (via `next` edges and stat `failScene` edges); no dead ends
   (non-ending scenes have >= 1 always-visible choice); all `next`/`failScene` ids exist;
   no unknown stat/flag references (flags used in `requireFlags`/`hideIfFlags`/`clearFlags` must be set somewhere).
2. The **shortest path** from `startScene` to any ending has **>= 32 scenes**, of which **>= 20 are decision scenes**
   (2+ choices), and **>= 3,600 words** of on-screen text (narration + arrival body/subject + exhibit text).
3. Computed `estimatedMinutes` = `round(words/200 + decisionScenes*0.75)` is **>= 30**. This value goes into `index.json`.
4. At least 3 distinct endings, including at least one `failure` and at least one `triumph`.
5. Every decision scene has 2-4 choices, and at least 60% of decision scenes include a choice with a `logic`
   rating and a non-empty `why`.
6. `npm run validate -- --allow-short` skips the length rules (2, 3) and relaxes (4, 5) for `examples/demo.json`
   sample stories only. `tools/add-story.js` refuses to add a story to `index.json` that fails the length rules -
   short stories can never ship to players.

## 6. Word counting (exactly what the validator counts)

Words = whitespace-separated tokens from: `narration`, `arrival.body`, `arrival.subject`,
exhibit `title`, table cell strings, chart `data[].label`, kpi `items[].label/value`, `addNotes`.
Everything the player actually reads on screen. `choices[].text` is not counted (player-generated page, not authored prose).
