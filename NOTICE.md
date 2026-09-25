# Asset and research notice

The MIT License applies to original source code authored for this project. It does not relicense third-party materials.

## Retained educational media

- `assets/exhibit/Babbage_Difference_Engine-p-500.jpg` and `assets/exhibit/markweiser4-p-500.jpeg` were carried over from the original 2023 educational prototype. They remain subject to their original owners' terms. Precise upstream license attribution was not established by this refresh; do not assume the repository's MIT license permits independent reuse.
- `assets/case-study/` contains screenshots of the historical prototype. Third-party material visible in those screenshots retains its respective rights.
- `assets/exhibit/favicon.svg` is original source artwork from an earlier refresh. It is no longer referenced: every page now uses the original wave favicon set in `favicon/`.

The original `images/`, `fonts/`, `videos/`, `documents/`, `favicon/` and `models/` directories have been restored from `e4c3e53`. They retain their original third-party terms; restoration does not establish new licenses or grant independent reuse rights. Legacy camera helpers/model shards remain in source but are not used by the current experiment pages.

## Shared typography

The 2026 edition uses the story's original typefaces from `fonts/` on every page (Venus Rising, Nasalization, Century Gothic and Morbodoni). They keep their original terms. `Morbodoni-Trial.ttf` is a trial release of that typeface; confirm or replace its license before any commercial or institutional deployment.

## Original presentation runtimes

The Webflow export and its runtime remain intact. The build serves locked copies of jQuery 3.7.1, Typed.js 2.0.9, Splide 4.0.6 and Chart.js 4.3.3 with their MIT license files under `vendor/story/`. GSAP and ScrollTrigger 3.12.2 retain their own distribution notices and GreenSock license; the package README with its license references is also copied there. These dependencies are not relicensed by this repository.

The original Google font loader, pinned Spline viewer/scene and embedded video retain their providers' terms and require external requests.

## Computer vision

The build includes the lockfile-pinned `@mediapipe/tasks-vision` npm package, published by Google under Apache-2.0. The license is included in [assets/licenses/mediapipe-APACHE-2.0.txt](assets/licenses/mediapipe-APACHE-2.0.txt). See the [upstream repository](https://github.com/google-ai-edge/mediapipe).

The application downloads the following versioned models only when a visitor starts a camera experiment:

- `face_landmarker/face_landmarker/float16/1/face_landmarker.task`
- `hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`
- `pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`

These are served from `https://storage.googleapis.com/mediapipe-models/`. Model documentation and applicable terms are provided by Google:

- [Face landmark detection](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker)
- [Hand landmark detection](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)
- [Pose landmark detection](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker)

The educational UI explains model limitations. The demos do not identify people or estimate age, gender or emotion.

## Research context

The evaluation results summarized in the README refer to the original thesis's formative study of 13 participants. They have not been re-measured for the 2026 implementation. The thesis and the original source are the record of the historical prototype.
