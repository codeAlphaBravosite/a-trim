document.addEventListener('DOMContentLoaded', () => {
  const audioInput = document.getElementById('audioInput');
  const fileLabel = document.getElementById('fileLabel');
  const processBtn = document.getElementById('processBtn');
  const playBtn = document.getElementById('playBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const audioPlayer = document.getElementById('audioPlayer');
  
  let audioProcessor = new AudioProcessor();
  let currentFile = null;
  let processedBlob = null;

  audioInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      currentFile = file;
      fileLabel.textContent = file.name;
      processBtn.disabled = false;
      audioPlayer.src = URL.createObjectURL(file);
      playBtn.disabled = false;
    }
  });

  processBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    try {
      processBtn.disabled = true;
      processBtn.classList.add('processing');
      
      const minSilence = parseInt(document.getElementById('minSilence').value);
      const threshold = parseInt(document.getElementById('threshold').value);
      const keepSilence = parseInt(document.getElementById('keepSilence').value);
      const crossfade = parseInt(document.getElementById('crossfade').value);

      const audioBuffer = await audioProcessor.loadAudioFile(currentFile);
      processedBlob = await audioProcessor.processSilence(
        audioBuffer,
        minSilence,
        threshold,
        keepSilence,
        crossfade
      );

      audioPlayer.src = URL.createObjectURL(processedBlob);
      downloadBtn.disabled = false;
      
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Error processing audio file');
    } finally {
      processBtn.disabled = false;
      processBtn.classList.remove('processing');
    }
  });

  playBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playBtn.innerHTML = `
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        Pause
      `;
    } else {
      audioPlayer.pause();
      playBtn.innerHTML = `
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Play
      `;
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!processedBlob) return;

    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processed_audio.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Update play button text when audio ends
  audioPlayer.addEventListener('ended', () => {
    playBtn.innerHTML = `
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Play
    `;
  });
});