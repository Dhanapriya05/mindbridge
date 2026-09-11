import React from 'react';
import { BreathingEngine } from '../components/relaxation/BreathingEngine';
import { GroundingExercise } from '../components/relaxation/GroundingExercise';
import { PMRGuide } from '../components/relaxation/PMRGuide';
import { SoundMixer } from '../components/relaxation/SoundMixer';
import { ZenCanvas } from '../components/relaxation/ZenCanvas';
export const RelaxationSuite = () => <div className="mx-auto max-w-6xl space-y-6 px-4 py-8"><header><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Calming suite</p><h1 className="mt-2 text-4xl font-display font-bold">Choose what your nervous system needs.</h1></header><BreathingEngine /><div className="grid gap-6 lg:grid-cols-2"><GroundingExercise /><PMRGuide /><SoundMixer /><ZenCanvas /></div></div>;