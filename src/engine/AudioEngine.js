class AudioEngine {
    constructor() {
        this.ctx = null;
        this.buffers = {};
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Create audio context on first user interaction to satisfy browser policies
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Standard 1000Hz IPSC start beep
        this.createBeepBuffer('start', 1000, 0.3); // High pitch, 0.3s
        // Slightly lower/longer stop beep
        this.createBeepBuffer('stop', 800, 0.5);

        this.initialized = true;
    }

    createBeepBuffer(name, frequency, duration) {
        if (!this.ctx) return;

        const sampleRate = this.ctx.sampleRate;
        const frameCount = sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < frameCount; i++) {
            const time = i / sampleRate;
            // Generate sine wave
            let sample = Math.sin(2 * Math.PI * frequency * time);

            // Simple envelope to avoid clicks (fade in 10ms, fade out 10ms)
            const fadeTime = 0.01;
            if (time < fadeTime) {
                sample *= (time / fadeTime);
            } else if (time > duration - fadeTime) {
                sample *= ((duration - time) / fadeTime);
            }

            channelData[i] = sample;
        }

        this.buffers[name] = buffer;
    }

    play(name) {
        if (!this.ctx || !this.buffers[name]) {
            console.warn(`AudioContext not initialized or buffer ${name} not found.`);
            return;
        }

        // Resume context if suspended (browser autoplay policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers[name];

        // Add a slight gain node to control volume
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = 1.0;

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.start();
    }

    playStart() {
        this.play('start');
    }

    playStop() {
        this.play('stop');
    }
}

export const audio = new AudioEngine();
