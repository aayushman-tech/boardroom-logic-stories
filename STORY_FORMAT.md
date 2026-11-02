# Story Format (schemaVersion 2)

This is the **contract** between the Spotlight Business Play app and every story file in this repository.
The app reads `index.json` from `main` branch of this repo, verifies each story's `sha256`,
validates the story against `schema/story.schema.json`, and offers it to the player.

Every story must be **pure JSON**. All story text is rendered as **plain text** by the app. Blank lines (`\n\n`) become paragraph breaks.

---

## 1. Manifest: `index.json` (repo root)

```json
{
  "schemaVersion": 2,
  "minAppVersion": "1.1.0",
  "updated": "2026-11-02T12:00:00.000Z",
  "stories": [
    {
      "id": "garage-to-glory",
      "title": "Garage to Glory",
      "subtitle": "Build a tech titan, survive a board coup, and orchestrate the ultimate comeback.",
      "publishDate": "2026-11-02",
      "estimatedMinutes": 42,
      "tags": ["technology", "strategy", "comeback", "hardware", "leadership"],
      "file": "stories/garage-to-glory.json",
      "sha256": "<hex sha256 of the story file bytes>"
    }
  ]
}
```

Rules:

- `schemaVersion`: strictly `2`.
- `minAppVersion`: strictly `"1.1.0"` or higher.
- `sha256`: lowercase hex SHA-256 of the story file bytes.
- A story is **playable** when player's local date is >= `publishDate`.
- The home screen presents the stories in a vertical numbered list (newest first).

---

## 2. Story File: `stories/<id>.json`

```json
{
  "schemaVersion": 2,
  "minAppVersion": "1.1.0",
  "id": "garage-to-glory",
  "title": "Garage to Glory",
  "subtitle": "Build a tech titan, survive a board coup, and orchestrate the ultimate comeback.",
  "publishDate": "2026-11-02",
  "tags": ["technology", "strategy", "comeback"],
  "premise": [
    "You are a technical founder in 1976 Silicon Valley with a prototype motherboard..."
  ],
  "characters": [
    { "id": "wes", "name": "Wes Ortega", "role": "Co-founder & Engineering Genius", "emoji": "🔧" }
  ],
  "lessons": [
    "Focus means saying no to a hundred tempting ideas to make one thing truly great.",
    "Gross margins matter: selling at cost never scales into a sustainable enterprise.",
    "Product vision and engineering integrity must lead the company, not corporate committees."
  ],
  "startScene": "s001",
  "scenes": {
    "s001": {
      "chapter": "Chapter 1: The Spark",
      "title": "The Blue Glow",
      "arrival": { "type": "memo", "body": "Terrell Byte Shop request." },
      "narration": "Wes adjusts the potentiometer on the circuit board...",
      "choices": [
        { "id": "c001_a", "text": "Start Orchard Computers and manufacture the units ourselves.", "next": "s004" },
        { "id": "c001_b", "text": "Take quick cash and sell the blueprint.", "next": "s002" }
      ]
    },
    "s_win": {
      "chapter": "Epilogue",
      "title": "The Comeback",
      "narration": "You stand under the auditorium spotlight...",
      "choices": [],
      "ending": {
        "kind": "win",
        "title": "The Ultimate Comeback",
        "summary": "You built an enduring enterprise through discipline and vision."
      }
    },
    "s_lose": {
      "chapter": "Epilogue",
      "title": "Sold for Pocket Change",
      "narration": "You cashed out early...",
      "choices": [],
      "ending": {
        "kind": "lose",
        "title": "Sold Your Life's Work",
        "summary": "You sold out before proving product-market fit.",
        "reason": "Equity and long-term ownership are where real enterprise value resides."
      }
    }
  }
}
```

---

## 3. Ending Objects

Every ending scene has `choices: []` and an `ending` object:
- `kind`: `"win"` or `"lose"`.
- `title`: Short punchy outcome title.
- `summary`: Narrative summary of the outcome.
- `reason`: (Required on `"lose"`) Clear business explanation of why the decision failed.
