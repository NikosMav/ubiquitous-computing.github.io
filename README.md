# Ubiquitous Computing Museum Experience

[![Site checks](https://github.com/NikosMav/ubiquitous-computing.github.io/actions/workflows/checks.yml/badge.svg)](https://github.com/NikosMav/ubiquitous-computing.github.io/actions/workflows/checks.yml)

**An interactive Greek learning exhibit, based on my 2023 bachelor's thesis at NKUA. Refreshed in 2026.**

Explore how computing moved from shared machines to personal devices and into everyday environments. The site combines a readable educational narrative, optional quizzes and three computer-vision experiments that process camera frames on the visitor's device.

[Explore the exhibit](https://nikosmav.github.io/ubiquitous-computing.github.io/) · [Open the laboratory](https://nikosmav.github.io/ubiquitous-computing.github.io/#experiments) · [Read the thesis (PDF)](https://pergamos.lib.uoa.gr/uoa/dl/object/3362706/file.pdf)

## Why this project exists

Ubiquitous computing is broad and often invisible by design. My thesis explored how a museum-oriented digital experience could make it approachable to visitors with different levels of technical knowledge. The work covered research, interaction design, development and formative evaluation over approximately twelve months.

The project was proposed and supervised by Associate Professor Maria Roussou at the NKUA Department of Informatics and Telecommunications. It was designed for potential adoption as a digital extension of the planned [Museum of Informatics and Telecommunications](https://museum.di.uoa.gr/). It is an academic exhibit concept, not a confirmed museum installation.

## Try it

- **Read freely:** thirteen chapters cover computing history, design principles, the thesis's three-wave structure, eight enabling technologies, connected environments and a future scenario. Reading and chapter navigation work without JavaScript.
- **Choose a starting point:** an optional eight-question diagnostic suggests history, principles or applications. The result never hides content. This is deterministic score-based guidance, not a learning recommender.
- **Experiment:** inspect face landmarks, track hands or estimate body pose. Models load only after pressing Start. Stop, cancellation, permission errors, disconnected cameras and background tabs are handled explicitly.
- **Check your understanding:** a seven-question knowledge quiz gives immediate feedback. Download a plain-text result and answer review locally; no email, account or backend is required.

The educational experience is in Greek. The homepage includes an English overview, and this README describes the engineering and research context in English.

## What changed in 2026

| Original prototype                                             | Current implementation                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Desktop Webflow export; mobile maintenance screen              | Responsive semantic HTML and one shared stylesheet                           |
| Mandatory quiz before content appeared                         | Direct chapter access and an optional suggested route                        |
| Webflow, jQuery, animation and chart runtimes on the main page | No JavaScript or external runtime requests on the landing and reading pages  |
| Three independent webcam implementations                       | One shared camera controller and MediaPipe Tasks Vision runtime              |
| Unbounded/overlapping inference loops                          | Worker inference, one frame in flight, capped at 15 fps                      |
| Pose joints filtered before applying connection indices        | Original landmark indices retained when testing visibility                   |
| Age, gender and expression guesses                             | Face geometry only; no identity or demographic inference                     |
| Fixed poll percentages and unfinished EmailJS souvenir         | Misleading poll removed; local quiz-result download                          |
| Committed unused media, fonts and model shards                 | Only referenced illustrations and historical screenshots retained            |
| No automated verification                                      | Unit, link, accessibility and browser journey checks before Pages deployment |

The narrative has been reformatted and selected misleading historical claims corrected. The original theatrical animations, embedded videos and 3D scenes are not reproduced. This edition prioritizes a usable reading experience and functioning experiments. The future scenario remains clearly labeled as a 2023 hypothetical, not a present-day capability claim.

The [pre-refresh repository](https://github.com/NikosMav/ubiquitous-computing.github.io/tree/e4c3e53) preserves the original source, media and prototype. Git history was not rewritten.

## Architecture

```text
Static HTML + shared CSS
  ├── Landing page and reading chapters: no JS required
  ├── Quizzes: JSON question banks + small browser module
  └── Vision lab: camera controller
        └── one ImageBitmap at a time → Web Worker
              └── pinned MediaPipe runtime + versioned model
                    └── normalized landmarks → canvas overlay
```

No application server, framework, database, tracking or persistent storage. The build script copies the site and the locked vision runtime into `dist/`; it does not bundle the site into an application framework. Relative URLs support GitHub Pages project hosting.

### Camera lifecycle and privacy

- Requests video only after an explicit button press; never requests microphone access.
- Downloads the selected model from Google's `mediapipe-models` storage. Model paths use version `1`, not `latest`.
- Uses a locally served, lockfile-pinned `@mediapipe/tasks-vision` runtime. Inference runs in a worker with the CPU delegate, keeping the interface responsive.
- Keeps at most one frame in flight. Skips duplicate video frames and caps submission at 15 fps; this is a ceiling, not a performance guarantee.
- Stops all media tracks and terminates the worker on Stop, navigation, hidden tab, model failure or timeout. A stream arriving after cancellation is immediately stopped.
- Does not record or upload frames. Asset requests still disclose ordinary connection metadata to the hosting providers.

Face and hand experiments show landmarks; the pose experiment uses the lite model and draws connections only between sufficiently visible points. None of the demos authenticates people or provides medical, biometric identity or emotion assessment.

## Run locally

Use Node.js 22 or newer:

```bash
npm ci
npm run build
npm start
```

Open `http://localhost:8000`. Rebuild after editing source files. `dist/`, installed packages and test output are ignored by Git. Serving the source folder directly will not provide the built vision runtime.

## Verification

```bash
npm test
npm run format:check
npm run build
npx playwright install chromium
npm run test:browser
```

The checks cover question-bank integrity, score thresholds, non-mutating sampling, landmark-index preservation, track cleanup, local assets/fragment links, all seven pages at desktop and phone sizes, WCAG A/AA checks through axe, reading without JavaScript, quiz completion/download/retry and camera denial/cancellation.

Browser tests load the real face, hand and pose models and run inference on generated blank video frames, then verify that Stop ends the stream. This validates model integration and lifecycle behavior, **not landmark accuracy on people**. Physical-camera quality across lighting, devices and browsers still needs human testing. Chrome-based desktop and mobile emulation are automated; Safari and Firefox are not certified by this suite.

GitHub Actions builds and tests every push and pull request. A successful run on `main` publishes only `dist/` to GitHub Pages. Failed tests block deployment. No generated output is committed.

## Original formative evaluation

The **2023 prototype**, not this refreshed edition, was evaluated with **13 participants** through a structured questionnaire. Two participants with different technical backgrounds were also observed in person.

Reported outcomes:

- **84.6%** said they felt more knowledgeable about ubiquitous computing.
- **77%** were likely or very likely to recommend the experience.
- Approximately **85%** rated their overall experience positively or very positively.

These are reported perceptions from a small formative study, not a large-scale usability benchmark, measured learning gains or evidence about the 2026 interface.

![The original 2023 desktop prototype](assets/case-study/museum-experience-hero.jpg)

_The original Webflow prototype. The current live site uses the responsive presentation described above._

## Academic reference and reuse

Nikolaos Mavrapidis, _Design and Development of a Web Application for Ubiquitous Computing_, Bachelor's thesis, Department of Informatics and Telecommunications, National and Kapodistrian University of Athens, October 2023.

Original source code is available under the [MIT License](LICENSE.md). Illustrations, historical screenshots and model/runtime dependencies retain their respective terms. See [NOTICE.md](NOTICE.md) for provenance and reuse boundaries.
