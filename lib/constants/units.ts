export const INVENTORY_UNITS = [
  'piece',
  'box',
  'pack',
  'bottle',
  'tube',
  'vial',
  'cartridge',
  'ml',
  'litre',
  'gram',
  'kg',
  'roll',
  'pair',
  'sheet',
  'set',
] as const;

export type InventoryUnit = (typeof INVENTORY_UNITS)[number];
