diff --git a/src/IcedPourOverApp.tsx b/src/IcedPourOverApp.tsx
index abc1234..def5678 100644
--- a/src/IcedPourOverApp.tsx
+++ b/src/IcedPourOverApp.tsx
@@ -1,13 +1,6 @@
-import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
-import {
-  Pause,
-  RotateCcw,
-  Settings,
-  ArrowLeft,
-  Check
-} from 'lucide-react';
+import React, { useState, useEffect, useRef } from 'react';
+import { Coffee, Droplets } from 'lucide-react';

 interface Checklist {
@@ -30,14 +23,6 @@ type Phase = 'setup' | 'brewing' | 'finishing' | 'complete';

 const IcedPourOverApp: React.FC = () => {
-  const [people, setPeople] = useState<number>(1);
-  const [useCustomWeight, setUseCustomWeight] = useState<boolean>(false);
-  const [customCoffeeWeight, setCustomCoffeeWeight] = useState<number>(25);
   const [currentStep, setCurrentStep] = useState<Phase>('setup');
   const [currentBloom, setCurrentBloom] = useState<number>(0);
   const [timeLeft, setTimeLeft] = useState<number>(0);
-  const [timerStarted, setTimerStarted] = useState<boolean>(false);
-  const [stirNudgeShown, setStirNudgeShown] = useState<boolean>(false);
-  const [settings, setSettings] = useState<Settings>({ /* … */ });
+  const [settings] = useState<Settings>({ /* … */ });

   const intervalRef = useRef<number | null>(null);

@@ -105,12 +90,6 @@ const IcedPourOverApp: React.FC = () =>

   // Controls
-  const startTimer = (duration: number) => { /* … */ };
-  const pauseTimer = () => setIsTimerRunning(false);
-  const resetTimer = () => { /* … */ };
-
-  const handleChecklistChange = (item: keyof Checklist) => { /* … */ };
-  const allChecklistComplete = Object.values(checklist).every(v => v);
+  const startTimer = (duration: number) => { /* … */ };
+  const resetTimer = () => { /* … */ };
+  const allChecklistComplete = Object.values(checklist).every(v => v);

   const formatTime = (sec: number) => { /* … */ };

@@ -160,7 +139,7 @@ const IcedPourOverApp: React.FC = () =>

   const nextStep = () => {
     if (currentStep === 'setup') {
-      startTimer( /* … */ );
+      startTimer(bloomDuration);
     } else if (currentStep === 'brewing') {
       /* … */
     }


