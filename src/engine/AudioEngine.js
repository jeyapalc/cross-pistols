class AudioEngine {
    constructor() {
        this.audioCtx = null;
    }

    init() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playBeep(duration = 0.5, frequency = 1000, type = 'square') {
        this.init();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.value = frequency;

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();

        // Smooth start/stop to avoid clicking
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.5, this.audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.stop(this.audioCtx.currentTime + duration);
    }

    playStart() {
        this.playBeep(0.3, 1500, 'square');
    }

    playStop() {
        this.playBeep(0.7, 800, 'sawtooth');
    }

    // 100% Free native browser text-to-speech API (no tokens)
    speak(text) {
        return new Promise((resolve) => {
            if (!window.speechSynthesis) {
                console.warn("Speech Synthesis not supported in this browser.");
                resolve();
                return;
            }

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Try to find a good authoritative English voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes('en-US') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Microsoft')));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.rate = 1.0; 
            utterance.pitch = 1.0;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve(); // proceed even if it fails

            window.speechSynthesis.speak(utterance);
        });
    }
}

export const audio = new AudioEngine();
