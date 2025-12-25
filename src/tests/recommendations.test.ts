import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '../domain/engines/recommendations';
import { Component, Build, RuleResult } from '../domain/model/types';

describe('generateRecommendations', () => {
  const mockComponents: Component[] = [
    {
      id: 'cpu-old',
      type: 'CPU',
      brand: 'Intel',
      model: 'i5-8400',
      specs: { type: 'CPU', socket: 'LGA1151', cores: 6, threads: 6, baseClock: 2.8, boostClock: 4.0, tdpW: 65 },
      tags: ['old-gen'],
    },
    {
      id: 'gpu-weak',
      type: 'GPU',
      brand: 'NVIDIA',
      model: 'GTX 1060',
      specs: { type: 'GPU', vramGB: 6, interface: 'PCIe 3.0 x16', lengthMm: 250, widthMm: 111, heightMm: 40, tdpW: 120 },
      tags: ['budget'],
    },
    {
      id: 'ram-slow',
      type: 'RAM',
      brand: 'Kingston',
      model: 'ValueRAM',
      specs: { type: 'RAM', ramType: 'DDR4', speed: 2133, capacityGB: 8, sticks: 1 },
      tags: ['slow'],
    },
    {
      id: 'storage-hdd',
      type: 'Storage',
      brand: 'Seagate',
      model: 'Barracuda',
      specs: { type: 'Storage', storageType: 'HDD', capacityGB: 1000, interface: 'SATA' },
    },
    {
      id: 'cpu-modern',
      type: 'CPU',
      brand: 'AMD',
      model: 'Ryzen 5 5600X',
      specs: { type: 'CPU', socket: 'AM4', cores: 6, threads: 12, baseClock: 3.7, boostClock: 4.6, tdpW: 65 },
      tags: ['modern', 'gaming'],
    },
    {
      id: 'gpu-strong',
      type: 'GPU',
      brand: 'NVIDIA',
      model: 'RTX 3060',
      specs: { type: 'GPU', vramGB: 12, interface: 'PCIe 4.0 x16', lengthMm: 242, widthMm: 111, heightMm: 40, tdpW: 170 },
      tags: ['modern', 'gaming'],
    },
    {
      id: 'ram-fast',
      type: 'RAM',
      brand: 'Corsair',
      model: 'Vengeance',
      specs: { type: 'RAM', ramType: 'DDR4', speed: 3200, capacityGB: 16, sticks: 1 },
      tags: ['fast'],
    },
    {
      id: 'storage-ssd',
      type: 'Storage',
      brand: 'Samsung',
      model: '980',
      specs: { type: 'Storage', storageType: 'SSD', capacityGB: 500, interface: 'NVMe' },
    },
  ];

  it('should recommend CPU socket fix for mismatch', () => {
    const build: Build = {
      cpu: 'cpu-old',
      gpu: 'gpu-weak',
      motherboard: 'mb-1',
      ram: ['ram-slow'],
      storage: ['storage-hdd'],
      meta: { target: 'gaming' },
    };

    const compatibilityResults: RuleResult[] = [{
      code: 'cpu-socket-mismatch',
      severity: 'error',
      message: 'CPU socket LGA1151 does not match motherboard socket AM4',
      reason: 'CPU and motherboard must have compatible sockets',
      affectedIds: ['cpu-old', 'mb-1'],
    }];
    const balanceResults: RuleResult[] = [];

    const recommendations = generateRecommendations(build, mockComponents, compatibilityResults, balanceResults);
    
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some((r: any) => r.reasonCode === 'cpu-socket-mismatch')).toBe(true);
  });

  it('should recommend GPU upgrade for weak graphics', () => {
    const build: Build = {
      cpu: 'cpu-modern',
      gpu: 'gpu-weak',
      motherboard: 'mb-1',
      ram: ['ram-fast'],
      storage: ['storage-ssd'],
      meta: { target: 'gaming' },
    };

    const compatibilityResults: RuleResult[] = [];
    const balanceResults: RuleResult[] = [{
      code: 'cpu-gpu-mismatch',
      severity: 'warning',
      message: 'CPU may bottleneck high-end GPU in gaming',
      reason: 'Low core count CPU can limit GPU performance',
      affectedIds: ['cpu-modern', 'gpu-weak'],
    }];

    const recommendations = generateRecommendations(build, mockComponents, compatibilityResults, balanceResults);
    
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some((r: any) => r.reasonCode === 'cpu-gpu-mismatch')).toBe(true);
  });

  it('should recommend SSD upgrade for HDD storage', () => {
    const build: Build = {
      cpu: 'cpu-modern',
      gpu: 'gpu-strong',
      motherboard: 'mb-1',
      ram: ['ram-fast'],
      storage: ['storage-hdd'],
      meta: { target: 'gaming' },
    };

    const compatibilityResults: RuleResult[] = [];
    const balanceResults: RuleResult[] = [{
      code: 'no-ssd',
      severity: 'warning',
      message: 'No SSD selected, system may be slow',
      reason: 'SSD provides much faster boot and load times',
      affectedIds: ['storage-hdd'],
    }];

    const recommendations = generateRecommendations(build, mockComponents, compatibilityResults, balanceResults);
    
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some((r: any) => r.reasonCode === 'no-ssd')).toBe(true);
    expect(recommendations.find((r: any) => r.reasonCode === 'no-ssd')?.alternatives).toContain('storage-ssd');
  });

  it('should recommend RAM upgrade for insufficient memory', () => {
    const build: Build = {
      cpu: 'cpu-modern',
      gpu: 'gpu-strong',
      motherboard: 'mb-1',
      ram: ['ram-slow'], // Only 8GB slow RAM
      storage: ['storage-ssd'],
      meta: { target: 'gaming' },
    };

    const compatibilityResults: RuleResult[] = [];
    const balanceResults: RuleResult[] = [{
      code: 'insufficient-ram-gaming',
      severity: 'warning',
      message: 'Only 8GB RAM for gaming, recommend at least 16GB',
      reason: 'Gaming workloads benefit from more RAM',
      affectedIds: ['ram-slow'],
    }];

    const recommendations = generateRecommendations(build, mockComponents, compatibilityResults, balanceResults);
    
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.some((r: any) => r.reasonCode === 'insufficient-ram-gaming')).toBe(true);
    expect(recommendations.find((r: any) => r.reasonCode === 'insufficient-ram-gaming')?.alternatives).toContain('ram-fast');
  });

  it('should not recommend upgrades for clean build', () => {
    const build: Build = {
      cpu: 'cpu-modern',
      gpu: 'gpu-strong',
      motherboard: 'mb-1',
      ram: ['ram-fast'],
      storage: ['storage-ssd'],
      meta: { target: 'gaming' },
    };

    const compatibilityResults: RuleResult[] = [];
    const balanceResults: RuleResult[] = [];

    const recommendations = generateRecommendations(build, mockComponents, compatibilityResults, balanceResults);
    
    // Should have no recommendations for a clean build
    expect(recommendations.length).toBe(0);
  });
});
