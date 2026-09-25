// Declare variables for the DOM elements
const video = document.getElementById("video");
const videoContainer = document.getElementById("video-container");
const updateNote = document.getElementById("updatenote");

async function loadModels() {
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.load("./models"),
            faceapi.nets.faceLandmark68Net.load("./models"),
            faceapi.nets.faceRecognitionNet.load('./models'),
            faceapi.nets.faceExpressionNet.load('./models'),
            faceapi.nets.ageGenderNet.load('./models')
        ]);
        startWebcam();
    } catch (error) {
        console.error("Error loading models:", error);
    }
}

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
            };
        })
        .catch(error => console.error("Error accessing webcam:", error));
}

function toggleInstructions() {
    const instructionsDiv = document.getElementById('instructions');
    instructionsDiv.style.display = (instructionsDiv.style.display === 'none') ? 'block' : 'none';
}

function smoothValues(currentValue, newValue, smoothingFactor) {
    return (currentValue * (1 - smoothingFactor)) + (newValue * smoothingFactor);
}

video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    videoContainer.appendChild(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    const maxBufferSize = 10;
    const detectionBuffer = [];
    let smoothedAge = 0;
    let smoothedGender = '';
    let smoothedExpression = '';

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

        updateNote.innerText = "Loaded Models!";
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        if (detections.length > 0) {
            detectionBuffer.push(detections[0]);
            if (detectionBuffer.length > maxBufferSize) {
                detectionBuffer.shift();
            }

            const latestDetection = detectionBuffer[detectionBuffer.length - 1];
            smoothedAge = smoothValues(smoothedAge, latestDetection.age, 0.2);
            smoothedGender = latestDetection.gender;
            smoothedExpression = latestDetection.expressions.asSortedArray()[0].expression;

            const estimationText = [
                `Γένος: ${smoothedGender}`,
                `Ηλικία: ${Math.round(smoothedAge)} χρονών`,
                `Έκφραση: ${smoothedExpression}`
            ];

            estimationText.forEach((text, index) => {
                new faceapi.draw.DrawTextField(
                    [text],
                    { x: 10, y: 30 + (index * 25) }
                ).draw(canvas);
            });
        }
    }, 50);
});

loadModels();
