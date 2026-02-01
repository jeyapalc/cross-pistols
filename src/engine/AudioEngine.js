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
}

export const audio = new AudioEngine();
