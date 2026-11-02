# spotlight-business-play-stories

Story content for **[Spotlight Business Play](https://github.com/aayushman-tech/spotlight-business-play-app)** -
a free 90s-style choose-your-path business adventure game for Windows. Every story inside this repository is a JSON file
validated against a strict schema (reachability, length, single winning spine, quick-lose branches, business reasoning coverage) before it becomes
playable in the app.

Services & accounts: none for this repository. No analytics, no tracking, no cookies of any kind.
Data collection: none. The only thing that happens in CI is GitHub Actions validation.

## How the app consumes this repository

1. The app fetches `https://raw.githubusercontent.com/aayushman-tech/spotlight-business-play-stories/main/index.json`.
2. Every manifest entry is verified with its `sha256`.
3. The story file is downloaded, validated against `schema/story.schema.json`, then offered in the stories list
   (newest `publishDate` >= the player's local date).

Publishing new content requires no app update: add a story, push to `main`, and players' apps show it
on the story's `publishDate`.

## Quick start

```bash
npm run validate        # validate everything (index.json + all published stories)
npm run add-story -- path/to/new-story.json   # validate + hash + publish into index.json
```

## Adding a new story

See [AUTHORING_GUIDE.md](AUTHORING_GUIDE.md) and [STORY_FORMAT.md](STORY_FORMAT.md) for the exact contract.

Workflow:

1. Write a story JSON somewhere (e.g. `stories/my-story.json`).
2. `npm run add-story -- stories/my-story.json` - validates, computes the `sha256`,
   sets `estimatedMinutes`, inserts it into `index.json` sorted newest first, then re-validates the repo.
3. Fix everything the validator flags - it refuses to half-publish.
4. Commit + push to `main`. CI validates again. Done - once `publishDate` arrives, every player gets it.

Rules that make this safe:

- A story is playable only on/after its `publishDate` (schedule content ahead freely).
- The app rejects any file whose hash changed without a manifest re-hash.
- Short or malformed stories never reach players.

## Repository layout

```
index.json                 manifest the app reads (Schema v2)
stories/*.json             published stories
schema/story.schema.json   machine-readable contract (v2)
tools/validate.js          full repo validation (CI runs this)
tools/validator-core.js    pure validation logic, single source of truth
tools/add-story.js         publication tool
AUTHORING_GUIDE.md         how to write stories (v2 specification)
STORY_FORMAT.md            exact format + length rules (Schema v2)
.github/workflows/validate.yml  validates on every push/PR
```

## Privacy

No data is collected here. See the app's
[PRIVACY.md](https://github.com/aayushman-tech/spotlight-business-play-app/blob/main/PRIVACY.md) and
the [privacy policy page](https://aayushman-tech.github.io/spotlight-business-play-app/).

## License

Content in this repo is licensed under the MIT license - see LICENSE.
