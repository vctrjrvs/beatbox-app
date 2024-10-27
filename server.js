const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

// Allow cross-origin requests
app.use(cors());

// Serve sound files
app.use('/sounds', express.static(path.join(__dirname, 'sounds')));

// Endpoint to get list of sounds
app.get('/api/sounds', (req, res) => {
  const soundsDir = path.join(__dirname, 'sounds');
  fs.readdir(soundsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read sounds directory' });
    }
    const soundFiles = files.filter(file => file.endsWith('.wav') || file.endsWith('.mp3'));
    res.json(soundFiles);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
