import { describe, it, expect } from 'vitest';
import { checkCompatibility } from '../domain/engines/compatibility';
import { Component } from '../domain/model/types';

const mockComponents: Component[] = [
  {
    id: 'cpu-1',
    type: 'CPU',
    brand: 'Intel',
    model: 'i5',
    specs: { type: 'CPU', socket: 'LGA1700', cores: 6, threads: 12, baseClock: 3.7, boostClock: 4.9, tdpW: 125 },
  },
  {
    id: 'mb-1',
    type: 'Motherboard',
    brand: 'ASUS',
    model: 'B660',
    specs: { type: 'Motherboard', socket: 'LGA1700', formFactor: 'ATX', ramSlots: 4, ramType: 'DDR4', maxRamGB: 128, chipset: 'B660', pcieSlots: 2 },
  },
  {
    id: 'case-1',
    type: 'Case',
    brand: 'Fractal',
    model: 'Meshify',
    specs: { type: 'Case', formFactorCompatibility: ['ATX', 'Micro-ATX'], maxGpuLengthMm: 315, maxCpuCoolerHeightMm: 165 },
  },
];

describe('checkCompatibility', () => {
  it('should return no errors for compatible build', () => {
    const build = {
      cpu: 'cpu-1',
      motherboard: 'mb-1',
      case: 'case-1',
      ram: [],
      storage: [],
      meta: { target: 'gaming' as const },
    };

    const results = checkCompatibility(build, mockComponents);
    expect(results.filter(r => r.severity === 'error')).toHaveLength(0);
  });

  it('should return error for socket mismatch', () => {
    const build = {
      cpu: 'cpu-1',
      motherboard: 'mb-1', // same socket
      ram: [],
      storage: [],
      meta: { target: 'gaming' as const },
    };

    // Change mb socket
    const modifiedComponents = mockComponents.map(c =>
      c.id === 'mb-1' ? { ...c, specs: { ...c.specs, socket: 'AM4' } } : c
    );

    const results = checkCompatibility(build, modifiedComponents);
    expect(results.some(r => r.code === 'cpu-socket-mismatch')).toBe(true);
  });
});
