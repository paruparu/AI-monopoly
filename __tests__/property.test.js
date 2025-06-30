// __tests__/property.test.js
import { calculateRent } from '../js/engine/property.js';

describe('calculateRent()', () => {
  // Mock owner object for testing
  const createMockOwner = (options = {}) => ({
    utilitiesOwned: 0,
    railroadsOwned: 0,
    hasMonopoly: () => false,
    ...options
  });

  test('should calculate rent for normal property with no houses', () => {
    const space = { 
      type: 'property', 
      rentLevels: [100, 200, 300, 450, 600, 800],
      color: 'brown'
    };
    const owner = createMockOwner();
    
    expect(calculateRent(space, 0, owner)).toBe(100);
  });

  test('should double rent for monopoly with no houses', () => {
    const space = { 
      type: 'property', 
      rentLevels: [100, 200, 300, 450, 600, 800],
      color: 'brown'
    };
    const owner = createMockOwner({
      hasMonopoly: (color) => color === 'brown'
    });
    
    expect(calculateRent(space, 0, owner)).toBe(200);
  });

  test('should calculate rent based on number of houses', () => {
    const space = { 
      type: 'property', 
      rentLevels: [100, 200, 300, 450, 600, 800],
      color: 'brown',
      houses: 3
    };
    const owner = createMockOwner();
    
    expect(calculateRent(space, 0, owner)).toBe(450);
  });

  test('should handle hotel as 5 houses', () => {
    const space = { 
      type: 'property', 
      rentLevels: [100, 200, 300, 450, 600, 800],
      color: 'brown',
      houses: 5  // Hotel is treated as 5 houses in the implementation
    };
    const owner = createMockOwner();
    
    expect(calculateRent(space, 0, owner)).toBe(800);
  });

  test('should calculate utility rent based on dice roll', () => {
    const space = { type: 'utility' };
    
    // Test with 1 utility owned (400x dice roll)
    const owner1 = createMockOwner({ utilitiesOwned: 1 });
    expect(calculateRent(space, 8, owner1)).toBe(8 * 400);
    
    // Test with 2 utilities owned (1000x dice roll)
    const owner2 = createMockOwner({ utilitiesOwned: 2 });
    expect(calculateRent(space, 7, owner2)).toBe(7 * 1000);
    
    // Test with more than 2 utilities (2000x dice roll)
    const owner3 = createMockOwner({ utilitiesOwned: 3 });
    expect(calculateRent(space, 5, owner3)).toBe(5 * 2000);
  });

  test('should calculate railroad rent based on number owned', () => {
    const space = { type: 'railroad' };
    
    // Test with 1 railroad owned
    const owner1 = createMockOwner({ railroadsOwned: 1 });
    expect(calculateRent(space, 0, owner1)).toBe(2500);
    
    // Test with 2 railroads owned
    const owner2 = createMockOwner({ railroadsOwned: 2 });
    expect(calculateRent(space, 0, owner2)).toBe(5000);
    
    // Test with 3 railroads owned
    const owner3 = createMockOwner({ railroadsOwned: 3 });
    expect(calculateRent(space, 0, owner3)).toBe(10000);
    
    // Test with 4 railroads owned
    const owner4 = createMockOwner({ railroadsOwned: 4 });
    expect(calculateRent(space, 0, owner4)).toBe(20000);
  });

  test('should return 0 for unowned property', () => {
    const space = { 
      type: 'property', 
      rentLevels: [100, 200, 300, 450, 600, 800],
      color: 'brown'
    };
    
    expect(calculateRent(space, 0, null)).toBe(0);
  });
});
