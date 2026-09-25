# Asset and research notice

The MIT License applies to original source code authored for this project. It does not relicense third-party materials.

## Retained educational media

- `assets/exhibit/Babbage_Difference_Engine-p-500.jpg` and `assets/exhibit/markweiser4-p-500.jpeg` were carried over from the original 2023 educational prototype. They remain subject to their original owners' terms. Precise upstream license attribution was not established by this refresh; do not assume the repository's MIT license permits independent reuse.
- `assets/case-study/` contains screenshots of the historical prototype. Third-party material visible in those screenshots retains its respective rights.
- `assets/exhibit/favicon.svg` is original source artwork for the refreshed site.

Unused legacy media and model files were removed from the current tree; the original material remains available in Git history at `e4c3e53`.

## Computer vision

The build includes the lockfile-pinned `@mediapipe/tasks-vision` npm package, published by Google under Apache-2.0. See the [upstream repository and license](https://github.com/google-ai-edge/mediapipe).

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
