let video;
let poseNet;
let pose;
let skeleton;

let canvasWidth = 1920;  // Adjust based on canvas size

let n = 120;
let soundFile;
let soundEffects = [];
let bgsoundCollection = [];
let currentBGSound;
let isBGPlaying = false; // Separate flag for background sound
let isEffectPlaying = false; // Separate flag for sound effects

let value = 24;

let colorSchemes;
let currentScheme;

let animationDuration = 60; // Duration to move from start to end

// FLOWER ANIMATION
let animDuration = 60*6; // Duration of the animation in frames
let animProgress = 0; // Progress of the animation
let animDirection = 0.1; // 1 for forward, -1 for backward

//BUBBLES ANIMATION
let bubblesArray1 = [], bubblesArray2 = [], bubblesArray3 = [], bubblesArray4 = [];
let lastReloadTime = 0;
const reloadInterval = 20 * 60; // 20 seconds in 60 FPS

// SMALL WAVES ANIMATION
let phase = 0, moveX = 0, moveY = 0, speed = 0.1; 
let phase2 = 0, moveX2 = 0, moveY2 = 0, speed2 = 0.1; 
let secondPhase = false, secondPhase2 = false;
let startTime; 
const duration = 15 * 60; // Duration of movement in 60 FPS (5 minute)

// FISH ANIMATION
let rotationDuration = 300; // Duration for one full rotation in frames
let pauseDuration = 20*60; // Pause duration in frames (15s at 60 FPS)
let minScale = 0.5; // Minimum scale factor during rotation
let maxScale = 1; // Maximum scale factor during pause

let moveDistance = n / 4; // Distance to move to the right
let totalCycleDuration = rotationDuration * 2 + pauseDuration * 2; // Total duration of the cycle

// SLIDER ANIMATION
let offsetX = 0;  // Current horizontal position
let targetOffsetX = 0;  // Target horizontal position for sliding
let slideDistance = 1920 / 2;  // The distance for each slide (half of 1920)
let slideSpeed = 0.03;  // Speed of sliding transition (adjust as needed)
let lastSlideTime = 0;  // Track the last time we started a slide
let currentPhase = 0;  // Track which phase we're in (0 = waiting, 1 = sliding left 1st time, etc.)

function preload() {
  soundFormats("ogg", "mp3");

  // Preload sound effects
  soundEffects.push(loadSound('SOUNDS_EFFECT/Birds1.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Birds2.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Birds3.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Birds4.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Cicada1.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Cicada2.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Cicada3.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Cicada4.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Insects.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Leaves Rustling.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Waves1.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Waves2.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Waves3.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/Waves4.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/fish1.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/fish2.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/forest.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/forest1.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/forest2.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/glow1.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/glow2.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/leafeffect1.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/ocean1.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/ocean2.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/ocean3.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/ocean4.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/submarine.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/water1.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/water2.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/wind.mp3'));
  soundEffects.push(loadSound('SOUNDS_EFFECT/wind2.mp3'));


  // Preload background sound collection
  bgsoundCollection.push(loadSound('BACKGROUND_SOUNDS/bgsound1.mp3'));
  bgsoundCollection.push(loadSound('BACKGROUND_SOUNDS/bgsound2.mp3'));
  bgsoundCollection.push(loadSound('BACKGROUND_SOUNDS/bgsound3.mp3'));
  bgsoundCollection.push(loadSound('BACKGROUND_SOUNDS/bgsound4.mp3'));
  
}

function setup() {
    let canvas = createCanvas(1920, 1080);
    canvas.parent('interactive-artwork');
  
  // Play random background sound
  playRandomBGSound();

  // Initialize color schemes
  colorSchemes = {
    blue: {
      background: '#000F2C',
      color1: color('#314979'),
      color2: color('#5B85C5'),
      color3: color('#D0E3FA')
    },
    green: {
      background: '#051808',
      color1: color('#1B5B1F'),
      color2: color('#459849'),
      color3: color('#D4F0D6')
    },
    yellow: {
      background: '#0F0F04',
      color1: color('#524D0C'),
      color2: color('#938914'),
      color3: color('#FAEC59')
    }
  };

  setScheme('blue');
  
  lastReloadTime = frameCount; // Initialize the last reload time
  
  // Create bubbles for each box
  createBubbles(60, 20, n, 3 * n, random(1, 4), bubblesArray1); 
  createBubbles(60, 20, n, 3 * n, random(1, 4), bubblesArray2); 
  createBubbles(60, 20, n, 3 * n, random(1, 4), bubblesArray3); 
  createBubbles(60, 20, n, 3 * n, random(1, 4), bubblesArray4);
  
  startTime = frameCount; // Initialize the start time
  
  // CAMERA FUNCTION
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
}

function gotPoses(poses) {
  if (poses.length > 0) {
    // Filter out small or distant people
    let validPoses = filterSmallPeople(poses);
    
    // Select the largest/closest person
    if (validPoses.length > 0) {
      let largestPose = getLargestPerson(validPoses);
      if (largestPose) {
        pose = largestPose;  // Use the largest pose for animations and sounds
        skeleton = validPoses[0].skeleton;  // Assign skeleton from the first valid pose
      }
    } else {
      // No valid people, reset to blue scheme
      setScheme('blue');
      pose = null;  // Clear the pose data
      skeleton = null;  // Clear the skeleton data
    }
  } else {
    // No posTes detected, reset to blue scheme
    setScheme('blue');
    pose = null;  // Clear the pose data
    skeleton = null;  // Clear the skeleton data
  }
}


// Function to filter out small people based on shoulder width
function filterSmallPeople(poses) {
  let minPersonWidth = 100; // Minimum pixel width for detection
  return poses.filter(pose => {
    let leftShoulder = pose.pose.leftShoulder;
    let rightShoulder = pose.pose.rightShoulder;
    if (leftShoulder && rightShoulder) {
      let personWidth = dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y);
      return personWidth >= minPersonWidth;  // Only keep people who are large enough
    }
    return false;
  });
}

// Function to select the largest person based on shoulder width
function getLargestPerson(poses) {
  let largestPose = null;
  let maxArea = 0;
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    let leftShoulder = pose.leftShoulder;
    let rightShoulder = pose.rightShoulder;
    if (leftShoulder && rightShoulder) {
      let width = dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y);
      if (width > maxArea) {
        maxArea = width;
        largestPose = pose;
      }
    }
  }
  return largestPose;
}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  
  // inspired by https://editor.p5js.org/codingtrain/sketches/ULA97pJXR
    if (pose) {
    let blendAmount;

    // Get shoulder x positions
    let leftShoulderX = pose.leftShoulder.x;
    let rightShoulderX = pose.rightShoulder.x;
    let shoulderMidX = (leftShoulderX + rightShoulderX) / 2;

    // First third (green to blue transition) with expanded overlap zone
    if (shoulderMidX < width / 2) {
      blendAmount = easeInOut(map(shoulderMidX, 0, width / 2, 0, 1));
      smoothColorWithEasing('green', 'blue', blendAmount);
    } 
    // Second third (blue to yellow transition)
    else if (shoulderMidX < width) {
      blendAmount = easeInOut(map(shoulderMidX, width / 2, width, 0, 1));
      smoothColorWithEasing('blue', 'yellow', blendAmount);
    }
  }
  
  // PLAY RANDOM SOUNDS EFFECT
  if (pose) {
    // Get shoulder x positions
    let leftShoulderX = pose.leftShoulder.x;
    let rightShoulderX = pose.rightShoulder.x;
    let shoulderMidX = (leftShoulderX + rightShoulderX) / 2;
  if (shoulderMidX.x < width / 3) {
      if (!isEffectPlaying) {
        playRandomSound();  
      }
    } 
    else if (shoulderMidX.x < 2*width/3) {
      if (!isEffectPlaying) {
        playRandomSound(); 
      }
    } else {
    if (!isEffectPlaying) {
      playRandomSound();
    }
  }
  }
  
  background(currentScheme.background);
  sliderAnimation();

  // image(video, 0, 0, width, height);

  // if (pose) {
  //   drawKeypoints();
  //   drawSkeleton();
  // }
    
}

function drawKeypoints() {
  fill(0, 255, 0);
  noStroke();

  // Loop through all keypoints and draw them
  for (let i = 0; i < pose.keypoints.length; i++) {
    let keypoint = pose.keypoints[i];
    if (keypoint.score > 0.2) { // Only draw if the keypoint was detected
      ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
    }
  }
}

// Draw lines between the connected keypoints (skeleton)
function drawSkeleton() {
  stroke(255, 0, 0);
  strokeWeight(2);
  
  // Loop through all skeleton connections and draw them
  for (let i = 0; i < skeleton.length; i++) {
    let partA = skeleton[i][0];
    let partB = skeleton[i][1];
    line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
  }
}

function sliderAnimation(){
  noStroke();
  // Smooth transition between offsetX and targetOffsetX using lerp
  offsetX = lerp(offsetX, targetOffsetX, slideSpeed);

  // Draw the current pattern with the current offset
  push();
  translate(offsetX, 0);  // Apply horizontal offset to simulate sliding
  slider();
  pop();
  
  // SLIDER ANIMATION
  let currentTime = frameCount;  // Get the current frame count
  
  // Slide left two times with pauses
  if (currentPhase === 0 && currentTime - lastSlideTime > 40 * 60) {
    // Phase 0: Initial pause (90 seconds) is over, start the first slide to the left
    currentPhase = 1;
    targetOffsetX -= slideDistance;  // Slide left by 1920/2
    lastSlideTime = currentTime;  // Reset the time
  }
  
  if (currentPhase === 1 && currentTime - lastSlideTime > 30 * 60) {
    // Phase 1: Pause for 90 seconds after the first left slide, then slide left again
    currentPhase = 2;
    targetOffsetX -= slideDistance;  // Slide left by 1920/2 again
    lastSlideTime = currentTime;  // Reset the time for the next phase
  }
  
  if (currentPhase === 2 && currentTime - lastSlideTime > 30 * 60) {
    // Phase 2: Pause for 90 seconds after the second left slide, then start sliding back to the right
    currentPhase = 3;
    targetOffsetX += slideDistance;  // Slide right by 1920/2
    lastSlideTime = currentTime;  // Reset the time
  }
  
  // Slide right two times with pauses
  if (currentPhase === 3 && currentTime - lastSlideTime > 30 * 60) {
    // Phase 3: Pause for 90 seconds after the first right slide, then slide right again
    currentPhase = 4;
    targetOffsetX += slideDistance;  // Slide right by 1920/2 again
    lastSlideTime = currentTime;  // Reset the time for the final pause
  }
  
  if (currentPhase === 4 && currentTime - lastSlideTime > 30 * 60) {
    // Phase 4: Final pause after all slides are done, loop back to the start
    currentPhase = 0;
    lastSlideTime = currentTime;  // Reset the time for the next cycle
  }
    
}

function playRandomBGSound() {
  if (!isBGPlaying) {
    let randomIndex = floor(random(bgsoundCollection.length));
    currentBGSound = bgsoundCollection[randomIndex];
    currentBGSound.play();
    isBGPlaying = true;
    
    currentBGSound.onended(() => {
      isBGPlaying = false;
      playRandomBGSound();
    });
  }
}

function playRandomSound() {
  if (!isEffectPlaying) {
    let randomIndex = floor(random(soundEffects.length));
    let randomSound = soundEffects[randomIndex];
    randomSound.setVolume(0.5);
    randomSound.play();
    isEffectPlaying = true;

    randomSound.onended(() => {
      isEffectPlaying = false;
    });
  }
}

function smoothColorWithEasing(scheme1, scheme2, amount) {
  // Easing function for smooth blending (easeInOutQuad)
  let easedAmount = easeInOutQuad(amount);
  
  // Smooth transition between colors using easedAmount
  currentScheme = {
    background: lerpColor(color(colorSchemes[scheme1].background), color(colorSchemes[scheme2].background), easedAmount),
    color1: lerpColor(colorSchemes[scheme1].color1, colorSchemes[scheme2].color1, easedAmount),
    color2: lerpColor(colorSchemes[scheme1].color2, colorSchemes[scheme2].color2, easedAmount),
    color3: lerpColor(colorSchemes[scheme1].color3, colorSchemes[scheme2].color3, easedAmount)
  };
}

// Easing function (easeInOutQuad) for smooth transitions
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeInOut(t) {
  return t * t * (3 - 2 * t);  // Smooth easing curve
}

function halfBigWave(x, y, color_1, color_2) {
  let currentFrame = frameCount % totalCycleDuration;
  let upAndDown = abs(sin(frameCount * 0.005)) * 24; 

  noStroke();
  fill(color_1);
  rect(x + n, y + n, n);
  rect(x + 3 * n, y + n, n);
  rect(x + 2 * n, y + n, 120, 24);
  rect(x + 2 * n, y + n + 24 + upAndDown, 120, 24);
  rect(x + 2 * n, y + n + 24 * 2 + upAndDown * 2, 120, 24);
  rect(x + 2 * n, y + n + 24 * 3 + upAndDown * 3, 120, 24);
  rect(x + 2 * n, y + n + 24 * 4 + upAndDown * 4, 120, 24);

  fill(color_2);
  
  
  // TRIANGLE ANIMATION
  let bottomLeftX = x;
  let bottomLeftY = y + n;
  
  if (currentFrame < animationDuration) {
    // Moving to (x + n, y + 0)
    bottomLeftX = lerp(x, x + n, currentFrame / animationDuration);
    bottomLeftY = lerp(y + n, y, currentFrame / animationDuration);
  } else if (currentFrame < animationDuration + pauseDuration) {
    // Pause at (x + n, y + 0)
    bottomLeftX = x + n;
    bottomLeftY = y;
  } else if (currentFrame < 2 * animationDuration + pauseDuration) {
    // Moving back to (x, y + n)
    let elapsed = currentFrame - (animationDuration + pauseDuration);
    bottomLeftX = lerp(x + n, x, elapsed / animationDuration);
    bottomLeftY = lerp(y, y + n, elapsed / animationDuration);
  } else {
    // Pause at the original position
    bottomLeftX = x;
    bottomLeftY = y + n;
  }

  // Draw the animated triangle with the updated bottom-left corner
  fill(color_2);
  triangle(x, y, bottomLeftX, bottomLeftY, x + n, y + n);
  
  
  // CENTER TRIANGLES ANIMATION
  let scaleBigWave = 1 - 0.5 * abs(sin(frameCount * 0.005)); // Scales between 0.5 and 1.0

  fill(color_2);
  push();
  translate(x + 5 * n / 2, y + 2.5 * n + upAndDown * 5); // Move to the center of the triangle
  rotate(frameCount * 0.02); // Adjust rotation speed
  scale(scaleBigWave); // Apply scaling
  triangle(-n / 2, -n / 2, n / 2, -n / 2, 0, n / 2); // Draw the triangle centered at (0,0)
  pop();


  arc(x + n, y + 2 * n, 2 * n, 2 * n, radians(270), radians(0));
  arc(x + 4 * n, y + 2 * n, 2 * n, 2 * n, radians(180), radians(270));
  

  let leftAndRight = abs(sin(frameCount * 0.003)) * n;
  rect(x + 4 * n + leftAndRight * 2, y + 2 * n, n);
  rect(x + 5 * n + leftAndRight, y + 2 * n, n);
  rect(x + 6 * n, y + 2 * n, n);

  
// FISH ANIMATION  
  let rotationAngle = 0;
  let scaleFactor = 1;
  
  if (currentFrame < rotationDuration) {
    // Rotating phase
    rotationAngle = map(currentFrame, 0, rotationDuration, 0, HALF_PI);
    scaleFactor = lerp(maxScale, minScale, currentFrame / rotationDuration); // Scale down during rotation
  } else if (currentFrame < rotationDuration + pauseDuration) {
    // First pause phase
    rotationAngle = HALF_PI;
    scaleFactor = minScale; // Maintain small size during the pause
  } else if (currentFrame < 2 * rotationDuration + pauseDuration) {
    // Returning phase
    rotationAngle = map(currentFrame - (rotationDuration + pauseDuration), 0, rotationDuration, HALF_PI, 0);
    scaleFactor = lerp(minScale, maxScale, (currentFrame - (rotationDuration + pauseDuration)) / rotationDuration); // Scale up during return
  } else {
    // Second pause phase
    rotationAngle = 0;
    scaleFactor = maxScale; // Maintain original size during the pause
  }

  push();
  translate(x + 7.5 * n, y + 3.5 * n); // Move to the center of the arc
  rotate(rotationAngle); // Apply rotation
  scale(scaleFactor); // Apply scaling
  arc(n / 2, -n / 2, 2 * n, 2 * n, radians(90), radians(180)); // Draw the arc centered at (0, 0)
  pop();

  
// FISH ANIMATION 2  
  let moveOffset = 0;
  
  // Determine position offset based on current phase
  if (currentFrame < rotationDuration) {
    // Move right
    moveOffset = map(currentFrame, 0, rotationDuration, 0, moveDistance);
  } else if (currentFrame < rotationDuration + pauseDuration) {
    // Stop at the right position
    moveOffset = moveDistance;
  } else if (currentFrame < 2 * rotationDuration + pauseDuration) {
    // Move left
    moveOffset = map(currentFrame - (rotationDuration + pauseDuration), 0, rotationDuration, moveDistance, 0);
  } else {
    // Stop at the original position
    moveOffset = 0;
  }

  // Draw the arc with the calculated position
  fill(color_1); // Set color for the arc
  arc(x + 8 * n + moveOffset, y + 3.5 * n, n / 2, n / 2, radians(90), radians(270));
  

  fill(currentScheme.background);
  arc(x + 5 * n + leftAndRight * 2, y + 2 * n, 2 * n, 2 * n, radians(90), radians(180));
  arc(x + 6 * n + leftAndRight, y + 2 * n, 2 * n, 2 * n, radians(90), radians(180));
  arc(x + 7 * n, y + 2 * n, 2 * n, 2 * n, radians(90), radians(180));
}

function flower(x, y, color_1, color_2) {
  
  // TRIANGLE ANIMATION
  let currentFrame = frameCount % totalCycleDuration;
  let bottomLeftX = x + n;
  let bottomLeftY = y + 2 * n;
  
  if (currentFrame < animationDuration) {
    // Moving to (x, y + n)
    bottomLeftX = lerp(x + n, x, currentFrame / animationDuration);
    bottomLeftY = lerp(y + 2 * n, y + n, currentFrame / animationDuration);
  } else if (currentFrame < animationDuration + pauseDuration) {
    // Pause at (x + n, y + 0)
    bottomLeftX = x;
    bottomLeftY = y + n;
  } else if (currentFrame < 2 * animationDuration + pauseDuration) {
    // Moving back to (x + n, y + 2 * n)
    let elapsed = currentFrame - (animationDuration + pauseDuration);
    bottomLeftX = lerp(x, x + n, elapsed / animationDuration);
    bottomLeftY = lerp(y + n, y + 2 * n, elapsed / animationDuration);
  } else {
    // Pause at the original position
    bottomLeftX = x + n;
    bottomLeftY = y + 2 * n;
  }
  

  fill(color_2);
  arc(x + n, y + n, 2 * n, 2 * n, radians(180), radians(90));   

  push();
  translate(x + n, y + n);
  rotate(frameCount * 0.005);
  fill(color_1);
  arc(0, 0, 2 * n, 2 * n, radians(0), radians(90)); // Right petal
  pop();

  fill(currentScheme.background);
  arc(x + n, y + n, n, n, radians(360), radians(0));
  rect(x + 0, y + n, n);
  fill(color_1);
  
  // Draw the animated triangle with the updated bottom-left corner
  triangle(bottomLeftX, bottomLeftY, x, y + 2*n, x + n, y + n);
}

function smallWave(x, y, color_1, color_2) {
  noStroke();

  // First arc and rectangle (upper left) with movement
  fill(color_1);

  if (!secondPhase) {
    // First phase of movement (left, down, right, stop)
    if (phase === 0) { 
      moveX -= speed;
      if (moveX <= -n/2) {
        phase = 1;
      }
    } else if (phase === 1) {
      // Move down
      moveY += speed;
      if (moveY >= n) {
        phase = 2;
      }
    } else if (phase === 2) {
      // Move right
      moveX += speed;
      if (moveX >= n) { 
        phase = 3; 
      }
    }
  } else {
    // Second phase of movement (left, up, right, stop)
    if (phase === 0) { 
      moveX -= speed;
      if (moveX <= -n/2) {
        phase = 1;
      }
    } else if (phase === 1) {
      // Move up
      moveY -= speed;
      if (moveY <= 0) { 
        phase = 2;
      }
    } else if (phase === 2) {
      // Move right
      moveX += speed;
      if (moveX >= 0) { 
        phase = 3; 
      }
    }
  }

  // Draw the moving arc and rectangle
  arc(x + n + moveX, y + moveY, 2 * n, 2 * n, radians(90), radians(180));
  rect(x + n + moveX, y + moveY, n);
  fill(currentScheme.background);
  arc(x + 2 * n + moveX, y + moveY, 2 * n, 2 * n, radians(90), radians(180));

  // Second arc and rectangle (lower right) movement
  fill(color_2);

  if (!secondPhase2) {
    // First movement phase (right, up, left)
    if (phase2 === 0) { 
      moveX2 += speed2;
      if (moveX2 >= n/2) { // Move right by n pixels
        phase2 = 1;
      }
    } else if (phase2 === 1) {
      moveY2 -= speed2;
      if (moveY2 <= -n) { // Move up by n pixels
        phase2 = 2;
      }
    } else if (phase2 === 2) {
      moveX2 -= speed2;
      if (moveX2 <= -n) { 
        phase2 = 3; 
      }
    }
  } else {
    // Second movement phase after 1 minute (right, down, left)
    if (phase2 === 0) { 
      moveX2 += speed2;
      if (moveX2 >= n/2) {
        phase2 = 1;
      }
    } else if (phase2 === 1) {
      moveY2 += speed2;
      if (moveY2 >= 0) { 
        phase2 = 2;
      }
    } else if (phase2 === 2) {
      moveX2 -= speed2;
      if (moveX2 <= 0) { 
        phase2 = 3;
      }
    }
  }

  // Draw the second moving arc and rectangle
  rect(x + n + moveX2, y + n + moveY2, n);
  arc(x + 2 * n + moveX2, y + 2 * n + moveY2, 2 * n, 2 * n, radians(270), radians(0));
  fill(currentScheme.background);
  arc(x + n + moveX2, y + 2 * n + moveY2, 2 * n, 2 * n, radians(270), radians(0));
}

function drawSmallWaves(x,y) {
  let elapsedTime = frameCount - startTime;

  // Check if 1 minute has passed
  if (elapsedTime > duration) {
    startTime = frameCount; // Reset the start time
    
    secondPhase = !secondPhase;
    secondPhase2 = !secondPhase2;
    
    phase = 0;
    phase2 = 0;
  }

  smallWave(x+8 * n, y-n, currentScheme.color1, currentScheme.color2);
  smallWave(x+7 * n, y+2 * n, currentScheme.color2, currentScheme.color1);
  smallWave(x+6 * n, y+5 * n, currentScheme.color1, currentScheme.color2);
  smallWave(x+5 * n, y+8 * n, currentScheme.color2, currentScheme.color1);
}

function createBubbles(x, y, boxWidth, boxHeight, numBubbles, bubblesArray) {
  bubblesArray.length = 0; // Clear existing bubbles
  for (let i = 0; i < numBubbles; i++) {
    let radius = random(n / 8, n / 3);
    let bubble = {
      x: random(x + radius, x + boxWidth - radius),
      y: random(y + radius, y + boxHeight - radius),
      vx: random(0.1, 0.3), // Random initial x-velocity
      vy: random(0.1, 0.3), // Random initial y-velocity
      radius: radius,
      angle: random(TWO_PI),
      angularVelocity: (0.001,0.005),
    };
    bubblesArray.push(bubble);
  }
}

function drawBubbles(x, y, boxWidth, boxHeight, bubblesArray) {
  noFill();
  rect(x, y, boxWidth, boxHeight); // Draw the box

  for (let bubble of bubblesArray) {
    // Move the bubble
    bubble.x += bubble.vx;
    bubble.y += bubble.vy;

    // Rotate the bubble
    bubble.angle += bubble.angularVelocity;

    // Check for collision with the box walls and reverse velocity
    if (bubble.x - bubble.radius < x) {
      bubble.x = x + bubble.radius;
      bubble.vx *= -1;
    } else if (bubble.x + bubble.radius > x + boxWidth) {
      bubble.x = x + boxWidth - bubble.radius;
      bubble.vx *= -1;
    }

    if (bubble.y - bubble.radius < y) {
      bubble.y = y + bubble.radius;
      bubble.vy *= -1;
    } else if (bubble.y + bubble.radius > y + boxHeight) {
      bubble.y = y + boxHeight - bubble.radius;
      bubble.vy *= -1;
    }

    // Draw the bubble with rotation
    push();
    translate(bubble.x, bubble.y);
    rotate(bubble.angle);
    fill(currentScheme.color1);
    ellipse(0, 0, bubble.radius * 2);
    fill(currentScheme.background);
    ellipse(0, -bubble.radius / 2, bubble.radius); // Highlight effect
    pop();
  }
}

function halfPattern(x, y) {
  let currentTime = frameCount;
  if (currentTime - lastReloadTime > reloadInterval) {
    lastReloadTime = currentTime; // Update last reload time
    createBubbles(60, 20, n, 3 * n, random(1, 4), bubblesArray1); 
    createBubbles(60, 20, n, 3 * n, random(1, 4), bubblesArray2); 
    createBubbles(60, 20, n, 3 * n, random(1, 4), bubblesArray3); 
    createBubbles(60, 20, n, 3 * n, random(1, 4), bubblesArray4);
  }
  drawBubbles(x+n, y, 2 * n, 2 * n, bubblesArray1);
  drawBubbles(x, y+3 * n, 2 * n, 2 * n, bubblesArray2);
  drawBubbles(x-n, y+6 * n, 2 * n, 2 * n, bubblesArray3);
  drawBubbles(x-2*n, y+9 * n, 2 * n, 2 * n, bubblesArray4);

  halfBigWave(x+n, y-2 * n, currentScheme.color3, currentScheme.color2); 
  halfBigWave(x, y+n, currentScheme.color2, currentScheme.color3); 
  halfBigWave(x-n, y+4 * n, currentScheme.color3, currentScheme.color2); 
  halfBigWave(x-2 * n, y+7 * n, currentScheme.color2, currentScheme.color3); 
  halfBigWave(x-3 * n, y+10 * n, currentScheme.color3, currentScheme.color2); 

  flower(x+4 * n, y+n, currentScheme.color2, currentScheme.color1); 
  flower(x+3 * n, y+4 * n, currentScheme.color1, currentScheme.color2); 
  flower(x+2 * n, y+7 * n, currentScheme.color2, currentScheme.color1);
  flower(x+n, y+10 * n, currentScheme.color1, currentScheme.color2);  
}

function slider(){
  halfPattern(0,0);
  push();
  scale(-1, -1);
  translate(-15 * n, -12 * n);
  halfPattern(0,0);
  pop();
  drawSmallWaves(0,0);
  
  push();
    scale(-1, -1);
    translate(-32 * n, -10 * n);
    halfPattern(0,0);
  
    push();
    scale(-1, -1);
    translate(-15 * n, -12 * n);
    halfPattern(0,0);
    pop();
    drawSmallWaves(0,0);
  pop();
}

function setScheme(scheme) {
  currentScheme = colorSchemes[scheme];
}
