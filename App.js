
import React from 'react';
import { homeScreenLevels, flashcardDecks, bibleBookOrderData } from './data.js';
import { QuizItemType } from './types.js';

const { useState, useEffect, useMemo, useCallback, useRef } = React;
const e = React.createElement;

// --- Helper Functions & Constants ---
const shuffleArray = (array) => {
  if (array.length <= 1) {
    return [...array];
  }
  let shuffledArray;
  const originalOrderString = JSON.stringify(array);
  do {
    shuffledArray = [...array].sort(() => Math.random() - 0.5);
  } while (JSON.stringify(shuffledArray) === originalOrderString);
  return shuffledArray;
};

// --- Custom Hooks ---
const useServiceWorkerUpdater = () => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    const checkForUpdate = (registration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdateNotification(true);
      }
    };
    
    navigator.serviceWorker.ready.then(registration => {
      checkForUpdate(registration);
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              checkForUpdate(registration);
            }
          });
        }
      });
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdateNotification(false);
    }
  };

  return { showUpdateNotification, handleUpdate };
};

const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = window.localStorage.getItem('theme');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            return savedTheme;
        }
    }
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('theme', theme);
    }
  }, [theme]);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.toggle('dark', mediaQuery.matches);
      }
    };

    // For robust compatibility across browsers (especially older Android)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange); // Deprecated fallback
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange); // Deprecated fallback
      }
    };
  }, [theme]);

  return [theme, setTheme];
};


// --- Icon Components ---
const ArrowLeftIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" }));
const ArrowRightIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" }));
const ShuffleIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M18 20.25V19.05C18 16.65 16.35 15.675 14.55 15.675H13.5V14.175H14.55C15.9 14.175 16.5 13.575 16.5 12.75C16.5 11.925 15.9 11.325 14.55 11.325H13.125L14.625 12.825L13.575 13.875L10.95 11.25L13.575 8.625L14.625 9.675L13.125 11.175H14.55C16.95 11.175 18 10.125 18 8.7V7.5H19.5V8.7C19.5 10.575 17.925 11.85 16.05 12.375V12.75C17.925 13.275 19.5 14.55 19.5 16.5V19.05C19.5 20.85 17.85 21.75 16.05 21.75H8.25V20.25H16.05C17.4 20.25 18 19.65 18 18.825V20.25ZM4.5 3.75H6V5.25H4.5V3.75ZM6 18.75V21.75H4.5V18.75H6ZM6 6.75V17.25H4.5V6.75H6Z" }));
const ReverseIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M18 22.5H6C5.175 22.5 4.5 21.825 4.5 21V3C4.5 2.175 5.175 1.5 6 1.5H18C18.825 1.5 19.5 2.175 19.5 3V21C19.5 21.825 18.825 22.5 18 22.5ZM13.05 8.4V5.25L9 9.3L13.05 13.35V10.2H15V8.4H13.05Z" }));
const BackIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z" }));
const DownloadIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M13 10H18L12 16L6 10H11V3H13V10ZM4 18H20V20H4V18Z" }));
const ChevronDownIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 15.9999L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z" }));
const GamepadIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M16.5 2.25C18.0525 2.25 19.3125 3.15 19.9125 4.5H22.5V11.25H18.0375C17.0625 11.25 16.125 10.725 15.525 9.825L14.4 7.875H9.6L8.475 9.825C7.875 10.725 6.9375 11.25 5.9625 11.25H1.5V4.5H4.0875C4.6875 3.15 5.9475 2.25 7.5 2.25H9V4.5H7.5V6H9V4.5H15V6H16.5V4.5H15V2.25H16.5ZM16.5 12.75H19.5V15.75H16.5V12.75ZM4.5 12.75H7.5V15.75H4.5V12.75ZM2.25 12.75H0V21.75H12V12.75H9.75V15.375C9.75 16.2 9.15 16.875 8.325 16.875H5.625C4.8 16.875 4.2 16.2 4.2 15.375V12.75H2.25Z" }));
const BookOpenIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M12 2.25C9.075 2.25 6.75 4.575 6.75 7.5C6.75 9.9 8.25 11.85 10.5 12.525V21.75L12 20.25L13.5 21.75V12.525C15.75 11.85 17.25 9.9 17.25 7.5C17.25 4.575 14.925 2.25 12 2.25ZM12 3.75C14.1 3.75 15.75 5.4 15.75 7.5C15.75 9.6 14.1 11.25 12 11.25C9.9 11.25 8.25 9.6 8.25 7.5C8.25 5.4 9.9 3.75 12 3.75Z M4.5 6.75V21.75L6 20.25V6.75C5.475 6.75 4.95 6.75 4.5 6.75Z M19.5 6.75C19.05 6.75 18.525 6.75 18 6.75V20.25L19.5 21.75V6.75Z" }));
const BrainIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M12 2C9.28 2 7.03 3.65 6.13 5.96C6.09 6.07 6.06 6.18 6.03 6.29C4.41 7.42 3.5 9.38 3.5 11.5C3.5 14.53 5.97 17 9 17H9.5C9.72 17.22 9.97 17.42 10.24 17.6C10.28 17.63 10.32 17.67 10.36 17.7C10.61 17.87 10.88 18.01 11.16 18.13C11.43 18.24 11.71 18.33 12 18.39V22H13V18.39C13.29 18.33 13.57 18.24 13.84 18.13C14.12 18.01 14.39 17.87 14.64 17.7C14.68 17.67 14.72 17.63 14.76 17.6C15.03 17.42 15.28 17.22 15.5 17H16C19.03 17 21.5 14.53 21.5 11.5C21.5 9.38 20.59 7.42 18.97 6.29C18.94 6.18 18.91 6.07 18.87 5.96C17.97 3.65 15.72 2 13 2H12M12 3.5H13C15.09 3.5 16.84 4.8 17.47 6.69C17.47 6.71 17.48 6.74 17.48 6.76C17.77 7.61 18 8.5 18.16 9.43C18.21 9.68 18.25 9.94 18.28 10.2C18.29 10.3 18.29 10.4 18.3 10.5C19.16 10.82 19.5 11.19 19.5 11.5C19.5 12.08 18.75 13.11 17.6 14.05C16.81 14.7 16 15.34 16 15.5H15.5C14.86 15.5 14.26 15.25 13.79 14.83L12.5 13.54L11.21 14.83C10.74 15.25 10.14 15.5 9.5 15.5H9C9 15.34 8.19 14.7 7.4 14.05C6.25 13.11 5.5 12.08 5.5 11.5C5.5 11.19 5.84 10.82 6.7 10.5C6.71 10.4 6.71 10.3 6.72 10.2C6.75 9.94 6.79 9.68 6.84 9.43C7 8.5 7.23 7.61 7.52 6.76C7.52 6.74 7.53 6.71 7.53 6.69C8.16 4.8 9.91 3.5 12 3.5Z"}));
const SunIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM20 11H23V13H20V11ZM1 11H4V13H1V11ZM16.9497 5.63604L19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604ZM5.63604 16.9497L3.51472 19.0711L4.92893 20.4853L7.05025 18.364L5.63604 16.9497Z"}));
const MoonIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M10 7C10 9.76142 12.2386 12 15 12C16.4811 12 17.8225 11.3915 18.7831 10.4132C18.2713 12.4832 16.421 14 14 14C11.2386 14 9 11.7614 9 9C9 6.57901 10.5168 4.72873 12.5868 4.21693C11.6085 5.17754 11 6.51891 11 8C11 8.32174 11.0233 8.63821 11.0681 8.94711C10.5561 8.44873 10.1813 7.75519 10 7ZM12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z"}));
const DesktopIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M21 15H3V3H21V15ZM21 1H3C1.89543 1 1 1.89543 1 3V15C1 16.1046 1.89543 17 3 17H8V21H10V19H14V21H16V17H21C22.1046 17 23 16.1046 23 15V3C23 1.89543 22.1046 1 21 1Z"}));
const DragHandleIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className },
  e('path', { d: "M11 5C11 6.10457 10.1046 7 9 7C7.89543 7 7 6.10457 7 5C7 3.89543 7.89543 3 9 3C10.1046 3 11 3.89543 11 5Z"}),
  e('path', { d: "M11 12C11 13.1046 10.1046 14 9 14C7.89543 14 7 13.1046 7 12C7 10.8954 7.89543 10 9 10C10.1046 10 11 10.8954 11 12Z"}),
  e('path', { d: "M11 19C11 20.1046 10.1046 21 9 21C7.89543 21 7 20.1046 7 19C7 17.8954 7.89543 17 9 17C10.1046 17 11 17.8954 11 19Z"}),
  e('path', { d: "M17 5C17 6.10457 16.1046 7 15 7C13.8954 7 13 6.10457 13 5C13 3.89543 13.8954 3 15 3C16.1046 3 17 3.89543 17 5Z"}),
  e('path', { d: "M17 12C17 13.1046 16.1046 14 15 14C13.8954 14 13 13.1046 13 12C13 10.8954 13.8954 10 15 10C16.1046 10 17 10.8954 17 12Z"}),
  e('path', { d: "M17 19C17 20.1046 16.1046 21 15 21C13.8954 21 13 20.1046 13 19C13 17.8954 13.8954 17 15 17C16.1046 17 17 17.8954 17 19Z"}),
);
const QuestionMarkIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: 'M12,2C6.477,2,2,6.477,2,12s4.477,10,10,10s10-4.477,10-10S17.523,2,12,2z M12,17c-0.552,0-1-0.448-1-1v-4c0-0.552,0.448-1,1-1 s1,0.448,1,1v4C13,16.552,12.552,17,12,17z M12,9c-0.552,0-1-0.448-1-1s0.448-1,1-1s1,0.448,1,1S12.552,9,12,9z' }));
const CheckCircleIcon = ({ className }) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className }, e('path', { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 16.29L5.7 12.7a.996.996 0 1 1 1.41-1.41L10 14.17l6.88-6.88a.996.996 0 1 1 1.41 1.41l-7.59 7.59a.996.996 0 0 1-1.41 0z" }));

const ICONS = {
    Gamepad: GamepadIcon,
    BookOpen: BookOpenIcon,
};

const InstructionsScreen = ({ onDismiss, isInitialWelcome }) => {
  const instructions = [
    {
      icon: 'Gamepad',
      title: 'Match the Scripture',
      text: 'Start here to learn the material. Pick a topic, then match the scripture reference on the left with its corresponding text on the right. A correct match will turn green!'
    },
    {
      icon: 'BookOpen',
      title: 'Flashcard Decks',
      text: 'When you are confident with a section from the matching game, move on to flashcards to test your memory. Select a category to study, flip the cards, and use shuffle/reverse modes for an extra challenge.'
    },
    {
      icon: 'Gamepad',
      title: 'Bible Book Order',
      text: 'First, use the "Practice" mode to learn with mnemonics. Then, in the "Challenge", drag the books into the correct order for each category, then arrange the categories themselves to complete it.'
    }
  ];

  return e('div', { className: 'fixed inset-0 bg-slate-50 dark:bg-slate-900 z-50 flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in' },
    e('div', { className: 'w-full max-w-2xl text-center' },
      e('h1', { className: 'text-4xl sm:text-5xl font-bold font-serif text-sky-600 dark:text-sky-400 mb-4' }, isInitialWelcome ? "Welcome!" : "How to Play"),
      e('p', { className: 'text-lg text-slate-700 dark:text-slate-300 mb-8' }, isInitialWelcome ? "Ready to sharpen your Bible knowledge? Here’s how to play:" : "A quick reminder on how to play each mode:"),
      
      e('div', { className: 'space-y-6 text-left max-w-lg mx-auto' },
        instructions.map(item => {
          const IconComponent = ICONS[item.icon];
          return e('div', { key: item.title, className: 'flex items-start space-x-4' },
            e(IconComponent, { className: 'w-8 h-8 text-sky-500 mt-1 flex-shrink-0' }),
            e('div', null,
              e('h3', { className: 'text-xl font-bold text-slate-800 dark:text-slate-100' }, item.title),
              e('p', { className: 'text-slate-600 dark:text-slate-400' }, item.text)
            )
          )
        })
      ),

      e('button', {
        onClick: onDismiss,
        className: 'mt-12 px-8 py-4 bg-sky-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-sky-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900'
      }, isInitialWelcome ? "Let's Get Started" : "Got It!")
    )
  );
};

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Caught by Error Boundary:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return e('div', { className: "flex flex-col h-screen items-center justify-center p-8 text-center bg-slate-100 dark:bg-slate-900" },
                e('h1', { className: "text-4xl font-bold text-sky-600 dark:text-sky-400 mb-4" }, "Oops!"),
                e('p', { className: "text-xl text-slate-700 dark:text-slate-300 mb-8" }, "Something went wrong while loading this part of the app."),
                e('div', { className: "flex space-x-4" },
                    e('button', { onClick: () => window.location.reload(), className: "px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors" }, "Refresh Page"),
                    e('button', { onClick: () => window.history.back(), className: "px-6 py-3 bg-white dark:bg-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" }, "Go Back")
                ),
                e('p', { className: "text-sm text-slate-500 dark:text-slate-400 mt-8" }, "If the problem persists, please check the console for more details.")
            );
        }
        return this.props.children;
    }
}

// --- UI Components ---
const Confetti = React.memo(({ count = 200 }) => {
  const [particles, setParticles] = useState([]);

  const playConfettiSound = useCallback(() => {
    if (!window.appAudioContext) {
        window.appAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const audioContext = window.appAudioContext;
    if (!audioContext) return;

    const playSound = () => {
        const now = audioContext.currentTime;

        // Low-frequency boom for the "oomph"
        const boomOsc = audioContext.createOscillator();
        boomOsc.type = 'sine';
        boomOsc.frequency.setValueAtTime(100, now); // Start freq
        boomOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.4); // Pitch drop

        const boomGain = audioContext.createGain();
        boomGain.gain.setValueAtTime(0.5, now); // Initial volume
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        boomOsc.connect(boomGain);
        boomGain.connect(audioContext.destination);

        // Noise burst for the "crackle"
        const noiseDuration = 0.5;
        const bufferSize = audioContext.sampleRate * noiseDuration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // White noise
        }

        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = buffer;

        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);

        noiseSource.connect(noiseGain);
        noiseGain.connect(audioContext.destination);

        // Start and stop sounds
        boomOsc.start(now);
        boomOsc.stop(now + 0.4);
        noiseSource.start(now);
        noiseSource.stop(now + noiseDuration);
    };

    if (audioContext.state === 'suspended') {
        audioContext.resume().then(playSound).catch(err => console.error("Could not resume audio context for confetti sound:", err));
    } else {
        playSound();
    }
  }, []);
  
  useEffect(() => {
    playConfettiSound();

    const newParticles = Array.from({ length: count }).map((_, i) => {
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
      const duration = Math.random() * 1.5 + 1;
      const size = Math.random() * 4 + 4;
      const isRect = Math.random() > 0.2;
      const rectWidth = size;
      const rectHeight = size * 2;
      
      return {
        id: i,
        style: {
          '--end-x': `${(Math.random() - 0.5) * 150}vw`,
          '--end-y': `${(Math.random() - 0.5) * 150}vh`,
          '--end-rotation': `${Math.random() * 540 + 540}deg`,
          animationDuration: `${duration}s`,
          animationDelay: `${Math.random() * 0.1}s`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          left: '50%',
          top: '50%', // Start from center
          width: isRect ? `${rectWidth}px` : `${size}px`,
          height: isRect ? `${rectHeight}px` : `${size}px`,
          borderRadius: isRect ? '0' : '50%',
        }
      };
    });
    setParticles(newParticles);
  }, [count, playConfettiSound]);

  return e('div', { className: 'fixed inset-0 pointer-events-none z-[100] overflow-hidden' },
    particles.map(p => e('div', {
      key: p.id,
      className: 'absolute animate-confetti-burst',
      style: p.style,
    }))
  );
});

const Header = ({ onBack, title, children }) => e('header', { className: "p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20 flex items-center shadow-sm" },
    onBack && e('button', { onClick: onBack, className: "p-2 mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors", 'aria-label': "Go back" },
        e(BackIcon, { className: "w-6 h-6" })
    ),
    e('h1', { className: "flex-grow text-xl font-bold text-slate-900 dark:text-white truncate" }, title),
    children
);

const HomeScreen = ({ onSelectGame, onInstall, canInstall, onShowInstructions, themeToggle }) => {
    return e('div', null,
        e(Header, { title: "Bible Flashcard Quiz" },
            e('div', { className: 'flex items-center space-x-2 ml-2' },
                canInstall && e('button', {
                    onClick: onInstall,
                    className: "flex items-center space-x-2 px-3 py-1.5 bg-sky-600 text-white font-semibold rounded-full shadow-md hover:bg-sky-700 transition-colors text-sm",
                    title: "Install App for Offline Use",
                    'aria-label': "Install App for Offline Use"
                },
                    e(DownloadIcon, { className: "w-5 h-5" }),
                    e('span', null, 'Install')
                ),
                e('button', {
                    onClick: onShowInstructions,
                    className: "p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
                    title: "How to Play",
                    'aria-label': "Show how to play instructions"
                }, e(QuestionMarkIcon, { className: "w-6 h-6" })),
                themeToggle
            )
        ),
        e('main', { className: "p-4 space-y-8" },
            e('section', null,
                e('h2', { className: "text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 px-2" }, "Your Learning Path"),
                e('div', { className: "space-y-4 max-w-2xl mx-auto" },
                    homeScreenLevels.map((levelData, index) => {
                        const { level, difficulty, game } = levelData;
                        const IconComponent = ICONS[game.icon] || GamepadIcon;
                        return e(React.Fragment, { key: game.id },
                            e('button', {
                                onClick: () => onSelectGame(game),
                                className: "w-full p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-left group border border-slate-200 dark:border-slate-700"
                            },
                                e('div', { className: 'flex justify-between items-start' },
                                    e('div', null,
                                        e('span', { className: 'px-2 py-1 text-xs font-semibold tracking-wider uppercase rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200' }, `Level ${level}: ${difficulty}`),
                                        e('h3', { className: "text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors mt-2" }, game.question)
                                    ),
                                    e(IconComponent, { className: "w-8 h-8 text-sky-500 flex-shrink-0 ml-4" })
                                ),
                                e('p', { className: "text-slate-600 dark:text-slate-400 mt-2" }, game.description)
                            ),
                            index < homeScreenLevels.length - 1 && e('div', { className: 'flex justify-center my-2' }, 
                                e(ChevronDownIcon, { className: 'w-8 h-8 text-slate-300 dark:text-slate-600' })
                            )
                        );
                    })
                )
            ),
             e('section', { className: 'text-center' },
                e('h3', { className: "text-lg font-bold text-slate-800 dark:text-slate-100 mb-2" }, "Share This App"),
                e('div', { className: 'flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md max-w-xs mx-auto' },
                    e('img', {
                        src: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tkp1972.github.io/bible-flashcard-quiz-game/',
                        alt: 'QR code for Bible Flashcard Quiz Game',
                        width: 150,
                        height: 150,
                        className: 'rounded-md'
                    }),
                    e('p', { className: 'mt-3 text-sm text-slate-600 dark:text-slate-400' }, 'Scan the code to visit the page.'),
                    e('a', {
                        href: 'https://tkp1972.github.io/bible-flashcard-quiz-game/',
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: 'mt-1 text-xs text-sky-600 dark:text-sky-400 hover:underline break-all'
                    }, 'tkp1972.github.io/bible-flashcard-quiz-game/')
                )
            ),
            e('section', { className: 'px-2 text-center' },
                e('h3', { className: "font-semibold text-md text-slate-700 dark:text-slate-300" }, "Play Offline!"),
                e('p', { className: "text-sm text-slate-500 dark:text-slate-400 mt-1" },
                    "This app can be installed on your device to work without an internet connection."
                ),
                e('p', { className: "text-xs text-slate-500 dark:text-slate-500 mt-2" },
                    "To install, look for the 'Add to Home Screen' or 'Install App' option in your browser's menu."
                )
            )
        )
    );
};

const FlashcardsMenuScreen = ({ onSelectTopic, onBack, themeToggle, initialContext, completedItems }) => {
    const [openItems, setOpenItems] = useState(() => {
        if (initialContext && initialContext.groupTitle && initialContext.subGroupTitle) {
            const newSet = new Set();
            newSet.add(initialContext.groupTitle);
            newSet.add(`${initialContext.groupTitle}-${initialContext.subGroupTitle}`);
            return newSet;
        }
        return new Set();
    });

    const toggleOpen = (key) => {
        setOpenItems(prev => {
            const newSet = new Set(); // Only allow one main category open at a time
            if (!prev.has(key)) {
                newSet.add(key);
            }
            return newSet;
        });
    };
    
    const toggleSubOpen = (key) => {
        setOpenItems(prev => {
            const newSet = new Set(prev);
             if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    return e('div', null,
        e(Header, { onBack, title: "Flashcard Decks" }, themeToggle),
        e('main', { className: "p-4" },
            e('div', { className: "space-y-4" },
                flashcardDecks.map(group => {
                    const isGroupOpen = openItems.has(group.title);
                    return e('div', { key: group.title, className: "bg-white dark:bg-slate-800 rounded-lg shadow-md" },
                        e('button', { onClick: () => toggleOpen(group.title), className: `w-full flex justify-between items-center p-4 text-left bg-sky-50 dark:bg-sky-900/40 transition-colors ${isGroupOpen ? 'rounded-t-lg' : 'rounded-lg'}`, 'aria-expanded': isGroupOpen },
                            e('h3', { className: "text-xl font-bold text-sky-700 dark:text-sky-400" }, group.title),
                            e(ChevronDownIcon, { className: `w-6 h-6 text-slate-500 transition-transform duration-300 ${isGroupOpen ? 'rotate-180' : ''}` })
                        ),
                        e('div', { className: `accordion-content ${isGroupOpen ? 'open' : ''}` },
                           e('div', null,
                                e('div', { className: "px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2" },
                                    group.subGroups.map(subGroup => {
                                        const subGroupKey = `${group.title}-${subGroup.title}`;
                                        const isSubGroupOpen = openItems.has(subGroupKey);
                                        return e('div', { key: subGroupKey, className: "border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900/50" },
                                            e('button', { onClick: () => toggleSubOpen(subGroupKey), className: "w-full flex justify-between items-center p-3 text-left", 'aria-expanded': isSubGroupOpen },
                                                e('h4', { className: "font-semibold text-slate-800 dark:text-white" }, subGroup.title),
                                                e(ChevronDownIcon, { className: `w-5 h-5 text-slate-400 transition-transform duration-300 ${isSubGroupOpen ? 'rotate-180' : ''}` })
                                            ),
                                            e('div', { className: `accordion-content ${isSubGroupOpen ? 'open' : ''}` },
                                               e('div', null,
                                                    e('div', { className: "p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-600" },
                                                        subGroup.items.map(item => {
                                                            const isCompleted = completedItems.has(`flashcards-${item.id}`);
                                                            const buttonClass = `p-4 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left group border ${isCompleted ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`;
                                                            
                                                            return e('button', { 
                                                                key: item.id, 
                                                                onClick: () => onSelectTopic(item, { groupTitle: group.title, subGroupTitle: subGroup.title }), 
                                                                className: buttonClass
                                                            },
                                                                e('div', {className: "flex justify-between items-start"},
                                                                  e('div', null,
                                                                    e('p', { className: "text-sm font-semibold text-sky-600 dark:text-sky-400" }, item.type),
                                                                    e('p', { className: "text-md font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors" }, item.question)
                                                                  ),
                                                                  isCompleted && e(CheckCircleIcon, { className: "w-6 h-6 text-green-500 flex-shrink-0 ml-2" })
                                                                )
                                                            )
                                                        })
                                                    )
                                                )
                                            )
                                        );
                                    })
                                )
                            )
                        )
                    );
                })
            )
        )
    );
};

const ScriptureMatchingMenuScreen = ({ onSelectTopic, onBack, themeToggle, completedItems, initialContext }) => {
    const [openItems, setOpenItems] = useState(() => {
        if (initialContext && initialContext.groupTitle && initialContext.subGroupTitle) {
            const newSet = new Set();
            newSet.add(initialContext.groupTitle);
            newSet.add(`${initialContext.groupTitle}-${initialContext.subGroupTitle}`);
            return newSet;
        }
        return new Set();
    });

    const handleSelect = (item, groupTitle, subGroupTitle) => {
        let pairs = [];
        if (item.type === QuizItemType.QA && item.answers) {
            item.answers.forEach(answer => {
                pairs.push({ id: answer.reference, item1: answer.reference, item2: answer.text });
            });
        } else if (item.type === QuizItemType.PROPHECY && item.pairs) {
            item.pairs.forEach(pair => {
                if (pair.prophecy) pairs.push({ id: pair.prophecy.reference, item1: pair.prophecy.reference, item2: pair.prophecy.text });
                if (pair.fulfillment) pairs.push({ id: pair.fulfillment.reference, item1: pair.fulfillment.reference, item2: pair.fulfillment.text });
            });
        }

        if (pairs.length > 0) {
            onSelectTopic({
                id: item.id,
                question: `Match: ${item.question}`,
                type: QuizItemType.MATCH_SCRIPTURE,
                pairs: pairs
            }, { groupTitle, subGroupTitle });
        } else {
            alert("This category has no scriptures to match.");
        }
    };
    
    const toggleOpen = (key) => {
        setOpenItems(prev => {
            const newSet = new Set();
            if (!prev.has(key)) newSet.add(key);
            return newSet;
        });
    };
    
    const toggleSubOpen = (key) => {
        setOpenItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) newSet.delete(key);
            else newSet.add(key);
            return newSet;
        });
    };

    return e('div', null,
        e(Header, { onBack, title: "Select a Category to Match" }, themeToggle),
        e('main', { className: "p-4" },
            e('div', { className: "space-y-4" },
                flashcardDecks.map(group => {
                    const isGroupOpen = openItems.has(group.title);
                    return e('div', { key: group.title, className: "bg-white dark:bg-slate-800 rounded-lg shadow-md" },
                        e('button', { onClick: () => toggleOpen(group.title), className: `w-full flex justify-between items-center p-4 text-left bg-sky-50 dark:bg-sky-900/40 transition-colors ${isGroupOpen ? 'rounded-t-lg' : 'rounded-lg'}`, 'aria-expanded': isGroupOpen },
                            e('h3', { className: "text-xl font-bold text-sky-700 dark:text-sky-400" }, group.title),
                            e(ChevronDownIcon, { className: `w-6 h-6 text-slate-500 transition-transform duration-300 ${isGroupOpen ? 'rotate-180' : ''}` })
                        ),
                        e('div', { className: `accordion-content ${isGroupOpen ? 'open' : ''}` },
                           e('div', null,
                                e('div', { className: "px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2" },
                                    group.subGroups.map(subGroup => {
                                        const subGroupKey = `${group.title}-${subGroup.title}`;
                                        const isSubGroupOpen = openItems.has(subGroupKey);
                                        return e('div', { key: subGroupKey, className: "border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900/50" },
                                            e('button', { onClick: () => toggleSubOpen(subGroupKey), className: "w-full flex justify-between items-center p-3 text-left" },
                                                e('h4', { className: "font-semibold text-slate-800 dark:text-white" }, subGroup.title),
                                                e(ChevronDownIcon, { className: `w-5 h-5 text-slate-400 transition-transform duration-300 ${isSubGroupOpen ? 'rotate-180' : ''}` })
                                            ),
                                            e('div', { className: `accordion-content ${isSubGroupOpen ? 'open' : ''}` },
                                               e('div', null,
                                                    e('div', { className: "p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-600" },
                                                        subGroup.items.map(item => {
                                                            const isCompleted = completedItems.has(`match-scripture-${item.id}`);
                                                            const buttonClass = `p-4 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left group border ${isCompleted ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`;

                                                            return e('button', { 
                                                                key: item.id, 
                                                                onClick: () => handleSelect(item, group.title, subGroup.title), 
                                                                className: buttonClass
                                                            },
                                                                e('div', { className: "flex justify-between items-start" },
                                                                    e('p', { className: "text-md font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors" }, item.question),
                                                                    isCompleted && e(CheckCircleIcon, { className: "w-6 h-6 text-green-500 flex-shrink-0 ml-2" })
                                                                )
                                                            );
                                                        })
                                                    )
                                                )
                                            )
                                        );
                                    })
                               )
                            )
                        )
                    );
                })
            )
        )
    );
};

const Flashcard = ({ front, back, isFlipped, onFlip }) => e('div', { className: "w-full h-full cursor-pointer", onClick: onFlip, style: { perspective: '1000px' }, role: "button", 'aria-label': "Flip card" },
    e('div', { className: "relative w-full h-full transition-transform duration-700", style: { transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'none' } },
        e('div', { className: "absolute w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex items-center justify-center", style: { backfaceVisibility: 'hidden' } }, front),
        e('div', { className: "absolute w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 overflow-y-auto", style: { backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' } },
            e('div', { className: "h-full w-full" }, back)
        )
    )
);

const ScriptureList = ({ scriptures }) => e('div', { className: "space-y-4" },
    scriptures.map((s, i) => e('div', { key: i },
        e('p', { className: "font-serif text-lg text-slate-700 dark:text-slate-300 leading-relaxed" }, s.text),
        e('p', { className: "text-right font-sans text-base font-semibold text-sky-600 dark:text-sky-400 mt-1" }, s.reference)
    ))
);

const CenteredScriptureList = ({ scriptures }) => e('div', { className: "space-y-4 text-center" },
    scriptures.map((s, i) => e('div', { key: i },
        e('p', { className: "font-serif text-xl text-slate-700 dark:text-slate-300 leading-relaxed" }, s.text),
        e('p', { className: "font-sans text-lg font-semibold text-sky-600 dark:text-sky-400 mt-2" }, s.reference)
    ))
);

const CenteredScriptureText = ({ scriptures }) => e('div', { className: "space-y-4 text-center flex items-center justify-center h-full" },
    scriptures.map((s, i) => e('div', { key: i },
        e('p', { className: "font-serif text-xl text-slate-700 dark:text-slate-300 leading-relaxed" }, s.text)
    ))
);

const ScriptureTextOnly = ({ scriptures }) => e('div', { className: "space-y-4" },
    scriptures.map((s, i) => e('div', { key: i, className: "flex flex-col justify-center items-center h-full text-center" },
        e('p', { className: "font-serif text-slate-700 dark:text-slate-300 leading-relaxed text-lg" }, s.text),
        e('p', { className: "text-slate-500 dark:text-slate-400 mt-8 font-sans" }, "What is the reference for this scripture?")
    ))
);

const GameScreen = ({ topic, onBack, themeToggle, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [gameItems, setGameItems] = useState([]);
  const hasCompleted = useRef(false);

  useEffect(() => {
    hasCompleted.current = false;
    let items = [];
    if (topic.type === QuizItemType.QA) items = topic.answers;
    else if (topic.type === QuizItemType.PROPHECY) items = topic.pairs;
    else items = [topic];
    setGameItems(items);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsReversed(false);
  }, [topic]);
  
  useEffect(() => {
    if (!hasCompleted.current && gameItems.length > 0 && currentIndex === gameItems.length - 1) {
        onComplete(topic.id);
        hasCompleted.current = true;
    }
  }, [currentIndex, gameItems.length, onComplete, topic.id]);

    const handleShuffle = useCallback(() => {
        setGameItems(shuffleArray(gameItems));
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [gameItems]);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % gameItems.length);
        }, 200);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + gameItems.length) % gameItems.length);
        }, 200);
    };

    const currentItem = useMemo(() => gameItems[currentIndex], [gameItems, currentIndex]);

    const renderFrontContent = () => {
        switch (topic.type) {
            case QuizItemType.QA:
                if (!currentItem) return null;
                if (isReversed) {
                    return e(ScriptureTextOnly, { scriptures: [{ text: currentItem.keyPhrase }] });
                }
                return e('div', { className: "text-center flex flex-col justify-center items-center h-full" },
                    e('p', { className: "text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-4" }, "Recall the Scripture"),
                    e('p', { className: "text-4xl font-bold font-sans text-slate-800 dark:text-slate-100" }, currentItem.reference)
                );
            case QuizItemType.PROPHECY:
                if (!currentItem) return null;
                return e('div', null,
                    e('p', { className: "text-sm font-bold text-center text-sky-600 dark:text-sky-400 mb-4" }, "PROPHECY"),
                    e(ScriptureList, { scriptures: [currentItem.prophecy] })
                );
            case QuizItemType.BOOKS:
            case QuizItemType.HOW_TO:
                return e('p', { className: "text-2xl font-bold text-center" }, topic.question);
            default: return null;
        }
    };
    
    const renderBackContent = () => {
        switch (topic.type) {
            case QuizItemType.QA:
                if (!currentItem) return null;
                if (isReversed) {
                    return e('div', { className: "text-center flex flex-col justify-center items-center h-full" },
                        e('p', { className: "text-4xl font-bold font-sans text-slate-800 dark:text-slate-100" }, currentItem.reference)
                    );
                }
                return e(CenteredScriptureText, { scriptures: [{ text: currentItem.keyPhrase }] });
            case QuizItemType.PROPHECY:
                 if (!currentItem) return null;
                const fulfillmentWithKeyPhrase = { ...currentItem.fulfillment, text: currentItem.fulfillment.keyPhrase };
                return e('div', { className: "text-center flex flex-col justify-center h-full" },
                    e('p', { className: "text-base font-bold text-green-600 dark:text-green-400 mb-4" }, "FULFILLMENT"),
                    e(CenteredScriptureList, { scriptures: [fulfillmentWithKeyPhrase] })
                );
            case QuizItemType.BOOKS:
                return e('div', { className: "space-y-6 text-center" },
                    topic.content.map(group => e('div', { key: group.group },
                        e('h3', { className: "text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2" }, group.group),
                        group.categories.map(cat => e('div', { key: cat.name, className: "mb-4" },
                            e('h4', { className: "font-semibold text-xl text-slate-700 dark:text-slate-300" }, cat.name),
                            e('p', { className: "text-lg text-slate-500 dark:text-slate-400 italic mb-1" }, cat.description),
                            e('p', { className: "text-lg text-slate-600 dark:text-slate-300" }, cat.books.join(', '))
                        ))
                    ))
                );
            case QuizItemType.HOW_TO:
                return e('div', { className: "space-y-6 text-center flex flex-col justify-center h-full" },
                    topic.points.map(point => e('div', { key: point.title, className: "mb-4" },
                        e('h4', { className: "font-semibold text-xl" }, point.title),
                        e('p', { className: "text-slate-600 dark:text-slate-400 text-lg" }, point.text)
                    )),
                    e('div', { className: "pt-6 mt-6 border-t border-slate-200 dark:border-slate-700" },
                        e(CenteredScriptureList, { scriptures: [topic.conclusion] })
                    )
                );
            default: return null;
        }
    };
    
    if (!currentItem) {
        return e('div', { className: "flex flex-col h-screen" },
            e(Header, { onBack, title: topic.question }, themeToggle),
            e('main', { className: "flex-grow p-4 md:p-8 flex items-center justify-center" },
                e('div', { className: "text-slate-500 dark:text-slate-400" }, "Loading...")
            )
        );
    }
    
    const hasMultipleCards = gameItems.length > 1;

    return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: topic.question }, themeToggle),
        e('main', { className: "flex-grow p-4 md:p-8 flex flex-col items-center justify-center" },
            e('div', { className: "w-full max-w-2xl h-[450px] mb-6" },
                e(Flashcard, { front: renderFrontContent(), back: renderBackContent(), isFlipped, onFlip: () => setIsFlipped(!isFlipped) })
            ),
            
            e('div', { className: "flex items-center justify-center space-x-2 sm:space-x-4 mt-6 w-full max-w-2xl" },
                hasMultipleCards ? e(React.Fragment, null,
                    e('button', { onClick: handlePrev, className: "p-4 rounded-full bg-white dark:bg-slate-800 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors", 'aria-label': "Previous card" }, e(ArrowLeftIcon, { className: "w-6 h-6" })),
                    e('span', { className: "font-mono text-slate-500 dark:text-slate-400 w-20 text-center" }, `${currentIndex + 1} / ${gameItems.length}`),
                    e('button', { onClick: handleNext, className: "p-4 rounded-full bg-white dark:bg-slate-800 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors", 'aria-label': "Next card" }, e(ArrowRightIcon, { className: "w-6 h-6" })),
                    e('button', { onClick: handleShuffle, className: "p-4 rounded-full bg-white dark:bg-slate-800 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors", title: "Shuffle" }, e(ShuffleIcon, { className: "w-6 h-6" }))
                ) : e('div', { className: 'h-14' }),

                e('button', { onClick: () => setIsReversed(!isReversed), className: `p-4 rounded-full shadow-md transition-colors ${isReversed ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`, title: "Reverse Card" }, e(ReverseIcon, { className: "w-6 h-6" }))
            )
        )
    );
};

// --- Book Quiz Screen Component ---
const QuizScreen = ({ topic, onBack, themeToggle, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const shuffledQuestions = shuffleArray(topic.quiz).map(q => ({ ...q, options: shuffleArray(q.options) }));
    setQuestions(shuffledQuestions);
  }, [topic]);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      onComplete(topic.id);
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    const shuffledQuestions = shuffleArray(topic.quiz).map(q => ({ ...q, options: shuffleArray(q.options) }));
    setQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
  };

  if (questions.length === 0) {
    return e('div', { className: "flex flex-col h-screen" },
      e(Header, { onBack, title: topic.question }, themeToggle),
      e('main', { className: "flex-grow p-4 md:p-8 flex items-center justify-center" },
        e('div', { className: "text-slate-500 dark:text-slate-400" }, "Loading Quiz...")
      )
    );
  }

  if (quizFinished) {
      const isPerfectScore = score === questions.length;
      return e('div', { className: "flex flex-col h-screen" },
        e(Confetti, null),
        e(Header, { onBack, title: "Quiz Results" }, themeToggle),
        e('main', { className: "flex-grow p-4 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in-up" },
            e('h2', { className: "text-4xl font-bold mb-4 text-sky-600 dark:text-sky-400" }, "Congratulations!"),
            e('p', { className: "text-lg text-slate-600 dark:text-slate-300 mb-6" }, isPerfectScore ? "You answered every question correctly!" : "You finished the quiz. Great job!"),
            e('p', { className: "text-5xl font-bold mb-8" }, "Your score: ", e('span', { className: "text-sky-600 dark:text-sky-400" }, `${score} / ${questions.length}`)),
            e('div', { className: "flex space-x-4" },
                e('button', { onClick: handleRestart, className: "px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors" }, "Try Again"),
                e('button', { onClick: onBack, className: "px-6 py-3 bg-white dark:bg-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" }, "Back to Menu")
            )
        )
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return e('div', { className: "flex flex-col h-screen" },
    e(Header, { onBack, title: topic.question }, themeToggle),
    e('main', { className: "flex-grow p-4 md:p-8 flex flex-col items-center justify-center" },
      e('div', { className: "w-full max-w-2xl" },
        e('div', { className: "text-center mb-4" },
          e('p', { className: "text-sm font-semibold text-slate-500 dark:text-slate-400" }, `Question ${currentQuestionIndex + 1} of ${questions.length}`)
        ),
        e('div', { className: "bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg mb-8 min-h-[120px] flex items-center justify-center" },
          e('p', { className: "text-xl font-semibold text-center" }, currentQuestion.questionText)
        ),
        e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
          currentQuestion.options.map(option => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            const getButtonClass = () => {
              if (!selectedAnswer) return 'bg-white dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700';
              if (isCorrect) return 'bg-green-100 dark:bg-green-900 border-green-500 ring-2 ring-green-500 text-green-800 dark:text-green-200';
              if (isSelected && !isCorrect) return 'bg-red-100 dark:bg-red-900 border-red-500 ring-2 ring-red-500 text-red-800 dark:text-red-200';
              return 'bg-white dark:bg-slate-800 opacity-60';
            };
            return e('button', { key: option, onClick: () => handleAnswerSelect(option), disabled: !!selectedAnswer, className: `p-4 rounded-lg border dark:border-slate-700 text-center font-semibold transition-all duration-300 transform hover:scale-105 ${getButtonClass()}` }, option);
          })
        ),
        selectedAnswer && e('div', { className: "text-center mt-8" },
          e('button', { onClick: handleNextQuestion, className: "px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors" },
            currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'
          )
        )
      )
    )
  );
};

// --- Matching Game Screen Component ---
const MatchingGameScreen = ({ topic, onBack, themeToggle, onComplete }) => {
    const [columnA, setColumnA] = useState([]);
    const [columnB, setColumnB] = useState([]);
    const [selectedA, setSelectedA] = useState(null);
    const [selectedB, setSelectedB] = useState(null);
    const [matchedPairs, setMatchedPairs] = useState(new Set());
    const [incorrectPair, setIncorrectPair] = useState(null);
    const [isComplete, setIsComplete] = useState(false);

    const matchMap = useMemo(() => {
        const map = new Map();
        topic.pairs.forEach(p => map.set(p.item1, p.item2));
        return map;
    }, [topic.pairs]);

    const initializeGame = useCallback(() => {
        setColumnA(shuffleArray(topic.pairs.map(p => ({ id: p.id, content: p.item1 }))));
        setColumnB(shuffleArray(topic.pairs.map(p => ({ id: p.id, content: p.item2 }))));
        setSelectedA(null);
        setSelectedB(null);
        setMatchedPairs(new Set());
        setIncorrectPair(null);
        setIsComplete(false);
    }, [topic.pairs]);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);
    
    const handleSelectA = (item) => {
        if (selectedA?.id === item.id) {
            setSelectedA(null); // Deselect if clicked again
        } else {
            setSelectedA(item);
        }
    };

    const handleSelectB = (item) => {
        if (selectedB?.id === item.id) {
            setSelectedB(null); // Deselect if clicked again
        } else {
            setSelectedB(item);
        }
    };

    useEffect(() => {
        if (selectedA && selectedB) {
            const isMatch = matchMap.get(selectedA.content) === selectedB.content;

            if (isMatch) {
                setMatchedPairs(prev => new Set(prev).add(selectedA.id));
                setSelectedA(null);
                setSelectedB(null);
            } else {
                setIncorrectPair({ aId: selectedA.id, bId: selectedB.id });
                setTimeout(() => {
                    setIncorrectPair(null);
                    setSelectedA(null);
                    setSelectedB(null);
                }, 1000);
            }
        }
    }, [selectedA, selectedB, matchMap]);
    
    useEffect(() => {
        if (matchedPairs.size > 0 && matchedPairs.size === topic.pairs.length) {
            onComplete(topic.id);
            setIsComplete(true);
        }
    }, [matchedPairs, topic.pairs.length, onComplete, topic.id]);


    if (isComplete) {
      return e('div', { className: "flex flex-col h-screen" },
        e(Confetti, null),
        e(Header, { onBack, title: "Game Complete!" }, themeToggle),
        e('main', { className: "flex-grow p-4 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in-up" },
            e('h2', { className: "text-4xl font-bold mb-4 text-sky-600 dark:text-sky-400" }, "Congratulations!"),
            e('p', { className: "text-lg text-slate-600 dark:text-slate-300 mb-6" }, "You matched them all!"),
            e('div', { className: "flex space-x-4 mt-8" },
                e('button', { onClick: initializeGame, className: "px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors" }, "Play Again"),
                e('button', { onClick: onBack, className: "px-6 py-3 bg-white dark:bg-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" }, "Back to Menu")
            )
        )
    );
    }
    
    const getCardClass = (item, type) => {
        const isA = type === 'A';
        const isSelected = isA ? selectedA?.id === item.id : selectedB?.id === item.id;
        const isMatched = matchedPairs.has(item.id);
        const isIncorrect = isA ? incorrectPair?.aId === item.id : incorrectPair?.bId === item.id;

        let base = `w-full p-4 rounded-lg border-2 ${isA ? 'text-center' : 'text-left'} flex ${isA ? 'items-center justify-center' : 'items-start'} transition-all duration-300 cursor-pointer `;
        if (isMatched) return base + "bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-300 opacity-60 cursor-default";
        if (isIncorrect) return base + "bg-red-100 dark:bg-red-900/50 border-red-500 transform scale-105 animate-pulse";
        if (isSelected) return base + "bg-sky-100 dark:bg-sky-900/50 border-sky-500 ring-2 ring-sky-500 transform scale-105 shadow-lg";
        return base + "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-sky-400 hover:shadow-md";
    };
    
    const fontClassA = "font-bold text-base md:text-lg";
    const fontClassB = "font-serif text-sm md:text-base";

    return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: topic.question }, themeToggle),
        e('main', { className: "flex-grow p-2 sm:p-4 md:p-8" },
            e('div', { className: "grid grid-cols-[auto,1fr] gap-2 sm:gap-4 h-full" },
                e('div', { className: "flex flex-col gap-2 sm:gap-4" },
                    columnA.map(item => e('button', { 
                        key: `A-${item.id}`,
                        onClick: () => handleSelectA(item), 
                        disabled: matchedPairs.has(item.id),
                        className: `flex-1 ${getCardClass(item, 'A')}`
                    }, e('span', { className: fontClassA }, item.content)))
                ),
                e('div', { className: "flex flex-col gap-2 sm:gap-4" },
                    columnB.map(item => e('button', { 
                        key: `B-${item.id}`,
                        onClick: () => handleSelectB(item),
                        disabled: matchedPairs.has(item.id),
                        className: `flex-1 ${getCardClass(item, 'B')}`
                    }, e('span', { className: fontClassB }, item.content)))
                )
            )
        )
    );
};

// --- Book Order Game Components ---
const BookOrderStartScreen = ({ onPractice, onStart, onBack, themeToggle }) => {
    return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: "Bible Book Order" }, themeToggle),
        e('main', { className: "p-4 flex-grow flex flex-col items-center justify-center" },
            e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl" },
                e('button', {
                    onClick: onPractice,
                    className: "p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-center group border border-slate-200 dark:border-slate-700"
                },
                    e(BrainIcon, { className: "w-12 h-12 text-sky-500 mx-auto mb-4" }),
                    e('h3', { className: "text-2xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors" }, "Practice Mnemonics"),
                    e('p', { className: "text-md text-slate-500 dark:text-slate-400 mt-2" }, "Learn memory aids to master the book order.")
                ),
                e('button', {
                    onClick: onStart,
                    className: "p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-center group border border-slate-200 dark:border-slate-700"
                },
                    e(GamepadIcon, { className: "w-12 h-12 text-sky-500 mx-auto mb-4" }),
                    e('h3', { className: "text-2xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors" }, "Start Challenge"),
                    e('p', { className: "text-md text-slate-500 dark:text-slate-400 mt-2" }, "Test your knowledge by arranging the books.")
                )
            )
        )
    );
};

const MinorProphetsMnemonic = () => {
  const books = [
    "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah",
    "Nahum", "Habakkuk", "Zephaniah",
    "Haggai", "Zechariah", "Malachi"
  ];
  const width = 500;
  const height = 400;
  const cols = 3;
  const rows = 4;
  const cellWidth = 150;
  const cellHeight = 80;
  const xPadding = (width - cols * cellWidth) / 2;
  const yPadding = (height - rows * cellHeight) / 2;

  const getCellCoords = (index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      x: xPadding + col * cellWidth + cellWidth / 2,
      y: yPadding + row * cellHeight + cellHeight / 2
    };
  };

  const habakkukCoords = getCellCoords(7); // Habakkuk
  const haggaiCoords = getCellCoords(9); // Haggai
  const zephaniahCoords = getCellCoords(8); // Zephaniah
  const zechariahCoords = getCellCoords(10); // Zechariah

  return e('svg', { viewBox: `0 0 ${width} ${height}`, className: 'w-full h-auto bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700' },
    e('defs', null,
      e('marker', {
        id: 'arrowhead',
        viewBox: '0 0 10 10',
        refX: '8',
        refY: '5',
        markerWidth: '6',
        markerHeight: '6',
        orient: 'auto-start-reverse',
        className: 'fill-slate-500 dark:fill-slate-400'
      }, e('path', { d: 'M 0 0 L 10 5 L 0 10 z' }))
    ),
    e('path', {
      d: `M ${habakkukCoords.x - 55} ${habakkukCoords.y} Q ${haggaiCoords.x + 30} ${((habakkukCoords.y + haggaiCoords.y) / 2) - 25} ${haggaiCoords.x - 35} ${haggaiCoords.y - 15}`,
      strokeWidth: '2',
      fill: 'none',
      markerEnd: 'url(#arrowhead)',
      className: 'stroke-slate-500 dark:stroke-slate-400'
    }),
    e('path', {
      d: `M ${zephaniahCoords.x - 55} ${zephaniahCoords.y} Q ${zechariahCoords.x + 40} ${((zephaniahCoords.y + zechariahCoords.y) / 2) - 25} ${zechariahCoords.x - 50} ${zechariahCoords.y - 15}`,
      strokeWidth: '2',
      fill: 'none',
      markerEnd: 'url(#arrowhead)',
      className: 'stroke-slate-500 dark:stroke-slate-400'
    }),
    books.map((book, index) => {
      const { x, y } = getCellCoords(index);
      const col = index % cols;
      const isHONH = col === 0;
      const isJ = book === 'Joel' || book === 'Jonah';
      const endsWithAh = book === 'Obadiah' || book === 'Jonah' || book === 'Micah';
      const isSpecialConnection = book === 'Habakkuk' || book === 'Haggai' || book === 'Zephaniah' || book === 'Zechariah';

      return e('text', {
        key: book, x, y,
        fontFamily: "Inter, sans-serif",
        fontSize: "18",
        fontWeight: "600",
        textAnchor: "middle",
        dominantBaseline: "central",
        className: "fill-slate-800 dark:fill-slate-200"
      },
        e('tspan', { className: (isHONH || isJ || isSpecialConnection) ? 'fill-sky-600 dark:fill-sky-400 font-bold' : '' }, book.charAt(0)),
        e('tspan', null, book.substring(1, book.length - (endsWithAh ? 2 : 0))),
        endsWithAh ? e('tspan', { className: 'fill-sky-600 dark:fill-sky-400 font-bold' }, 'ah') : null
      );
    })
  );
};

const mnemonicData = [
    { title: "The Pentateuch (5 books)", content: e('div', {className: "space-y-2"}, e('p', null, "Remember the story:"), e('ul', {className: "list-disc list-inside space-y-1 pl-2"}, e('li', null, e('strong', null, "Genesis"), " means Origin or Birth."), e('li', null, e('strong', null, "Exodus"), ": Jehovah leads the Israelites out of Egypt with a 'mighty hand' and an 'outstretched arm'"), e('li', null, e('strong', null, "Leviticus"), ": Jehovah organizes the Israelites into a theocratic nation with the Levitical priesthood"), e('li', null, e('strong', null, "Numbers"), ": The tribes of Israel are registered (Numbered) and organized into a three-tribe division"), e('li', null, e('strong', null, "Deuteronomy"), ": The final book of the Pentateuch."))) },
    { title: "Historical Books (12 books)", content: e('div', {className: "space-y-2"}, e('p', null, "Follow the historical flow:"), e('ul', {className: "list-disc list-inside space-y-1 pl-2"}, e('li', null, "After Moses, ", e('strong', null, "Joshua"), " led them into the promised land."), e('li', null, "Next is the period of the ", e('strong', null, "Judges"), ", which includes the story of ", e('strong', null, "Ruth"), "."), e('li', null, "After the judges, Israel wanted a king. ", e('strong', null, "1 & 2 Samuel"), " tell of Samuel anointing the first kings, leading into the history of the monarchies in ", e('strong', null, "1 & 2 Kings"), "."), e('li', null, e('strong', null, "1 & 2 Chronicles"), " cover the period from the death of King Saul to the carrying away of exiles to Babylon, with a conclusion telling of Cyrus’ decree at the end of the 70-year exile."), e('li', null, "The book of ", e('strong', null, "Ezra"), " is followed by ", e('strong', null, "Nehemiah"), " rebuilding Jerusalem’s wall."), e('li', null, "In the book of ", e('strong', null, "Esther"), ", Jehovah protects his people in Persia by Esther attaining queenship."))) },
    { 
        title: "Poetic Books (5 books)", 
        content: e('div', {className: "space-y-2"}, 
            e('p', null, "A simple way to remember this section:"), 
            e('ul', {className: "list-disc list-inside space-y-1 pl-2"}, 
                e('li', null, 
                    "Think of ", e('strong', null, "Psalms"), " as being 'sandwiched' by ", e('strong', null, "Job"), " before it and ", e('strong', null, "Proverbs"), " after it."
                ), 
                e('li', null, 
                    "The final two books are ", e('strong', null, "Ecclesiastes"), " and ", e('strong', null, "Song of Solomon"), "."
                )
            )
        ) 
    },
    { title: '"Major" Prophets (5 books)', content: e('p', null, "These five books can be memorized in order: Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel.") },
    { title: '"Minor" Prophets (12 books)', content: e('div', { className: 'space-y-4' },
        e('p', {className: "text-sm text-slate-600 dark:text-slate-400"}, "This diagram uses color and connections to highlight patterns in the book order. Here's what to look for:"),
        e('div', { className: 'max-w-md mx-auto' }, e(MinorProphetsMnemonic)),
        e('div', {className: "space-y-2 text-sm text-slate-600 dark:text-slate-400"},
            e('ul', { className: "list-disc list-inside space-y-1 pl-2"},
                e('li', null, "Memorize the top row: Hosea, Joel, Amos."),
                e('li', null, "Remember the first letters of each row vertically: ", e('strong', null, "H-O-N-H"), "."),
                e('li', null, "The middle book in each of the top two rows starts with ", e('strong', null, "J"), "."),
                e('li', null, "All books in the second row end in '", e('strong', null, "ah"), "' (Obadi", e('strong', null, "ah"), ", Jon", e('strong', null, "ah"), ", Mic", e('strong', null, "ah"), ")."),
                e('li', null, "Notice the connections: ", e('strong', null, "H"), "abakkuk links to ", e('strong', null, "H"), "aggai, and ", e('strong', null, "Z"), "ephaniah links to ", e('strong', null, "Z"), "echariah."),
                e('li', null, "The last book of the Hebrew Scriptures is Malachi.")
            )
        )
    ) },
    {
        title: "The Four Gospels & Acts",
        content: e('div', {className: "space-y-2"},
            e('p', null, "These first five books are historical narratives:"),
            e('ul', {className: "list-disc list-inside space-y-1 pl-2"},
                e('li', null, e('strong', null, "Matthew, Mark, Luke, John:"), " The four accounts of Jesus' life and ministry."),
                e('li', null, e('strong', null, "Acts:"), " Follows the Gospels, documenting the history of the early Christian congregation.")
            )
        )
    },
    {
        title: "Paul's 14 Letters",
        content: e('div', {className: "space-y-2"},
            e('p', null, "Paul's letters can be remembered by following this logical flow:"),
            e('ul', {className: "list-disc list-inside space-y-1 pl-2"},
                e('li', null, "It starts with ", e('strong', null, "Romans"), ". Paul, an apostle to the nations, had Roman citizenship."),
                e('li', null, "Next are all letters to congregations ending in '", e('strong', null, "ians"), "': 1 & 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 & 2 Thessalonians."),
                e('li', null, "Then, letters to ", e('strong', null, "Timothy"), " (1 & 2) and ", e('strong', null, "Titus"), ", regarding spiritual requirements for privileges of service."),
                e('li', null, "A personal appeal to ", e('strong', null, "Philemon"), " on the basis of love to take back his runaway slave, who had become a Christian."),
                e('li', null, "He ends with a letter to the ", e('strong', null, "Hebrew"), " Christians in Jerusalem and Judea.")
            )
        )
    },
    {
        title: "General Letters & Revelation",
        content: e('div', {className: "space-y-2"},
            e('ul', {className: "list-disc list-inside space-y-1 pl-2"},
                e('li', null, e('strong', null, "James")),
                e('li', null, e('strong', null, "1 & 2 Peter")),
                e('li', null, e('strong', null, "1, 2, & 3 John")),
                e('li', null, e('strong', null, "Jude")),
                e('li', {className: "mt-2"}, "The final book of the Bible is ", e('strong', null, "Revelation"), ".")
            )
        )
    }
];

const BookOrderPracticeScreen = ({ onBack, themeToggle }) => {
    const [openKey, setOpenKey] = useState(mnemonicData[0].title);

    const toggleOpen = (key) => {
        setOpenKey(prevKey => (prevKey === key ? null : key));
    };

    return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: "Practice Mnemonics" }, themeToggle),
        e('main', { className: "p-4" },
            e('div', { className: "space-y-4" },
                mnemonicData.map(item => {
                    const isOpen = openKey === item.title;
                    return e('div', { key: item.title, className: "bg-white dark:bg-slate-800 rounded-lg shadow-md" },
                        e('button', { onClick: () => toggleOpen(item.title), className: "w-full flex justify-between items-center p-4 text-left", 'aria-expanded': isOpen },
                            e('h3', { className: "text-xl font-bold text-slate-800 dark:text-slate-100" }, item.title),
                            e(ChevronDownIcon, { className: `w-6 h-6 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}` })
                        ),
                        e('div', { className: `accordion-content ${isOpen ? 'open' : ''}` },
                            e('div', null,
                                e('div', { className: "px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700" },
                                    e('div', { className: 'prose dark:prose-invert prose-p:my-2 prose-ul:my-2' }, item.content)
                                )
                            )
                        )
                    );
                })
            )
        )
    );
};

const BookOrderChallengeScreen = ({ onSelectSection, onBack, themeToggle, completedItems }) => {
    return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: "Bible Book Order Challenge" }, themeToggle),
        e('main', { className: "p-4 flex-grow flex items-center justify-center" },
            e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl" },
                bibleBookOrderData.map(section => {
                    const bookCount = section.categories.flatMap(c => c.books).length;
                    const isCompleted = completedItems.has(`order-books-${section.id}`);
                    const buttonClass = `p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-left group border ${isCompleted ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`;

                    return e('button', {
                        key: section.sectionTitle,
                        onClick: () => onSelectSection(section),
                        className: buttonClass
                    },
                      e('div', {className: 'flex justify-between items-start'},
                        e('div', null, 
                          e('h3', { className: "text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors" }, section.sectionTitle),
                          e('p', { className: "text-md text-slate-500 dark:text-slate-400 mt-1" }, `${bookCount} books`)
                        ),
                        isCompleted && e(CheckCircleIcon, { className: "w-8 h-8 text-green-500 flex-shrink-0 ml-2" })
                      )
                    )
                })
            )
        )
    );
};

const BookOrderGameScreen = ({ section, onBack, themeToggle, onComplete }) => {
    const [stage, setStage] = useState('books'); // 'books', 'categories', 'complete'
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [completedCategories, setCompletedCategories] = useState([]);
    
    const [sourceBooks, setSourceBooks] = useState([]);
    const [targetBooks, setTargetBooks] = useState([]);
    const [isCategoryCorrect, setIsCategoryCorrect] = useState(false);
    
    const [categoryOrder, setCategoryOrder] = useState([]);
    const [categoryStatuses, setCategoryStatuses] = useState([]);
    const [feedback, setFeedback] = useState({ text: '', type: '' });
    const [isFinalOrderCorrect, setIsFinalOrderCorrect] = useState(false);

    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const hasCompleted = useRef(false);

    useEffect(() => {
        hasCompleted.current = false;
    }, [section.id]);

    const currentCategory = useMemo(() => section.categories[categoryIndex], [section, categoryIndex]);

    const setupCategory = useCallback((index) => {
        const categoryData = section.categories[index];
        if (!categoryData) return;
        setSourceBooks(shuffleArray(categoryData.books.map(b => ({ name: b }))));
        setTargetBooks([]);
        setIsCategoryCorrect(false);
        setFeedback({ text: '', type: '' });
    }, [section.categories]);

    useEffect(() => {
        if (stage === 'books') {
            setupCategory(categoryIndex);
        }
    }, [stage, categoryIndex, setupCategory]);

    useEffect(() => {
        if (stage === 'books' && currentCategory && sourceBooks.length === 0 && targetBooks.length > 0) {
            const correctOrder = currentCategory.books;
            const userOrder = targetBooks.map(b => b.name);
            const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
            
            setIsCategoryCorrect(isCorrect);
            setFeedback({
                text: isCorrect ? "Correct! Well done." : "The order is not quite right. Try again!",
                type: isCorrect ? 'success' : 'error'
            });
        } else {
             setIsCategoryCorrect(false);
             if (feedback.type === 'error') {
                 setFeedback({ text: '', type: '' });
             }
        }
    }, [stage, sourceBooks, targetBooks, currentCategory, feedback.type]);

    const handleNext = () => {
        const newCompletedCategory = { title: currentCategory.title, books: targetBooks.map(b => b.name) };
        const updatedCompleted = [...completedCategories, newCompletedCategory];
        setCompletedCategories(updatedCompleted);

        if (categoryIndex < section.categories.length - 1) {
            setCategoryIndex(prev => prev + 1);
        } else {
            setStage('categories');
            setCategoryOrder(shuffleArray(updatedCompleted));
            setFeedback({ text: '', type: '' });
        }
    };
    
    const resetCurrentCategory = () => {
        setupCategory(categoryIndex);
    }

    const checkCategoryOrder = () => {
        const correctOrder = section.categories.map(c => c.title);
        const userOrder = categoryOrder.map(c => c.title);
        const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(userOrder);
        
        const statuses = userOrder.map((title, index) => correctOrder[index] === title ? 'correct' : 'incorrect');
        setCategoryStatuses(statuses);

        if (isCorrect) {
            if (!hasCompleted.current) {
                onComplete(section.id);
                hasCompleted.current = true;
            }
            setIsFinalOrderCorrect(true);
            setFeedback({ text: "Perfect! You've ordered everything correctly.", type: 'success' });
            setTimeout(() => setStage('complete'), 1500);
        } else {
            setFeedback({ text: 'Not quite right. Correct items are green, incorrect are red.', type: 'error' });
        }
    };

    const handleDragStart = useCallback((e, item, source, index) => {
        dragItem.current = { item, source, index };
        setIsDragging(true);
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', ''); // For Firefox compatibility
        }
        if (stage === 'categories') {
            setCategoryStatuses([]);
            setFeedback({ text: '', type: '' });
        }
    }, [stage]);

    const handleDragEnd = useCallback(() => {
        dragItem.current = null;
        dragOverItem.current = null;
        setDragOverIndex(null);
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e, index) => {
        e.preventDefault(); // Necessary to allow dropping
        if (dragOverItem.current !== index) {
            dragOverItem.current = index;
            setDragOverIndex(index);
        }
    }, []);

    const handleContainerDragLeave = useCallback((e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            dragOverItem.current = null;
            setDragOverIndex(null);
        }
    }, []);

    const handleDrop = useCallback((e, target) => {
        e.preventDefault();
        if (!dragItem.current) return;
        
        const { item, source, index } = dragItem.current;
        
        if (stage === 'books') {
            let newSourceBooks = [...sourceBooks];
            let newTargetBooks = [...targetBooks];

            if (source === 'source' && target === 'targetBooks') {
                newSourceBooks.splice(index, 1);
                const dropIndex = dragOverItem.current !== null ? dragOverItem.current : newTargetBooks.length;
                newTargetBooks.splice(dropIndex, 0, item);
            } else if (source === 'target' && target === 'targetBooks') {
                const draggedItem = newTargetBooks.splice(index, 1)[0];
                const dropIndex = dragOverItem.current !== null ? dragOverItem.current : newTargetBooks.length;
                newTargetBooks.splice(dropIndex, 0, draggedItem);
            } else if (source === 'target' && target === 'sourceBooks') {
                const draggedItem = newTargetBooks.splice(index, 1)[0];
                newSourceBooks.push(draggedItem);
            }
            
            setSourceBooks(newSourceBooks);
            setTargetBooks(newTargetBooks);
        }
        
        if (stage === 'categories') {
            let newCategoryOrder = [...categoryOrder];
            const draggedItem = newCategoryOrder.splice(index, 1)[0];
            const dropIndex = dragOverItem.current !== null ? dragOverItem.current : newCategoryOrder.length;
            newCategoryOrder.splice(dropIndex, 0, draggedItem);
            setCategoryOrder(newCategoryOrder);
        }
        
        handleDragEnd();
    }, [stage, sourceBooks, targetBooks, categoryOrder, handleDragEnd]);

    useEffect(() => {
        const moveHandler = (clientX, clientY) => {
            const element = document.elementFromPoint(clientX, clientY);
            if (!element) return;

            const dropTarget = element.closest('[data-dnd-index]');
            let newDragOverIndex = null;
            
            if (dropTarget) {
                const index = parseInt(dropTarget.dataset.dndIndex, 10);
                const zone = dropTarget.dataset.dndZone;
                if ((stage === 'books' && zone === 'targetBooks') || (stage === 'categories' && zone === 'categories')) {
                    newDragOverIndex = index;
                }
            } else {
                const dropContainer = element.closest('[data-dnd-container]');
                if (dropContainer) {
                    const zone = dropContainer.dataset.dndContainer;
                    if (stage === 'books' && zone === 'targetBooks') newDragOverIndex = targetBooks.length;
                    else if (stage === 'categories' && zone === 'categories') newDragOverIndex = categoryOrder.length;
                }
            }
            
            if (newDragOverIndex !== dragOverIndex) {
                 dragOverItem.current = newDragOverIndex;
                 setDragOverIndex(newDragOverIndex);
            }
        };

        const handleTouchMove = e => {
            if (isDragging) {
                 e.preventDefault();
                 const touch = e.touches[0];
                 moveHandler(touch.clientX, touch.clientY);
            }
        };

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        
        const handleTouchEnd = (e) => {
            if (isDragging) {
                const touch = e.changedTouches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                const container = element ? element.closest('[data-dnd-container]') : null;
                if (container) {
                    handleDrop(e, container.dataset.dndContainer);
                } else {
                    handleDragEnd();
                }
            }
        };

        window.addEventListener('touchend', handleTouchEnd);
        
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, stage, targetBooks.length, categoryOrder.length, dragOverIndex, handleDrop, handleDragEnd]);

    const resetGame = useCallback(() => {
        setStage('books');
        setCategoryIndex(0);
        setCompletedCategories([]);
        setCategoryOrder([]);
        setCategoryStatuses([]);
        setIsFinalOrderCorrect(false);
    }, []);

    if (stage === 'complete') {
        return e('div', { className: "flex flex-col h-screen" },
            e(Confetti, null),
            e(Header, { onBack, title: section.sectionTitle }, themeToggle),
            e('main', { className: "flex-grow p-4 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in-up" },
                e('h2', { className: "text-4xl font-bold mb-4 text-sky-600 dark:text-sky-400" }, "Congratulations!"),
                e('p', { className: "text-lg text-slate-600 dark:text-slate-300 mb-6" }, `You correctly sorted all books and categories for the ${section.sectionTitle}.`),
                e('div', { className: "flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8" },
                    e('button', { onClick: resetGame, className: "px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors" }, "Play Again"),
                    e('button', { onClick: onBack, className: "px-6 py-3 bg-white dark:bg-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" }, "Back to Menu")
                )
            )
        );
    }
    
    const getFeedbackClass = (type) => {
        if (type === 'success') return 'text-green-600 dark:text-green-400';
        if (type === 'error') return 'text-red-600 dark:text-red-400';
        return 'text-slate-600 dark:text-slate-400';
    };
    
    return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: `Order: ${section.sectionTitle}` }, themeToggle),
        e('main', { className: "flex-grow p-4 flex flex-col items-center" },
            stage === 'books' && currentCategory && e('div', { key: categoryIndex, className: 'w-full max-w-4xl animate-fade-in' },
                e('div', { className: 'text-center mb-4' },
                    e('p', { className: 'text-sm font-semibold text-slate-500 dark:text-slate-400' }, `Category ${categoryIndex + 1} of ${section.categories.length}`),
                    e('h2', { className: 'text-2xl font-bold' }, currentCategory.title),
                ),
                 e('div', {
                    'data-dnd-container': 'targetBooks',
                    className: `border-2 border-dashed rounded-lg p-4 min-h-[10rem] transition-colors ${isCategoryCorrect ? 'border-green-500' : 'border-slate-400 dark:border-slate-600'}`,
                    onDragOver: (e) => {
                        e.preventDefault();
                        if (e.target.dataset.dndContainer === 'targetBooks') {
                            handleDragOver(e, targetBooks.length);
                        }
                    },
                    onDragLeave: handleContainerDragLeave,
                    onDrop: (e) => handleDrop(e, 'targetBooks')
                },
                    e('div', { className: 'flex flex-wrap gap-2' },
                        targetBooks.map((book, index) => e(React.Fragment, { key: book.name },
                            dragOverIndex === index && e('div', { className: 'w-1 h-10 bg-sky-500 rounded' }),
                            e('div', {
                                'data-dnd-index': index, 'data-dnd-zone': 'targetBooks',
                                className: 'flex items-center justify-center text-center p-2 h-12 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-300 dark:border-slate-700 cursor-grab touch-none',
                                draggable: true,
                                onDragStart: (e) => handleDragStart(e, book, 'target', index),
                                onTouchStart: (e) => handleDragStart(e, book, 'target', index),
                                onDragEnd: handleDragEnd,
                                onDragOver: (e) => { e.stopPropagation(); handleDragOver(e, index); }
                            }, e('span', { className: "text-sm font-semibold" }, book.name))
                        )),
                         dragOverIndex === targetBooks.length && e('div', { className: 'w-1 h-10 bg-sky-500 rounded' })
                    )
                ),
                
                e('div', { className: 'text-center my-4 h-6' },
                    e('p', { className: `font-semibold ${getFeedbackClass(feedback.type)}` }, feedback.text)
                ),

                e('div', {
                    'data-dnd-container': 'sourceBooks',
                    className: 'mt-4 w-full p-4 border-t-2 border-slate-300 dark:border-slate-700 min-h-[8rem] bg-slate-50 dark:bg-slate-900/50 rounded-b-lg',
                    onDragOver: (e) => e.preventDefault(),
                    onDrop: (e) => handleDrop(e, 'sourceBooks')
                },
                    e('div', { className: 'flex flex-wrap gap-2 justify-center' },
                        sourceBooks.map((book, index) => e('div', {
                            key: book.name,
                            className: 'flex items-center justify-center text-center p-2 h-12 bg-sky-100 dark:bg-sky-900/50 rounded-md shadow-sm border border-sky-300 dark:border-sky-700 cursor-grab touch-none',
                            draggable: true,
                            onDragStart: (e) => handleDragStart(e, book, 'source', index),
                            onTouchStart: (e) => handleDragStart(e, book, 'source', index),
                            onDragEnd: handleDragEnd,
                        }, e('span', { className: "text-sm font-semibold" }, book.name)))
                    )
                ),

                e('div', { className: "mt-6 flex justify-center space-x-4" },
                    e('button', { onClick: resetCurrentCategory, className: "px-6 py-2 bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg shadow-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" }, "Reset"),
                    isCategoryCorrect && e('button', { onClick: handleNext, className: "px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors animate-fade-in" }, "Next Category")
                )
            ),

            stage === 'categories' && e('div', { className: 'w-full max-w-4xl animate-fade-in' },
                e('div', { className: 'text-center mb-4' },
                    e('h2', { className: 'text-2xl font-bold' }, 'Final Step: Order the Categories'),
                    e('p', { className: `font-semibold h-6 mt-2 ${getFeedbackClass(feedback.type)}` }, feedback.text || "Drag and drop the categories into their correct sequence.")
                ),
                e('div', {
                    'data-dnd-container': 'categories',
                    className: 'space-y-3',
                    onDragOver: (e) => {
                        e.preventDefault();
                        if (e.target.dataset.dndContainer === 'categories') {
                           handleDragOver(e, categoryOrder.length);
                        }
                    },
                    onDragLeave: handleContainerDragLeave,
                    onDrop: (e) => handleDrop(e, 'categories')
                },
                    categoryOrder.map((cat, index) => {
                        const isDraggable = !isFinalOrderCorrect;
                        const status = categoryStatuses[index];
                        const categoryBoxClass = `w-full p-4 rounded-lg shadow-md transition-colors duration-500 flex items-center justify-between ${
                            isFinalOrderCorrect ? 'border border-green-500 bg-green-100 dark:bg-green-900/50'
                            : status === 'correct' ? 'border border-green-500 bg-green-100 dark:bg-green-900/50'
                            : status === 'incorrect' ? 'border border-red-500 bg-red-100 dark:bg-red-900/50'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`;
                        
                        const titleClass = isFinalOrderCorrect || status === 'correct'
                            ? 'font-bold text-lg text-green-800 dark:text-green-200'
                            : status === 'incorrect'
                            ? 'font-bold text-lg text-red-800 dark:text-red-200'
                            : 'font-bold text-lg text-sky-700 dark:text-sky-300';
                        const booksClass = isFinalOrderCorrect || status === 'correct'
                            ? 'text-sm text-green-700 dark:text-green-400 mt-1'
                             : status === 'incorrect'
                            ? 'text-sm text-red-700 dark:text-red-400 mt-1'
                            : 'text-sm text-slate-500 dark:text-slate-400 mt-1';
                        
                        return e(React.Fragment, { key: cat.title },
                             dragOverIndex === index && isDraggable && e('div', { className: 'h-1 w-full bg-sky-500 rounded' }),
                             e('div', {
                                'data-dnd-index': index, 'data-dnd-zone': 'categories',
                                className: categoryBoxClass,
                                onDragOver: isDraggable ? (e) => { e.stopPropagation(); handleDragOver(e, index); } : undefined,
                            },
                                e('div', { className: 'flex-grow' },
                                    e('h3', { className: titleClass }, cat.title),
                                    e('p', { className: booksClass }, cat.books.join(', '))
                                ),
                                isDraggable && e('div', {
                                    className: 'ml-4 p-2 cursor-grab touch-none rounded-md hover:bg-slate-200 dark:hover:bg-slate-700',
                                    draggable: true,
                                    onDragStart: (e) => handleDragStart(e, cat, 'categories', index),
                                    onTouchStart: (e) => handleDragStart(e, cat, 'categories', index),
                                    onDragEnd: handleDragEnd,
                                }, e(DragHandleIcon, { className: 'w-6 h-6 text-slate-500 dark:text-slate-400' }))
                            )
                        );
                    }),
                    dragOverIndex === categoryOrder.length && !isFinalOrderCorrect && e('div', { className: 'h-1 w-full bg-sky-500 rounded' })
                ),
                e('div', { className: "mt-6 flex justify-center space-x-4" },
                    e('button', { onClick: checkCategoryOrder, className: "px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors", disabled: isFinalOrderCorrect }, "Check Final Order")
                )
            )
        )
    );
};

const ThemeToggle = ({ theme, setTheme }) => {
  const toggleTheme = useCallback(() => {
    setTheme(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  }, [setTheme]);

  const { Icon, label } = useMemo(() => {
    if (theme === 'light') {
      return { Icon: SunIcon, label: 'Switch to Dark Mode' };
    }
    if (theme === 'dark') {
      return { Icon: MoonIcon, label: 'Switch to System Preference' };
    }
    return { Icon: DesktopIcon, label: 'Switch to Light Mode' };
  }, [theme]);
  
  return e('button', {
    onClick: toggleTheme,
    className: "p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500",
    'aria-label': label,
    title: label
  }, e(Icon, { className: "w-6 h-6 text-slate-700 dark:text-slate-300" }));
};


// --- Main App Component ---
export default function App() {
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('hasSeenWelcome_v4'));
  const [showInstructions, setShowInstructions] = useState(false);
  const [view, setView] = useState({ name: 'home', topic: null });
  const [installPrompt, setInstallPrompt] = useState(null);
  const { showUpdateNotification, handleUpdate } = useServiceWorkerUpdater();
  const [theme, setTheme] = useTheme();
  const [completedItems, setCompletedItems] = useState(() => new Set());

  useEffect(() => {
    const resumeAudioContext = () => {
      if (!window.appAudioContext) {
        window.appAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (window.appAudioContext.state === 'suspended') {
        window.appAudioContext.resume();
      }
      document.body.removeEventListener('click', resumeAudioContext);
      document.body.removeEventListener('touchstart', resumeAudioContext);
    };
    document.body.addEventListener('click', resumeAudioContext);
    document.body.addEventListener('touchstart', resumeAudioContext);
    return () => {
      document.body.removeEventListener('click', resumeAudioContext);
      document.body.removeEventListener('touchstart', resumeAudioContext);
    };
  }, []);

  useEffect(() => {
    const storedCompleted = localStorage.getItem('completedItems_v2');
    if (storedCompleted) {
        setCompletedItems(new Set(JSON.parse(storedCompleted)));
    }
  }, []);

  const markAsComplete = useCallback((gameMode, itemId) => {
    if (!gameMode || !itemId) return;
    const completionKey = `${gameMode}-${itemId}`;
    setCompletedItems(prev => {
        if (prev.has(completionKey)) return prev;
        const newSet = new Set(prev);
        newSet.add(completionKey);
        localStorage.setItem('completedItems_v2', JSON.stringify(Array.from(newSet)));
        return newSet;
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') console.log('User accepted the install prompt');
      else console.log('User dismissed the install prompt');
      setInstallPrompt(null);
    });
  };

  const handleInstructionsDismiss = () => {
    if (showWelcome) {
        localStorage.setItem('hasSeenWelcome_v4', 'true');
        setShowWelcome(false);
    }
    setShowInstructions(false);
  };
  
  const handleShowInstructions = () => {
      setShowInstructions(true);
  };

  const handleSelectGame = (game) => {
    if (game.type === QuizItemType.FLASHCARD_MENU) {
      setView({ name: 'flashcards' });
    } else if (game.type === QuizItemType.ORDER_BOOKS) {
      setView({ name: 'bookOrderStart' });
    } else if (game.type === QuizItemType.MATCH_SCRIPTURE) {
      setView({ name: 'scriptureMatchingMenu' });
    } else {
      setView({ name: 'game', topic: game });
    }
  };
  
  const handleSelectBookOrderSection = (section) => {
    setView({ name: 'bookOrderGame', topic: section });
  };

  const handleSelectTopic = (topic, context) => {
    setView({ name: 'game', topic: topic, context: context });
  };
  
  const handleBack = () => {
    const { name, topic, context } = view;
    if (name === 'game') {
        if (topic.type === QuizItemType.MATCH_SCRIPTURE) {
            setView({ name: 'scriptureMatchingMenu', context: context });
        } else {
            setView({ name: 'flashcards', context: context });
        }
    } else if (name === 'flashcards' || name === 'scriptureMatchingMenu' || name === 'bookOrderStart') {
        setView({ name: 'home' });
    } else if (name === 'bookOrderPractice' || name === 'bookOrderChallenge') {
        setView({ name: 'bookOrderStart' });
    } else if (name === 'bookOrderGame') {
        setView({ name: 'bookOrderChallenge' });
    }
  };

  const renderScreen = () => {
    const themeToggle = e(ThemeToggle, { theme, setTheme });
    const baseProps = { onBack: handleBack, themeToggle, completedItems };

    switch (view.name) {
      case 'home':
        return e(HomeScreen, { onSelectGame: handleSelectGame, onInstall: handleInstallClick, canInstall: !!installPrompt, onShowInstructions: handleShowInstructions, themeToggle });
      case 'flashcards':
        return e(FlashcardsMenuScreen, { ...baseProps, onSelectTopic: handleSelectTopic, initialContext: view.context });
      case 'scriptureMatchingMenu':
        return e(ScriptureMatchingMenuScreen, { ...baseProps, onSelectTopic: handleSelectTopic, initialContext: view.context });
      case 'bookOrderStart':
        return e(BookOrderStartScreen, {
            ...baseProps,
            onPractice: () => setView({ name: 'bookOrderPractice' }),
            onStart: () => setView({ name: 'bookOrderChallenge' })
        });
      case 'bookOrderPractice':
        return e(BookOrderPracticeScreen, { ...baseProps });
      case 'bookOrderChallenge':
        return e(BookOrderChallengeScreen, { ...baseProps, onSelectSection: handleSelectBookOrderSection });
      case 'bookOrderGame':
        return e(BookOrderGameScreen, { 
            ...baseProps,
            section: view.topic,
            onComplete: (itemId) => markAsComplete('order-books', itemId)
        });
      case 'game':
        if (!view.topic) return e(HomeScreen, { onSelectGame: handleSelectGame, themeToggle }); // Fallback
        
        const gameMode = view.topic.type === QuizItemType.MATCH_SCRIPTURE ? 'match-scripture' : 'flashcards';
        const gameProps = { 
            ...baseProps, 
            topic: view.topic,
            onComplete: (itemId) => markAsComplete(gameMode, itemId) 
        };

        switch (view.topic.type) {
          case QuizItemType.BOOK_QUIZ:
            return e(QuizScreen, gameProps);
          case QuizItemType.MATCH_SCRIPTURE:
            return e(MatchingGameScreen, gameProps);
          default:
            return e(GameScreen, gameProps);
        }
      default:
        return e(HomeScreen, { onSelectGame: handleSelectGame, themeToggle });
    }
  };

  return e(ErrorBoundary, null,
    e('div', { className: 'relative min-h-screen' },
        (showWelcome || showInstructions)
            ? e(InstructionsScreen, { onDismiss: handleInstructionsDismiss, isInitialWelcome: showWelcome })
            : renderScreen(),
        showUpdateNotification && e('div', { className: "fixed bottom-4 right-4 z-50 animate-fade-in-up" },
            e('div', { className: "bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg shadow-xl p-4 flex items-center space-x-4" },
                e('p', { className: "font-medium" }, "A new version is available!"),
                e('button', { onClick: handleUpdate, className: "px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 dark:focus:ring-offset-slate-200 focus:ring-sky-500" }, "Reload")
            )
        )
    )
  );
}