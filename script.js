import { initModelViewer } from './3d-viewer.js';

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // PERFORMANCE OPTIMIZATION: Lazy Load 3D Model Viewers
    // ----------------------------------------------------
    const viewerConfigs = [
        { containerId: 'bottle-container', modelPath: './glass-bottle.glb', scale: 0.4, yOffset: 0, labelPath: './bottle-label.png' },
        { containerId: 'coke-container', modelPath: './coke-can.glb', scale: 2.4, yOffset: 0 },
        { containerId: 'keg-container', modelPath: './beer-keg.glb', scale: 2.2, yOffset: 0 }
    ];

    const observerOptions = {
        root: null,
        rootMargin: '100px 0px',
        threshold: 0.01
    };

    const viewerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                const configId = container.id;
                
                const config = viewerConfigs.find(c => c.containerId === configId);
                if (config) {
                    if (config.labelPath) {
                        initModelViewer(config.containerId, config.modelPath, config.scale, config.yOffset, config.labelPath);
                    } else {
                        initModelViewer(config.containerId, config.modelPath, config.scale, config.yOffset);
                    }
                }
                observer.unobserve(container);
            }
        });
    }, observerOptions);

    viewerConfigs.forEach(config => {
        const el = document.getElementById(config.containerId);
        if (el) viewerObserver.observe(el);
    });

    // ----------------------------------------------------
    // Audio Toggle Simulation
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // HELPER: Display In-Page Alert Banner
    // ----------------------------------------------------
    const showInPageAlert = (form, message, isError = false) => {
        let feedback = form.querySelector('.form-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'form-feedback';
            form.appendChild(feedback);
        }

        if (isError) {
            // Bright red warning background with dark text/border for high visibility
            feedback.style.cssText = 'margin-top: 12px; padding: 12px; background: #ffcccc; border: 2px solid #990000; color: #990000; font-weight: bold; font-family: monospace; text-transform: uppercase;';
        } else {
            // Bright high-contrast success state (e.g., bright yellow-green or off-white)
            feedback.style.cssText = 'margin-top: 12px; padding: 12px; background: #e2f0d9; border: 2px solid #1e3f1e; color: #1e3f1e; font-weight: bold; font-family: monospace; text-transform: uppercase;';
        }

        feedback.textContent = message;

        if (!isError) {
            setTimeout(() => {
                feedback.remove();
            }, 4000);
        }
    };

    // ----------------------------------------------------
    // ENHANCED FORM SUBMISSION & IN-PAGE FEEDBACK
    // ----------------------------------------------------
    
    // Allocation Form Setup
    const allocationForm = document.getElementById('allocation-form');
    if (allocationForm) {
        allocationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('alloc-email')?.value;
            const name = document.getElementById('alloc-name')?.value;
            
            if (!email) {
                showInPageAlert(allocationForm, 'CRITICAL ERROR: Secure Dispatch Line (Email) is required for allocation.', true);
                return;
            }
            
            const submitBtn = document.getElementById('allocation-submit-btn');
            if (submitBtn) {
                submitBtn.textContent = 'TRANSACTION LOGGED';
                submitBtn.style.background = '#2d5a27';
                submitBtn.disabled = true;
            }

            showInPageAlert(allocationForm, `RESERVATION LOGGED: Thank you, ${name || 'Operator'}. Your request has been queued.`);
            allocationForm.reset();
        });
    }

    // Newsletter Form Setup
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('news-email')?.value;
            
            if (!email) {
                showInPageAlert(newsletterForm, 'CRITICAL ERROR: Email is required to subscribe to the dispatch log.', true);
                return;
            }
            
            showInPageAlert(newsletterForm, 'BROADCAST SUBSCRIBED: You will receive upcoming botanical archive drops.');
            newsletterForm.reset();
        });
    }
});