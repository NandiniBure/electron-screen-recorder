

const videoElement = document.querySelector('video');
const videoSelectButtons = document.querySelectorAll('.videoSelectBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let screenRecorder;
let webcamRecorder;
let combinedRecorder;

let recordedScreenChunks = [];
let recordedWebcamChunks = [];
let recordedCombinedChunks = [];

let screenStream;
let webcamStream;

let sessionUUID = '';
let stopCount = 0;
console.log('✅ Renderer loaded');

window.addEventListener('DOMContentLoaded', () => {
  if (!window.electronAPI) {
    console.error('❌ electronAPI not available');
    return;
  }

  console.log('✅ electronAPI is available');
});

videoSelectButtons.forEach(btn => btn.addEventListener('click', getVideoSources));

startBtn.onclick = () => {
  if (screenRecorder?.state === 'inactive') screenRecorder.start();
  if (webcamRecorder?.state === 'inactive') webcamRecorder.start();
  if (combinedRecorder?.state === 'inactive') combinedRecorder.start();

  startBtn.disabled = true;
  stopBtn.disabled = false;
  startBtn.classList.add('is-danger');
};

stopBtn.onclick = () => {
  if (screenRecorder?.state === 'recording') screenRecorder.stop();
  if (webcamRecorder?.state === 'recording') webcamRecorder.stop();
  if (combinedRecorder?.state === 'recording') combinedRecorder.stop();

  stopBtn.disabled = true;
  startBtn.disabled = false;
  startBtn.classList.remove('is-danger');
};



async function getVideoSources() {
  console.log("here")
  const inputSources = await window.electronAPI.getSources();
   console.log("here")
  console.log(inputSources);
  const menu = document.createElement('div');
  menu.className = 'source-menu';
  inputSources.forEach(source => {
    const button = document.createElement('button');
    button.textContent = source.name;
    button.onclick = () => {
      menu.remove();
      selectSource(source);
    };
    menu.appendChild(button);
  });

  document.body.appendChild(menu);
}

function generateUUID() {

  console.log("video");

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function selectSource(source) {
  startBtn.disabled = false;

  const includeWebcam = document.getElementById('includeWebcam').checked;

  recordedScreenChunks.length = 0;
  recordedWebcamChunks.length = 0;
  recordedCombinedChunks.length = 0;

  const recordingNameInput = document.getElementById('recordingNameInput');
  const inputName = recordingNameInput?.value?.trim();
  sessionUUID = inputName || generateUUID();
  stopCount = 0;

  const screenConstraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };

  screenStream = await navigator.mediaDevices.getUserMedia(screenConstraints);

  if (includeWebcam) {
    webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  } else {
    webcamStream = null;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const [screenTrack] = screenStream.getVideoTracks();
  const screenSettings = screenTrack.getSettings();

  canvas.width = screenSettings.width || 1280;
  canvas.height = screenSettings.height || 720;

  const screenVideo = document.createElement('video');
  screenVideo.srcObject = screenStream;
  screenVideo.play();

  let webcamVideo;
  if (includeWebcam && webcamStream) {
    webcamVideo = document.createElement('video');
    webcamVideo.srcObject = webcamStream;
    webcamVideo.play();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
    if (includeWebcam && webcamVideo) {
      ctx.drawImage(webcamVideo, canvas.width - 330, canvas.height - 250, 320, 240);
    }
    requestAnimationFrame(drawFrame);
  }
  drawFrame();

  const combinedStream = canvas.captureStream(30);
  videoElement.srcObject = combinedStream;
  videoElement.play();

  screenRecorder = new MediaRecorder(screenStream, { mimeType: 'video/webm; codecs=vp9' });
  screenRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedScreenChunks.push(e.data);
  };
  screenRecorder.onstop = handleRecordingStop;

  if (includeWebcam && webcamStream) {
    webcamRecorder = new MediaRecorder(webcamStream, { mimeType: 'video/webm; codecs=vp9' });
    webcamRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedWebcamChunks.push(e.data);
    };
    webcamRecorder.onstop = handleRecordingStop;
  } else {
    webcamRecorder = null;
  }

  combinedRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp9' });
  combinedRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedCombinedChunks.push(e.data);
  };
  combinedRecorder.onstop = handleRecordingStop;
}

function handleRecordingStop() {
  stopCount++;
  const expectedStops = webcamRecorder ? 3 : 2;

  if (stopCount === expectedStops) {
    saveRecordings();
  }
}

async function saveRecordings() {
  const screenBlob = new Blob(recordedScreenChunks, { type: 'video/webm; codecs=vp9' });
  const combinedBlob = new Blob(recordedCombinedChunks, { type: 'video/webm; codecs=vp9' });

  const screenBuffer = await screenBlob.arrayBuffer();
  const combinedBuffer = await combinedBlob.arrayBuffer();

  window.electronAPI.saveVideo(sessionUUID, `screen.webm`, new Uint8Array(screenBuffer));
  window.electronAPI.saveVideo(sessionUUID, `final.webm`, new Uint8Array(combinedBuffer));

  // ✅ Save webcam separately (if used)
  if (webcamRecorder && recordedWebcamChunks.length > 0) {
    const webcamBlob = new Blob(recordedWebcamChunks, { type: 'video/webm; codecs=vp9' });
    const webcamBuffer = await webcamBlob.arrayBuffer();
    window.electronAPI.saveVideo(sessionUUID, `webcam.webm`, new Uint8Array(webcamBuffer));
  }

  // Show UI
  document.getElementById('recordingCompleteScreen').style.display = 'block';
  document.getElementById('openFolderBtn').onclick = () => {
    window.electronAPI.openFolder();
  };

  recordedScreenChunks.length = 0;
  recordedWebcamChunks.length = 0;
  recordedCombinedChunks.length = 0;
}



