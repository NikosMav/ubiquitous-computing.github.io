async function setupCamera() {
  const video = document.getElementById('video');
  try {
      const stream = await navigator.mediaDevices.getUserMedia({ 'audio': false, 'video': true });
      video.srcObject = stream;
      return new Promise((resolve) => {
          video.onloadedmetadata = () => {
              resolve(video);
          };
      });
  } catch (error) {
      console.error("Error accessing the camera:", error);
  }
}

async function loadPoseNet() {
  try {
      const net = await posenet.load();
      document.getElementById("updatenote").innerText = "Loaded Model!";
      return net;
  } catch (error) {
      console.error("Error loading PoseNet:", error);
  }
}

function smoothKeypoints(newKeypoints) {
  for (let i = 0; i < numKeypoints; i++) {
      prevKeypoints[i].x = smoothingFactor * prevKeypoints[i].x + (1 - smoothingFactor) * newKeypoints[i].position.x;
      prevKeypoints[i].y = smoothingFactor * prevKeypoints[i].y + (1 - smoothingFactor) * newKeypoints[i].position.y;
      prevKeypoints[i].score = newKeypoints[i].score;
  }
  return prevKeypoints;
}

function drawKeypoints(keypoints, ctx) {
  keypoints.forEach((keypoint) => {
      const { x, y } = keypoint;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
  });
}

function drawConnections(connections, keypoints, ctx) {
  connections.forEach((connection) => {
      const [startIndex, endIndex] = connection;
      const start = keypoints[startIndex];
      const end = keypoints[endIndex];
      if (start && end) {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 2;
          ctx.stroke();
      }
  });
}

async function detectPose(net, video) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = video.width;
  canvas.height = video.height;

  while (true) {
      const pose = await net.estimateSinglePose(video);
      const smoothedKeypoints = smoothKeypoints(pose.keypoints);
      const filteredKeypoints = smoothedKeypoints.filter((keypoint) => keypoint.score > confidenceThreshold);
      
      ctx.clearRect(0, 0, video.width, video.height);
      drawConnections(poseConnections, filteredKeypoints, ctx);
      drawKeypoints(filteredKeypoints, ctx);
      
      await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

async function main() {
  try {
      const video = await setupCamera();
      const net = await loadPoseNet();
      detectPose(net, video);
  } catch (error) {
      console.error("Error in main function:", error);
  }
}

function toggleInstructions() {
  const instructionsDiv = document.getElementById('instructions');
  instructionsDiv.style.display = (instructionsDiv.style.display === 'none') ? 'block' : 'none';
}

const numKeypoints = 17;
const smoothingFactor = 0.5;
const confidenceThreshold = 0.65;
const prevKeypoints = new Array(numKeypoints).fill(null).map(() => ({ x: 0, y: 0, score: 0 }));
const poseConnections = [
  [5, 7], [7, 9], [6, 8], [8, 10], [11, 13], [13, 15], [12, 14], [14, 16], [5, 6], [11, 12]
];

main();

