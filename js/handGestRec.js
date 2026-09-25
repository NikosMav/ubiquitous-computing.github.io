// Improve performance by querying the DOM only once for each element reference
const video = document.getElementById("video");
const canvas = document.getElementById("canvasbox");
const context = canvas.getContext("2d");
const updateNote = document.getElementById("updatenote");
var model;

// Reduce unnecessary properties in modelParams to improve performance
const modelParams = {
  maxNumBoxes: 20,
  iouThreshold: 0.5,
  scoreThreshold: 0.7,
  scoreThresholds: {
    face: 0.9, // Set a higher score threshold for face class
    hand: 0.6, // Set a lower score threshold for hand class
  },
};

// Use async/await instead of the Promise callback
async function startVideo() {
  try {
    const status = await handTrack.startVideo(video); // Use the helper function
    console.log("video started", status);
    if (status) {
      runDetection();
    } else {
      updateNote.innerText = "Please enable video";
    }
  } catch (error) {
    console.error("Error starting video", error);
  }
}

// Use async/await instead of the Promise callback
async function runDetection() {
  try {
    const predictions = await model.detect(video);
    const filteredPredictions = predictions.filter(prediction => prediction.label !== 'face'); // Filter out predictions with label 'face'
    console.log("Filtered Predictions: ", filteredPredictions);
    model.renderPredictions(filteredPredictions, canvas, context, video);
    requestAnimationFrame(runDetection);
    // console.log("Predictions: ", predictions);
    // model.renderPredictions(predictions, canvas, context, video);
    // requestAnimationFrame(runDetection);
  } catch (error) {
    console.error("Error detecting", error);
  }
}

// Load the model.
async function loadModel() {
  try {
    model = await handTrack.load(modelParams);
    console.log(model);
    updateNote.innerText = "Loaded Model!";
    startVideo();
  } catch (error) {
    console.error("Error loading model", error);
  }
}

// JavaScript function to toggle the visibility of the instructions div
function toggleInstructions() {
  const instructionsDiv = document.getElementById('instructions');
  instructionsDiv.style.display = (instructionsDiv.style.display === 'none') ? 'block' : 'none';
}

loadModel();