/**
 * Dice rolling functionality for the Monopoly game
 */

export function rollDice() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return { d1, d2, sum: d1 + d2 };
}
