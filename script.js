import { initModelViewer } from './3d-viewer.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all three 3D Product Viewers cleanly (added label image path to the bottle)
    initModelViewer('bottle-container', './glass-bottle.glb', 2.4, 0, './images/bottle-label.png');
    initModelViewer('coke-container', './coke-can.glb', 2.4, 0);
    initModelViewer('keg-container', './beer-keg.glb', 2.2, 0);

    // Audio Toggle Simulation
    const audioToggle = document.getElementById('audio-toggle');
    const audioLabel = document.getElementById('audio-label');
    let audioActive = false;

    if (audioToggle && audioLabel) {
        audioToggle.addEventListener('click', () => {
            audioActive = !audioActive;
            if (audioActive) {
                audioLabel.textContent = '[AUDIO: ON]';
                audioToggle.style.borderColor = 'var(--accent)';
                audioToggle.style.background = 'var(--accent-light)';
            } else {
                audioLabel.textContent = '[AUDIO: OFF]';
                audioToggle.style.borderColor = 'var(--border)';
                audioToggle.style.background = 'var(--surface)';
            }
        });
    }

    // Form Submission Handling
    const allocationForm = document.getElementById('allocation-form');
    if (allocationForm) {
        allocationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('alloc-name').value;
            const email = document.getElementById('alloc-email').value;
            
            // Check if email is missing
            if (!email) {
                alert('CRITICAL ERROR: Secure Dispatch Line (Email) is required for allocation.');
                return;
            }
            
            // Success State UI Update (Runs when email is provided)
            const submitBtn = document.getElementById('allocation-submit-btn');
            submitBtn.textContent = 'TRANSACTION LOGGED // BATCH 01 SECURED';
            submitBtn.style.background = '#2d5a27';
            submitBtn.disabled = true;

            alert(`RESERVATION LOGGED: Thank you, ${name || 'Operator'}. Your allocation request has been queued.`);
            allocationForm.reset();
        });
    }

    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('news-email').value;
            if (!email) {
                alert('CRITICAL ERROR: Email is required to subscribe to the dispatch log.');
                return;
            }
            alert('BROADCAST SUBSCRIBED: You will receive upcoming botanical archive drops and rollout notices.');
            newsletterForm.reset();
        });
    }
});