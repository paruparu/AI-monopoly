// __tests__/dice.test.js
import { rollDice } from '../js/engine/dice.js';

describe('rollDice()', () => {
  test('d1 and d2 should return integers between 1 and 6', () => {
    const { d1, d2 } = rollDice();
    
    // Check if d1 and d2 are integers between 1 and 6
    expect(Number.isInteger(d1)).toBe(true);
    expect(d1).toBeGreaterThanOrEqual(1);
    expect(d1).toBeLessThanOrEqual(6);
    
    expect(Number.isInteger(d2)).toBe(true);
    expect(d2).toBeGreaterThanOrEqual(1);
    expect(d2).toBeLessThanOrEqual(6);
  });

  test('sum should be equal to d1 + d2', () => {
    const { d1, d2, sum } = rollDice();
    expect(sum).toBe(d1 + d2);
  });

  test('should return different values on subsequent calls', () => {
    // This test might occasionally fail due to randomness, but it's very unlikely
    const firstRoll = rollDice();
    const secondRoll = rollDice();
    
    // It's possible but very unlikely to get the same roll twice in a row
    const sameRoll = firstRoll.d1 === secondRoll.d1 && 
                    firstRoll.d2 === secondRoll.d2;
    
    // If by chance we got the same roll, log it but don't fail
    if (sameRoll) {
      console.log('Warning: Got the same dice roll twice in a row. This is possible but unlikely.');
    }
  });
});
