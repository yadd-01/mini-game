// audio.js - Web Audio API Synthesizer

const AudioSys = {
    ctx: null,
    
    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playTone: function(freq, type, duration, vol=0.1) {
        if(!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    
    playPlaceCard: function() {
        this.init();
        this.playTone(400, 'triangle', 0.1, 0.2);
        setTimeout(() => this.playTone(200, 'square', 0.1, 0.2), 30);
    },
    
    playPass: function() {
        this.init();
        this.playTone(150, 'sawtooth', 0.5, 0.3);
    },
    
    playShuffle: function() {
        this.init();
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    },
    
    playBreak: function() {
        this.init();
        
        // Explosion / shatter sound using noise and multiple oscillators
        const duration = 0.3;
        
        // 1. Noise part (the shatter)
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 800;
        
        const gainNoise = this.ctx.createGain();
        gainNoise.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gainNoise.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(gainNoise);
        gainNoise.connect(this.ctx.destination);
        noise.start();
        
        // 2. Tonal part (the success chime)
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
        
        const gainOsc = this.ctx.createGain();
        gainOsc.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gainOsc.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gainOsc);
        gainOsc.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    
    // --- BACKGROUND MUSIC (Retro 8-bit Arpeggio) ---
    bgmInterval: null,
    isPlayingBGM: false,
    notes: [261.63, 329.63, 392.00, 523.25], // C4, E4, G4, C5 (C Major)
    noteIndex: 0,
    
    toggleBGM: function() {
        if (this.isPlayingBGM) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
    },
    
    startBGM: function() {
        this.init();
        if (this.isPlayingBGM) return;
        this.isPlayingBGM = true;
        
        // Ensure context is resumed before starting interval
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        this.bgmInterval = setInterval(() => {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            
            const freq = this.notes[this.noteIndex];
            // Use 'square' for an 8-bit retro sound that is much more audible than sine
            this.playTone(freq, 'square', 0.15, 0.1); 
            
            this.noteIndex++;
            if (this.noteIndex >= this.notes.length) {
                this.noteIndex = 0;
                
                // Randomly change chord for a bit of song progression
                if (Math.random() < 0.2) {
                    if (this.notes[0] === 261.63) {
                        this.notes = [220.00, 261.63, 329.63, 440.00]; // A Minor
                    } else if (this.notes[0] === 220.00) {
                        this.notes = [349.23, 440.00, 523.25, 698.46]; // F Major
                    } else {
                        this.notes = [261.63, 329.63, 392.00, 523.25]; // C Major
                    }
                }
            }
        }, 200); // 200ms for a faster, more upbeat song
    },
    
    stopBGM: function() {
        this.isPlayingBGM = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
};

window.AudioSys = AudioSys;

// Start BGM explicitly when user interacts, use mousedown to be more reliable
document.addEventListener('mousedown', () => {
    if (window.AudioSys && !window.AudioSys.isPlayingBGM) {
        window.AudioSys.startBGM();
        const btn = document.getElementById('btn-toggle-music');
        if (btn) {
            btn.textContent = 'Music: ON';
            btn.style.color = '#10b981';
        }
    }
}, { once: true });
