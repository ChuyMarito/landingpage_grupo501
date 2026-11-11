const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

// Sonido sintetizado localmente con Web Audio API: no requiere archivos externos.
const launchButton = document.getElementById('launchSound');
const soundStatus = document.getElementById('soundStatus');
let audioContext;
launchButton.addEventListener('click', async () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    soundStatus.textContent = 'Tu navegador no permite reproducir este efecto de sonido.';
    return;
  }
  audioContext ||= new AudioContextClass();
  if (audioContext.state === 'suspended') await audioContext.resume();
  const now = audioContext.currentTime;
  const duration = 3.2;
  const master = audioContext.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.32, now + 0.35);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  master.connect(audioContext.destination);

  // Ruido filtrado para un rugido de despegue estilizado, sin audio descargado.
  const bufferSize = Math.floor(audioContext.sampleRate * duration);
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize * 0.55);
  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(180, now);
  filter.frequency.exponentialRampToValueAtTime(950, now + 0.8);
  filter.frequency.exponentialRampToValueAtTime(240, now + duration);
  noise.connect(filter).connect(master);
  noise.start(now);
  noise.stop(now + duration);

  const oscillator = audioContext.createOscillator();
  const toneGain = audioContext.createGain();
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(58, now);
  oscillator.frequency.exponentialRampToValueAtTime(34, now + duration);
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.linearRampToValueAtTime(0.16, now + 0.25);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(toneGain).connect(master);
  oscillator.start(now);
  oscillator.stop(now + duration);

  launchButton.disabled = true;
  launchButton.innerHTML = '<span class="sound-icon">♫</span> Despegando…';
  soundStatus.textContent = '¡Despegue iniciado!';
  window.setTimeout(() => {
    launchButton.disabled = false;
    launchButton.innerHTML = '<span class="sound-icon">♫</span> Escuchar despegue';
    soundStatus.textContent = '¿Listo para otra misión?';
  }, duration * 1000);
});
