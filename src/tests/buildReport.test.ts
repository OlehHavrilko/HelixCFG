import { describe, it, expect } from 'vitest';
import { generateBuildReport } from '../domain/services/buildReport';
import { Build, Component, Price } from '../domain/model/types';

describe('generateBuildReport', () => {
  const mockComponents: Component[] = [
    {
      id: 'cpu-1',
      type: 'CPU',
      brand: 'Intel',
      model: 'i5-12400F',
      specs: { type: 'CPU', socket: 'LGA1700', cores: 6, threads: 12, baseClock: 2.5, boostClock: 4.4, tdpW: 65 },
    },
    {
      id: 'gpu-1',
      type: 'GPU',
      brand: 'NVIDIA',
      model: 'RTX 3060',
      specs: { type: 'GPU', vramGB: 12, interface: 'PCIe 4.0 x16', lengthMm: 242, widthMm: 111, heightMm: 40, tdpW: 170 },
    },
    {
      id: 'mb-1',
      type: 'Motherboard',
      brand: 'MSI',
      model: 'B660M',
      specs: { type: 'Motherboard', socket: 'LGA1700', formFactor: 'Micro-ATX', ramSlots: 4, ramType: 'DDR4', maxRamGB: 128, chipset: 'B660', pcieSlots: 2 },
    },
    {
      id: 'ram-1',
      type: 'RAM',
      brand: 'Corsair',
      model: 'Vengeance',
      specs: { type: 'RAM', ramType: 'DDR4', speed: 3200, capacityGB: 16, sticks: 1 },
    },
    {
      id: 'ram-2',
      type: 'RAM',
      brand: 'Corsair',
      model: 'Vengeance',
      specs: { type: 'RAM', ramType: 'DDR4', speed: 3200, capacityGB: 16, sticks: 1 },
    },
    {
      id: 'storage-1',
      type: 'Storage',
      brand: 'Samsung',
      model: '980',
      specs: { type: 'Storage', storageType: 'SSD', capacityGB: 500, interface: 'NVMe' },
    },
  ];

  const mockPrices: Price[] = [
    { componentId: 'cpu-1', value: 180, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'gpu-1', value: 320, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'mb-1', value: 120, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'ram-1', value: 60, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'ram-2', value: 60, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
    { componentId: 'storage-1', value: 80, currency: 'USD', source: 'manual', updatedAt: '2024-01-01' },
  ];

  it('should generate complete build report for valid build', () => {
    const build: Build = {
      cpu: 'cpu-1',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1', 'ram-2'],
      storage: ['storage-1'],
      meta: { target: 'gaming' },
    };

    const report = generateBuildReport(build, mockComponents, mockPrices);

    expect(report).toBeDefined();
    expect(report.totalPrice).toBe(820); // 180 + 320 + 120 + 60 + 60 + 80
    expect(report.lineItems).toHaveLength(6);
    expect(report.errors).toBeDefined();
    expect(report.warnings).toBeDefined();
    expect(report.recommendations).toBeDefined();
    expect(report.summary).toContain('gaming');
    expect(report.summary).toContain('820');
  });

  it('should handle build with missing components', () => {
    const partialBuild: Build = {
      cpu: 'cpu-1',
      ram: ['ram-1'],
      storage: ['storage-1'],
      meta: { target: 'work' },
    };

    const report = generateBuildReport(partialBuild, mockComponents, mockPrices);

    expect(report.totalPrice).toBe(320); // 180 + 60 + 80
    expect(report.lineItems).toHaveLength(3);
    expect(report.summary).toContain('work');
  });

  it('should calculate pricing correctly with quantities', () => {
    const build: Build = {
      cpu: 'cpu-1',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1', 'ram-1', 'ram-2'], // duplicate ram-1
      storage: ['storage-1'],
      meta: { target: 'gaming' },
    };

    const report = generateBuildReport(build, mockComponents, mockPrices);

    expect(report.totalPrice).toBe(880); // 180 + 320 + 120 + 60 + 60 + 60 + 80 (ram-1 appears twice)
    
    const ram1Item = report.lineItems.find(item => item.componentId === 'ram-1');
    expect(ram1Item?.quantity).toBe(2);
    expect(ram1Item?.total).toBe(120);
  });

  it('should handle build with pricing errors gracefully', () => {
    const build: Build = {
      cpu: 'cpu-1',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1'],
      storage: ['storage-1'],
      meta: { target: 'gaming' },
    };

    // Prices without ram-1
    const incompletePrices = mockPrices.filter(p => p.componentId !== 'ram-1');

    const report = generateBuildReport(build, mockComponents, incompletePrices);

    expect(report.totalPrice).toBe(700); // 180 + 320 + 120 + 80 (ram-1 excluded)
    expect(report.lineItems).toHaveLength(5);
    expect(report.summary).toContain('gaming');
    expect(report.summary).toContain('700');
  });

  it('should generate appropriate summary based on issues', () => {
    const build: Build = {
      cpu: 'cpu-1',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1'],
      storage: ['storage-1'],
      meta: { target: 'gaming' },
    };

    const report = generateBuildReport(build, mockComponents, mockPrices);

    expect(report.summary).toMatch(/gaming/);
    expect(report.summary).toMatch(/\d+ USD total/);
    expect(report.summary).toMatch(/No issues detected|compatibility error|balance warning/);
  });

  it('should include compatibility errors in report', () => {
    const incompatibleBuild: Build = {
      cpu: 'cpu-1',
      gpu: 'gpu-1',
      ram: ['ram-1'],
      storage: ['storage-1'],
      meta: { target: 'gaming' },
    };

    const report = generateBuildReport(incompatibleBuild, mockComponents, mockPrices);

    expect(report.errors.length).toBeGreaterThan(0);
    expect(report.errors.some(e => e.code === 'missing-motherboard')).toBe(true);
  });

  it('should include balance warnings in report', () => {
    const weakCpu: Component = {
      id: 'cpu-weak',
      type: 'CPU',
      brand: 'Intel',
      model: 'i3-10100',
      specs: { type: 'CPU', socket: 'LGA1200', cores: 4, threads: 8, baseClock: 3.6, boostClock: 4.3, tdpW: 65 },
    };

    const build: Build = {
      cpu: 'cpu-weak',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1'], // Only 16GB
      storage: ['storage-1'],
      meta: { target: 'gaming' },
    };

    const componentsWithWeakCpu = [...mockComponents.filter(c => c.id !== 'cpu-1'), weakCpu];
    const report = generateBuildReport(build, componentsWithWeakCpu, mockPrices);

    // Should have warnings about insufficient RAM and potential CPU-GPU mismatch
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it('should generate recommendations based on issues', () => {
    const weakCpu: Component = {
      id: 'cpu-weak',
      type: 'CPU',
      brand: 'Intel',
      model: 'i3-10100',
      specs: { type: 'CPU', socket: 'LGA1200', cores: 4, threads: 8, baseClock: 3.6, boostClock: 4.3, tdpW: 65 },
    };

    const build: Build = {
      cpu: 'cpu-weak',
      gpu: 'gpu-1',
      motherboard: 'mb-1',
      ram: ['ram-1'],
      storage: ['storage-1'],
      meta: { target: 'gaming' },
    };

    const componentsWithWeakCpu = [...mockComponents.filter(c => c.id !== 'cpu-1'), weakCpu];
    const report = generateBuildReport(build, componentsWithWeakCpu, mockPrices);

    expect(report.recommendations.length).toBeGreaterThan(0);
  });
});
