// Import game engine modules
import { rollDice, calculateRent } from './engine/index.js';

// Make engine functions available globally for now (can be refactored later)
window.rollDice = rollDice;
window.calculateRent = calculateRent;

// Import and initialize the rest of the game
import './game.js';  // We'll create this next to hold the rest of the game logic

console.log('Game initialized!');
