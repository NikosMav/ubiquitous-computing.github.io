/**
 * @license
 * Copyright 2019 Victor Dibia.
 * Handtrack.js - A library for prototyping realtime hand tracking using neural networks.
 * Licensed under the MIT License (the "License");
 * Code snippets from the tensorflow coco-ssd example are reused here - https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
 * =============================================================================
 */

import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";

export const version = "0.1.5";

const basePath =
  "https://cdn.jsdelivr.net/npm/handtrackjs@latest/models/webmodel/";
// const basePath = "webmodel/";

const labelMap = {
  1: "open",
  2: "closed",
  3: "pinch",
  4: "point",
  5: "face",
  6: "pointtip",
  7: "pinchtip",
};

const defaultRenderThresholds = {
  open: 0.6,
  closed: 0.6,
  pinch: 0.6,
  point: 0.6,
  face: 0.8,
  pointtip: 0.6,
  pinchtip: 0.6,
};
const defaultParams = {
  flipHorizontal: false,
  outputStride: 16,
  imageScaleFactor: 1,
  maxNumBoxes: 20,
  iouThreshold: 0.2,
  scoreThreshold: 0.6,
  modelType: "ssd320fpnlite", // centernet512fpn,
  modelSize: "small",
  bboxLineWidth: "2",
  fontSize: 17,
  basePath: basePath,
  labelMap: labelMap,
  renderThresholds: null,
};

const modelSizeMap = {
  large: "base",
  medium: "fp16",
  small: "int8",
};
export const colorMap = {
  open: "#374151",
  closed: "#B91C1C",
  pinch: "#F59E0B",
  point: "#10B981",
  face: "#3B82F6",
  pointtip: "#6366F1",
  pinchtip: "#EC4899",
};

// const modelOutputNodes = [
//   // "StatefulPartitionedCall/Postprocessor/Slice",
//   // "StatefulPartitionedCall/Postprocessor/convert_scores",
//   // "StatefulPartitionedCall/Postprocessor/ExpandDims_1",
//   "Identity_4:0",
//   "Identity:0",
// ];

const modelOutputNodes = {
  ssd320fpnlite: [
    "StatefulPartitionedCall/Postprocessor/Slice",
    "StatefulPartitionedCall/Postprocessor/ExpandDims_1",
  ],
  ssd640fpnlite: [
    "StatefulPartitionedCall/Postprocessor/Slice",
    "StatefulPartitionedCall/Postprocessor/ExpandDims_1",
  ],
  centernet512fpn: ["Identity_4:0", "Identity:0", "Identity_2:0"],
};

export async function load(params) {
  let modelParams = Object.assign({}, defaultParams, params);
  // console.log(modelParams)
  const objectDetection = new ObjectDetection(modelParams);
  await objectDetection.load();
  return objectDetection;
}

export function startVideo(video) {
  return new Promise(function (resolve, reject) {
    // Video must have height and width in order to be used as input for NN
    // Aspect ratio of 3/4 is used to support safari browser.

    if (!video) {
      resolve({ status: false, msg: "please provide a valid video element" });
    }

    video.width = video.width || 640;
    video.height = video.width * (video.videoHeight / video.videoWidth); //* (3 / 4);
    video.style.height = "20px";

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
        },
      })
      .then((stream) => {
        window.localStream = stream;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.height = video.width * (video.videoHeight / video.videoWidth); //* (3 / 4);
          video.style.height =
            parseInt(video.style.width) *
              (video.videoHeight / video.videoWidth).toFixed(2) +
            "px";
          video.play();
          resolve({ status: true, msg: "webcam successfully initiated." });
        };
      })
      .catch(function (err) {
        resolve({ status: false, msg: err });
      });
  });
}

export async function stopVideo() {
  if (window.localStream) {
    window.localStream.getTracks().forEach((track) => {
      track.stop();
      return true;
    });
  } else {
    return false;
  }
}

export class ObjectDetection {
  constructor(modelParams) {
    this.modelPath =
      modelParams.basePath +
      modelParams.modelType +
      "/" +
      (modelSizeMap[modelParams.modelSize] || "base") +
      "/model.json ";
    // this.weightPath =
    //   basePath + modelParams.modelType + "/weights_manifest.json";
    this.modelParams = modelParams;
  }

  async load() {
    this.fps = 0;

    this.model = await loadGraphModel(this.modelPath);
    // console.log(this.model.executor._signature);
    // Warmup the model.
    const dummyInput = tf.zeros([1, 300, 300, 3], "int32");
    // this.model.executeAsync(dummyInput).then((result) => {
    //   tf.dispose(result);
    //   tf.dispose(dummyInput);
    // });
    const result = await this.model.executeAsync(
      dummyInput,
      modelOutputNodes[this.modelParams.modelType]
    );
    result.map(async (t) => await t.data());
    result.map(async (t) => t.dispose());
    tf.dispose(dummyInput);
    // console.log(tf.memory());
  }

  async detect(input) {
    let timeBegin = Date.now();
    const [height, width] = getInputTensorDimensions(input);
    const resizedHeight = getValidResolution(
      this.modelParams.imageScaleFactor,
      height,
      this.modelParams.outputStride
    );
    const resizedWidth = getValidResolution(
      this.modelParams.imageScaleFactor,
      width,
      this.modelParams.outputStride
    );

    const batched = tf.tidy(() => {
      const imageTensor = tf.browser.fromPixels(input);
      if (this.modelParams.flipHorizontal) {
        return (
          imageTensor
            //   .transpose([0, 1, 2])
            .reverse(1)
            .resizeBilinear([resizedHeight, resizedWidth])
            .expandDims(0)
            .toInt()
        );
      } else {
        return (
          imageTensor
            //   .transpose([0, 1, 2])
            .resizeBilinear([resizedHeight, resizedWidth])
            .expandDims(0)
            .toInt()
        );
      }
    });
    // const result = await this.model.executeAsync(batched);
    const self = this;

    return this.model
      .executeAsync(batched, modelOutputNodes[this.modelParams.modelType])
      .then(function (result) {
        // clean the webgl tensors
        batched.dispose();

        let predictions = [];

        if (self.modelParams.modelType === "centernet512fpn") {
          const scores = result[0].dataSync();
          const boxes = result[1].arraySync();
          const classes = result[2].dataSync();
          // console.log(boxes[0]);

          // clean the webgl tensors
          tf.dispose(result);

          predictions = self.buildDetectObjectsCenternet(
            width,
            height,
            boxes[0],
            scores,
            classes
          );

          console.log(predictions);
        } else {
          const scores = result[0].dataSync();
          const boxes = result[1].dataSync();

          // clean the webgl tensors
          tf.dispose(result);

          const [maxScores, classes] = calculateMaxScores(
            scores,
            result[0].shape[1],
            result[0].shape[2]
          );

          // console.log(classes.length);
          const prevBackend = tf.getBackend();
          // run post process in cpu
          tf.setBackend("cpu");
          const indexTensor = tf.tidy(() => {
            const boxes2 = tf.tensor2d(boxes, [
              result[1].shape[1],
              result[1].shape[3],
            ]);
            return tf.image.nonMaxSuppression(
              boxes2,
              maxScores,
              self.modelParams.maxNumBoxes, // maxNumBoxes
              self.modelParams.iouThreshold, // iou_threshold
              self.modelParams.scoreThreshold // score_threshold
            );
          });
          const indexes = indexTensor.dataSync();
          indexTensor.dispose();
          // // restore previous backend
          tf.setBackend(prevBackend);

          predictions = self.buildDetectedObjects(
            width,
            height,
            boxes,
            maxScores,
            indexes,
            classes
          );
        }
        let timeEnd = Date.now();
        self.fps = Math.round(1000 / (timeEnd - timeBegin));

        return predictions;
      });
  }

  buildDetectedObjects(width, height, boxes, scores, indexes, classes) {
    const count = indexes.length;
    const objects = [];
    for (let i = 0; i < count; i++) {
      const bbox = [];
      for (let j = 0; j < 4; j++) {
        bbox[j] = boxes[indexes[i] * 4 + j];
      }
      const minY = bbox[0] * height;
      const minX = bbox[1] * width;
      const maxY = bbox[2] * height;
      const maxX = bbox[3] * width;
      bbox[0] = minX;
      bbox[1] = minY;
      bbox[2] = maxX - minX;
      bbox[3] = maxY - minY;
      const detectionClass = Math.round(classes[indexes[i]]) + 1;
      objects.push({
        bbox: bbox,
        class: detectionClass,
        label: this.modelParams.labelMap[detectionClass],
        score: scores[indexes[i]].toFixed(2),
      });
    }
    return objects;
  }

  buildDetectObjectsCenternet(width, height, boxes, scores, classes) {
    const objects = [];
    for (let i = 0; i < scores.length; i++) {
      const bbox = boxes[i];
      const minY = bbox[0] * height;
      const minX = bbox[1] * width;
      const maxY = bbox[2] * height;
      const maxX = bbox[3] * width;
      bbox[0] = minX;
      bbox[1] = minY;
      bbox[2] = maxX - minX;
      bbox[3] = maxY - minY;
      const detectionClass = Math.round(classes[i]) + 1;
      objects.push({
        bbox: bbox,
        class: detectionClass,
        label: this.modelParams.labelMap[detectionClass],
        score: scores[i].toFixed(2),
      });
    }
    return objects.slice(0, 10);
  }

  getFPS() {
    return this.fps;
  }

  setModelParameters(params) {
    this.modelParams = Object.assign({}, this.modelParams, params);
  }

  getModelParameters() {
    return this.modelParams;
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === "undefined") {
      stroke = true;
    }
    if (typeof radius === "undefined") {
      radius = 5;
    }
    if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height
    );
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }

  renderPredictions(predictions, canvas, context, mediasource) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = mediasource.width;
    canvas.height = mediasource.height;
    // console.log("render", mediasource.width, mediasource.height);
    canvas.style.height =
      parseInt(canvas.style.width) *
        (mediasource.height / mediasource.width).toFixed(2) +
      "px";
    // console.log("render", canvas.style.width, canvas.style.height);

    context.save();
    if (this.modelParams.flipHorizontal) {
      context.scale(-1, 1);
      context.translate(-mediasource.width, 0);
    }
    context.drawImage(mediasource, 0, 0, mediasource.width, mediasource.height);
    context.restore();
    context.font = "bold " + this.modelParams.fontSize + "px Arial";

    const renderThresholds = this.modelParams.renderThresholds;
    // console.log('number of detections: ', predictions.length);
    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i];
      // console.log(pred.score, renderThresholds[pred.label]);
      if (!renderThresholds || pred.score > renderThresholds[pred.label]) {
        context.beginPath();
        context.fillStyle = "rgba(255, 255, 255, 0.6)";

        context.fillRect(
          pred.bbox[0] + 1,
          pred.bbox[1] + 1,
          pred.bbox[2] - 1,
          this.modelParams.fontSize * 1.5
        );
        context.lineWidth = this.modelParams.bboxLineWidth;
        // context.rect(...pred.bbox);
        this.roundRect(
          context,
          pred.bbox[0],
          pred.bbox[1],
          pred.bbox[2],
          pred.bbox[3],
          5,
          false,
          true
        );

        // draw a dot at the center of bounding box

        // context.lineWidth = 1;
        context.strokeStyle = colorMap[pred.label];
        context.fillStyle = colorMap[pred.label];

        //draw dot at center of each bounding box
        context.stroke();
        context.beginPath();
        context.arc(
          pred.bbox[0] + pred.bbox[2] / 2,
          pred.bbox[1] + pred.bbox[3] / 2,
          2,
          0,
          2 * Math.PI
        );
        context.fill();

        //draw label in each box
        context.stroke();
        context.fillText(
          pred.score + " | " + pred.label,
          pred.bbox[0] + 5,
          pred.bbox[1] + this.modelParams.fontSize * 1.1
        );
      }
    }

    // FPS background
    context.fillStyle = "rgba(255, 255, 255, 0.6)";

    // context.fillRect(5, 5, 80, 24);
    this.roundRect(
      context,
      10,
      10,
      this.modelParams.fontSize * 4.6,
      this.modelParams.fontSize + 8,
      5,
      true,
      false
    );
    // Write FPS to top left
    // context.stroke();
    context.strokeStyle = "#374151";
    context.fillStyle = "#374151";
    context.font = "bold " + this.modelParams.fontSize + "px Arial";
    context.fillText("FPS: " + this.fps, 18, this.modelParams.fontSize + 12);
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
    }
  }
}

function getValidResolution(imageScaleFactor, inputDimension, outputStride) {
  const evenResolution = inputDimension * imageScaleFactor - 1;
  return evenResolution - (evenResolution % outputStride) + 1;
}

function getInputTensorDimensions(input) {
  return input instanceof tf.Tensor
    ? [input.shape[0], input.shape[1]]
    : [input.height, input.width];
}

function calculateMaxScores(scores, numBoxes, numClasses) {
  const maxes = [];
  const classes = [];
  for (let i = 0; i < numBoxes; i++) {
    let max = Number.MIN_VALUE;
    let index = -1;
    for (let j = 0; j < numClasses; j++) {
      if (scores[i * numClasses + j] > max) {
        max = scores[i * numClasses + j];
        index = j;
      }
    }
    maxes[i] = max;
    classes[i] = index;
  }
  return [maxes, classes];
}
