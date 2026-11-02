# AUTHORING GUIDE (Spotlight Business Play Story Schema v2)

You are writing a new story for **Spotlight Business Play**, a free 90s-style interactive business adventure game for Windows.
Your output is ONE JSON file, valid against `schema/story.schema.json`, that must pass `npm run validate`.
Read `STORY_FORMAT.md` for exact field names; this guide explains *how to write a good story*.

---

## 1. What the game is

A 90s choose-your-own-adventure gamebook for modern business strategy.
The player steps into the shoes of an executive, founder, turnaround manager, or chief operator.
Arrival cards pop on screen: an urgent memo, phone call, fax, terminal alert, or visitor.
The player reads concise, cinematic prose, examines optional business exhibits (financial tables, bar charts, line graphs, KPI tiles), and makes a decision from up to 4 options (A, B, C, D / keys 1-4).

Selecting a choice transitions **immediately** to the next scene (like turning the page). There is no mid-story feedback modal. Consequence is delivered through the narrative of the subsequent scene.

Target: **Every story is playable in 30+ minutes** (~35-45 minutes).
All outcomes are **deterministic** — authentic business logic decides success or failure.

---

## 2. Win / Lose Architecture

1. **The Heroic Winning Spine**:
   - Exactly ONE chain of sound business decisions leads to the WIN ending (the breakthrough / comeback).
   - Reaching it marks the story as completed and displays a celebration screen with the victory summary and key business takeaways.
   - Shortest winning path must contain:
     * >= 32 scenes
     * >= 20 decisions
     * >= 3,600 words
     * Estimated length >= 30 minutes

2. **Quick-Lose Branches (GAME OVER)**:
   - Every wrong choice branches into a path that hits a LOSE ending within **1 to 4 scenes**.
   - No endless wandering or meaningless branch loops.
   - When hitting a LOSE ending, the game presents a bold "GAME OVER" screen with:
     * Ending title & summary of the collapse
     * REQUIRED `reason` field: clear, concise explanation of the business principle violated (e.g., "Cash ran out before product-market fit was proven", "Giving away exclusivity killed the distribution deal").
     * One button to "Start Over" (resets back to scene 1 with cleared flags).

---

## 3. Style & Tone

- **Tone**: Fast-paced business thriller. Present tense, punchy prose.
- **Narrative length**: Keep scenes between 50 and 180 words. Keep average sentence length under 22 words for readability.
- **Choices**: 1-4 clear choices per decision scene. Choice text should be an imperative action statement (<= 25 words).
- **Realistic scenarios**: Authentic trade-offs: capital allocation, unit economics, channel distribution, board politics, customer obsession, pricing power, intellectual property.
- **Fictional entities**: Use evocative fictional company and character names.

---

## 4. Verification

Before committing:
```bash
npm run validate
```
The validator guarantees schema compliance, reachability, absence of traps, win/lose counts, shortest winning path length, word counts, and reading level guards.
