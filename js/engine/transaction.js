/**
 * Transaction-related functions for the Monopoly game
 */
import { calculateRent } from './property.js';
import { handleJailTurn as pureHandleJailTurn } from './jail.js';

/**
 * Attempts to buy a property for a player
 * @param {Object} player - The player attempting to buy
 * @param {Object} space - The property space to buy
 * @returns {boolean} True if the purchase was successful, false otherwise
 */
export function buyProperty(player, space) {
  if (player.money < space.price) return false;
  
  player.money -= space.price;
  space.owner = player.id;
  if (!player.properties) {
    player.properties = [];
  }
  player.properties.push(space.id);
  return true;
}

/**
 * Handles rent payment between players
 * @param {Object} player - The player paying rent
 * @param {Object} owner - The property owner receiving rent
 * @param {Object} space - The property being rented
 * @param {number} diceRoll - The current dice roll (for utility calculations)
 * @returns {number|boolean} The amount paid if successful, false if player can't pay
 */
export function payRent(player, owner, space, diceRoll = 0) {
  const rent = calculateRent(space, diceRoll, {
    utilitiesOwned: owner.properties.filter(pId => {
      const prop = globalBoardData.find(s => s.id === pId);
      return prop?.type === 'utility';
    }).length,
    railroadsOwned: owner.properties.filter(pId => {
      const prop = globalBoardData.find(s => s.id === pId);
      return prop?.type === 'railroad';
    }).length,
    hasMonopoly: (color) => {
      if (!color) return false;
      const owned = owner.properties.filter(pId => {
        const prop = globalBoardData.find(s => s.id === pId);
        return prop?.color === color;
      }).length;
      const total = globalBoardData.filter(s => s.color === color).length;
      return total > 0 && owned === total;
    }
  });
  
  if (player.money < rent) return false;
  
  player.money -= rent;
  owner.money += rent;
  return rent;
}

/**
 * Applies the effect of a chance card to a player
 * @param {Object} player - The player drawing the chance card
 * @param {Object} card - The chance card data
 * @param {Array} board - The game board
 * @returns {Object} Object containing the result of the card effect
 */
export function applyChanceCard(player, card, board) {
  const result = { type: card.type, message: card.description };
  
  switch (card.type) {
    case 'advance':
      result.newPosition = card.position;
      result.passedGo = player.position > result.newPosition; // Check if passed GO
      player.position = result.newPosition;
      if (result.passedGo) {
        player.money += 200; // Collect $200 for passing GO
      }
      break;
      
    case 'collect':
      player.money += card.amount;
      result.amount = card.amount;
      break;
      
    case 'pay':
      player.money -= card.amount;
      result.amount = card.amount;
      break;
      
    case 'jail':
      player.inJail = true;
      player.jailTurns = 0;
      player.position = 10; // Just Visiting/Jail position
      break;
      
    case 'move':
      result.newPosition = (player.position + card.spaces) % board.length;
      result.passedGo = player.position + card.spaces >= board.length;
      player.position = result.newPosition;
      if (result.passedGo) {
        player.money += 200; // Collect $200 for passing GO
      }
      break;
      
    case 'repairs':
      // Charge per house/hotel
      const totalCharge = (player.properties || []).reduce((total, propId) => {
        const prop = board.find(s => s.id === propId);
        if (!prop) return total;
        if (prop.hotel) return total + card.hotelCost;
        return total + (prop.houses * card.houseCost);
      }, 0);
      
      player.money -= totalCharge;
      result.amount = totalCharge;
      break;
  }
  
  return result;
}

/**
 * Advances player to a specific property by ID
 * @param {Object} player - The player to move
 * @param {string} propertyId - The ID of the property to advance to
 * @param {Array} board - The game board
 * @returns {Object} Result of the movement
 */
export function advanceToProperty(player, propertyId, board) {
  const currentPos = player.position;
  const targetIndex = board.findIndex(space => space.id === propertyId);
  
  if (targetIndex === -1) {
    console.warn('Property not found:', propertyId);
    return { success: false, error: 'Property not found' };
  }
  
  // If already on the target space, consider it a full loop around the board
  if (targetIndex === currentPos) {
    player.money += 200; // Collect $200 for passing GO
    return {
      success: true,
      newPosition: targetIndex,
      spacesMoved: board.length,
      passedGo: true,
      space: board[targetIndex]
    };
  }
  
  const spacesMoved = (targetIndex - currentPos + board.length) % board.length;
  const passedGo = targetIndex < currentPos;
  
  // Update player position
  player.position = targetIndex;
  
  // Collect $200 if passing GO
  if (passedGo) {
    player.money += 200;
  }
  
  return {
    success: true,
    newPosition: targetIndex,
    spacesMoved,
    passedGo,
    space: board[targetIndex]
  };
}

/**
 * Handles a player's turn in jail
 * @param {Object} player - The player in jail
 * @param {Object} options - Options for the jail turn
 * @param {boolean} options.useCard - Whether to use a Get Out of Jail Free card
 * @param {boolean} options.payBail - Whether to pay the $50 bail
 * @param {Object} options.diceRoll - The current dice roll (if any)
 * @returns {Object} Result of the jail action
 */
export function handleJailTurn(player, options = {}) {
  // Call the pure function version
  const result = pureHandleJailTurn(player, options);
  
  // Update the original player object
  Object.assign(player, result.player);
  
  // Return the expected result format
  return {
    released: result.released,
    reason: result.reason,
    paidBail: result.paidBail
  };
  return result;
}

/**
 * Global board data reference (will be set by the game)
 * This is a temporary solution - in a real app, you might want to pass this as a parameter
 */
let globalBoardData = [];

/**
 * Sets the global board data reference
 * @param {Array} boardData - The game board data
 */
export function setGlobalBoardData(boardData) {
  globalBoardData = boardData;
  
  // For Node.js environment
  if (typeof global !== 'undefined') {
    global.globalBoardData = globalBoardData;
  }
}

// For Node.js environment
if (typeof global !== 'undefined' && !global.globalBoardData) {
  global.globalBoardData = globalBoardData;
}
