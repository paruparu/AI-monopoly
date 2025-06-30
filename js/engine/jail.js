/**
 * Pure functions for handling jail-related game mechanics
 */

/**
 * Handles a player's turn while in jail (pure function version)
 * @param {Object} player - The player object
 * @param {Object} options - Options for the jail turn
 * @param {boolean} options.useCard - Whether to use a Get Out of Jail Free card
 * @param {boolean} options.payBail - Whether to pay bail
 * @param {Object} options.diceRoll - Optional dice roll result
 * @returns {Object} Result containing updated player and turn info
 */
export function handleJailTurn(player, options = {}) {
  const { useCard = false, payBail = false, diceRoll = null } = options;
  const result = {
    released: false,
    reason: '',
    paidBail: false,
    usedCard: false,
    player: { ...player } // Create a deep copy of the player
  };

  // Check if using a Get Out of Jail Free card
  if (useCard && result.player.getOutOfJailCards > 0) {
    result.player.getOutOfJailCards--;
    result.player.inJail = false;
    result.player.jailTurns = 0;
    result.released = true;
    result.reason = 'card';
    result.usedCard = true;
    return result;
  }

  // Check if paying bail
  if (payBail) {
    if (result.player.money >= 50) {
      result.player.money -= 50;
      result.player.inJail = false;
      result.player.jailTurns = 0;
      result.released = true;
      result.reason = 'paid';
      result.paidBail = true;
      return result;
    } else {
      result.reason = 'insufficient_funds';
      return result;
    }
  }

  // Check for doubles
  if (diceRoll && diceRoll.d1 === diceRoll.d2) {
    result.player.inJail = false;
    result.player.jailTurns = 0;
    result.released = true;
    result.reason = 'doubles';
    return result;
  }

  // Increment jail turns if no doubles
  if (diceRoll) {
    result.player.jailTurns = (result.player.jailTurns || 0) + 1;
    
    // Force payment on third failed attempt
    if (result.player.jailTurns >= 3) {
      if (result.player.money >= 50) {
        result.player.money -= 50;
        result.player.inJail = false;
        result.player.jailTurns = 0;
        result.released = true;
        result.reason = 'forced_pay';
        result.paidBail = true;
      } else {
        result.reason = 'insufficient_funds';
      }
    }
  }

  return result;
}
