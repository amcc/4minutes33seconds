let mic, recorder, soundFile;
let mySound;
let state = 0;

let timer = 0;
let startTime = 0;

let darkColour = 200;
let redColour = [255, 0, 0];

let cageLength = 4 * 60 + 33;
let playHead = 0;
let playing = false;
let soundArray = [];
let soundArrayCalculated = false;
let controls;
let playArray = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.mousePressed(canvasPressed);
  background(220);
  textAlign(CENTER, CENTER);

  // create an audio in
  mic = new p5.AudioIn();

  // prompts user to enable their browser mic
  mic.start();

  // create a sound recorder
  recorder = new p5.SoundRecorder();

  // connect the mic to the recorder
  recorder.setInput(mic);

  // this sound file will be used to
  // playback & save the recording
  soundFile = new p5.SoundFile();
  textFont("Space Mono");

  // setup html
  controls = select(".controls");
}

function draw() {
  background(255);
  if (state === 0) {
    textSize(height / 7);
    noStroke();
    text(getTime(), width / 2, height / 2);
  } else if (state === 1) {
    visualiseSound();
    noStroke();
    fill(redColour);
    textSize(height / 7);
    text(getTime(), width / 2, height / 2);

    timer = millis() - startTime;

    // getTime();
  } else if (state === 2) {
    if (soundFile.buffer && !soundArrayCalculated) {
      soundArray = soundFile.getPeaks(width / 2);
      soundArrayCalculated = true;
    }
    if (soundFile.buffer) {
      drawSound();
      // Draw all active playheads
      for (let i = 0; i < playArray.length; i++) {
        if (playArray[i].playing) {
          drawPlayhead(playArray[i]);
        }
      }
    }
    noStroke();
    fill(50);
    textSize(height / 7);
    text(formatTime(timer / 1000), width / 2, height / 2);
  }
}

function canvasPressed() {
  // ensure audio is enabled
  userStartAudio();
  playHead = 0;

  // make sure user enabled the mic
  if (state === 0 && mic.enabled) {
    // record to our p5.SoundFile
    timer = 0;
    playHead = 0;
    playing = false;
    soundArray = [];
    soundArrayCalculated = false;
    startTime = millis();
    recordSound();
    controls.style("display", "none");
    state++;
  } else if (state === 1) {
    // stop recorder and
    // send result to soundFile
    recorder.stop();
    soundArrayCalculated = false;
    controls.style("display", "block");

    state++;
  } else if (state === 2) {
    playArray.push({
      playing: true,
      playHead: 0,
      startTime: millis(),
    });
    soundFile.play(); // play the result!
    // save(soundFile, "mySound.wav");
    // state++;
  }
}

function recordSound() {
  setTimeout(() => {
    recorder.record(soundFile);
  }, 250);
}

function visualiseSound() {
  let vol = mic.getLevel() * height * 4;
  noStroke();
  fill(darkColour);
  // strokeWeight(10)
  // stroke(darkColour)
  // line(0, height-vol, width, height-vol)
  rect(0, height - vol, width, vol);
}

function drawSound() {
  const step = width / soundArray.length;

  stroke(darkColour);
  strokeWeight(1);

  for (let i = 0; i < soundArray.length; i++) {
    let peak = map(soundArray[i], 0, 0.3, 0, height);
    line(i * step, height, i * step, height - peak);
  }
}

function drawPlayhead(playheadObj) {
  // Calculate elapsed time since this playback started
  const elapsedTime = (millis() - playheadObj.startTime) / 1000;
  const duration = soundFile.duration();
  const playbackProgress = elapsedTime / duration;

  // Map that to the canvas width
  playheadObj.playHead = ceil(playbackProgress * width);

  if (playheadObj.playHead >= width) {
    playheadObj.playing = false;
    return;
  }

  strokeWeight(1);
  stroke(redColour);
  line(playheadObj.playHead, 0, playheadObj.playHead, height);
}

function getTime(total = cageLength) {
  const secondsElapsed = floor(timer / 1000);
  const remainingSeconds = total - secondsElapsed;
  return formatTime(remainingSeconds);
}

function download() {
  if (soundFile.buffer) {
    save(soundFile, formatTime(timer / 1000) + ".wav");
  }
}

function formatTime(seconds) {
  const mins = floor(seconds / 60);
  const sec = floor(seconds - mins * 60);
  return mins + "′" + String(sec).padStart(2, "0") + "″";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function reset() {
  state = 0;
  timer = 0;
  playHead = 0;
  playing = false;
  soundArray = [];
  soundArrayCalculated = false;
  startTime = millis();
  recordSound();
  controls.style("display", "none");
  soundFile.stop();
}
