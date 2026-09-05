import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useWebAudioMask — High-Fidelity Synthesized Audio Engine
 * Provides 100% client-side synthesized relaxing frequencies:
 * 1. 432 Hz Solfeggio / Theta Binaural Carrier Tone
 * 2. Pink Noise (Equal energy per octave for focus & stress reduction)
 * 3. Brown Noise (Deep rumbling waterfall mask for panic de-escalation)
 * 4. Monsoon Rain (Algorithmic ambient resonance)
 */
export const useWebAudioMask = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState('432hz'); // '432hz' | 'pink' | 'brown' | 'monsoon'
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const activeNodesRef = useRef([]);

  // Initialize or resume AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, [volume]);

  // Clean up active sound nodes
  const stopCurrentNodes = useCallback(() => {
    activeNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {
        // Node already terminated
      }
    });
    activeNodesRef.current = [];
  }, []);

  // 1. Synthesize 432 Hz Binaural Healing Tone
  const play432HzTone = useCallback((ctx, destination) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const subOsc = ctx.createOscillator();

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const subGain = ctx.createGain();

    // 432 Hz base carrier with 438 Hz (6Hz Theta beat for deep relaxation)
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(438, ctx.currentTime);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime);

    // Warm sub-bass harmonic
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(108, ctx.currentTime); // Sub-octave
    subGain.gain.setValueAtTime(0.15, ctx.currentTime);

    osc1.connect(gain1).connect(destination);
    osc2.connect(gain2).connect(destination);
    subOsc.connect(subGain).connect(destination);

    osc1.start();
    osc2.start();
    subOsc.start();

    activeNodesRef.current.push(osc1, osc2, subOsc, gain1, gain2, subGain);
  }, []);

  // 2. Synthesize Pink / Brown Noise Buffer
  const playNoiseBuffer = useCallback((ctx, destination, noiseType) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds looping buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (noiseType === 'pink') {
        // Paul Kellet's Pink Noise algorithm
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else if (noiseType === 'brown') {
        // Brown noise integration
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      } else if (noiseType === 'monsoon') {
        // Filtered monsoon rain sound
        lastOut = (lastOut + 0.015 * white) / 1.015;
        const raindrop = Math.random() > 0.997 ? (Math.random() * 0.8 - 0.4) : 0;
        data[i] = lastOut * 2.8 + raindrop;
      }
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Gentle low-pass filter for velvety softness
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(noiseType === 'brown' ? 450 : 1200, ctx.currentTime);

    noiseSource.connect(filter).connect(destination);
    noiseSource.start();

    activeNodesRef.current.push(noiseSource, filter);
  }, []);

  const play = useCallback((soundMode = mode) => {
    const ctx = getAudioContext();
    stopCurrentNodes();

    if (soundMode === '432hz') {
      play432HzTone(ctx, masterGainRef.current);
    } else {
      playNoiseBuffer(ctx, masterGainRef.current, soundMode);
    }

    setIsPlaying(true);
    setMode(soundMode);
  }, [getAudioContext, mode, play432HzTone, playNoiseBuffer, stopCurrentNodes]);

  const stop = useCallback(() => {
    stopCurrentNodes();
    setIsPlaying(false);
  }, [stopCurrentNodes]);

  const toggle = useCallback((selectedMode) => {
    if (isPlaying && (!selectedMode || selectedMode === mode)) {
      stop();
    } else {
      play(selectedMode || mode);
    }
  }, [isPlaying, mode, play, stop]);

  const updateVolume = useCallback((newVol) => {
    setVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(newVol, audioCtxRef.current.currentTime, 0.05);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCurrentNodes();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopCurrentNodes]);

  return {
    isPlaying,
    mode,
    volume,
    play,
    stop,
    toggle,
    setMode: (m) => {
      setMode(m);
      if (isPlaying) play(m);
    },
    setVolume: updateVolume
  };
};
