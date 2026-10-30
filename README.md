# boardroom-logic-stories

Story content for **[Boardroom Logic](https://github.com/aayushman-tech/boardroom-logic-app)** -
a free interactive business reasoning game for Windows. Every story inside this repository is a JSON file
validated against a strict schema (reachability, length, endings, reasoning coverage) before it becomes
playable in the app.

Services & accounts: none for this repository. No analytics, no tracking, no cookies of any kind.
Data collection: none. The only thing that happens in CI is GitHub Actions validation.

## How the app consumes this repository

1. The app fetches `https://raw.githubusercontent.com/aayushman-tech/boardroom-logic-stories/main/index.json`.
2. Every manifest entry is verified with its `sha256`.
3. The story file is downloaded, validated against `schema/story.schema.json`, then offered as **Today's Story**
   (newest `publishDate` >= the player's local date) and in the Archive.

Publishing new content requires no app update: add a story, push to `main`, and player's app shows it
on the story's `publishDate`.

## Quick start

```bash
npm run validate        # validate everything (index.json + all published stories)
npm run validate:demo   # same, allowing short sample stories (examples/demo.json)
npm run add-story -- path/to/new-story.json   # validate + hash + publish into index.json
```

## Adding a new story

See [AUTHORING_GUIDE.md](AUTHORING_GUIDE.md) (a paste-ready prompt for an AI writer) and
[STORY_FORMAT.md](STORY_FORMAT.md) for the exact contract.

Workflow:

1. Write a story JSON somewhere (e.g. `~/my-story.json`).
2. `npm run add-story -- ~/my-story.json` - validates, copies it into `stories/`, computes the `sha256`,
   sets `estimatedMinutes`, inserts it into `index.json` sorted newest first, then re-validates the repo.
3. Fix everything the validator flags - it refuses to half-publish.
4. Commit + push to `main`. CI validates again. Done - once `publishDate` arrives, every player gets it
   as Today's Story.

Rules that make this safe:

- A story is playable only on/after its `publishDate` (schedule content ahead freely).
- The app rejects any file whose hash changed without a manifest re-hash.
- Short or malformed stories never reach players; `--allow-short` exists only for `examples/demo.json`
  and short stories can't be added to `index.json` by the tooling.

## Repository layout

```
index.json                 manifest the app reads
stories/*.json             published stories
schema/story.schema.json   machine-readable contract
tools/validate.js          full repo validation (CI runs this)
tools/validator-core.js    pure validation logic, single source of truth
tools/add-story.js         publication tool
examples/demo.json         ~5-minute sample (bundled with the app for offline first launch)
AUTHORING_GUIDE.md         how to write stories (paste-grade prompt)
STORY_FORMAT.md            exact format + length rules
.github/workflows/validate.yml  validates on every push/PR
```

## Privacy

No data is collected here. See the app's
[PRIVACY.md](https://github.com/aayushman-tech/boardroom-logic-app/blob/main/PRIVACY.md) and
the [privacy policy page](https://aayushman-tech.github.io/boardroom-logic-app/).

## License

Content in this repo is licensed under the MIT license - see LICENSE.
