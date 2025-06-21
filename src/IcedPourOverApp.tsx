import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Droplets,
  Settings,
  ArrowLeft,
  Check,
  Circle,
} from "lucide-react";

const IcedPourOverApp = () => {
  const [people, setPeople] = useState(1);
  const [useCustomWeight, setUseCustomWeight] = useState(false);
  const [customCoffeeWeight, setCustomCoffeeWeight] = useState(25);
  const [currentStep, setCurrentStep] = useState("setup");
  const [currentBloom, setCurrentBloom] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [stirNudgeShown, setStirNudgeShown] = useState(false);
  const [checklist, setChecklist] = useState({
    grind: false,
    water: false,
    ice: false,
    v60Setup: false,
  });
  const [currentPage, setCurrentPage] = useState("app");
  const [settings, setSettings] = useState({
    coffeeRatio: 65,
    brewWaterRatio: 0.6,
    iceRatio: 0.4,
    minBloomRatio: 2.0,
    maxBloomRatio: 3.0,
    minBloomTime: 45,
    maxBloomTime: 55,
  });
  const intervalRef = useRef(null);

  // Calculations based on user input and settings
  const baseWaterPerPerson = 250;
  const coffeeRatio = settings.coffeeRatio;
  const brewWaterRatio = settings.brewWaterRatio;
  const iceRatio = settings.iceRatio;

  let coffeeWeight, totalWater;

  if (useCustomWeight) {
    coffeeWeight = customCoffeeWeight;
    totalWater = Math.round((coffeeWeight / coffeeRatio) * 1000);
  } else {
    totalWater = people * baseWaterPerPerson;
    coffeeWeight = Math.round((totalWater / 1000) * coffeeRatio);
  }

  const brewWater = Math.round(totalWater * brewWaterRatio);
  const iceWeight = Math.round(totalWater * iceRatio);

  // Bloom calculations - adaptive based on coffee weight constraints
  const minWaterPerBloom = coffeeWeight * settings.minBloomRatio;
  const maxWaterPerBloom = coffeeWeight * settings.maxBloomRatio;
  const minBloomTime = settings.minBloomTime;
  const maxBloomTime = settings.maxBloomTime;

  const calculateOptimalBlooms = () => {
    for (let bloomCount = 3; bloomCount >= 2 && bloomCount <= 4; bloomCount++) {
      const waterPerBloom = Math.round(brewWater / bloomCount);

      if (
        waterPerBloom >= minWaterPerBloom &&
        waterPerBloom <= maxWaterPerBloom
      ) {
        return {
          bloomCount,
          waterPerBloom,
          bloomDuration: 50,
          reason: "Optimal ratio achieved",
        };
      }
    }

    const waterPerBloom = Math.round(brewWater / 3);

    if (waterPerBloom < minWaterPerBloom) {
      const twoBloomWater = Math.round(brewWater / 2);
      if (twoBloomWater <= maxWaterPerBloom) {
        return {
          bloomCount: 2,
          waterPerBloom: twoBloomWater,
          bloomDuration: Math.min(maxBloomTime, 55),
          reason: "Reduced blooms for proper water ratio",
        };
      }
    }

    if (waterPerBloom > maxWaterPerBloom) {
      const fourBloomWater = Math.round(brewWater / 4);
      if (fourBloomWater >= minWaterPerBloom) {
        return {
          bloomCount: 4,
          waterPerBloom: fourBloomWater,
          bloomDuration: Math.max(minBloomTime, 45),
          reason: "Increased blooms for proper water ratio",
        };
      }
    }

    let adjustedTime = 50;
    if (waterPerBloom < minWaterPerBloom) {
      adjustedTime = Math.min(maxBloomTime, 55);
    } else if (waterPerBloom > maxWaterPerBloom) {
      adjustedTime = Math.max(minBloomTime, 45);
    }

    return {
      bloomCount: 3,
      waterPerBloom,
      bloomDuration: adjustedTime,
      reason: "Adjusted timing for ratio",
    };
  };

  const bloomConfig = calculateOptimalBlooms();
  const bloomCount = bloomConfig.bloomCount;
  const bloomDuration = bloomConfig.bloomDuration;
  const waterPerBloom = bloomConfig.waterPerBloom;

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isTimerRunning, timeLeft]);

  const startTimer = (duration) => {
    setTimeLeft(duration);
    setIsTimerRunning(true);
    setTimerStarted(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(0);
    setTimerStarted(false);
    setStirNudgeShown(false);
  };

  const handleChecklistChange = (item) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const allChecklistComplete = Object.values(checklist).every(
    (checked) => checked
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const nextStep = () => {
    if (currentStep === "setup") {
      setCurrentStep("brewing");
      startTimer(bloomDuration);
    } else if (currentStep === "brewing" && currentBloom < bloomCount - 1) {
      setCurrentBloom(currentBloom + 1);
      resetTimer();
      startTimer(bloomDuration);
    } else if (currentStep === "brewing" && currentBloom >= bloomCount - 1) {
      setCurrentStep("finishing");
    } else if (currentStep === "finishing") {
      setCurrentStep("complete");
    }
  };

  const resetBrewing = () => {
    setCurrentStep("setup");
    setCurrentBloom(0);
    setStirNudgeShown(false);
    resetTimer();
  };

  const renderSetupPhase = () => (
    <div className="space-y-8">
      {/* Recipe Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recipe</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure your brewing parameters
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Brewing Method Selection */}
          <div className="space-y-4">
            <div className="flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setUseCustomWeight(false)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !useCustomWeight
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                By People
              </button>
              <button
                onClick={() => setUseCustomWeight(true)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  useCustomWeight
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Custom Weight
              </button>
            </div>

            {!useCustomWeight ? (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Number of servings
                </label>
                <select
                  value={people}
                  onChange={(e) => setPeople(parseInt(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Coffee weight (grams)
                </label>
                <input
                  type="number"
                  value={customCoffeeWeight}
                  onChange={(e) =>
                    setCustomCoffeeWeight(parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="10"
                  max="100"
                />
              </div>
            )}
          </div>

          {/* Recipe Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <Coffee className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {coffeeWeight}g
              </div>
              <div className="text-xs text-gray-600">Ground Coffee</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Droplets className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {brewWater}g
              </div>
              <div className="text-xs text-gray-600">Brew Water</div>
            </div>
            <div className="bg-cyan-50 rounded-xl p-4 text-center">
              <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">
                <div className="w-4 h-4 bg-cyan-600 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {iceWeight}g
              </div>
              <div className="text-xs text-gray-600">Ice</div>
            </div>
          </div>

          {/* Brewing Plan */}
          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Adaptive Brewing Plan
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {bloomCount}
                </div>
                <div className="text-xs text-gray-600">Bloom Cycles</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {bloomDuration}s
                </div>
                <div className="text-xs text-gray-600">Per Bloom</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {waterPerBloom}g
                </div>
                <div className="text-xs text-gray-600">Water Each</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-600 text-center">
              {bloomConfig.reason} • {(waterPerBloom / coffeeWeight).toFixed(1)}
              x ratio
            </div>
          </div>
        </div>
      </div>

      {/* Preparation Checklist */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Preparation</h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete all steps before brewing
          </p>
        </div>

        <div className="p-6 space-y-4">
          {[
            {
              key: "grind",
              text: `Grind ${coffeeWeight}g coffee beans (fine, like for espresso)`,
            },
            { key: "water", text: `Heat ${brewWater}g water to 90-96°C` },
            {
              key: "ice",
              text: `Prepare ${iceWeight}g ice (keep chilled until needed)`,
            },
            {
              key: "v60Setup",
              text: "Set up V60 with filter and rinse thoroughly",
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start space-x-4 cursor-pointer group"
            >
              <div className="flex-shrink-0 mt-1">
                {checklist[item.key] ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-gray-400 transition-colors"></div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="checkbox"
                  checked={checklist[item.key]}
                  onChange={() => handleChecklistChange(item.key)}
                  className="sr-only"
                />
                <span
                  className={`text-base ${
                    checklist[item.key]
                      ? "line-through text-gray-500"
                      : "text-gray-900"
                  }`}
                >
                  {item.text}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={nextStep}
        disabled={!allChecklistComplete}
        className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all duration-200 ${
          allChecklistComplete
            ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {allChecklistComplete
          ? "Start Brewing"
          : "Complete preparation to continue"}
      </button>
    </div>
  );

  const renderBrewingPhase = () => {
    const stirTriggerTime = Math.ceil(bloomDuration * 0.6);
    const shouldShowStirNudge =
      timerStarted &&
      timeLeft <= stirTriggerTime &&
      timeLeft > 0 &&
      !stirNudgeShown;

    if (shouldShowStirNudge) {
      setStirNudgeShown(true);
    }

    return (
      <div className="space-y-8">
        {/* Current Bloom Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bloom {currentBloom + 1} of {bloomCount}
          </h1>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: bloomCount }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index < currentBloom
                    ? "bg-green-500"
                    : index === currentBloom
                    ? "bg-blue-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timer Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-600 mb-2">
                Pour this amount
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {waterPerBloom}g
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {(waterPerBloom / coffeeWeight).toFixed(1)}x coffee weight
              </div>
            </div>

            <div className="mb-6">
              <div
                className={`text-6xl font-mono font-bold mb-4 ${
                  timeLeft <= 10 ? "text-red-500" : "text-gray-900"
                }`}
              >
                {formatTime(timeLeft)}
              </div>

              {isTimerRunning && (
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={pauseTimer}
                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Pause className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={resetTimer}
                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="w-6 h-6 text-gray-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        {timeLeft > stirTriggerTime && (
          <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
            <div className="flex items-start space-x-3">
              <Droplets className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Pour the water
                </h3>
                <p className="text-blue-800">
                  Pour {waterPerBloom}g hot water in a slow, circular motion
                  starting from the center and spiraling outward. Watch the
                  coffee bloom and expand.
                </p>
              </div>
            </div>
          </div>
        )}

        {timeLeft <= stirTriggerTime && timeLeft > 0 && (
          <div className="bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-500">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 mt-1 flex-shrink-0">
                <div className="w-full h-full bg-orange-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Time to stir
                </h3>
                <p className="text-orange-800">
                  Give the coffee a gentle stir - once clockwise, then once
                  counter-clockwise. This ensures even saturation.
                </p>
              </div>
            </div>
          </div>
        )}

        {timeLeft === 0 && timerStarted && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-2xl p-6 border-l-4 border-green-500">
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Bloom complete!
                  </h3>
                  <p className="text-green-800">
                    Bloom {currentBloom + 1} finished successfully.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={nextStep}
              className="w-full py-4 bg-green-600 text-white rounded-2xl text-lg font-semibold hover:bg-green-700 active:bg-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {currentBloom < bloomCount - 1
                ? `Start Bloom ${currentBloom + 2}`
                : "Finish Brewing"}
            </button>
          </div>
        )}

        {/* Reset Option */}
        <div className="text-center">
          <button
            onClick={resetBrewing}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Reset and start over
          </button>
        </div>
      </div>
    );
  };

  const renderFinishingPhase = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Final Steps</h1>
        <p className="text-gray-600">Complete your iced pour over</p>
      </div>

      <div className="space-y-6">
        <div className="bg-cyan-50 rounded-2xl p-6 border-l-4 border-cyan-500">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 mt-1 flex-shrink-0">
              <div className="w-full h-full bg-cyan-600 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-900 mb-2">
                Add the ice
              </h3>
              <p className="text-cyan-800">
                Add {iceWeight}g of chilled ice to your brewing vessel. The ice
                should be as cold as possible for best results.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-500">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 mt-1 flex-shrink-0 rotate-45">
              <div className="w-full h-full bg-orange-600 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Stir until dissolved
              </h3>
              <p className="text-orange-800">
                Gently stir the coffee until all ice is completely dissolved.
                This brings your coffee to the perfect serving temperature.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={nextStep}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Complete Brewing
      </button>
    </div>
  );

  const renderCompletePhase = () => (
    <div className="space-y-8 text-center">
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Perfect!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Your {people === 1 ? "single serving" : `${people}-person batch`} of
          iced V60 pour over is ready to enjoy.
        </p>

        <div className="bg-white rounded-xl p-4 inline-block shadow-sm">
          <div className="text-sm font-medium text-gray-600">
            Total brewing time
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatTime(bloomCount * bloomDuration)}
          </div>
        </div>
      </div>

      <button
        onClick={resetBrewing}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Brew Another Batch
      </button>
    </div>
  );

  const renderHowItWorks = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h1>
        <p className="text-lg text-gray-600">
          The science behind perfect iced pour over coffee
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            ☕ The Golden Ratio
          </h3>
          <p className="text-gray-700 mb-4">
            Our brewing formula is based on proven coffee science:
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>65g coffee per 1000ml water</strong> - Optimal strength
                for iced coffee
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>60:40 water split</strong> - 60% hot brewing water, 40%
                ice for immediate cooling
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>2x-3x bloom ratio</strong> - Water per bloom should be
                2-3 times coffee weight
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            ⏱️ Adaptive Timing
          </h3>
          <p className="text-gray-700 mb-4">
            The app intelligently adjusts brewing parameters:
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>Bloom Count</strong> - Varies between 2-4 cycles based
                on coffee amount
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>Bloom Duration</strong> - Adjusts between 45-55 seconds
                for optimal extraction
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>Water Distribution</strong> - Ensures proper
                water-to-coffee ratio per bloom
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            🔬 Brewing Science
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>Fine grind</strong> - For proper extraction and bloom
                development
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>90-96°C water</strong> - Optimal temperature for flavor
                extraction
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>Bloom purpose</strong> - CO2 escape and even water
                saturation
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>
                <strong>Ice dilution</strong> - Pre-calculated for perfect final
                strength
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderUpdateLog = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Update Log</h1>
        <p className="text-lg text-gray-600">
          Development journey and version history
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            version: "Version 1.5 - Apple Design Standards",
            date: "Latest",
            color: "green",
            updates: [
              "Complete visual redesign following Apple Human Interface Guidelines",
              "Improved typography hierarchy and spacing",
              "Enhanced accessibility with better contrast and focus states",
              "Refined color palette and card-based layouts",
              "Smooth transitions and hover states throughout",
            ],
          },
          {
            version: "Version 1.4 - Adaptive Intelligence",
            date: "Jun 21, 2025",
            color: "blue",
            updates: [
              "Smart bloom calculation with automatic adjustments",
              "Water ratio safety ensuring optimal extraction",
              "Adaptive display showing brewing rationale",
              "Intelligent fallbacks for any coffee amount",
            ],
          },
          {
            version: "Version 1.3 - Flow Optimization",
            date: "Jun 21, 2025",
            color: "purple",
            updates: [
              "Improved brewing flow with immediate timer start",
              "Progressive instructions based on timer progress",
              "40% stir timing for optimal bloom point",
              "Seamless transitions between bloom cycles",
            ],
          },
        ].map((release, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}
          >
            <div
              className={`px-6 py-4 bg-${release.color}-50 border-b border-${release.color}-100`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">
                  {release.version}
                </h3>
                <span
                  className={`text-sm px-3 py-1 rounded-full bg-${release.color}-100 text-${release.color}-800`}
                >
                  {release.date}
                </span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {release.updates.map((update, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 bg-${release.color}-500 rounded-full mt-2 flex-shrink-0`}
                    ></div>
                    <span className="text-gray-700">{update}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => {
    const handleSettingChange = (key, value) => {
      const numValue = parseFloat(value) || 0;
      if (key === "brewWaterRatio") {
        setSettings((prev) => ({
          ...prev,
          brewWaterRatio: numValue,
          iceRatio: 1 - numValue,
        }));
      } else {
        setSettings((prev) => ({
          ...prev,
          [key]: numValue,
        }));
      }
    };

    const resetToDefaults = () => {
      setSettings({
        coffeeRatio: 65,
        brewWaterRatio: 0.6,
        iceRatio: 0.4,
        minBloomRatio: 2.0,
        maxBloomRatio: 3.0,
        minBloomTime: 45,
        maxBloomTime: 55,
      });
    };

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Settings</h1>
          <p className="text-lg text-gray-600">
            Customize your brewing parameters
          </p>
        </div>

        <div className="bg-yellow-50 rounded-2xl p-6 border-l-4 border-yellow-400">
          <p className="text-yellow-800">
            <strong>⚠️ Advanced Settings:</strong> These parameters affect all
            calculations. Only modify if you understand coffee brewing ratios.
          </p>
        </div>

        <div className="space-y-6">
          {/* Coffee & Water Ratios */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Coffee & Water Ratios
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Coffee Ratio (grams per liter)
                </label>
                <input
                  type="number"
                  value={settings.coffeeRatio}
                  onChange={(e) =>
                    handleSettingChange("coffeeRatio", e.target.value)
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="50"
                  max="80"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-2">Default: 65g/L</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Brewing Water (%)
                </label>
                <input
                  type="number"
                  value={Math.round(settings.brewWaterRatio * 100)}
                  onChange={(e) =>
                    handleSettingChange("brewWaterRatio", e.target.value / 100)
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="50"
                  max="80"
                  step="5"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Default: 60% (Ice: {Math.round(settings.iceRatio * 100)}%)
                </p>
              </div>
            </div>
          </div>

          {/* Other settings sections with similar styling... */}

          <div className="flex space-x-4">
            <button
              onClick={resetToDefaults}
              className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl text-lg font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Reset to Defaults
            </button>
            <button
              onClick={() => setCurrentPage("app")}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMainApp = () => (
    <div>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm text-gray-500">
            {currentStep === "setup" && "Setup"}
            {currentStep === "brewing" &&
              `Brewing (${currentBloom + 1}/${bloomCount})`}
            {currentStep === "finishing" && "Finishing"}
            {currentStep === "complete" && "Complete"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width:
                currentStep === "setup"
                  ? "25%"
                  : currentStep === "brewing"
                  ? `${25 + (50 * (currentBloom + 1)) / bloomCount}%`
                  : currentStep === "finishing"
                  ? "90%"
                  : "100%",
            }}
          ></div>
        </div>
      </div>

      {currentStep === "setup" && renderSetupPhase()}
      {currentStep === "brewing" && renderBrewingPhase()}
      {currentStep === "finishing" && renderFinishingPhase()}
      {currentStep === "complete" && renderCompletePhase()}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        {currentPage === "app" && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Iced Pour Over
            </h1>
            <p className="text-lg text-gray-600">
              V60 Method • Perfect every time
            </p>
          </div>
        )}

        {/* Back Navigation for other pages */}
        {currentPage !== "app" && (
          <div className="mb-8">
            <button
              onClick={() => setCurrentPage("app")}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Brewing</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="mb-16">
          {currentPage === "app" && renderMainApp()}
          {currentPage === "how-it-works" && renderHowItWorks()}
          {currentPage === "update-log" && renderUpdateLog()}
          {currentPage === "settings" && renderSettings()}
        </div>

        {/* Footer Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center">
            <div className="text-gray-900 font-semibold text-lg">
              ☕ Iced Pour Over
            </div>
            <div className="flex space-x-6">
              <button
                onClick={() => setCurrentPage("how-it-works")}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                How it works?
              </button>
              <button
                onClick={() => setCurrentPage("update-log")}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Update log
              </button>
              <button
                onClick={() => setCurrentPage("settings")}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IcedPourOverApp;
