// Function to dynamically load sound options
async function loadSoundOptions() {
    try {
      const response = await fetch('http://localhost:3001/api/sounds');
      const soundFiles = await response.json();
  
      const soundSelector = document.getElementById('sound-selector');
      soundFiles.forEach(file => {
        const option = document.createElement('option');
        option.value = `/sounds/${file}`;
        option.textContent = file.split('/').pop();
        soundSelector.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }
  
  // Load sounds on page load
  loadSoundOptions();
  
  const tempoSlider = document.getElementById("tempo");
  const tempoDisplay = document.getElementById("tempo-display");
  
  // Update interval timing and display when tempo changes
  tempoSlider.addEventListener("input", () => {
    // Update the display
    tempoDisplay.textContent = `${tempoSlider.value} BPM`;
  
    // If the sequencer is playing, adjust the interval timing
    if (interval) {
      clearInterval(interval);
      interval = setInterval(playStep, (60000 / tempoSlider.value) / 4);
    }
  });
  

// Function to change the theme
function changeTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("selectedTheme", theme); // Save the theme to localStorage
}

// Add event listeners to theme buttons
document.querySelectorAll("#theme-switcher button").forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.getAttribute("data-theme");
    changeTheme(theme);
  });
});

// Load saved theme from localStorage
const savedTheme = localStorage.getItem("selectedTheme") || "default";
changeTheme(savedTheme);

// Sound data and sequencer settings
const totalPads = 16;
const totalSteps = 16;
let currentStep = 0;
let interval;
let selectedPadIndex = null;
const sounds = Array(totalPads).fill(null);
const steps = Array.from({ length: totalPads }, () =>
  Array(totalSteps).fill(false)
);

// Initialize pad and sequencer grids
const padContainer = document.getElementById("pads");
const sequencerContainer = document.getElementById("sequencer-container");

// Create pads
for (let i = 0; i < totalPads; i++) {
  const pad = document.createElement("button");
  pad.classList.add("pad");
  pad.dataset.index = i;
  pad.textContent = `Pad ${i + 1}`;

  pad.addEventListener("click", () => {
    // Check if this pad is already selected
    if (pad.classList.contains("active")) {
      // Deselect it if it was already selected
      pad.classList.remove("active");
      selectedPadIndex = null;
    } else {
      // Deselect all other pads
      document.querySelectorAll(".pad").forEach(p => p.classList.remove("active"));
      // Select the clicked pad
      pad.classList.add("active");
      selectedPadIndex = i;
    }
  });

  padContainer.appendChild(pad);
}


// Create sequencer grid with labels
for (let row = 0; row < totalPads; row++) {
  const rowContainer = document.createElement("div");
  rowContainer.classList.add("sequencer-row");

  const rowLabel = document.createElement("label");
  rowLabel.textContent = `Pad ${row + 1}`;
  rowContainer.appendChild(rowLabel);

  const sequencerRow = document.createElement("div");
  sequencerRow.classList.add("sequencer");

  for (let col = 0; col < totalSteps; col++) {
    const step = document.createElement("div");
    step.classList.add("step");
    step.dataset.row = row;
    step.dataset.col = col;

    step.addEventListener("click", () => {
      steps[row][col] = !steps[row][col]; // Toggle the step
      step.classList.toggle("active", steps[row][col]);
    });

    sequencerRow.appendChild(step);
  }

  rowContainer.appendChild(sequencerRow);
  sequencerContainer.appendChild(rowContainer);
}

// Play sound associated with the step
function playSound(sound) {
  if (sound) {
    const audio = new Audio(sound);
    audio.play();
  }
}

// Function to play each step in sequence
function playStep() {
  sequencerContainer
    .querySelectorAll(".step")
    .forEach((step) => step.classList.remove("active-step"));

  sounds.forEach((sound, rowIndex) => {
    if (steps[rowIndex][currentStep] && sound) {
      playSound(sound);
      const step = sequencerContainer.querySelector(
        `.step[data-row='${rowIndex}'][data-col='${currentStep}']`
      );
      step.classList.add("active-step");
    }
  });

  currentStep = (currentStep + 1) % totalSteps;
}

// Start/stop playback
document.getElementById("play").addEventListener("click", () => {
  if (!interval) {
    interval = setInterval(
      playStep,
      60000 / document.getElementById("tempo").value / 4
    );
  }
});

document.getElementById("stop").addEventListener("click", () => {
  clearInterval(interval);
  interval = null;
  currentStep = 0;
  sequencerContainer
    .querySelectorAll(".active-step")
    .forEach((step) => step.classList.remove("active-step"));
});

// Load sound to the selected pad
document.getElementById("apply-sound").addEventListener("click", () => {
  if (selectedPadIndex !== null) {
    // Ensure a pad is selected
    const soundFile = document.getElementById("sound-selector").value;
    if (soundFile) {
      sounds[selectedPadIndex] = soundFile;
      const pad = document.querySelector(
        `.pad[data-index='${selectedPadIndex}']`
      );
      pad.textContent = `Pad ${selectedPadIndex + 1} (Loaded)`;

      // Update label for the sequencer row
      const label = sequencerContainer.querySelector(
        `.sequencer-row:nth-child(${selectedPadIndex + 1}) label`
      );
      label.textContent = `Pad ${selectedPadIndex + 1} (${soundFile
        .split("/")
        .pop()})`;
    }
  } else {
    alert("Please select a pad to load the sound.");
  }
});

// Update interval timing when tempo changes
document.getElementById("tempo").addEventListener("input", () => {
  if (interval) {
    clearInterval(interval);
    interval = setInterval(
      playStep,
      60000 / document.getElementById("tempo").value / 4
    );
  }
});
