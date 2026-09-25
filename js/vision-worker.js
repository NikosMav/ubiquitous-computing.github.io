// Classic worker: MediaPipe's WASM loader uses importScripts internally.
// Process one transferred frame at a time, away from the UI thread.
let detector, kind;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      kind = data.kind;
      const { FilesetResolver, FaceLandmarker, HandLandmarker, PoseLandmarker } =
        await import('../vendor/vision/vision_bundle.mjs');
      const files = await FilesetResolver.forVisionTasks(
        new URL('../vendor/vision/wasm', self.location.href).href,
      );
      const definitions = {
        face: {
          Class: FaceLandmarker,
          model: 'face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          options: { numFaces: 1 },
          connections: FaceLandmarker.FACE_LANDMARKS_CONTOURS,
        },
        hand: {
          Class: HandLandmarker,
          model: 'hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          options: { numHands: 2 },
          connections: HandLandmarker.HAND_CONNECTIONS,
        },
        pose: {
          Class: PoseLandmarker,
          model: 'pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          options: { numPoses: 1 },
          connections: PoseLandmarker.POSE_CONNECTIONS,
        },
      };
      const definition = definitions[kind];
      if (!definition) throw new Error('Unknown experiment');
      detector = await definition.Class.createFromOptions(files, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/${definition.model}`,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        ...definition.options,
      });
      self.postMessage({ type: 'ready', connections: definition.connections });
    } else if (data.type === 'frame') {
      try {
        const result = detector.detectForVideo(data.frame, data.timestamp);
        self.postMessage({
          type: 'result',
          landmarks: kind === 'face' ? result.faceLandmarks : result.landmarks,
        });
      } finally {
        data.frame.close();
      }
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};
