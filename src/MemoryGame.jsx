import React, { useState, useEffect, useRef } from 'react';
import { Code, Github, FileCode, Workflow, Terminal, Database, Server, Puzzle, LogIn, Slack, Figma, Chrome, Layers, Package, Monitor } from 'lucide-react';
import bgv from './assets/lego.gif'

// Memory Game App
export default function MemoryGame() {
  // State for current section
  const [currentSection, setCurrentSection] = useState(0);
  
  // Game settings state
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // Time elapsed in seconds
  const [timeLimit, setTimeLimit] = useState(0); // Time limit in seconds
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [timeTaken, setTimeTaken] = useState(0);
  
  // Reference for timer interval
  const timerIntervalRef = useRef(null);
  
  // Refs for sections to scroll to
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  
  // Welcome section animation
  const [welcomeText, setWelcomeText] = useState('');
  const fullText = 'Welcome to Memory Game';
  
  // Card icons
  const cardIcons = [
    <Code size={32} />,
    <Github size={32} />,
    <FileCode size={32} />,
    <Workflow size={32} />,
    <Terminal size={32} />,
    <Database size={32} />,
    <Server size={32} />,
    <Puzzle size={32} />,
    <LogIn size={32} />,
    <Slack size={32} />,
    <Figma size={32} />,
    <Chrome size={32} />,
    <Layers size={32} />,
    <Package size={32} />,
    <Monitor size={32} />,
  ];
  
  // Time options based on size
  const timeOptions = {
    '4x4': [15, 30, 60],
    '5x4': [30, 60, 120],
    '6x4': [60, 120, 180]  // Changed from 6x6 to 6x4
  };
  
  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Initialize welcome text animation
  useEffect(() => {
    let timer;
    let currentIndex = 0;
    
    const animateText = () => {
      if (currentIndex <= fullText.length) {
        setWelcomeText(fullText.substring(0, currentIndex));
        currentIndex++;
        timer = setTimeout(animateText, 100);
      } else {
        // After animation completes, scroll to section 2
        setTimeout(() => {
          setCurrentSection(1);
          section2Ref.current?.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
      }
    };
    
    animateText();
    
    return () => clearTimeout(timer);
  }, []);
  
  // Timer effect - counts upward from zero
  useEffect(() => {
    // Clear any existing timer interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Only start timer when game is started and not won/over
    if (gameStarted && !gameOver && !gameWon) {
      // Start a new timer
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + 1;
          
          // Check if time limit is reached
          if (timeLimit > 0 && newTime >= timeLimit) {
            // Time's up - end game if not already won
            if (matchedCards.length !== cards.length) {
              setGameOver(true);
              setGameStarted(false);
              
              // Clear this interval
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
              }
            }
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameStarted, gameOver, gameWon, timeLimit, matchedCards.length, cards.length]);
  
  // Check win condition
  useEffect(() => {
    if (gameStarted && cards.length > 0 && matchedCards.length === cards.length) {
      // Save the time taken before stopping the game
      setTimeTaken(elapsedTime);
      setGameWon(true);
      setGameStarted(false);
      
      // Clear the timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [matchedCards, cards, gameStarted, elapsedTime]);
  
  // Initialize game board
  const initializeGame = () => {
    // Parse rows and columns from the selected size (e.g., "4x4", "5x4", "6x4")
    const [rows, cols] = selectedSize.split('x').map(num => parseInt(num));
    
    // Always use 4 columns, with variable number of rows
    const totalCards = cols * rows;
    
    // Ensure we have an even number of cards for pairs
    const adjustedTotalCards = totalCards % 2 === 0 ? totalCards : totalCards - 1;
    const halfTotalCards = adjustedTotalCards / 2;
    
    // Select icons
    const selectedIcons = [];
    const iconsCopy = [...cardIcons];
    
    for (let i = 0; i < halfTotalCards; i++) {
      if (iconsCopy.length > 0) {
        const randomIndex = Math.floor(Math.random() * iconsCopy.length);
        selectedIcons.push(iconsCopy[randomIndex]);
        iconsCopy.splice(randomIndex, 1);
      } else {
        // If we run out of unique icons, reuse from the beginning
        const randomIndex = Math.floor(Math.random() * cardIcons.length);
        selectedIcons.push(cardIcons[randomIndex]);
      }
    }
    
    // Create pairs
    let newCards = [];
    for (let i = 0; i < halfTotalCards; i++) {
      newCards.push({
        id: i * 2,
        icon: selectedIcons[i],
        isFlipped: false,
        isMatched: false
      });
      newCards.push({
        id: i * 2 + 1,
        icon: selectedIcons[i],
        isFlipped: false,
        isMatched: false
      });
    }
    
    // Shuffle cards
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    
    // Reset game state
    setCards(newCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setElapsedTime(0); // Reset elapsed time to zero
    setGameOver(false);
    setGameWon(false);
    
    // Start the game after a brief delay to allow cards to render
    setTimeout(() => {
      setGameStarted(true);
    }, 800);
  };
  
  // Card click handler
  const handleCardClick = (cardId) => {
    // Don't allow more than 2 cards flipped at once
    if (flippedCards.length === 2) return;
    
    // Don't allow clicking on already matched or flipped cards
    const card = cards.find(c => c.id === cardId);
    if (card.isMatched || flippedCards.includes(cardId)) return;
    
    // Flip the card
    setFlippedCards(prev => [...prev, cardId]);
    
    // If we have 2 cards flipped, check for match
    if (flippedCards.length === 1) {
      const firstCardId = flippedCards[0];
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = card;
      
      // Increment moves
      setMoves(prev => prev + 1);
      
      // Check for match
      if (firstCard.icon.type === secondCard.icon.type) {
        // Match found
        setMatchedCards(prev => [...prev, firstCardId, cardId]);
      }
      
      // Reset flipped cards after delay
      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    }
  };
  
  // Size selection handler
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setSelectedTime(null);
  };
  
  // Time selection handler
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setTimeLimit(time); // Store the time limit in seconds
    
    // Clear any previous game state
    setGameOver(false);
    setGameWon(false);
    
    // Automatically scroll to game section
    setTimeout(() => {
      setCurrentSection(2);
      section3Ref.current?.scrollIntoView({ behavior: 'smooth' });
      initializeGame();
    }, 500);
  };
  
  // Restart game handler
  const handleRestartGame = () => {
    // First clear any running timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Close any open dialogs
    setGameOver(false);
    setGameWon(false);
    setGameStarted(false);
    
    // Then navigate back to settings section
    setCurrentSection(1);
    section2Ref.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Reset game settings
    setSelectedSize(null);
    setSelectedTime(null);
  };
  
  // Card size class based on selected size for responsiveness
  const getCardSizeClass = () => {
    switch (selectedSize) {
      case '4x4':
        return 'w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28';
      case '5x4':
        return 'w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24';
      case '6x4':
        return 'w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20';
      default:
        return 'w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28';
    }
  };
  
  // Icon size based on card size
  const getIconSize = () => {
    switch (selectedSize) {
      case '4x4':
        return 24;
      case '5x4':
        return 20;
      case '6x4':
        return 18;
      default:
        return 24;
    }
  };
  
  return (
    <div className="font-sans text-gray-800">
      {/* Section 1: Welcome */}
      <div 
        ref={section1Ref}
        className="h-screen flex flex-col items-center justify-center bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${bgv})`, 
          filter: 'blur(0px)', 
          backgroundColor: '#213448'
        }}
      >
        <div className="z-10 text-center p-8 rounded-lg bg-[#ecefca] bg-opacity-90">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#213448] to-[#547792]">
            {welcomeText}
            <span className="animate-blink">|</span>
          </h1>
        </div>
      </div>
      
      {/* Section 2: Game Settings */}
      <div 
        ref={section2Ref}
        className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#213448] to-[#547792] text-white"
      >
        <div className="text-center p-8 max-w-xl">
          <h2 className="text-4xl font-bold mb-8">Game Settings</h2>
          
          <div className="mb-8">
            <h3 className="text-2xl mb-4">Select Grid Size:</h3>
            <div className="flex space-x-4 justify-center">
              {['4x4', '5x4', '6x4'].map((size) => (
                <button
                  key={size}
                  className={`py-3 px-6 rounded-lg text-xl transition-all duration-300 ${
                    selectedSize === size 
                      ? 'bg-[#FFAB5B] text-black font-bold scale-110' 
                      : 'bg-[#ECEFCA] bg-opacity-20 hover:bg-opacity-30 text-black hover:bg-[#FFAB5B]'
                  }`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          {selectedSize && (
            <div className="mt-12">
              <h3 className="text-2xl mb-4">Select Time Limit:</h3>
              <div className="flex space-x-4 justify-center">
                {timeOptions[selectedSize].map((seconds) => (
                  <button
                    key={seconds}
                    className="py-3 px-6 rounded-lg text-xl bg-[#ECEFCA] bg-opacity-20 hover:bg-opacity-30 hover:bg-[#FFAB5B] hover:text-black hover:font-bold text-black transition-all duration-300"
                    onClick={() => handleTimeSelect(seconds)}
                  >
                    {seconds >= 60 ? `${Math.floor(seconds / 60)}min` : `${seconds}s`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Section 3: Game */}
      <div 
        ref={section3Ref}
        className="min-h-screen flex flex-col bg-gradient-to-br from-[#213448] to-[#547792]"
      >
        <div className="flex-1 p-4 flex flex-col">
          {/* Game Header */}
          {gameStarted && (
            <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-md">
              <div className="text-xl font-bold text-[#003092]">
                Moves: {moves}
              </div>
              <div className="text-xl font-bold text-[#00879E]">
                Time: {formatTime(elapsedTime)} / {formatTime(timeLimit)}
              </div>
            </div>
          )}
          
          {/* Game Board */}
          <div className="flex-1 flex items-center justify-center">
            {gameStarted && (
              <div className="grid grid-cols-4 gap-2 md:gap-4 mx-auto w-full max-w-lg">
                {cards.map((card) => (
                  <div 
                    key={card.id}
                    className={`${getCardSizeClass()} flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300 transform ${
                      flippedCards.includes(card.id) || matchedCards.includes(card.id)
                        ? 'rotate-y-180 bg-white'
                        : 'bg-[#ECEFCA]'
                    } ${
                      matchedCards.includes(card.id) ? 'bg-[#FFAB5B]' : ''
                    } hover:scale-105`}
                    onClick={() => handleCardClick(card.id)}
                  >
                    {flippedCards.includes(card.id) || matchedCards.includes(card.id) ? (
                      <div className="text-[#003092]">
                        {React.cloneElement(card.icon, { size: getIconSize() })}
                      </div>
                    ) : (
                      <div className="text-white">
                        <Puzzle size={getIconSize()} color='black' />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Game Over Modal */}
          {gameOver && (
            <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-md mx-4">
                <h2 className="text-3xl font-bold text-red-600 mb-4">Game Failed</h2>
                <p className="text-xl mb-6">Time's up! Would you like to try again?</p>
                <button
                  className="py-3 px-6 rounded-lg bg-gradient-to-r from-[#003092] to-[#00879E] text-white text-xl hover:opacity-90 transition-opacity"
                  onClick={handleRestartGame}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {/* Game Won Modal */}
          {gameWon && (
            <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-md mx-4">
                <h2 className="text-3xl font-bold text-green-600 mb-4">Game Won!</h2>
                <div className="mb-6">
                  <p className="text-xl mb-2">Total Moves: {moves}</p>
                  <p className="text-xl">Time Taken: {formatTime(timeTaken)}</p>
                </div>
                <button
                  className="py-3 px-6 rounded-lg bg-gradient-to-r from-[#003092] to-[#00879E] text-xl hover:opacity-90 transition-opacity text-white"
                  onClick={handleRestartGame}
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-8 py-4 text-center text-white">
            Game made by Anshu
          </div>
        </div>
      </div>
      
      {/* CSS for card flip animation */}
      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}