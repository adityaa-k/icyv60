import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  Pause,
  RotateCcw,
  Coffee,
  Droplets,
  Settings,
  ArrowLeft,
  Check
} from 'lucide-react';

interface Checklist {
  grind: boolean;
  water: boolean;
  ice: boolean;
  v60Setup: boolean;
  [key: string]: boolean;
}

interface Settings {
  coffeeRatio: number;
  brewWaterRatio: number;
  iceRatio: number;
  minBloomRatio: number;
  maxBloomRatio: number;
  minBloomTime: number;
  maxBloomTime: number;
}

type Phase = 'setup' | 'brewing' | 'finishing' | 'complete';

const IcedPourOverApp: React.FC = () => {
  const [people, setPeople] = useState<number>(1);
  const [useCustomWeight, setUseCustomWeight] = useState<boolean>(false);
  const [customCoffeeWeight, setCustomCoffeeWeight] = useState<number>(25);
  const [currentStep, setCurrentStep] = useState<Phase>('setup');
  const [currentBloom, setCurrentBloom] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [stirNudgeShown, setStirNudgeShown] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<Checklist>({
    grind: false,
    water: false,
    ice: false,
    v60Setup: false
  });
  const [settings, setSettings] = useState<Settings>({
    coffeeRatio: 65,
    brewWaterRatio: 0.6,
    iceRatio: 0.4,
    minBloomRatio: 2.0,
    maxBloomRatio: 3.0,
    minBloomTime: 45,
    maxBloomTime: 55
  });

  // Use a number ref for window.setInterval
  const intervalRef = useRef<number | null>(null);

  // Calculate weights
  const baseWaterPerPerson = 250;
  const coffeeRatio = settings.coffeeRatio / 100;

  let coffeeWeight: number;
  let totalWater: number;

  if (useCustomWeight) {
    coffeeWeight = customCoffeeWeight;
    totalWater = Math.round(customCoffeeWeight / coffeeRatio);
  } else {
    totalWater = people * baseWaterPerPerson;
    coffeeWeight = Math.round(totalWater * coffeeRatio);
  }

  const brewWater = Math.round(totalWater * settings.brewWaterRatio);
  const iceWeight = Math.round(totalWater * settings.iceRatio);

  // Bloom calculation
  const calculateOptimalBlooms = () => {
    const minWaterPerBloom = coffeeWeight * settings.minBloomRatio;
    const maxWaterPerBloom = coffeeWeight * settings.maxBloomRatio;
    const attempts = [2, 3, 4];
    for (const count of attempts) {
      const per = Math.round(brewWater / count);
      if (per >= minWaterPerBloom && per <= maxWaterPerBloom) {
        return { bloomCount: count, waterPerBloom: per, bloomDuration: 50, reason: 'Optimal ratio achieved' };
      }
    }
    return { bloomCount: 3, waterPerBloom: Math.round(brewWater / 3), bloomDuration: 50, reason: 'Default bloom' };
  };

  const { bloomCount, waterPerBloom, bloomDuration } = calculateOptimalBlooms();

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => (prev <= 1 ? (setIsTimerRunning(false), 0) : prev - 1));
      }, 1000);
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  // Controls
  const startTimer = (duration: number) => {
    setTimeLeft(duration);
    setIsTimerRunning(true);
    setTimerStarted(true);
  };
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(0);
    setTimerStarted(false);
    setStirNudgeShown(false);
  };

  const handleChecklistChange = (item: keyof Checklist) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };
  const allChecklistComplete = Object.values(checklist).every(v => v);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Step progression
  const nextStep = () => {
    if (currentStep === 'setup') {
      setCurrentStep('brewing');
      startTimer(bloomDuration);
    } else if (currentStep === 'brewing' && currentBloom < bloomCount - 1) {
      setCurrentBloom(prev => prev + 1);
      resetTimer();
      startTimer(bloomDuration);
    } else if (currentStep === 'brewing') {
      setCurrentStep('finishing');
    } else if (currentStep === 'finishing') {
      setCurrentStep('complete');
    }
  };

  // Simplified render for brevity
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold">Iced Pour Over</h1>
      {/* Insert your setup, brewing, finishing, and complete UI here,
          using `currentStep`, `allChecklistComplete`, `formatTime`, etc. */}
      {/* Example: */}
      {currentStep === 'setup' && (
        <div>
          <h2 className="mt-4 font-semibold">Recipe</h2>
          <div className="mt-2 grid grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <Coffee className="mx-auto mb-2" />
              <div>{coffeeWeight}g</div>
              <div className="text-sm text-gray-600">Ground Coffee</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Droplets className="mx-auto mb-2" />
              <div>{brewWater}g</div>
              <div className="text-sm text-gray-600">Brew Water</div>
            </div>
            <div className="p-4 bg-cyan-50 rounded-lg text-center">
              <div className="mx-auto mb-2 w-6 h-6 bg-cyan-600 rounded-full"></div>
              <div>{iceWeight}g</div>
              <div className="text-sm text-gray-600">Ice</div>
            </div>
          </div>
          <button
            onClick={nextStep}
            disabled={!allChecklistComplete}
            className={`mt-6 px-4 py-2 rounded-lg ${
              allChecklistComplete
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {allChecklistComplete ? 'Start Brewing' : 'Complete preparation'}
          </button>
        </div>
      )}
    </div>
  );
};

export default IcedPourOverApp;

