import { visibleConnections, stopStream, cameraError } from './vision-core.js';
const kind = document.querySelector('[data-demo]').dataset.demo;
const video = document.querySelector('#video'),
  canvas = document.querySelector('#overlay');
const context = canvas.getContext('2d');
const start = document.querySelector('#start-camera'),
  stop = document.querySelector('#stop-camera');
const status = document.querySelector('#camera-status'),
  summary = document.querySelector('#detection-summary');
const placeholder = document.querySelector('#camera-placeholder');
let stream,
  worker,
  session = 0,
  animation = 0,
  timeout = 0;
let busy = false,
  lastFrame = -1,
  lastTime = 0,
  connections = [];

function stopCamera(message = 'Η κάμερα έκλεισε. Μπορείς να ξεκινήσεις ξανά.') {
  session++;
  cancelAnimationFrame(animation);
  clearTimeout(timeout);
  worker?.terminate();
  worker = undefined;
  stopStream(stream);
  stream = undefined;
  video.pause();
  video.srcObject = null;
  context.clearRect(0, 0, canvas.width, canvas.height);
  busy = false;
  lastFrame = -1;
  lastTime = 0;
  placeholder.hidden = false;
  summary.textContent = '';
  start.disabled = false;
  stop.disabled = true;
  status.textContent = message;
}

function draw(groups) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.strokeStyle = '#f4cb59';
  context.fillStyle = '#fff';
  context.lineWidth = 2;
  for (const points of groups) {
    for (const { start, end } of visibleConnections(points, connections)) {
      context.beginPath();
      context.moveTo(points[start].x * canvas.width, points[start].y * canvas.height);
      context.lineTo(points[end].x * canvas.width, points[end].y * canvas.height);
      context.stroke();
    }
    for (const point of points) {
      if ((point.visibility ?? 1) < 0.6) continue;
      context.beginPath();
      context.arc(point.x * canvas.width, point.y * canvas.height, 2, 0, Math.PI * 2);
      context.fill();
    }
  }
  const text = groups.length
    ? `Εντοπισμένα ${kind === 'face' ? 'πρόσωπα' : kind === 'hand' ? 'χέρια' : 'σώματα'}: ${groups.length}`
    : 'Δεν εντοπίζονται σημεία. Δοκίμασε καλύτερο φωτισμό ή άλλαξε θέση.';
  if (summary.textContent !== text) summary.textContent = text;
  window.dispatchEvent(new CustomEvent('vision:frame', { detail: { kind, groups } }));
}

async function frame(timestamp, current) {
  if (current !== session) return;
  animation = requestAnimationFrame((time) => frame(time, current));
  if (busy || video.readyState < 2 || video.currentTime === lastFrame || timestamp - lastTime < 66)
    return;
  busy = true;
  lastFrame = video.currentTime;
  lastTime = timestamp;
  try {
    const bitmap = await createImageBitmap(video);
    if (current !== session) {
      bitmap.close();
      return;
    }
    timeout = setTimeout(
      () => stopCamera('Η ανάλυση δεν αποκρίνεται. Η κάμερα έκλεισε. Δοκίμασε ξανά.'),
      15000,
    );
    worker.postMessage({ type: 'frame', frame: bitmap, timestamp }, [bitmap]);
  } catch (error) {
    if (current === session) stopCamera(cameraError(error));
  }
}

start.addEventListener('click', async () => {
  if (start.disabled) return;
  const current = ++session;
  start.disabled = true;
  stop.disabled = false;
  status.textContent = 'Περιμένουμε άδεια για την κάμερα. Μπορείς να ακυρώσεις με «Διακοπή».';
  try {
    const acquired = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    });
    if (current !== session) {
      stopStream(acquired);
      return;
    }
    stream = acquired;
    for (const track of stream.getVideoTracks())
      track.addEventListener('ended', () => {
        if (current === session) stopCamera('Η σύνδεση με την κάμερα διακόπηκε. Δοκίμασε ξανά.');
      });
    video.srcObject = stream;
    await video.play();
    if (current !== session) return;
    video.parentElement.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    placeholder.hidden = true;
    status.textContent =
      'Η κάμερα είναι ανοιχτή. Φόρτωση μοντέλου… Μπορείς να διακόψεις όποτε θέλεις.';
    worker = new Worker(new URL('./vision-worker.js', import.meta.url));
    timeout = setTimeout(
      () =>
        stopCamera(
          'Η φόρτωση του μοντέλου άργησε πολύ. Η κάμερα έκλεισε. Έλεγξε τη σύνδεση και δοκίμασε ξανά.',
        ),
      60000,
    );
    worker.onerror = () => {
      if (current === session) stopCamera(cameraError());
    };
    worker.onmessage = ({ data }) => {
      if (current !== session) return;
      clearTimeout(timeout);
      if (data.type === 'ready') {
        connections = data.connections;
        status.textContent = 'Το πείραμα λειτουργεί. Οι εικόνες αναλύονται μόνο στη συσκευή σου.';
        animation = requestAnimationFrame((time) => frame(time, current));
      } else if (data.type === 'result') {
        busy = false;
        draw(data.landmarks);
      } else if (data.type === 'error') stopCamera(cameraError());
    };
    worker.postMessage({ type: 'init', kind });
  } catch (error) {
    if (current === session) stopCamera(cameraError(error));
  }
});
stop.addEventListener('click', () => stopCamera());
window.addEventListener('pagehide', () => stopCamera());
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !stop.disabled)
    stopCamera('Η κάμερα έκλεισε επειδή άλλαξες καρτέλα. Πάτησε «Έναρξη κάμερας» για συνέχεια.');
});
if (
  window.isSecureContext &&
  navigator.mediaDevices?.getUserMedia &&
  window.Worker &&
  window.createImageBitmap &&
  window.OffscreenCanvas
)
  start.disabled = false;
else
  status.textContent =
    'Το πείραμα χρειάζεται σύγχρονο browser και ασφαλή σύνδεση HTTPS (ή localhost). Η θεωρία παραμένει διαθέσιμη.';
