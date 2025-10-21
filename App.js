
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
    const audioContext = window.appAudioContext;
    // The global unlock handler should have set the state to 'running'.
    // If not, it's unlikely we can recover here, so we just check and exit.
    if (!audioContext || audioContext.state !== 'running') {
      console.warn(`AudioContext not ready, sound aborted. State: ${audioContext?.state}`);
      return;
    }

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
                const scriptureWithKeyPhrase = { ...currentItem, text: currentItem.keyPhrase };
                if (isReversed) return e(ScriptureTextOnly, { scriptures: [scriptureWithKeyPhrase] });
                return e('div', { className: "flex items-center justify-center h-full" }, e(CenteredScriptureList, { scriptures: [scriptureWithKeyPhrase] }));
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
    
    const renderFront = () => isReversed ? renderBackContent() : renderFrontContent();
    const renderBack = () => isReversed ? renderFrontContent() : renderBackContent();

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
                e(Flashcard, { front: renderFront(), back: renderBack(), isFlipped, onFlip: () => setIsFlipped(!isFlipped) })
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
  const mnemonic = "He Just Ate Overly Juicy Meat, Now He's Zesty, He's Zesty Man!";

  return e('div', { className: 'p-4 bg-sky-50 dark:bg-sky-900/40 rounded-lg' },
    e('h4', { className: 'text-lg font-bold text-sky-800 dark:text-sky-300 mb-2' }, 'Mnemonic for the 12 "Minor" Prophets'),
    e('p', { className: 'italic font-serif text-xl mb-4' }, `"${mnemonic}"`),
    e('div', { className: 'grid grid-cols-3 gap-2 text-sm' },
      books.map((book, i) => e('p', { key: book, className: 'flex items-center' }, 
        e('span', { className: 'font-bold text-sky-600 dark:text-sky-400 w-2 mr-2' }, `${book[0]}.`),
        e('span', null, book)
      ))
    )
  );
};

const BookOrderPracticeScreen = ({ onBack, themeToggle }) => {
    return e('div', { className: "flex flex-col min-h-screen" },
        e(Header, { onBack, title: "Practice Mode" }, themeToggle),
        e('main', { className: "p-4 flex-grow" },
            e('div', { className: "space-y-6 max-w-4xl mx-auto" },
                bibleBookOrderData.map(section => e('div', { key: section.id, className: "p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md" },
                    e('h2', { className: "text-2xl font-bold text-sky-700 dark:text-sky-400 border-b-2 border-sky-200 dark:border-sky-800 pb-2 mb-4" }, section.sectionTitle),
                    section.categories.map(category => e('div', { key: category.title, className: "mb-4" },
                        e('h3', { className: "text-xl font-semibold mb-1" }, category.title),
                        e('p', { className: "text-slate-600 dark:text-slate-300" }, category.books.join(' • '))
                    ))
                )),
                e(MinorProphetsMnemonic)
            )
        )
    );
};

const DraggableItem = ({ item, index, onDragStart, onDragOver, onDrop, onDragEnd, isCorrect, isComplete, children }) => {
    const [isDragging, setIsDragging] = useState(false);
    const handleDragStart = (e) => {
        setIsDragging(true);
        onDragStart(e, index);
    };
    const handleDragEnd = (e) => {
        setIsDragging(false);
        onDragEnd(e);
    };

    let baseClass = "p-2 rounded-md shadow-sm transition-all duration-200 flex items-center";
    let stateClass = "";
    if (isDragging) {
        stateClass = "bg-sky-200 dark:bg-sky-800 opacity-50";
    } else if (isComplete && isCorrect) {
        stateClass = "bg-green-100 dark:bg-green-900 border border-green-500 cursor-default";
    } else {
        stateClass = "bg-white dark:bg-slate-700 cursor-grab active:cursor-grabbing";
    }

    return e('div', {
        draggable: !isComplete,
        onDragStart: handleDragStart,
        onDragOver,
        onDrop: (e) => onDrop(e, index),
        onDragEnd: handleDragEnd,
        className: `${baseClass} ${stateClass}`
    }, children);
};

const BookOrderChallengeScreen = ({ onBack, themeToggle, onComplete }) => {
    const [sections, setSections] = useState(() => shuffleArray(bibleBookOrderData).map(s => ({ ...s, isComplete: false, isCorrect: false })));
    const [bookLists, setBookLists] = useState({});
    const [completedCategories, setCompletedCategories] = useState(new Set());
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedSection, setDraggedSection] = useState(null);

    useEffect(() => {
        const initialBookLists = {};
        bibleBookOrderData.forEach(section => {
            section.categories.forEach(category => {
                initialBookLists[category.title] = shuffleArray(category.books);
            });
        });
        setBookLists(initialBookLists);
    }, []);

    const checkCategoryCompletion = (category) => {
        const userOrder = bookLists[category.title];
        const correctOrder = category.books;
        if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
            setCompletedCategories(prev => new Set(prev).add(category.title));
            return true;
        }
        return false;
    };

    const checkSectionCompletion = (section) => {
        const allCategoriesCorrect = section.categories.every(cat => completedCategories.has(cat.title));
        if (allCategoriesCorrect) {
            setSections(prev => prev.map(s => s.id === section.id ? { ...s, isComplete: true } : s));
        }
    };
    
    const checkFinalCompletion = () => {
        const correctOrder = bibleBookOrderData.map(s => s.id);
        const userOrder = sections.map(s => s.id);
        if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
             setSections(prev => prev.map(s => ({...s, isCorrect: true})));
             onComplete('hebrew-greek-order'); // A unique ID for the whole challenge
        } else {
            // Provide feedback if order is wrong
        }
    };

    const handleDrop = (e, dropIndex, categoryTitle) => {
        e.preventDefault();
        if (draggedItem === null) return;
        
        const list = [...bookLists[categoryTitle]];
        const draggedContent = list[draggedItem];
        list.splice(draggedItem, 1);
        list.splice(dropIndex, 0, draggedContent);

        setBookLists(prev => ({ ...prev, [categoryTitle]: list }));
        setDraggedItem(null);
    };
    
    const handleSectionDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedSection === null) return;

        const list = [...sections];
        const draggedContent = list[draggedSection];
        list.splice(draggedSection, 1);
        list.splice(dropIndex, 0, draggedContent);
        
        setSections(list);
        setDraggedSection(null);
    };

    const areAllSectionsComplete = sections.every(s => s.isComplete);

    if (sections.every(s => s.isComplete && s.isCorrect)) {
        return e('div', { className: "flex flex-col h-screen" },
            e(Confetti, null),
            e(Header, { onBack, title: "Challenge Complete!" }, themeToggle),
            e('main', { className: "flex-grow p-4 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in-up" },
                e('h2', { className: "text-4xl font-bold mb-4 text-sky-600 dark:text-sky-400" }, "Mastered!"),
                e('p', { className: "text-lg text-slate-600 dark:text-slate-300 mb-6" }, "You've correctly ordered all the books of the Bible!"),
                e('button', { onClick: onBack, className: "mt-8 px-6 py-3 bg-white dark:bg-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" }, "Back to Menu")
            )
        );
    }
    
    return e('div', { className: "flex flex-col min-h-screen" },
        e(Header, { onBack, title: "Bible Book Order Challenge" }, themeToggle),
        e('main', { className: "p-4 flex-grow" },
            e('div', { className: "space-y-6 max-w-4xl mx-auto" },
                !areAllSectionsComplete && e('p', { className: 'text-center text-slate-600 dark:text-slate-400 mb-4 bg-slate-100 dark:bg-slate-800 p-3 rounded-md' }, 'First, order the books within each category. Once a category is correct, it will lock. Once all categories in a section are correct, the section will lock.'),
                areAllSectionsComplete && e('p', { className: 'text-center text-slate-600 dark:text-slate-400 mb-4 bg-sky-100 dark:bg-sky-900/50 p-3 rounded-md' }, 'Great! Now, drag and drop the entire sections into their correct order.'),

                sections.map((section, sectionIndex) => e(DraggableItem, {
                    key: section.id,
                    item: section,
                    index: sectionIndex,
                    isComplete: !areAllSectionsComplete,
                    onDragStart: (e, index) => areAllSectionsComplete && setDraggedSection(index),
                    onDragOver: (e) => e.preventDefault(),
                    onDrop: handleSectionDrop,
                    onDragEnd: () => {}
                },
                    e('div', { className: 'w-full' },
                        e('div', { className: `p-4 ${section.isComplete ? 'bg-green-50 dark:bg-green-900/30' : ''} rounded-lg` },
                            e('h2', { className: "text-2xl font-bold text-sky-700 dark:text-sky-400 border-b-2 border-sky-200 dark:border-sky-800 pb-2 mb-4 flex items-center" },
                                e(DragHandleIcon, { className: `w-6 h-6 mr-2 text-slate-400 ${!areAllSectionsComplete ? 'opacity-30' : ''}` }),
                                section.sectionTitle
                            ),
                            section.categories.map(category => {
                                const isCatComplete = completedCategories.has(category.title);
                                return e('div', { key: category.title, className: `mb-4 p-3 rounded-md ${isCatComplete ? 'bg-green-100 dark:bg-green-900/50' : ''}` },
                                    e('h3', { className: "text-xl font-semibold mb-2" }, category.title),
                                    e('div', { className: "space-y-2" },
                                        bookLists[category.title] && bookLists[category.title].map((book, index) => e(DraggableItem, {
                                            key: book,
                                            item: book,
                                            index,
                                            isComplete: isCatComplete,
                                            isCorrect: isCatComplete, // if complete, it must be correct
                                            onDragStart: (e, dragIndex) => setDraggedItem(dragIndex),
                                            onDragOver: (e) => e.preventDefault(),
                                            onDrop: (e, dropIndex) => handleDrop(e, dropIndex, category.title),
                                            onDragEnd: () => setDraggedItem(null)
                                        },
                                          e(DragHandleIcon, { className: "w-5 h-5 mr-2 text-slate-400" }),
                                          e('span', null, book)
                                        ))
                                    ),
                                    !isCatComplete && e('button', {
                                        onClick: () => {
                                            if (checkCategoryCompletion(category)) {
                                                checkSectionCompletion(section);
                                            }
                                        },
                                        className: "mt-3 px-4 py-1.5 bg-sky-600 text-white text-sm font-semibold rounded-full shadow-md hover:bg-sky-700 transition-colors"
                                    }, "Check Order")
                                );
                            })
                        )
                    )
                )),
                
                areAllSectionsComplete && e('button', {
                    onClick: checkFinalCompletion,
                    className: "w-full mt-6 px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors"
                }, "Check Final Order")
            )
        )
    );
};

// --- Main App Component ---
function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentContext, setCurrentContext] = useState(null);
  
  const [completedItems, setCompletedItems] = useState(() => {
    try {
        const items = localStorage.getItem('completedItems');
        return items ? new Set(JSON.parse(items)) : new Set();
    } catch(e) {
        console.error("Could not parse completed items from localStorage", e);
        return new Set();
    }
  });

  const [theme, setTheme] = useTheme();
  
  const [installPrompt, setInstallPrompt] = useState(null);
  const { showUpdateNotification, handleUpdate } = useServiceWorkerUpdater();
  const [showInstructions, setShowInstructions] = useState(() => !localStorage.getItem('hasSeenInstructions'));
  
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    // This effect sets up a persistent event listener to unlock and keep the audio context "warm".
    // This is the most robust method for handling audio on restrictive mobile browsers like iOS Safari.
    const unlockAudioContext = () => {
      if (!window.appAudioContext) {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          window.appAudioContext = new AudioContext();
          console.log('AudioContext created on user interaction.');
        } catch (e) {
          console.error('Web Audio API is not supported.', e);
          return; // Can't proceed
        }
      }
      
      const audioContext = window.appAudioContext;
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          // On iOS, an AudioContext that is resumed must immediately play a sound
          // or it may be suspended again. Playing a silent buffer is a standard trick to keep it alive.
          const buffer = audioContext.createBuffer(1, 1, 22050);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0);
          console.log('AudioContext resumed and kept warm with a silent sound.');
        }).catch(e => console.error('Failed to resume AudioContext on interaction:', e));
      }
    };

    document.addEventListener('click', unlockAudioContext);
    // Use { passive: true } on touchstart to prevent interference with native gestures like swipe-to-navigate on iOS.
    document.addEventListener('touchstart', unlockAudioContext, { passive: true });

    return () => {
      document.removeEventListener('click', unlockAudioContext);
      document.removeEventListener('touchstart', unlockAudioContext);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('completedItems', JSON.stringify(Array.from(completedItems)));
  }, [completedItems]);

  const handleComplete = useCallback((key) => {
    // Sound unlocking is now handled by a global event listener,
    // so no special action is needed here before playing the sound.
    setCompletedItems(prev => new Set(prev).add(key));
  }, []);

  const handleSelectGame = (game) => {
    setHistory(prev => [...prev, { screen: currentScreen, topic: currentTopic, context: currentContext }]);
    switch (game.type) {
        case QuizItemType.FLASHCARD_MENU:
            setCurrentScreen('flashcards-menu');
            break;
        case QuizItemType.MATCH_SCRIPTURE:
            setCurrentScreen('match-scripture-menu');
            break;
        case QuizItemType.ORDER_BOOKS:
            setCurrentScreen('order-books-start');
            break;
        default:
            setCurrentTopic(game);
            setCurrentScreen('game');
            break;
    }
  };

  const handleSelectTopic = (topic, context = null) => {
    setHistory(prev => [...prev, { screen: currentScreen, topic: currentTopic, context: currentContext }]);
    setCurrentTopic(topic);
    setCurrentContext(context);
    switch (topic.type) {
        case QuizItemType.QA:
        case QuizItemType.PROPHECY:
        case QuizItemType.BOOKS:
        case QuizItemType.HOW_TO:
            setCurrentScreen('game');
            break;
        case QuizItemType.BOOK_QUIZ:
            setCurrentScreen('quiz');
            break;
        case QuizItemType.MATCH_SCRIPTURE:
            setCurrentScreen('match-game');
            break;
        default:
            console.error("Unknown topic type:", topic.type);
    }
  };
  
  const handleBack = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentScreen(lastState.screen);
      setCurrentTopic(lastState.topic);
      setCurrentContext(lastState.context);
    } else {
      setCurrentScreen('home');
      setCurrentTopic(null);
      setCurrentContext(null);
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };
  
  const handleShowInstructions = (isInitial = false) => {
      setShowInstructions(true);
      if (isInitial) {
          localStorage.setItem('hasSeenInstructions', 'true');
      }
  };

  const ThemeToggle = ({ theme, setTheme }) => {
    const nextTheme = { light: 'dark', dark: 'system', system: 'light' };
    const ThemeIcon = { light: SunIcon, dark: MoonIcon, system: DesktopIcon };
    const currentIcon = ThemeIcon[theme];

    return e('button', {
      onClick: () => setTheme(nextTheme[theme]),
      className: "p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
      title: `Theme: ${theme}. Switch to ${nextTheme[theme]}.`
    }, e(currentIcon, { className: "w-6 h-6" }));
  };

  const renderScreen = () => {
    if (showInstructions) {
        return e(InstructionsScreen, { 
            onDismiss: () => {
                setShowInstructions(false);
                localStorage.setItem('hasSeenInstructions', 'true');
            },
            isInitialWelcome: !localStorage.getItem('hasSeenInstructions')
        });
    }
      
    switch (currentScreen) {
      case 'home':
        return e(HomeScreen, { onSelectGame: handleSelectGame, onInstall: handleInstall, canInstall: !!installPrompt, onShowInstructions: () => handleShowInstructions(false), themeToggle: e(ThemeToggle, { theme, setTheme }) });
      case 'flashcards-menu':
        return e(FlashcardsMenuScreen, { onSelectTopic: handleSelectTopic, onBack: handleBack, themeToggle: e(ThemeToggle, { theme, setTheme }), initialContext: currentContext, completedItems });
      case 'match-scripture-menu':
        return e(ScriptureMatchingMenuScreen, { onSelectTopic: handleSelectTopic, onBack: handleBack, themeToggle: e(ThemeToggle, { theme, setTheme }), completedItems, initialContext: currentContext });
      case 'game':
        return e(ErrorBoundary, null, e(GameScreen, { topic: currentTopic, onBack: handleBack, themeToggle: e(ThemeToggle, { theme, setTheme }), onComplete: (id) => handleComplete(`flashcards-${id}`) }));
      case 'quiz':
        return e(ErrorBoundary, null, e(QuizScreen, { topic: currentTopic, onBack: handleBack, themeToggle: e(ThemeToggle, { theme, setTheme }), onComplete: (id) => handleComplete(`flashcards-${id}`) }));
      case 'match-game':
        return e(ErrorBoundary, null, e(MatchingGameScreen, { topic: currentTopic, onBack: handleBack, themeToggle: e(ThemeToggle, { theme, setTheme }), onComplete: (id) => handleComplete(`match-scripture-${id}`) }));
      case 'order-books-start':
        return e(BookOrderStartScreen, {
            onBack: handleBack,
            themeToggle: e(ThemeToggle, { theme, setTheme }),
            onPractice: () => {
                setHistory(prev => [...prev, { screen: currentScreen, topic: currentTopic, context: currentContext }]);
                setCurrentScreen('order-books-practice');
            },
            onStart: () => {
                setHistory(prev => [...prev, { screen: currentScreen, topic: currentTopic, context: currentContext }]);
                setCurrentScreen('order-books-challenge');
            }
        });
      case 'order-books-practice':
        return e(BookOrderPracticeScreen, { onBack: handleBack, themeToggle: e(ThemeToggle, { theme, setTheme }) });
      case 'order-books-challenge':
        return e(ErrorBoundary, null, e(BookOrderChallengeScreen, { onBack: handleBack, themeToggle: e(ThemeToggle, { theme, setTheme }), onComplete: (id) => handleComplete(`order-books-${id}`) }));
      default:
        return e('div', null, `Unknown screen: ${currentScreen}`);
    }
  };

  return e('div', { className: 'h-full' },
    renderScreen(),
    showUpdateNotification && e('div', { className: "fixed bottom-4 right-4 bg-sky-600 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 animate-fade-in-up" },
        e('p', null, "A new version is available!"),
        e('button', { onClick: handleUpdate, className: "px-4 py-2 bg-white text-sky-700 font-bold rounded-md hover:bg-sky-100" }, "Update Now")
    )
  );
}

export default App;
