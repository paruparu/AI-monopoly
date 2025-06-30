// __tests__/advancedTransaction.test.js
import { jest } from '@jest/globals';
import { 
  applyChanceCard, 
  advanceToProperty, 
  handleJailTurn 
} from '../js/engine/transaction.js';

describe('Advanced Transaction Tests', () => {
  // Mock console.warn before all tests
  beforeAll(() => {
    global.console.warn = jest.fn();
  });
  
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('applyChanceCard()', () => {
    let player;
    let board;

    beforeEach(() => {
      player = { id: 1, money: 1500, position: 0, properties: [] };
      board = Array(40).fill().map((_, i) => ({ id: `space-${i}`, type: 'property' }));
      
      // Add some special spaces
      board[5] = { id: 'rr1', type: 'railroad', price: 2000 };
      board[12] = { id: 'util1', type: 'utility', price: 1500 };
      board[28] = { id: 'rr2', type: 'railroad', price: 2000 };
    });

    test('should handle advance to specific position', () => {
      const card = { 
        type: 'advance', 
        position: 10, 
        description: 'Advance to Boardwalk' 
      };
      
      const result = applyChanceCard(player, card, board);
      
      expect(player.position).toBe(10);
      expect(result.newPosition).toBe(10);
      expect(result.passedGo).toBe(false);
      expect(result.message).toBe('Advance to Boardwalk');
    });

    test('should collect money when passing GO', () => {
      player.position = 35; // Near the end of the board
      const card = { 
        type: 'advance', 
        position: 5, 
        description: 'Advance to Reading Railroad' 
      };
      
      const result = applyChanceCard(player, card, board);
      
      expect(player.position).toBe(5);
      expect(result.passedGo).toBe(true);
      expect(player.money).toBe(1700); // 1500 + 200 for passing GO
    });

    test('should handle collect money card', () => {
      const card = { 
        type: 'collect', 
        amount: 100, 
        description: 'Bank pays you dividend of $100' 
      };
      
      const result = applyChanceCard(player, card, board);
      
      expect(player.money).toBe(1600); // 1500 + 100
      expect(result.amount).toBe(100);
    });

    test('should handle pay money card', () => {
      const card = { 
        type: 'pay', 
        amount: 50, 
        description: 'Pay poor tax of $50' 
      };
      
      const result = applyChanceCard(player, card, board);
      
      expect(player.money).toBe(1450); // 1500 - 50
      expect(result.amount).toBe(50);
    });

    test('should handle go to jail card', () => {
      const card = { 
        type: 'jail', 
        description: 'Go to Jail. Go directly to Jail, do not pass Go, do not collect $200' 
      };
      
      const result = applyChanceCard(player, card, board);
      
      expect(player.position).toBe(10); // Jail position
      expect(player.inJail).toBe(true);
      expect(player.jailTurns).toBe(0);
    });

    test('should handle move spaces card', () => {
      const card = { 
        type: 'move', 
        spaces: 3, 
        description: 'Advance 3 spaces' 
      };
      
      const result = applyChanceCard(player, card, board);
      
      expect(player.position).toBe(3); // 0 + 3
      expect(result.passedGo).toBe(false);
    });

    test('should handle repairs card', () => {
      // Give player some properties with houses
      player.properties = ['p1', 'p2', 'p3'];
      board[1] = { id: 'p1', type: 'property', houses: 2 };
      board[2] = { id: 'p2', type: 'property', hotel: true };
      board[3] = { id: 'p3', type: 'property', houses: 1 };
      
      const card = { 
        type: 'repairs', 
        houseCost: 25, 
        hotelCost: 100,
        description: 'Make general repairs on all your property' 
      };
      
      const result = applyChanceCard(player, card, board);
      
      // 2 houses * 25 + 1 hotel * 100 + 1 house * 25 = 175
      expect(result.amount).toBe(175);
      expect(player.money).toBe(1325); // 1500 - 175
    });
  });

  describe('advanceToProperty()', () => {
    let player;
    let board;

    beforeEach(() => {
      player = { id: 1, money: 1500, position: 0 };
      
      // Create a minimal board with just the spaces we need for testing
      board = Array(40).fill().map((_, i) => ({
        id: `space-${i}`,
        type: 'property',
        price: 100,
        rentLevels: [10, 20, 30, 40, 50, 60]
      }));
      
      // Set up specific spaces for testing
      board[5] = { id: 'rr1', type: 'railroad', price: 2000 };
      board[10] = { id: 'util1', type: 'utility', price: 1500 };
      board[20] = { id: 'park-place', type: 'property', price: 350, rentLevels: [35, 175, 500, 1100, 1300, 1500] };
      board[30] = { id: 'boardwalk', type: 'property', price: 400, rentLevels: [50, 200, 600, 1400, 1700, 2000] };
    });

    test('should advance to specified property', () => {
      const result = advanceToProperty(player, 'park-place', board);
      
      expect(result.success).toBe(true);
      expect(result.space.id).toBe('park-place');
      expect(player.position).toBe(20);
      expect(result.spacesMoved).toBe(20);
      expect(result.passedGo).toBe(false);
    });

    test('should pass GO when moving to earlier position', () => {
      player.position = 25;
      const result = advanceToProperty(player, 'rr1', board); // rr1 is at position 5
      
      expect(result.success).toBe(true);
      expect(result.space.id).toBe('rr1');
      expect(player.position).toBe(5);
      expect(result.passedGo).toBe(true);
      expect(player.money).toBe(1700); // 1500 + 200 for passing GO
    });

    test('should handle moving to current position', () => {
      player.position = 10; // util1 is at position 10
      const result = advanceToProperty(player, 'util1', board);
      
      expect(result.success).toBe(true);
      expect(result.space.id).toBe('util1');
      expect(player.position).toBe(10);
      expect(result.spacesMoved).toBe(40); // Full loop around the board
      expect(result.passedGo).toBe(true);
      expect(player.money).toBe(1700); // 1500 + 200 for passing GO
    });

    test('should return error for non-existent property', () => {
      const result = advanceToProperty(player, 'non-existent', board);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Property not found');
      expect(console.warn).toHaveBeenCalledWith('Property not found:', 'non-existent');
    });
  });

  describe('handleJailTurn()', () => {
    let player;

    beforeEach(() => {
      player = {
        id: 1,
        money: 500,
        inJail: true,
        jailTurns: 0,
        getOutOfJailCards: 0
      };
    });

    test('should use Get Out of Jail Free card if available', () => {
      player.getOutOfJailCards = 1;
      
      const result = handleJailTurn(player, { useCard: true });
      
      expect(result.released).toBe(true);
      expect(result.reason).toBe('card');
      expect(player.inJail).toBe(false);
      expect(player.jailTurns).toBe(0);
      expect(player.getOutOfJailCards).toBe(0);
    });

    test('should pay bail if requested and has enough money', () => {
      const result = handleJailTurn(player, { payBail: true });
      
      expect(result.released).toBe(true);
      expect(result.reason).toBe('paid');
      expect(result.paidBail).toBe(true);
      expect(player.inJail).toBe(false);
      expect(player.jailTurns).toBe(0);
      expect(player.money).toBe(450); // 500 - 50
    });

    test('should not pay bail if not enough money', () => {
      player.money = 25;
      
      const result = handleJailTurn(player, { payBail: true });
      
      expect(result.released).toBe(false);
      expect(result.reason).toBe('insufficient_funds');
      expect(player.inJail).toBe(true);
      expect(player.money).toBe(25);
    });

    test('should release on doubles', () => {
      const result = handleJailTurn(player, { 
        diceRoll: { d1: 3, d2: 3 } // Doubles
      });
      
      expect(result.released).toBe(true);
      expect(result.reason).toBe('doubles');
      expect(player.inJail).toBe(false);
      expect(player.jailTurns).toBe(0);
    });

    test('should increment jail turns on non-doubles', () => {
      const result = handleJailTurn(player, { 
        diceRoll: { d1: 3, d2: 4 } // Not doubles
      });
      
      expect(result.released).toBe(false);
      expect(player.jailTurns).toBe(1);
    });

    test('should force payment on third failed attempt', () => {
      player.jailTurns = 2; // Already had 2 failed attempts
      
      const result = handleJailTurn(player, { 
        diceRoll: { d1: 3, d2: 4 } // Not doubles
      });
      
      expect(result.released).toBe(true);
      expect(result.reason).toBe('forced_pay');
      expect(result.paidBail).toBe(true);
      expect(player.inJail).toBe(false);
      expect(player.jailTurns).toBe(0);
      expect(player.money).toBe(450); // 500 - 50
    });

    test('should stay in jail if cannot pay on third attempt', () => {
      player.jailTurns = 2;
      player.money = 25; // Not enough to pay $50
      
      const result = handleJailTurn(player, { 
        diceRoll: { d1: 3, d2: 4 } // Not doubles
      });
      
      expect(result.released).toBe(false);
      expect(result.reason).toBe('insufficient_funds');
      expect(player.inJail).toBe(true);
      expect(player.jailTurns).toBe(3);
      expect(player.money).toBe(25);
    });
  });
});
