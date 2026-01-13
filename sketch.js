let mic, recorder, soundFile;
let mySound;
let state = 0;

let timer = 0;
let startTime = 0;

let darkColour = 230

let cageLength = 4*60+33

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
  textFont("Space Mono")
}

function draw() {
  background(255);
  if (state === 0) {
    textSize(height / 7);
    text(getTime(), width / 2, height / 2);
  } else if (state === 1) {
    fill(255, 0, 0);
    textSize(height / 7);
    text(getTime(), width / 2, height / 2);

    timer = millis() - startTime;
    
    visualiseSound()
    // getTime();
  } else if (state === 2) {
    fill(50)
    textSize(height / 7);
    text(formatTime(timer/1000), width / 2, height / 2);
    if (soundFile.buffer) {
      drawSound();
    }
  }
  
}

function canvasPressed() {
  // ensure audio is enabled
  userStartAudio();

  // make sure user enabled the mic
  if (state === 0 && mic.enabled) {
    // record to our p5.SoundFile
    timer = 0;
    startTime = millis();
    recorder.record(soundFile);
    state++;
  } else if (state === 1) {
    // stop recorder and
    // send result to soundFile
    recorder.stop();

    state++;
  } else if (state === 2) {
    soundFile.play(); // play the result!
    // save(soundFile, 'mySound.wav');
    // state++;
  }
}

function visualiseSound() {
  let vol = mic.getLevel() * height * 4
  noStroke()
  fill(darkColour)
  // strokeWeight(10)
  // stroke(darkColour)
  // line(0, height-vol, width, height-vol)
  rect(0, height-vol, width, vol)
}

function drawSound() {
  const array = soundFile.getPeaks(500);
  // console.log(array);
  
  stroke(darkColour)

  for (let i = 0; i < array.length; i++) {
    let peak = map(array[i], 0, 0.3, 0, height);
    line(i, height, i, height - peak);
  }
}

function getTime(total = cageLength) {
  const secondsElapsed = floor(timer / 1000);
  const remainingSeconds = total - secondsElapsed;
  return formatTime(remainingSeconds)
}

function formatTime(seconds){
  const mins = floor(seconds / 60);
  const sec = floor(seconds - mins * 60);
  return mins + "′" + sec + '″';
}
