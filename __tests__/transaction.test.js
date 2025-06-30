// __tests__/transaction.test.js
import { buyProperty, payRent, setGlobalBoardData } from '../js/engine/transaction.js';

// Mock the global board data
const mockBoardData = [
  { id: 'p1', type: 'property', color: 'brown', price: 1000, rentLevels: [40, 200], houses: 0 },
  { id: 'p2', type: 'property', color: 'brown', price: 1000, rentLevels: [40, 200], houses: 0 },
  { id: 'util1', type: 'utility', price: 1500 },
  { id: 'util2', type: 'utility', price: 1500 },
  { id: 'rr1', type: 'railroad', price: 2000 },
  { id: 'rr2', type: 'railroad', price: 2000 },
  { id: 'rr3', type: 'railroad', price: 2000 },
  { id: 'rr4', type: 'railroad', price: 2000 },
];

// Set up the global board data before tests
describe('Transaction Tests', () => {
  beforeAll(() => {
    setGlobalBoardData(mockBoardData);
    if (typeof global !== 'undefined') {
      global.globalBoardData = mockBoardData;
    }
  });

  describe('buyProperty()', () => {
    test('should return false if player does not have enough money', () => {
      const player = { id: 1, money: 500, properties: [] };
      const space = { ...mockBoardData[0], owner: null };
      
      const result = buyProperty(player, space);
      
      expect(result).toBe(false);
      expect(player.money).toBe(500);
      expect(space.owner).toBe(null);
      expect(player.properties).toHaveLength(0);
    });

    test('should allow purchase if player has enough money', () => {
      const player = { id: 1, money: 1500, properties: [] };
      const space = { ...mockBoardData[0], owner: null };
      
      const result = buyProperty(player, space);
      
      expect(result).toBe(true);
      expect(player.money).toBe(500); // 1500 - 1000
      expect(space.owner).toBe(1);
      expect(player.properties).toContain('p1');
    });

    test('should handle properties array initialization', () => {
      const player = { id: 1, money: 1500 };
      const space = { ...mockBoardData[0], owner: null };
      
      const result = buyProperty(player, space);
      
      expect(result).toBe(true);
      expect(Array.isArray(player.properties)).toBe(true);
      expect(player.properties).toHaveLength(1);
    });
  });

  describe('payRent()', () => {
    test('should handle regular property rent', () => {
      const player = { id: 1, money: 1000, properties: [] };
      const owner = { id: 2, money: 1000, properties: ['p1'] };
      const space = { ...mockBoardData[0], owner: 2 };
      
      const rent = payRent(player, owner, space, 0);
      
      expect(rent).toBe(40); // rentLevels[0]
      expect(player.money).toBe(960); // 1000 - 40
      expect(owner.money).toBe(1040); // 1000 + 40
    });

    test('should handle monopoly rent (double for no houses)', () => {
      const player = { id: 1, money: 1000, properties: [] };
      const owner = { 
        id: 2, 
        money: 1000, 
        properties: ['p1', 'p2'] // Owns both brown properties
      };
      const space = { ...mockBoardData[0], owner: 2 };
      
      const rent = payRent(player, owner, space, 0);
      
      expect(rent).toBe(80); // 40 * 2 (monopoly)
      expect(player.money).toBe(920);
      expect(owner.money).toBe(1080);
    });

    test('should handle utility rent (1 utility)', () => {
      const player = { id: 1, money: 10000, properties: [] };
      const owner = { id: 2, money: 1000, properties: ['util1'] };
      const space = { ...mockBoardData[2], owner: 2 };
      
      const rent = payRent(player, owner, space, 10); // 10 * 400 = 4000
      
      expect(rent).toBe(4000);
      expect(player.money).toBe(6000);
      expect(owner.money).toBe(5000);
    });

    test('should handle utility rent (2 utilities)', () => {
      const player = { id: 1, money: 10000, properties: [] };
      const owner = { id: 2, money: 1000, properties: ['util1', 'util2'] };
      const space = { ...mockBoardData[2], owner: 2 };
      
      const rent = payRent(player, owner, space, 10); // 10 * 1000 = 10000
      
      expect(rent).toBe(10000);
      expect(player.money).toBe(0);
      expect(owner.money).toBe(11000);
    });

    test('should handle railroad rent (1 railroad)', () => {
      const player = { id: 1, money: 10000, properties: [] };
      const owner = { id: 2, money: 1000, properties: ['rr1'] };
      const space = { ...mockBoardData[4], owner: 2 };
      
      const rent = payRent(player, owner, space, 0);
      
      expect(rent).toBe(2500); // 2500 * 1
      expect(player.money).toBe(7500);
      expect(owner.money).toBe(3500);
    });

    test('should handle railroad rent (4 railroads)', () => {
      const player = { id: 1, money: 30000, properties: [] };
      const owner = { 
        id: 2, 
        money: 1000, 
        properties: ['rr1', 'rr2', 'rr3', 'rr4'] 
      };
      const space = { ...mockBoardData[4], owner: 2 };
      
      const rent = payRent(player, owner, space, 0);
      
      expect(rent).toBe(20000); // 2500 * 8 (2^(4-1) = 8)
      expect(player.money).toBe(10000); // 30000 - 20000
      expect(owner.money).toBe(21000);
    });

    test('should return false if player cannot pay rent', () => {
      const player = { id: 1, money: 30, properties: [] };
      const owner = { id: 2, money: 1000, properties: ['p1'] };
      const space = { ...mockBoardData[0], owner: 2 };
      
      const rent = payRent(player, owner, space, 0);
      
      expect(rent).toBe(false);
      expect(player.money).toBe(30);
      expect(owner.money).toBe(1000);
    });
  });
});
