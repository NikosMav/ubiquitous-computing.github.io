# Ubiquitous Computing: a scrollytelling thesis

[![Site checks](https://github.com/NikosMav/ubiquitous-computing.github.io/actions/workflows/checks.yml/badge.svg)](https://github.com/NikosMav/ubiquitous-computing.github.io/actions/workflows/checks.yml)

**An interactive museum exhibit about ubiquitous computing, created for my 2023 bachelor's thesis at NKUA and completed in 2026.**

The scrollytelling story moves through computing history, the principles of ubiquitous computing, the three waves and a fictional day in a connected future. Around it sit a reading version, a lab with fourteen hands-on experiments, check-in quizzes and a personal learning path with points, levels and badges. It works on desktop and on phones.

[Open the story](https://nikosmav.github.io/ubiquitous-computing.github.io/) · [Lab](https://nikosmav.github.io/ubiquitous-computing.github.io/lab.html) · [My journey](https://nikosmav.github.io/ubiquitous-computing.github.io/journey.html) · [Reading version](https://nikosmav.github.io/ubiquitous-computing.github.io/reading.html) · [Thesis PDF](https://pergamos.lib.uoa.gr/uoa/dl/object/3362706/file.pdf)

## Context and contribution

My thesis explored how a museum-oriented digital experience could introduce ubiquitous computing to visitors with different levels of technical knowledge. I worked on research, interaction design, implementation and formative evaluation over approximately twelve months.

The project was proposed and supervised by Associate Professor Maria Roussou at the NKUA Department of Informatics and Telecommunications. It was designed for potential adoption as a digital extension of the planned [Museum of Informatics and Telecommunications](https://museum.di.uoa.gr/). It is an academic exhibit concept, not a confirmed museum installation.

The presentation and educational content are in Greek. This README provides the engineering and research context in English.

## From prototype to complete exhibit

The 2023 prototype implemented the first wave in depth and presented the second and third waves only indicatively. Chapter 6 of the thesis listed what a complete version should add. The 2026 edition implements that list:

| Thesis future work                  | What the site now has                                                                                                                                                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6.2.1 Mobile version                | A phone and tablet layout for the Webflow story: pinned sequences become linear, text is rescaled, the opening animations keep running. All other pages are responsive.                                                                                                              |
| 6.2.2 Deeper second and third waves | Wave two gains fuller chapters and a lab each for smart homes, cars and clothes. Wave three adds a trends chapter based on section 3.4.3, a lab to weigh them and an epilogue.                                                                                                       |
| 6.2.3 Personalised learning paths   | The diagnostic quiz now leads to an optional profile (interests, preferred learning style). A generated path orders chapters, labs and check-ins to match. Visitors can skip steps and track progress on "Η διαδρομή μου".                                                           |
| 6.2.4 More interactive applications | A lab for every first-wave technology. These include the three proposed in the thesis: a location lab (trilateration and a shortest-route museum map), an NLP chatbot that shows its own analysis, and a wireless range, speed and latency simulator. Every lab has guided missions. |
| 6.2.5 Gamification                  | XP, five levels, fourteen badges, toast notifications, check-in quizzes after each wave, a device-local "station" leaderboard with pseudonyms, and a downloadable certificate that replaces the commemorative email.                                                                 |

The camera experiments also regain the thesis' gesture classification (pointer, fist, open palm, pinch) using landmark geometry, plus pose and face challenges. They still do not infer identity, age, gender or emotion.

## Using the exhibit

- **Story (`index.html`):** scroll through the original scenes. A fixed bar carries the brand, a live breadcrumb (top left, as in the thesis) and the reading progress. Every breadcrumb level links back to its section.
- **Diagnostic quiz:** eight optional questions choose one of the original three routes. An optional profile step then personalises the learning path.
- **Chapters:** each first-wave technology has theory and a hands-on lab that opens in place. Wave-two labs and the future vote load as you reach them.
- **Lab (`lab.html`):** all fourteen experiments, with completion status.
- **My journey (`journey.html`):** level, stats, the personalised path, check-ins, badges, the station leaderboard and the certificate. Progress can be reset.
- **Reading version (`reading.html`):** every chapter as plain text, linked to its scene and lab. Reading works without JavaScript.

Progress, votes and the leaderboard are stored in the browser (`localStorage`) only. Nothing is sent to a server. The polls and the leaderboard therefore count the visitors of one device, which suits a museum kiosk.

## Design system

All pages share one identity derived from the original story: the wave favicon, royal blue `#4150f0`, amber `#fbb454`, a night-sky navy and the story's typefaces (Venus Rising for the wordmark, Nasalization for labels, Century Gothic for text, Morbodoni for display). `css/brand.css` holds the tokens and the shared bar, breadcrumb, menu, footer and toasts.

The head, header and footer of every page are generated from `scripts/shell.js`. After changing navigation or branding, run:

```bash
npm run shell
```

A test fails if any page drifts from the shared blocks.

## Camera experiments

Face landmarks, hand landmarks and body pose use one shared camera controller and a pinned MediaPipe Tasks Vision runtime. The older prototype helpers and model files are retained as source history but are not loaded by the current experiment pages.

- Video access starts only after an explicit button press; microphone access is never requested.
- Inference runs in a worker, with at most one frame in flight and a 15 fps submission ceiling.
- Stop, navigation, hidden tabs, model failures and timeouts release the stream and terminate the worker. Late permission responses after cancellation are also cleaned up.
- Runtime files are served with the site. Versioned models download from Google's `mediapipe-models` storage only after Start.
- Frames are not recorded or uploaded. Asset requests still disclose ordinary connection metadata to their hosting providers.

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

Unit tests cover the question and check-in banks, route boundaries, the progress engine, badges and levels, the personalised path, every lab model (the missions must be winnable and teach the intended lesson), gesture and pose classification, camera cleanup, links, assets and the shared page shell. Browser tests cover the desktop story (disclosures, the seven-scene sequence, the breadcrumb, an in-place lab, all three quiz routes), the phone layout of the story, every subpage at desktop and phone sizes with automated axe checks, the quizzes, no-JavaScript reading and the camera experiments with synthetic frames.

The axe checks do not certify the entire original Webflow presentation. Physical-camera quality and Safari/Firefox behaviour still need human testing.

GitHub Actions verifies every push and pull request. Only a successful run on `main` deploys `dist/` to GitHub Pages.

## Original formative evaluation

The **2023 prototype**, not this edition, was evaluated with **13 participants** through a structured questionnaire. Two participants with different technical backgrounds were also observed in person.

Reported outcomes:

- **84.6%** said they felt more knowledgeable about ubiquitous computing.
- **77%** were likely or very likely to recommend the experience.
- Approximately **85%** rated their overall experience positively or very positively.

These are reported perceptions from a small formative study, not a large-scale usability benchmark, measured learning gains or evidence about the 2026 interface.

![The original 2023 desktop prototype](assets/case-study/museum-experience-hero.jpg)

_The original desktop presentation, restored as the main experience._

## Academic reference and reuse

Nikolaos Mavrapidis, _Design and Development of a Web Application for Ubiquitous Computing_, Bachelor's thesis, Department of Informatics and Telecommunications, National and Kapodistrian University of Athens, October 2023.

Original source code is available under the [MIT License](LICENSE.md). Illustrations, historical screenshots, fonts and model/runtime dependencies retain their respective terms. See [NOTICE.md](NOTICE.md) for provenance and reuse boundaries.
