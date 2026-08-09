document.addEventListener('DOMContentLoaded', () => {
    // 1. Allocation Form Interaction
    const form = document.getElementById('allocation-form');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('name').value;
            const submitButton = form.querySelector('button');

            submitButton.textContent = 'ALLOCATION SECURED ✓';
            submitButton.style.background = 'var(--accent)';
            submitButton.style.color = 'var(--paper)';
            submitButton.disabled = true;

            console.log(`Allocation registered for: ${nameInput}`);
        });
    }

    // 2. Brand Header Glitch Easter Egg
    console.log("%c[FLAGSHIP BEVERAGE CO.] // SYSTEM ACTIVE", "background: #52733d; color: #f4f0ea; padding: 4px 8px; font-weight: bold;");

    const brandMark = document.querySelector('.brand-mark');
    if (brandMark) {
        brandMark.addEventListener('mouseover', () => {
            brandMark.classList.add('glitch-active');
            setTimeout(() => {
                brandMark.classList.remove('glitch-active');
            }, 300);
        });
    }

    // 3. Ambient Audio Synth & Visual Pulse Toggle
    const soundToggle = document.getElementById('sound-toggle');
    let audioCtx = null;
    let oscillator = null;
    let gainNode = null;
    let isPlaying = false;

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            isPlaying = !isPlaying;

            if (isPlaying) {
                soundToggle.textContent = '[AUDIO: ON]';
                soundToggle.classList.add('active');
                document.body.classList.add('pulse-active');

                try {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    oscillator = audioCtx.createOscillator();
                    gainNode = audioCtx.createGain();

                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(55, audioCtx.currentTime);
                    gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);

                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    oscillator.start();
                } catch (err) {
                    console.log('Web Audio API not fully supported or blocked by browser policy.');
                }

            } else {
                soundToggle.textContent = '[AUDIO: OFF]';
                soundToggle.classList.remove('active');
                document.body.classList.remove('pulse-active');

                if (oscillator) {
                    oscillator.stop();
                    oscillator.disconnect();
                }
                if (audioCtx) {
                    audioCtx.close();
                }
            }
        });
    }
});