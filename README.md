# Ubiquitous Computing: a scrollytelling thesis

[![Site checks](https://github.com/NikosMav/ubiquitous-computing.github.io/actions/workflows/checks.yml/badge.svg)](https://github.com/NikosMav/ubiquitous-computing.github.io/actions/workflows/checks.yml)

**A desktop scrollytelling experience about ubiquitous computing, created for my 2023 bachelor's thesis at NKUA.**

The presentation moves through computing history, the principles of ubiquitous computing, eight enabling technologies and a fictional day in a connected future. The original Webflow scenes, typography, illustrations, videos and scroll transitions are the main experience. An optional plain reading version covers the material without the animated presentation.

[Open the desktop experience](https://nikosmav.github.io/ubiquitous-computing.github.io/) · [Plain reading version](https://nikosmav.github.io/ubiquitous-computing.github.io/guide.html) · [Camera experiments](https://nikosmav.github.io/ubiquitous-computing.github.io/guide.html#experiments) · [Thesis PDF](https://pergamos.lib.uoa.gr/uoa/dl/object/3362706/file.pdf)

## Context and contribution

My thesis explored how a museum-oriented digital experience could introduce ubiquitous computing to visitors with different levels of technical knowledge. I worked on research, interaction design, implementation and formative evaluation over approximately twelve months.

The project was proposed and supervised by Associate Professor Maria Roussou at the NKUA Department of Informatics and Telecommunications. It was designed for potential adoption as a digital extension of the planned [Museum of Informatics and Telecommunications](https://museum.di.uoa.gr/). It is an academic exhibit concept, not a confirmed museum installation.

The presentation and educational content are in Greek. This README provides the engineering and research context in English.

## Using the exhibit

- **Desktop story:** open the main page on a desktop or laptop. Scroll through the original scenes, or use the chapter links. Phone layout is outside the scope of this presentation.
- **Optional diagnostic:** an eight-question quiz suggests one of the original three routes. Questions advance only when you choose Next. You can skip the quiz or restore the entire route after a result.
- **Theory and applications:** eight technology chapters have working disclosure controls. Short exercises accompany the chapters; the computer-vision chapter links to three camera experiments.
- **Plain reading:** `guide.html` and `reading.html` provide a restrained, responsive alternative. Reading and chapter navigation work without JavaScript.
- **Knowledge quiz:** seven questions with feedback and a local result download. No account, email or server is required.

## Restoration and repairs

The 2026 maintenance work restores the original desktop presentation as `index.html`. The earlier reading-oriented replacement is retained at `guide.html`. Original source, fonts, media and model files are present in the repository, and Git history has not been rewritten.

Repairs around the original presentation include:

- Missing image references, duplicate exported IDs and dead navigation links.
- Keyboard-operable theory/application controls with focus and expanded-state updates.
- Optional quiz entry, manual question progression, recoverable question-loading failure and all three score-based routes.
- Guarded GSAP targets, matching GSAP/ScrollTrigger versions and refreshed scene measurements after layout changes.
- Reduced-motion controls and a sequential rendering of the original seven future-scenario scenes.
- A poll clearly labeled as a demonstration with hypothetical percentages; it does not collect visitor votes.
- A plain reading option with shared navigation back to the original presentation.

The Webflow runtime and original desktop layouts remain in use. The story still uses external Google fonts, a version-pinned Spline viewer/scene, and embedded media. These can depend on network availability. The plain reading version avoids those dependencies. The future scenario is a speculative narrative written in 2023.

## Camera experiments

Face landmarks, hand landmarks and body pose use one shared camera controller and a pinned MediaPipe Tasks Vision runtime. The older prototype helpers and model files are retained as source history but are not loaded by the current experiment pages.

- Video access starts only after an explicit button press; microphone access is never requested.
- Inference runs in a worker, with at most one frame in flight and a 15 fps submission ceiling.
- Stop, navigation, hidden tabs, model failures and timeouts release the stream and terminate the worker. Late permission responses after cancellation are also cleaned up.
- Runtime files are served with the site. Versioned models download from Google's `mediapipe-models` storage only after Start.
- Frames are not recorded or uploaded. Asset requests still disclose ordinary connection metadata to their hosting providers.
- The demos show geometry; they do not identify people or infer age, gender or emotion.

## Run and verify

Use Node.js 22 or newer:

```bash
npm ci
npm run build
npm start
```

Open `http://localhost:8000`. Rebuild after editing source. The build copies the static site and locked runtime dependencies into `dist/`. Installed packages, generated output and test reports are ignored by Git.

```bash
npm test
npm run format:check
npm run build
npx playwright install chromium
npm run test:browser
```

Unit and source checks cover question banks, score boundaries, sampling, landmark indices, camera cleanup, links and assets. Desktop browser journeys cover the original story's disclosures, seven-scene scroll sequence, three quiz routes and reduced-motion alternative. The guide, reading, quiz and lab pages are checked at desktop and phone sizes, including automated axe accessibility checks. Those accessibility checks do not certify the entire original Webflow presentation.

Camera integration tests load real models and process synthetic blank video frames, then verify stream cleanup. They do not establish detection accuracy on people. Physical-camera quality and Safari/Firefox behavior still need human testing.

GitHub Actions verifies every push and pull request. Only a successful run on `main` deploys `dist/` to GitHub Pages.

## Original formative evaluation

The **2023 prototype**, not this refreshed edition, was evaluated with **13 participants** through a structured questionnaire. Two participants with different technical backgrounds were also observed in person.

Reported outcomes:

- **84.6%** said they felt more knowledgeable about ubiquitous computing.
- **77%** were likely or very likely to recommend the experience.
- Approximately **85%** rated their overall experience positively or very positively.

These are reported perceptions from a small formative study, not a large-scale usability benchmark, measured learning gains or evidence about the 2026 interface.

![The original 2023 desktop prototype](assets/case-study/museum-experience-hero.jpg)

_The original desktop presentation, restored as the main experience._

## Academic reference and reuse

Nikolaos Mavrapidis, _Design and Development of a Web Application for Ubiquitous Computing_, Bachelor's thesis, Department of Informatics and Telecommunications, National and Kapodistrian University of Athens, October 2023.

Original source code is available under the [MIT License](LICENSE.md). Illustrations, historical screenshots and model/runtime dependencies retain their respective terms. See [NOTICE.md](NOTICE.md) for provenance and reuse boundaries.
