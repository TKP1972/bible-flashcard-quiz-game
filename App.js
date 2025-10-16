
import React from 'react';
import { homeScreenGames, flashcardDecks, bibleBookOrderData } from './data.js';
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

// --- Custom Hook for Service Worker Updates ---
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

const ICONS = {
    Gamepad: GamepadIcon,
    BookOpen: BookOpenIcon,
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
const Header = ({ onBack, title, children }) => e('header', { className: "p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20 flex items-center shadow-sm" },
    onBack && e('button', { onClick: onBack, className: "p-2 mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors", 'aria-label': "Go back" },
        e(BackIcon, { className: "w-6 h-6" })
    ),
    e('h1', { className: "flex-grow text-xl font-bold text-slate-900 dark:text-white truncate" }, title),
    children
);

const HomeScreen = ({ onSelectGame, onInstall, canInstall }) => {
    return e('div', null,
        e(Header, { title: "Bible Flashcard Quiz" },
            canInstall && e('button', {
                onClick: onInstall,
                className: "flex items-center space-x-2 ml-2 px-3 py-1.5 bg-sky-600 text-white font-semibold rounded-full shadow-md hover:bg-sky-700 transition-colors text-sm",
                title: "Install App for Offline Use",
                'aria-label': "Install App for Offline Use"
            },
                e(DownloadIcon, { className: "w-5 h-5" }),
                e('span', null, 'Install')
            )
        ),
        e('main', { className: "p-4 space-y-8" },
            e('section', null,
                e('h2', { className: "text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 px-2" }, "Study & Game Modes"),
                e('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" },
                    homeScreenGames.map(game => {
                        const IconComponent = ICONS[game.icon] || GamepadIcon;
                        return e('button', {
                            key: game.id,
                            onClick: () => onSelectGame(game),
                            className: "p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-left group border border-slate-200 dark:border-slate-700"
                        },
                            e('div', { className: 'flex items-center mb-2' },
                              e(IconComponent, { className: "w-6 h-6 text-sky-500 mr-3" }),
                              e('h3', { className: "text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors" }, game.question)
                            ),
                            e('p', { className: "text-slate-600 dark:text-slate-400" }, game.description)
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
                    "On iOS/iPadOS: Tap the Share button in Safari, then 'Add to Home Screen'."
                )
            )
        )
    );
};

const FlashcardsMenuScreen = ({ onSelectTopic, onBack }) => {
    const [openItems, setOpenItems] = useState(new Set());

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
        e(Header, { onBack, title: "Flashcard Decks" }),
        e('main', { className: "p-4" },
            e('div', { className: "space-y-4" },
                flashcardDecks.map(group => {
                    const isGroupOpen = openItems.has(group.title);
                    return e('div', { key: group.title, className: "bg-white dark:bg-slate-800 rounded-lg shadow-md transition-all duration-300" },
                        e('button', { onClick: () => toggleOpen(group.title), className: "w-full flex justify-between items-center p-4 text-left", 'aria-expanded': isGroupOpen },
                            e('h3', { className: "text-xl font-bold text-slate-800 dark:text-slate-100" }, group.title),
                            e(ChevronDownIcon, { className: `w-6 h-6 text-slate-500 transition-transform duration-300 ${isGroupOpen ? 'rotate-180' : ''}` })
                        ),
                        e('div', { className: `transition-all duration-500 ease-in-out overflow-hidden ${isGroupOpen ? 'max-h-[3000px]' : 'max-h-0'}` },
                            e('div', { className: "px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2" },
                                group.subGroups.map(subGroup => {
                                    const subGroupKey = `${group.title}-${subGroup.title}`;
                                    const isSubGroupOpen = openItems.has(subGroupKey);
                                    return e('div', { key: subGroupKey, className: "border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900/50" },
                                        e('button', { onClick: () => toggleSubOpen(subGroupKey), className: "w-full flex justify-between items-center p-3 text-left", 'aria-expanded': isSubGroupOpen },
                                            e('h4', { className: "font-semibold text-slate-700 dark:text-slate-300" }, subGroup.title),
                                            e(ChevronDownIcon, { className: `w-5 h-5 text-slate-400 transition-transform duration-300 ${isSubGroupOpen ? 'rotate-180' : ''}` })
                                        ),
                                        e('div', { className: `transition-all duration-500 ease-in-out overflow-hidden ${isSubGroupOpen ? 'max-h-[2000px]' : 'max-h-0'}` },
                                            e('div', { className: "p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-600" },
                                                subGroup.items.map(item => e('button', { key: item.id, onClick: () => onSelectTopic(item), className: "p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left group border border-slate-200 dark:border-slate-700" },
                                                    e('p', { className: "text-sm font-semibold text-sky-600 dark:text-sky-400" }, item.type),
                                                    e('p', { className: "text-md font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors" }, item.question)
                                                ))
                                            )
                                        )
                                    );
                                })
                            )
                        )
                    );
                })
            )
        )
    );
};

const ScriptureMatchingMenuScreen = ({ onSelectTopic, onBack }) => {
    const [openItems, setOpenItems] = useState(new Set());

    const handleSelect = (item) => {
        let pairs = [];
        if (item.type === QuizItemType.QA && item.answers) {
            item.answers.forEach(answer => {
                pairs.push({ id: answer.reference, item1: answer.reference, item2: answer.keyPhrase || answer.text });
            });
        } else if (item.type === QuizItemType.PROPHECY && item.pairs) {
            item.pairs.forEach(pair => {
                if (pair.prophecy) pairs.push({ id: pair.prophecy.reference, item1: pair.prophecy.reference, item2: pair.prophecy.keyPhrase || pair.prophecy.text });
                if (pair.fulfillment) pairs.push({ id: pair.fulfillment.reference, item1: pair.fulfillment.reference, item2: pair.fulfillment.keyPhrase || pair.fulfillment.text });
            });
        }

        if (pairs.length > 0) {
            onSelectTopic({
                id: item.id,
                question: `Match: ${item.question}`,
                type: QuizItemType.MATCH_SCRIPTURE,
                pairs: pairs
            });
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
        e(Header, { onBack, title: "Select a Category to Match" }),
        e('main', { className: "p-4" },
            e('div', { className: "space-y-4" },
                flashcardDecks.map(group => {
                    const isGroupOpen = openItems.has(group.title);
                    return e('div', { key: group.title, className: "bg-white dark:bg-slate-800 rounded-lg shadow-md" },
                        e('button', { onClick: () => toggleOpen(group.title), className: "w-full flex justify-between items-center p-4 text-left" },
                            e('h3', { className: "text-xl font-bold" }, group.title),
                            e(ChevronDownIcon, { className: `w-6 h-6 text-slate-500 transition-transform ${isGroupOpen ? 'rotate-180' : ''}` })
                        ),
                        e('div', { className: `transition-all duration-300 ease-in-out overflow-hidden ${isGroupOpen ? 'max-h-[3000px]' : 'max-h-0'}` },
                           e('div', { className: "px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2" },
                                group.subGroups.map(subGroup => {
                                    const subGroupKey = `${group.title}-${subGroup.title}`;
                                    const isSubGroupOpen = openItems.has(subGroupKey);
                                    return e('div', { key: subGroupKey, className: "border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900/50" },
                                        e('button', { onClick: () => toggleSubOpen(subGroupKey), className: "w-full flex justify-between items-center p-3 text-left" },
                                            e('h4', { className: "font-semibold text-slate-700 dark:text-slate-300" }, subGroup.title),
                                            e(ChevronDownIcon, { className: `w-5 h-5 text-slate-400 transition-transform ${isSubGroupOpen ? 'rotate-180' : ''}` })
                                        ),
                                        e('div', { className: `transition-all duration-500 ease-in-out overflow-hidden ${isSubGroupOpen ? 'max-h-[2000px]' : 'max-h-0'}` },
                                            e('div', { className: "p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-600" },
                                                subGroup.items.map(item => e('button', { 
                                                    key: item.id, 
                                                    onClick: () => handleSelect(item), 
                                                    className: "p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left group border border-slate-200 dark:border-slate-700" 
                                                },
                                                    e('p', { className: "text-md font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors" }, item.question)
                                                ))
                                            )
                                        )
                                    );
                                })
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

const GameScreen = ({ topic, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [gameItems, setGameItems] = useState([]);

    useEffect(() => {
        let items = [];
        if (topic.type === QuizItemType.QA) items = topic.answers;
        else if (topic.type === QuizItemType.PROPHECY) items = topic.pairs;
        else items = [topic];
        setGameItems(items);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsReversed(false);
    }, [topic]);

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
                if (isReversed) return e(ScriptureTextOnly, { scriptures: [currentItem] });
                return e('div', { className: "flex items-center justify-center h-full" }, e(CenteredScriptureList, { scriptures: [currentItem] }));
            case QuizItemType.PROPHECY:
                 if (!currentItem) return null;
                return e('div', { className: "text-center flex flex-col justify-center h-full" },
                    e('p', { className: "text-base font-bold text-green-600 dark:text-green-400 mb-4" }, "FULFILLMENT"),
                    e(CenteredScriptureList, { scriptures: [currentItem.fulfillment] })
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
            e(Header, { onBack, title: topic.question }),
            e('main', { className: "flex-grow p-4 md:p-8 flex items-center justify-center" },
                e('div', { className: "text-slate-500 dark:text-slate-400" }, "Loading...")
            )
        );
    }
    
    const hasMultipleCards = gameItems.length > 1;

    return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: topic.question }),
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
const QuizScreen = ({ topic, onBack }) => {
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
      e(Header, { onBack, title: topic.question }),
      e('main', { className: "flex-grow p-4 md:p-8 flex items-center justify-center" },
        e('div', { className: "text-slate-500 dark:text-slate-400" }, "Loading Quiz...")
      )
    );
  }

  if (quizFinished) {
      const isPerfectScore = score === questions.length;
      return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: "Quiz Results" }),
        e('main', { className: "flex-grow p-4 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in-up" },
            e('h2', { className: "text-4xl font-bold mb-4" }, isPerfectScore ? "Well done!" : "Good effort!"),
            e('p', { className: "text-lg text-slate-600 dark:text-slate-300 mb-6" }, isPerfectScore ? "You answered every question correctly!" : "Do you want to try again?"),
            e('p', { className: "text-5xl font-bold mb-8" }, "Your score: ", e('span', { className: "text-sky-600 dark:text-sky-400" }, `${score} / ${questions.length}`)),
            e('div', { className: "flex space-x-4" },
                e('button', { onClick: handleRestart, className: "px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors" }, "Try Again"),
                e('button', { onClick: onBack, className: "px-6 py-3 bg-white dark:bg-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" }, "Back to Home")
            )
        )
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return e('div', { className: "flex flex-col h-screen" },
    e(Header, { onBack, title: topic.question }),
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
const MatchingGameScreen = ({ topic, onBack }) => {
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
            setIsComplete(true);
        }
    }, [matchedPairs, topic.pairs.length]);


    const handleSelectA = (item) => {
        if (selectedA?.id === item.id || matchedPairs.has(item.id) || incorrectPair) return;
        setSelectedA(item);
    };

    const handleSelectB = (item) => {
        if (matchedPairs.has(item.id) || incorrectPair) return;
        setSelectedB(item);
    };

    if (isComplete) {
      return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: "Game Complete!" }),
        e('main', { className: "flex-grow p-4 md:p-8 flex flex-col items-center justify-center text-center animate-fade-in-up" },
            e('h2', { className: "text-4xl font-bold mb-4" }, "Well done!"),
            e('p', { className: "text-lg text-slate-600 dark:text-slate-300 mb-6" }, "You matched them all!"),
            e('div', { className: "flex space-x-4 mt-8" },
                e('button', { onClick: initializeGame, className: "px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors" }, "Play Again"),
                e('button', { onClick: onBack, className: "px-6 py-3 bg-white dark:bg-slate-800 font-semibold rounded-lg shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" }, "Back to Home")
            )
        )
    );
    }
    
    const getCardClass = (item, type) => {
        const isA = type === 'A';
        const isSelected = isA ? selectedA?.id === item.id : selectedB?.id === item.id;
        const isMatched = matchedPairs.has(item.id);
        const isIncorrect = isA ? incorrectPair?.aId === item.id : incorrectPair?.bId === item.id;

        let base = "w-full p-4 rounded-lg border-2 text-center flex items-center justify-center transition-all duration-300 cursor-pointer ";
        if (isMatched) return base + "bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-300 opacity-60 cursor-default";
        if (isIncorrect) return base + "bg-red-100 dark:bg-red-900/50 border-red-500 transform scale-105 animate-pulse";
        if (isSelected) return base + "bg-sky-100 dark:bg-sky-900/50 border-sky-500 ring-2 ring-sky-500 transform scale-105 shadow-lg";
        return base + "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-sky-400 hover:shadow-md";
    };
    
    const fontClassA = "font-bold text-base md:text-lg";
    const fontClassB = "font-serif text-sm md:text-base";

    return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: topic.question }),
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
const BookOrderMenuScreen = ({ onSelectSection, onBack }) => {
    return e('div', { className: "flex flex-col h-screen" },
        e(Header, { onBack, title: "Bible Book Order Challenge" }),
        e('main', { className: "p-4" },
            e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                bibleBookOrderData.map(section => {
                    const bookCount = section.categories.flatMap(c => c.books).length;
                    return e('button', {
                        key: section.sectionTitle,
                        onClick: () => onSelectSection(section),
                        className: "p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-left group border border-slate-200 dark:border-slate-700"
                    },
                        e('h3', { className: "text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors" }, section.sectionTitle),
                        e('p', { className: "text-md text-slate-500 dark:text-slate-400 mt-1" }, `${bookCount} books`)
                    )
                })
            )
        )
    );
};

const BookOrderGameScreen = ({ section, onBack }) => {
    const [stage, setStage] = useState('books'); // 'books', 'categories', 'complete'
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [completedCategories, setCompletedCategories] = useState([]);
    
    const [sourceBooks, setSourceBooks] = useState([]);
    const [targetBooks, setTargetBooks] = useState([]);
    const [isCategoryCorrect, setIsCategoryCorrect] = useState(false);
    
    const [categoryOrder, setCategoryOrder] = useState([]);
    const [feedback, setFeedback] = useState({ text: '', type: '' });

    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

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
    }, [stage, sourceBooks, targetBooks, currentCategory]);

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

        if (isCorrect) {
            setFeedback({ text: "Perfect! You've ordered everything correctly.", type: 'success' });
            setTimeout(() => setStage('complete'), 1500);
        } else {
            setFeedback({ text: 'Not quite the right order for the categories. Try again!', type: 'error' });
            setTimeout(() => setFeedback({text: '', type: ''}), 2500);
        }
    };
    
    // --- DND Handlers ---
    const handleDragStart = (e, item, source, index) => {
        dragItem.current = { item, source, index };
        setTimeout(() => e.target.classList.add('opacity-50'), 0);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
        dragItem.current = null;
        dragOverItem.current = null;
        setDragOverIndex(null);
    };

    const handleDragOver = (e, target, index) => {
        e.preventDefault();
        if (target === 'targetBooks' || target === 'categories') {
            dragOverItem.current = index;
            setDragOverIndex(index);
        } else {
             dragOverItem.current = null;
            setDragOverIndex(null);
        }
    };

    const handleDrop = (e, target) => {
        e.preventDefault();
        if (!dragItem.current) return;
        
        const { item, source, index } = dragItem.current;
        
        // --- Book Sorting Stage ---
        if (stage === 'books') {
            const newSourceBooks = [...sourceBooks];
            const newTargetBooks = [...targetBooks];

            if (source === 'source' && target === 'targetBooks') {
                newSourceBooks.splice(index, 1);
                if (dragOverItem.current !== null) {
                    newTargetBooks.splice(dragOverItem.current, 0, item);
                } else {
                    newTargetBooks.push(item);
                }
            } else if (source === 'target' && target === 'targetBooks') {
                const draggedItem = newTargetBooks.splice(index, 1)[0];
                 if (dragOverItem.current !== null) {
                    newTargetBooks.splice(dragOverItem.current, 0, draggedItem);
                } else {
                    newTargetBooks.push(draggedItem);
                }
            } else if (source === 'target' && target === 'sourceBooks') {
                const draggedItem = newTargetBooks.splice(index, 1)[0];
                newSourceBooks.push(draggedItem);
            }
            
            setSourceBooks(newSourceBooks);
            setTargetBooks(newTargetBooks);
        }
        
        // --- Category Sorting Stage ---
        if (stage === 'categories') {
            const newCategoryOrder = [...categoryOrder];
            const draggedItem = newCategoryOrder.splice(index, 1)[0];
            if (dragOverItem.current !== null) {
                newCategoryOrder.splice(dragOverItem.current, 0, draggedItem);
            } else {
                 newCategoryOrder.push(draggedItem);
            }
            setCategoryOrder(newCategoryOrder);
        }
    };

    const resetGame = useCallback(() => {
        setStage('books');
        setCategoryIndex(0);
        setCompletedCategories([]);
        setCategoryOrder([]);
    }, []);

    // --- Render logic ---
    if (stage === 'complete') {
        return e('div', { className: "flex flex-col h-screen" },
            e(Header, { onBack, title: section.sectionTitle }),
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
        e(Header, { onBack, title: `Order: ${section.sectionTitle}` }),
        e('main', { className: "flex-grow p-4 flex flex-col items-center" },
            
            // --- Stage 1: Book Sorting ---
            stage === 'books' && currentCategory && e('div', { key: categoryIndex, className: 'w-full max-w-4xl animate-fade-in' },
                e('div', { className: 'text-center mb-4' },
                    e('p', { className: 'text-sm font-semibold text-slate-500 dark:text-slate-400' }, `Category ${categoryIndex + 1} of ${section.categories.length}`),
                    e('h2', { className: 'text-2xl font-bold' }, currentCategory.title),
                ),
                 e('div', {
                    className: `border-2 border-dashed rounded-lg p-4 min-h-[10rem] transition-colors ${isCategoryCorrect ? 'border-green-500' : 'border-slate-400 dark:border-slate-600'}`,
                    onDragOver: (e) => e.preventDefault(),
                    onDrop: (e) => handleDrop(e, 'targetBooks')
                },
                    e('div', { className: 'flex flex-wrap gap-2' },
                        targetBooks.map((book, index) => e(React.Fragment, { key: book.name },
                            dragOverIndex === index && e('div', { className: 'w-1 h-10 bg-sky-500 rounded' }),
                            e('div', {
                                className: 'flex items-center justify-center text-center p-2 h-12 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-300 dark:border-slate-700 cursor-grab',
                                draggable: true,
                                onDragStart: (e) => handleDragStart(e, book, 'target', index),
                                onDragEnd: handleDragEnd,
                                onDragOver: (e) => handleDragOver(e, 'targetBooks', index)
                            }, e('span', { className: "text-sm font-semibold" }, book.name))
                        )),
                         dragOverIndex === targetBooks.length && e('div', { className: 'w-1 h-10 bg-sky-500 rounded' })
                    )
                ),
                
                e('div', { className: 'text-center my-4 h-6' },
                    e('p', { className: `font-semibold ${getFeedbackClass(feedback.type)}` }, feedback.text)
                ),

                e('div', {
                    className: 'mt-4 w-full p-4 border-t-2 border-slate-300 dark:border-slate-700 min-h-[8rem] bg-slate-50 dark:bg-slate-900/50 rounded-b-lg',
                    onDragOver: (e) => e.preventDefault(),
                    onDrop: (e) => handleDrop(e, 'sourceBooks')
                },
                    e('div', { className: 'flex flex-wrap gap-2 justify-center' },
                        sourceBooks.map((book, index) => e('div', {
                            key: book.name,
                            className: 'flex items-center justify-center text-center p-2 h-12 bg-sky-100 dark:bg-sky-900/50 rounded-md shadow-sm border border-sky-300 dark:border-sky-700 cursor-grab',
                            draggable: true,
                            onDragStart: (e) => handleDragStart(e, book, 'source', index),
                            onDragEnd: handleDragEnd
                        }, e('span', { className: "text-sm font-semibold" }, book.name)))
                    )
                ),

                e('div', { className: "mt-6 flex justify-center space-x-4" },
                    e('button', { onClick: resetCurrentCategory, className: "px-6 py-2 bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg shadow-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" }, "Reset"),
                    isCategoryCorrect && e('button', { onClick: handleNext, className: "px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors animate-fade-in" }, "Next Category")
                )
            ),

            // --- Stage 2: Category Sorting ---
            stage === 'categories' && e('div', { className: 'w-full max-w-4xl animate-fade-in' },
                e('div', { className: 'text-center mb-4' },
                    e('h2', { className: 'text-2xl font-bold' }, 'Final Step: Order the Categories'),
                    e('p', { className: `font-semibold h-6 mt-2 ${getFeedbackClass(feedback.type)}` }, feedback.text || "Drag and drop the categories into their correct sequence.")
                ),
                e('div', {
                    className: 'space-y-3',
                    onDragOver: (e) => e.preventDefault(),
                    onDrop: (e) => handleDrop(e, 'categories')
                },
                    categoryOrder.map((cat, index) => e(React.Fragment, { key: cat.title },
                         dragOverIndex === index && e('div', { className: 'h-1 w-full bg-sky-500 rounded' }),
                         e('div', {
                            className: 'w-full p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 cursor-grab',
                            draggable: true,
                            onDragStart: (e) => handleDragStart(e, cat, 'categories', index),
                            onDragEnd: handleDragEnd,
                            onDragOver: (e) => handleDragOver(e, 'categories', index)
                        },
                            e('h3', { className: 'font-bold text-lg text-sky-700 dark:text-sky-300' }, cat.title),
                            e('p', { className: 'text-sm text-slate-500 dark:text-slate-400 mt-1' }, cat.books.join(', '))
                        )
                    )),
                    dragOverIndex === categoryOrder.length && e('div', { className: 'h-1 w-full bg-sky-500 rounded' })
                ),
                e('div', { className: "mt-6 flex justify-center space-x-4" },
                    e('button', { onClick: checkCategoryOrder, className: "px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors" }, "Check Final Order")
                )
            )
        )
    );
};


// --- Main App Component ---
export default function App() {
  const [view, setView] = useState({ name: 'home', topic: null });
  const [installPrompt, setInstallPrompt] = useState(null);
  const { showUpdateNotification, handleUpdate } = useServiceWorkerUpdater();

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

  const handleSelectGame = (game) => {
    if (game.type === QuizItemType.FLASHCARD_MENU) {
      setView({ name: 'flashcards' });
    } else if (game.type === QuizItemType.ORDER_BOOKS) {
      setView({ name: 'bookOrderMenu' });
    } else if (game.type === QuizItemType.MATCH_SCRIPTURE) {
      setView({ name: 'scriptureMatchingMenu' });
    } else {
      setView({ name: 'game', topic: game });
    }
  };
  
  const handleSelectBookOrderSection = (section) => {
    setView({ name: 'bookOrderGame', topic: section });
  };

  const handleSelectTopic = (topic) => {
    setView({ name: 'game', topic: topic });
  };
  
  const handleBack = () => {
    const { name, topic } = view;
    if (name === 'game') {
        if (topic.type === QuizItemType.MATCH_SCRIPTURE) {
            setView({ name: 'scriptureMatchingMenu' });
        } else {
            setView({ name: 'flashcards' });
        }
    } else if (name === 'flashcards' || name === 'bookOrderMenu' || name === 'scriptureMatchingMenu') {
        setView({ name: 'home' });
    } else if (name === 'bookOrderGame') {
        setView({ name: 'bookOrderMenu' });
    }
  };

  const renderScreen = () => {
    switch (view.name) {
      case 'home':
        return e(HomeScreen, { onSelectGame: handleSelectGame, onInstall: handleInstallClick, canInstall: !!installPrompt });
      case 'flashcards':
        return e(FlashcardsMenuScreen, { onSelectTopic: handleSelectTopic, onBack: handleBack });
      case 'scriptureMatchingMenu':
        return e(ScriptureMatchingMenuScreen, { onSelectTopic: handleSelectTopic, onBack: handleBack });
      case 'bookOrderMenu':
        return e(BookOrderMenuScreen, { onSelectSection: handleSelectBookOrderSection, onBack: handleBack });
      case 'bookOrderGame':
        return e(BookOrderGameScreen, { 
            section: view.topic, 
            onBack: handleBack,
        });
      case 'game':
        if (!view.topic) return e(HomeScreen, { onSelectGame: handleSelectGame }); // Fallback
        switch (view.topic.type) {
          case QuizItemType.BOOK_QUIZ:
            return e(QuizScreen, { topic: view.topic, onBack: handleBack });
          case QuizItemType.MATCH_SCRIPTURE:
            return e(MatchingGameScreen, { topic: view.topic, onBack: handleBack });
          default:
            return e(GameScreen, { topic: view.topic, onBack: handleBack });
        }
      default:
        return e(HomeScreen, { onSelectGame: handleSelectGame });
    }
  };

  return e(ErrorBoundary, null,
    e('div', { className: 'relative min-h-screen' },
        renderScreen(),
        showUpdateNotification && e('div', { className: "fixed bottom-4 right-4 z-50 animate-fade-in-up" },
            e('div', { className: "bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg shadow-xl p-4 flex items-center space-x-4" },
                e('p', { className: "font-medium" }, "A new version is available!"),
                e('button', { onClick: handleUpdate, className: "px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 dark:focus:ring-offset-slate-200 focus:ring-sky-500" }, "Reload")
            )
        )
    )
  );
}
