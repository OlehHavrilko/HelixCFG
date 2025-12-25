import { describe, it, expect } from 'vitest';
import { checkBalance } from '../domain/engines/balance';
import { Component, Build } from '../domain/model/types';

describe('checkBalance', () => {
  const mockComponents: Component[] = [
    {
      id: 'cpu-1',
      type: 'CPU',
      brand: 'Intel',
      model: 'i7-13700K',
      specs: { type: 'CPU', socket: 'LGA1700', cores: 16, threads: 24, baseClock: 3.4, boostClock: 5.4, tdpW: 125 },
      tags: ['high-end', 'gaming'],
    },
    {
      id: 'gpu-1',
      type: 'GPU',
      brand: 'NVIDIA',
      model: 'RTX 4080',
      specs: { type: 'GPU', vramGB: 16, interface: 'PCIe 4.0 x16', lengthMm: 310, widthMm: 140, heightMm: 61, tdpW: 320 },
      tags: ['high-end', 'gaming'],
    },
    {
      id: 'ram-1',
      type: 'RAM',
      brand: 'Corsair',
      model: 'Vengeance',
      specs: { type: 'RAM', ramType: 'DDR5', speed: 5600, capacityGB: 16, sticks: 1 },
      tags: ['gaming'],
    },
    {
      id: 'ram-2',
      type: 'RAM',
      brand: 'Corsair',
      model: 'Vengeance',
      specs: { type: 'RAM', ramType: 'DDR5', speed: 5600, capacityGB: 16, sticks: 1 },
      tags: ['gaming'],
    },
  ];

  it('should detect balanced gaming build', () => {
    const build: Build = {
      cpu: 'cpu-1',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1', 'ram-2'],
      storage: ['storage-1'],
      meta: { target: 'gaming' },
    };

    const results = checkBalance(build, mockComponents);
    
    expect(results.filter(r => r.severity === 'error')).toHaveLength(0);
    expect(results).toHaveLength(0); // No warnings for balanced build
  });

  it('should detect CPU-GPU mismatch for gaming', () => {
    const weakCpu: Component = {
      id: 'cpu-weak',
      type: 'CPU',
      brand: 'Intel',
      model: 'i3-13100',
      specs: { type: 'CPU', socket: 'LGA1700', cores: 4, threads: 8, baseClock: 3.4, boostClock: 4.5, tdpW: 60 },
      tags: ['budget'],
    };

    const components = [...mockComponents.filter(c => c.id !== 'cpu-1'), weakCpu];

    const build: Build = {
      cpu: 'cpu-weak',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1', 'ram-2'],
      storage: ['storage-1'],
      meta: { target: 'gaming' },
    };

    const results = checkBalance(build, components);
    
    expect(results.some((w: any) => w.code === 'cpu-gpu-mismatch')).toBe(true);
  });

  it('should detect insufficient RAM for workstation', () => {
    const build: Build = {
      cpu: 'cpu-1',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1'], // Only 16GB
      storage: ['storage-1'],
      meta: { target: 'work' },
    };

    const results = checkBalance(build, mockComponents);
    
    expect(results.some((w: any) => w.code === 'insufficient-ram-work')).toBe(true);
  });

  it('should detect no SSD warning', () => {
    const build: Build = {
      cpu: 'cpu-1',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1', 'ram-2'],
      storage: ['storage-hdd'], // HDD only
      meta: { target: 'gaming' },
    };

    const hddComponent: Component = {
      id: 'storage-hdd',
      type: 'Storage',
      brand: 'Seagate',
      model: 'Barracuda',
      specs: { type: 'Storage', storageType: 'HDD', capacityGB: 1000, interface: 'SATA' },
    };

    const results = checkBalance(build, [...mockComponents, hddComponent]);
    
    expect(results.some((w: any) => w.code === 'no-ssd')).toBe(true);
  });

  it('should detect PSU oversized warning', () => {
    const oversizedPsu: Component = {
      id: 'psu-oversized',
      type: 'PSU',
      brand: 'Corsair',
      model: 'RM1000',
      specs: { type: 'PSU', wattage: 1000, efficiency: '80+ Gold', modular: true },
    };

    const build: Build = {
      cpu: 'cpu-1',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1', 'ram-2'],
      storage: ['storage-1'],
      psu: 'psu-oversized',
      meta: { target: 'gaming' },
    };

    const results = checkBalance(build, [...mockComponents, oversizedPsu]);
    
    expect(results.some((w: any) => w.code === 'psu-oversized')).toBe(true);
  });
});
