/**
 * Property-related calculations for the Monopoly game
 */

export function calculateRent(space, diceRoll = 0, owner) {
  if (!space || !owner) return 0;
  
  if (space.type === 'utility') {
    const multiplier = owner.utilitiesOwned === 1 ? 400 : 
                     owner.utilitiesOwned === 2 ? 1000 : 2000;
    return diceRoll * multiplier;
  }
  
  if (space.type === 'railroad') {
    return 2500 * (2 ** (owner.railroadsOwned - 1));
  }
  
  // 通常物件 (Regular properties)
  if (!space.rentLevels || !Array.isArray(space.rentLevels)) {
    return 0;
  }
  
  const houses = space.houses || 0;
  let rent = space.rentLevels[Math.min(houses, space.rentLevels.length - 1)] || 0;
  
  // Double rent if player owns all properties of the same color (monopoly)
  // and there are no houses built
  if (houses === 0 && owner.hasMonopoly && owner.hasMonopoly(space.color)) {
    rent *= 2;
  }
  
  return rent;
}
